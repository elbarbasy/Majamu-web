"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Leaf, RotateCcw, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  computeQuizScore,
  QUIZ_V2_QUESTIONS,
  type QuizV2Option,
} from "@/constants/quiz-v2";
import { cn, formatCurrency } from "@/lib/utils";
import { getProducts } from "@/services/products.service";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

const SESSION_KEY = "majamu-quiz-v2-result";

/**
 * Quiz Rekomendasi v2 — guided experience (bukan filter).
 * 4 pertanyaan conversational → matching → 1 "Paling Cocok" + 2 alternatif.
 * Hasil tersimpan di sessionStorage (bertahan navigasi, hilang tutup browser).
 */
export function QuizSheet() {
  const open = useUiStore((s) => s.quizOpen);
  const close = useUiStore((s) => s.closeQuiz);
  const openDetail = useUiStore((s) => s.openProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<(QuizV2Option | null)[]>(
    Array(QUIZ_V2_QUESTIONS.length).fill(null)
  );
  const [products, setProducts] = React.useState<Product[]>([]);
  const [results, setResults] = React.useState<Product[] | null>(null);

  React.useEffect(() => {
    if (!open) return;
    getProducts().then(setProducts);
    // Restore hasil dari sessionStorage.
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

  const total = QUIZ_V2_QUESTIONS.length;
  const current = QUIZ_V2_QUESTIONS[step];
  const selected = answers[step];
  const percent = results ? 100 : Math.round(((step + (selected ? 1 : 0)) / total) * 100);

  function choose(opt: QuizV2Option) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = opt;
      return next;
    });
  }

  function next() {
    if (!selected) return;
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      computeResults();
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function computeResults() {
    const score = computeQuizScore(answers);

    const scored = products
      .filter((p) => p.stockStatus !== "out_of_stock")
      .map((p) => {
        const s = p.filterChips.reduce(
          (sum, chip) => sum + (score.get(chip) ?? 0),
          0
        );
        return { product: p, score: s };
      })
      .sort((a, b) => b.score - a.score);

    // 1 paling cocok + 2 alternatif. Fallback: pakai Q2 mapping saja.
    let picked = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.product);
    if (picked.length === 0) {
      // Fallback: Q2 mapping only.
      const q2 = answers[1];
      if (q2) {
        picked = products
          .filter((p) =>
            p.stockStatus !== "out_of_stock" &&
            p.filterChips.some((c) => q2.chips.includes(c))
          )
          .slice(0, 3);
      }
    }
    // Never show empty.
    if (picked.length === 0) {
      picked = products.filter((p) => p.stockStatus !== "out_of_stock").slice(0, 3);
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
    setAnswers(Array(total).fill(null));
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
      title="Rekomendasi Jamu"
      footer={
        results ? (
          <div className="flex gap-2">
            <Button variant="outline" block onClick={restart}>
              <RotateCcw className="h-4 w-4" />
              Coba Lagi
            </Button>
            <Button block onClick={close}>
              <ShoppingBag className="h-4 w-4" />
              Lihat Semua Produk
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
            {results ? "Selesai" : `Pertanyaan ${step + 1} dari ${total}`}
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
          {/* Pertanyaan */}
          <div className="mb-5 rounded-card border border-line bg-surface p-5 shadow-soft-sm">
            <h3 className="text-lg font-extrabold leading-snug text-ink">
              {current.question}
            </h3>
          </div>

          {/* Jawaban */}
          <div className="flex flex-col gap-3">
            {current.options.map((opt) => {
              const active = selected?.label === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => choose(opt)}
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
        <div className="animate-fade-in space-y-5">
          {/* Header hasil */}
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-primary">
              Rekomendasi Untukmu
            </h3>
            <p className="mt-1 text-sm text-muted">
              Berdasarkan gaya hidup dan preferasimu, ini yang kami sarankan.
            </p>
          </div>

          {/* Produk terbaik */}
          {results[0] && (
            <div className="rounded-card border-2 border-accent bg-accent/5 p-4 shadow-soft-sm">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="accent">⭐ Paling Cocok</Badge>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    openDetail(results[0].id);
                    close();
                  }}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary/15"
                >
                  {results[0].photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={results[0].photoUrl}
                      alt={results[0].name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-secondary">
                      <Leaf className="h-7 w-7" />
                    </span>
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-base font-bold text-ink">{results[0].name}</p>
                  <p className="text-base font-extrabold text-primary">
                    {formatCurrency(results[0].price)}
                  </p>
                  {results[0].description && (
                    <p className="clamp-2 mt-1 text-xs text-muted">
                      {results[0].description}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        addItem({
                          id: results[0].id,
                          name: results[0].name,
                          photoUrl: results[0].photoUrl,
                          price: results[0].price,
                        })
                      }
                    >
                      Tambah
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        openDetail(results[0].id);
                        close();
                      }}
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternatif */}
          {results.length > 1 && (
            <div>
              <p className="mb-3 text-sm font-bold text-ink">Alternatif Lain</p>
              <div className="flex flex-col gap-3">
                {results.slice(1).map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-3 rounded-card border border-line bg-surface p-3 shadow-soft-sm"
                  >
                    <button
                      onClick={() => {
                        openDetail(p.id);
                        close();
                      }}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-secondary/15"
                    >
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-secondary">
                          <Leaf className="h-5 w-5" />
                        </span>
                      )}
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="text-sm font-bold text-ink">{p.name}</p>
                      <p className="text-sm font-extrabold text-primary">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          id: p.id,
                          name: p.name,
                          photoUrl: p.photoUrl,
                          price: p.price,
                        })
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-btn bg-primary text-primary-foreground shadow-soft-sm"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
