"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Leaf, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { QUIZ_QUESTIONS } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { getProducts } from "@/services/products.service";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

const SESSION_KEY = "majamu-quiz-result";

/**
 * Quiz Rekomendasi — full-screen sheet, UX terstruktur:
 * progress bar hijau + persentase, step indicator, card pertanyaan,
 * jawaban berupa selectable card (active hijau), tombol Back/Next fixed.
 * Logika rekomendasi & sessionStorage tidak diubah.
 */
export function QuizSheet() {
  const open = useUiStore((s) => s.quizOpen);
  const close = useUiStore((s) => s.closeQuiz);
  const openDetail = useUiStore((s) => s.openProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [results, setResults] = React.useState<Product[] | null>(null);

  React.useEffect(() => {
    if (!open) return;
    getProducts().then(setProducts);
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids) && ids.length) {
          getProducts().then((all) =>
            setResults(all.filter((p) => ids.includes(p.id)))
          );
        }
      }
    } catch {
      /* ignore */
    }
  }, [open]);

  const total = QUIZ_QUESTIONS.length;
  const current = QUIZ_QUESTIONS[step];
  const selected = answers[step];
  const percent = results ? 100 : Math.round(((step + 1) / total) * 100);

  function choose(chip: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = chip;
      return next;
    });
  }

  function next() {
    if (!selected) return;
    if (step + 1 < total) setStep(step + 1);
    else computeResults(answers);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function computeResults(selectedChips: string[]) {
    const weight = new Map<string, number>();
    selectedChips.forEach((c) => weight.set(c, (weight.get(c) ?? 0) + 1));
    const scored = products
      .filter((p) => p.stockStatus !== "out_of_stock")
      .map((p) => ({
        product: p,
        score: p.filterChips.reduce((s, c) => s + (weight.get(c) ?? 0), 0),
      }))
      .sort((a, b) => b.score - a.score);
    let picked = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.product);
    if (picked.length < 2) {
      const fill = scored
        .map((s) => s.product)
        .filter((p) => !picked.includes(p))
        .slice(0, 2 - picked.length);
      picked = [...picked, ...fill];
    }
    setResults(picked);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(picked.map((p) => p.id)));
    } catch {
      /* ignore */
    }
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setResults(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      fullScreen
      title="Quiz Rekomendasi"
      footer={
        results ? (
          <div className="flex gap-2">
            <Button variant="outline" block onClick={restart}>
              <RotateCcw className="h-4 w-4" />
              Ulangi
            </Button>
            <Button block onClick={close}>
              Selesai
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={back}
              disabled={step === 0}
              className="px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button block onClick={next} disabled={!selected}>
              {step + 1 < total ? "Lanjut" : "Lihat Hasil"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    >
      {/* Progress */}
      <div className="mb-6 mt-1">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span className="text-muted">
            {results ? "Selesai" : `Langkah ${step + 1} dari ${total}`}
          </span>
          <span className="text-accent">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {!results ? (
        <div className="animate-fade-in">
          {/* Card pertanyaan */}
          <div className="mb-4 rounded-card border border-line bg-surface p-5 shadow-soft-sm">
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-1 text-[11px] font-bold text-accent">
              <Leaf className="h-3 w-3" /> Pertanyaan {step + 1}
            </span>
            <h3 className="text-lg font-extrabold leading-snug text-ink">
              {current.question}
            </h3>
          </div>

          {/* Jawaban selectable */}
          <div className="flex flex-col gap-3">
            {current.options.map((opt) => {
              const active = selected === opt.chip;
              return (
                <button
                  key={opt.label}
                  onClick={() => choose(opt.chip)}
                  className={cn(
                    "flex items-center gap-3 rounded-card border p-4 text-left text-sm font-semibold transition-all active:scale-[0.99]",
                    active
                      ? "border-accent bg-accent/10 text-accent shadow-soft-sm"
                      : "border-line bg-surface text-ink hover:border-accent/50 hover:bg-accent/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-line"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex-1">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-primary">
              Rekomendasi untukmu
            </h3>
            <p className="text-sm text-muted">
              Ramuan yang paling sesuai dengan kebutuhanmu.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {results.map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  "flex gap-3 rounded-card border bg-surface p-3 shadow-soft-sm",
                  idx === 0 ? "border-accent" : "border-line"
                )}
              >
                <button
                  onClick={() => {
                    openDetail(p.id);
                    close();
                  }}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary/15"
                >
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-secondary">
                      <Leaf className="h-7 w-7" />
                    </span>
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  {idx === 0 && (
                    <span className="mb-1 w-fit">
                      <Badge variant="accent">Paling Cocok</Badge>
                    </span>
                  )}
                  <p className="clamp-1 text-sm font-bold text-ink">{p.name}</p>
                  <p className="text-sm font-extrabold text-primary">
                    {formatCurrency(p.price)}
                  </p>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        addItem({
                          id: p.id,
                          name: p.name,
                          photoUrl: p.photoUrl,
                          price: p.price,
                        })
                      }
                    >
                      Tambah
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        openDetail(p.id);
                        close();
                      }}
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
