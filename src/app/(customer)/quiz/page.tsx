"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useUiStore } from "@/stores/ui-store";

/**
 * Deep-link Quiz (/quiz). Quiz tampil sebagai full-screen bottom sheet
 * (aturan wajib) yang dirender di layout; halaman ini membuka sheet lalu
 * mengarahkan ke homepage sebagai latar.
 */
export default function QuizPage() {
  const router = useRouter();
  const openQuiz = useUiStore((s) => s.openQuiz);

  React.useEffect(() => {
    openQuiz();
    router.replace("/");
  }, [openQuiz, router]);

  return null;
}
