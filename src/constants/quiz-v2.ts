/**
 * Quiz Rekomendasi v2 — guided experience, bukan kategori.
 * Pertanyaan conversational, pengguna tidak melihat nama filter.
 */

export interface QuizV2Option {
  label: string;
  /** Pemetaan internal ke filter chip (pengguna tidak melihat ini). */
  chips: string[];
  /** Pemetaan rasa (Q3) */
  taste?: string;
  /** Pemetaan format (Q4) */
  format?: string;
}

export interface QuizV2Question {
  id: string;
  question: string;
  options: QuizV2Option[];
  /** Boleh pilih lebih dari satu? */
  multi?: boolean;
}

export const QUIZ_V2_QUESTIONS: QuizV2Question[] = [
  {
    id: "lifestyle",
    question: "Kira-kira, hari-harimu lebih sering kayak gimana?",
    options: [
      {
        label: "Banyak duduk di depan laptop/kerja kantoran",
        chips: ["Pegal & Capek", "Stamina & Energi"],
      },
      {
        label: "Banyak gerak/aktivitas fisik di luar",
        chips: ["Stamina & Energi", "Daya Tahan Tubuh"],
      },
      {
        label: "Sering kurang tidur/jam istirahat tidak teratur",
        chips: ["Tenang & Tidur Nyenyak", "Stamina & Energi"],
      },
      {
        label: "Sering makan tidak teratur/jajan sembarangan",
        chips: ["Pencernaan Nyaman", "Daya Tahan Tubuh"],
      },
    ],
  },
  {
    id: "signal",
    question: "Akhir-akhir ini badan kasih sinyal apa?",
    options: [
      {
        label: "Gampang capek/lemas",
        chips: ["Stamina & Energi", "Daya Tahan Tubuh"],
      },
      {
        label: "Perut/pencernaan kurang nyaman",
        chips: ["Pencernaan Nyaman"],
      },
      {
        label: "Susah tidur/pikiran kurang rileks",
        chips: ["Tenang & Tidur Nyenyak"],
      },
      {
        label: "Tenggorokan/napas kurang nyaman",
        chips: ["Batuk & Tenggorokan", "Daya Tahan Tubuh"],
      },
      {
        label: "Tidak ada yang spesifik, cuma mau jaga-jaga",
        chips: ["Daya Tahan Tubuh", "Rekomendasi"],
      },
    ],
  },
  {
    id: "taste",
    question: "Suka rasa jamu yang gimana?",
    options: [
      { label: "Manis", chips: [], taste: "sweet" },
      { label: "Asam Segar", chips: ["Pencernaan Nyaman", "Kulit Sehat"], taste: "sour" },
      { label: "Pahit/Kental", chips: ["Daya Tahan Tubuh", "Stamina & Energi"], taste: "bitter" },
      { label: "Tidak Masalah", chips: [], taste: "any" },
    ],
  },
  {
    id: "format",
    question: "Lebih suka original atau dicampur susu/soda?",
    options: [
      { label: "Original", chips: [], format: "original" },
      { label: "Susu", chips: ["Susu & Soda Jamu"], format: "milk" },
      { label: "Soda", chips: ["Susu & Soda Jamu"], format: "soda" },
      { label: "Tidak Masalah", chips: [], format: "any" },
    ],
  },
];

/**
 * Hitung skor matching: Q1+Q2 tentukan kategori, Q3+Q4 refine.
 * Pengguna tidak pernah melihat nama kategori.
 */
export function computeQuizScore(
  answers: (QuizV2Option | null)[]
): Map<string, number> {
  const score = new Map<string, number>();

  answers.forEach((ans, idx) => {
    if (!ans) return;
    // Q1 & Q2 (lifestyle + signal) → bobot utama (2x)
    // Q3 & Q4 (taste + format) → bobot refinement (1x)
    const weight = idx < 2 ? 2 : 1;
    ans.chips.forEach((chip) => {
      score.set(chip, (score.get(chip) ?? 0) + weight);
    });
  });

  return score;
}
