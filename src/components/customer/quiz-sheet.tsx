"use client";

import * as React from "react";
import { Leaf, RotateCcw } from "lucide-react";
import Image from "next/image";

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
 * Quiz Rekomendasi sebagai FULL-SCREEN Bottom Sheet (aturan wajib).
 * 4 pertanyaan situasional, progress bar, hasil 2-3 produk, satu "Paling Cocok",
 * dapat diulang. Hasil disimpan di sessionStorage (CUSTOMER_UI.md).
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

  // Muat produk sekali saat dibuka & pulihkan hasil dari sessionStorage.
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
  const progress = results
    ? 100
    : Math.round(((step) / total) * 100);

  function selectOption(chip: string) {
    const nextAnswers = [...answers.slice(0, step), chip];
    setAnswers(nextAnswers);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      computeResults(nextAnswers);
    }
  }

  function computeResults(selectedChips: string[]) {
    const weight = new Map<string, number>();
    selectedChips.forEach((c) => weight.set(c, (weight.get(c) ?? 0) + 1));

    const scored = products
      .filter((p) => p.stockStatus !== "out_of_stock")
      .map((p) => {
        const score = p.filterChips.reduce(
          (sum, c) => sum + (weight.get(c) ?? 0),
          0
        );
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score);

    // Ambil 2-3 produk teratas dengan skor > 0; jika kurang, lengkapi dari sisa.
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
    >
      {/* Progress bar */}
      <div className="mb-5 mt-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!results && (
          <p className="mt-2 text-xs text-black/50">
            Pertanyaan {step + 1} dari {total}
          </p>
        )}
      </div>

      {!results ? (
        <div>
          <h3 className="mb-4 text-lg font-bold text-black/90">
            {current.question}
          </h3>
          <div className="flex flex-col gap-3">
            {current.options.map((opt) => {
              const active = answers[step] === opt.chip;
              return (
                <button
                  key={opt.label}
                  onClick={() => selectOption(opt.chip)}
                  className={cn(
                    "rounded-card border p-4 text-left text-sm font-medium transition-colors",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-black/10 bg-surface text-black/80 hover:border-accent/40"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-primary">
              Rekomendasi untukmu
            </h3>
            <p className="text-sm text-black/60">
              Berikut jamu yang paling sesuai dengan kebutuhanmu.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {results.map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  "flex gap-3 rounded-card border bg-surface p-3",
                  idx === 0 ? "border-accent" : "border-black/10"
                )}
              >
                <button
                  onClick={() => {
                    openDetail(p.id);
                    close();
                  }}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-secondary/20"
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
                    <span className="mb-1">
                      <Badge variant="accent">Paling Cocok</Badge>
                    </span>
                  )}
                  <p className="truncate text-sm font-semibold text-black/85">
                    {p.name}
                  </p>
                  <p className="text-sm font-bold text-primary">
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

          <Button block variant="ghost" onClick={restart}>
            <RotateCcw className="h-4 w-4" />
            Ulangi Quiz
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}
