"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, sweetnessLabel } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { getTableContext } from "@/lib/table-context";
import { saveOrder } from "@/lib/order-cache";
import { createOrder } from "@/services/orders.service";
import { useActiveOrderStore } from "@/stores/active-order-store";
import { useCartStore } from "@/stores/cart-store";
import { useCustomerHistoryStore } from "@/stores/customer-history-store";
import type { PaymentMethod } from "@/types";

const checkoutSchema = z.object({
  customerName: z.string().max(60, "Nama terlalu panjang").optional(),
  whatsapp: z
    .string()
    .min(8, "Nomor WhatsApp wajib diisi")
    .regex(/^[0-9+\s-]+$/, "Format nomor tidak valid"),
  notes: z.string().max(300).optional(),
  paymentMethod: z.enum(["cash", "qris", "midtrans"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

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

  // Redirect bila keranjang kosong (setelah mounted).
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
        customerName: values.customerName ?? "",
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
      router.replace(`/receipt/${order.receiptNumber}`);
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
          className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-primary">Checkout</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col"
      >
        <div className="flex-1 space-y-3 px-4 pb-40">
          {/* Data Pemesan */}
          <div className="space-y-3 rounded-card bg-surface p-4 shadow-sm">
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Nama Pemesan{" "}
                <span className="font-normal text-black/40">(opsional)</span>
              </label>
              <input
                {...register("customerName")}
                placeholder="Nama Anda"
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Nomor WhatsApp <span className="text-error">*</span>
              </label>
              <input
                {...register("whatsapp")}
                inputMode="tel"
                placeholder="08xxxxxxxxxx"
                className={cn(
                  "h-11 w-full rounded-card border px-3 text-sm outline-none",
                  errors.whatsapp
                    ? "border-error focus:border-error"
                    : "border-black/15 focus:border-primary"
                )}
              />
              {errors.whatsapp && (
                <p className="mt-1 text-xs text-error">
                  {errors.whatsapp.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Catatan Tambahan{" "}
                <span className="font-normal text-black/40">(opsional)</span>
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Catatan untuk pesanan…"
                className="w-full resize-none rounded-card border border-black/15 p-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="rounded-card bg-surface p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-black/80">
              Metode Pembayaran
            </p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => {
                const active = selectedPayment === (m.value as PaymentMethod);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setValue("paymentMethod", m.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-card border p-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-black/10 hover:border-primary/40"
                    )}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-black/85">
                        {m.label}
                      </span>
                      <span className="block text-xs text-black/50">
                        {m.hint}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        active ? "border-primary" : "border-black/20"
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
          </div>

          {/* Ringkasan Order */}
          <div className="rounded-card bg-surface p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-black/80">
              Ringkasan Order
            </p>
            <ul className="space-y-2">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.sweetnessLevel}`}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 text-black/70">
                    <span className="font-medium">
                      {i.quantity}x {i.name}
                    </span>
                    <span className="block text-xs text-black/45">
                      {sweetnessLabel(i.sweetnessLevel)}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-black/80">
                    {formatCurrency(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
              <span className="text-sm text-black/60">
                Total ({totalItems} item)
              </span>
              <span className="text-lg font-extrabold text-primary">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Aksi sticky */}
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-surface">
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
