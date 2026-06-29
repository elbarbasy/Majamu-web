"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, sweetnessLabel, temperatureLabel } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { getTableContext } from "@/lib/table-context";
import { saveOrder } from "@/lib/order-cache";
import { midtransClientConfigured, payWithSnap } from "@/lib/midtrans-client";
import { createOrder } from "@/services/orders.service";
import { useActiveOrderStore } from "@/stores/active-order-store";
import { useCartStore } from "@/stores/cart-store";
import { useCustomerHistoryStore } from "@/stores/customer-history-store";
import type { PaymentMethod } from "@/types";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Nama wajib diisi").max(60, "Nama terlalu panjang"),
  whatsapp: z
    .string()
    .min(8, "Nomor WhatsApp wajib diisi")
    .regex(/^[0-9+\s-]+$/, "Format nomor tidak valid"),
  notes: z.string().max(300).optional(),
  paymentMethod: z.enum(["cash", "qris", "midtrans"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {step}
      </span>
      <h2 className="text-sm font-extrabold text-ink">{title}</h2>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const cartNotes = useCartStore((s) => s.notes);
  const clearCart = useCartStore((s) => s.clearCart);
  const setActiveOrder = useActiveOrderStore((s) => s.setActiveOrder);
  const addHistory = useCustomerHistoryStore((s) => s.addHistory);

  const [mounted, setMounted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      whatsapp: "",
      notes: cartNotes,
      paymentMethod: "cash",
    },
  });

  const selectedPayment = watch("paymentMethod");

  React.useEffect(() => {
    if (mounted && items.length === 0 && !submitting) {
      router.replace("/cart");
    }
  }, [mounted, items.length, submitting, router]);

  async function onSubmit(values: CheckoutForm) {
    if (items.length === 0) return;
    setSubmitting(true);
    const ctx = getTableContext();
    try {
      const order = await createOrder({
        items,
        customerName: values.customerName,
        whatsapp: values.whatsapp,
        notes: values.notes ?? "",
        paymentMethod: values.paymentMethod,
        orderType: ctx.orderType,
        tableNumber: ctx.tableNumber,
      });

      saveOrder(order);
      setActiveOrder({
        orderId: order.orderId,
        statusUrl: order.statusUrl,
        receiptNumber: order.receiptNumber,
        displayNumber: order.displayNumber,
        currentStatus: order.status,
      });
      addHistory({
        orderId: order.orderId,
        statusUrl: order.statusUrl,
        receiptNumber: order.receiptNumber,
        displayNumber: order.displayNumber,
        orderType: order.orderType,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        itemsSummary: order.items
          .map((i) => `${i.quantity}x ${i.name}`)
          .join(", "),
      });
      clearCart();

      // Pembayaran QRIS via Midtrans (Snap): hanya jika metode qris,
      // order tersimpan di server (bukan lokal/dev), dan client key tersedia.
      if (
        values.paymentMethod === "qris" &&
        midtransClientConfigured() &&
        !order.orderId.startsWith("local-")
      ) {
        try {
          const res = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.orderId }),
          });
          if (res.ok) {
            const { token } = (await res.json()) as { token?: string };
            if (token) {
              const snapResult = await payWithSnap(token);

              // Jika QRIS sukses, langsung kirim struk WA sebagai backup
              // (webhook Midtrans juga akan kirim, tapi ini fallback jika webhook lambat/gagal)
              if (snapResult === "success") {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                fetch("/api/notifications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    whatsapp: values.whatsapp,
                    customerName: values.customerName,
                    orderNumber: order.displayNumber ?? "",
                    receiptNumber: order.receiptNumber ?? "",
                    total: formatCurrency(order.totalPrice),
                    receiptUrl: `${appUrl}/receipt/${order.receiptNumber ?? order.statusUrl}`,
                    statusUrl: `${appUrl}/order/${order.statusUrl}`,
                    paymentMethod: "qris",
                    orderId: order.orderId,
                  }),
                }).catch(() => {});
              }
            }
          }
        } catch {
          /* lanjut ke struk meski popup gagal */
        }
      }

      // Tunai → halaman QR pembayaran, QRIS → tracking
      if (order.paymentMethod === "cash" && order.paymentCode) {
        router.replace(`/payment/${order.paymentCode}`);
      } else {
        router.replace(`/order/${order.statusUrl}`);
      }
    } catch {
      setSubmitting(false);
    }
  }

  if (!mounted || items.length === 0) return null;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      {/* Sub-header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="touch-target flex items-center justify-center rounded-btn text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-page font-medium tracking-tight text-ink">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
        <div className="flex-1 space-y-4 px-4 pb-40">
          {/* 1. Ringkasan Pesanan */}
          <section className="rounded-card border border-line bg-surface p-4 shadow-soft-sm">
            <SectionTitle step={1} title="Ringkasan Pesanan" />
            <ul className="space-y-2.5">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.sweetnessLevel}-${i.temperature}`}
                  className="flex items-start gap-3 text-sm"
                >
                  {/* Thumbnail produk */}
                  {i.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.photoUrl}
                      alt={i.name}
                      className="h-12 w-12 shrink-0 rounded-card object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-secondary/20 text-secondary">
                      <span className="text-lg">🌿</span>
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <span className="min-w-0 text-ink/80">
                      <span className="font-semibold">
                        {i.quantity}x {i.name}
                      </span>
                      {(i.temperature || i.sweetnessLevel) && (
                        <span className="block text-xs text-muted">
                          {[
                            i.temperature ? temperatureLabel(i.temperature) : null,
                            i.sweetnessLevel ? sweetnessLabel(i.sweetnessLevel) : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-semibold text-ink">
                      {formatCurrency(i.price * i.quantity)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">Total ({totalItems} item)</span>
              <span className="text-lg font-extrabold text-primary">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </section>

          {/* 2. Metode Pembayaran */}
          <section className="rounded-card border border-line bg-surface p-4 shadow-soft-sm">
            <SectionTitle step={2} title="Metode Pembayaran" />
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => {
                const active = selectedPayment === (m.value as PaymentMethod);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setValue("paymentMethod", m.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-card border p-3.5 text-left transition-all",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-line hover:border-primary/40"
                    )}
                  >
                    <span>
                      <span className="block text-sm font-bold text-ink">
                        {m.label}
                      </span>
                      <span className="block text-xs text-muted">{m.hint}</span>
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        active ? "border-primary" : "border-line"
                      )}
                    >
                      {active && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Data Pemesan */}
          <section className="rounded-card border border-line bg-surface p-4 shadow-soft-sm">
            <SectionTitle step={3} title="Data Pemesan" />
            <div className="space-y-3">
              <div>
                <input
                  {...register("customerName")}
                  placeholder="Nama Anda"
                  className={cn(
                    "h-11 w-full rounded-input border px-3.5 text-base outline-none",
                    errors.customerName
                      ? "border-error"
                      : "border-line focus:border-primary"
                  )}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-error">
                    {errors.customerName.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  {...register("whatsapp")}
                  inputMode="tel"
                  placeholder="Nomor WhatsApp"
                  className={cn(
                    "h-11 w-full rounded-input border px-3.5 text-base outline-none",
                    errors.whatsapp
                      ? "border-error"
                      : "border-line focus:border-primary"
                  )}
                />
                {errors.whatsapp && (
                  <p className="mt-1 text-xs text-error">
                    {errors.whatsapp.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 4. Catatan */}
          <section className="rounded-card border border-line bg-surface p-4 shadow-soft-sm">
            <SectionTitle step={4} title="Catatan" />
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Catatan tambahan (opsional)…"
              className="w-full resize-none rounded-input border border-line p-3.5 text-sm outline-none focus:border-primary"
            />
          </section>
        </div>

        {/* 5. Buat Pesanan (sticky) */}
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface">
          <div className="mx-auto max-w-screen-sm px-4 py-3">
            <Button block size="lg" type="submit" disabled={submitting}>
              {submitting ? "Memproses…" : "Buat Pesanan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
