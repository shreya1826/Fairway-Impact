// PRD Section 06 — Draw & Reward System
// Draws are 5 numbers, each between 1 and 45 (mirrors the Stableford score range
// in Section 05, so a user's own recent scores can double as their "numbers").

export type DrawType = "random" | "algorithmic";

export interface ScoredEntry {
  userId: string;
  /** the user's last up-to-5 Stableford scores, used as their draw numbers */
  numbers: number[];
}

/** Standard lottery-style draw: 5 unique numbers from 1-45. */
export function generateRandomDraw(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const result: number[] = [];
  while (result.length < 5) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
}

/**
 * Algorithmic draw: weights number selection by frequency across all
 * subscribers' recent scores. `weightMode: "frequent"` biases toward numbers
 * that show up often (favors more likely outcomes); `"rare"` biases toward
 * numbers that rarely show up (favors underdog/long-shot outcomes).
 */
export function generateAlgorithmicDraw(
  allEntries: ScoredEntry[],
  weightMode: "frequent" | "rare" = "frequent"
): number[] {
  const freq = new Map<number, number>();
  for (let n = 1; n <= 45; n++) freq.set(n, 0);
  allEntries.forEach((e) => e.numbers.forEach((n) => {
    if (n >= 1 && n <= 45) freq.set(n, (freq.get(n) ?? 0) + 1);
  }));

  const weighted: { num: number; weight: number }[] = Array.from(freq.entries()).map(
    ([num, count]) => ({ num, weight: weightMode === "frequent" ? count + 1 : 1 / (count + 1) })
  );

  const result: number[] = [];
  const pool = [...weighted];
  while (result.length < 5 && pool.length) {
    const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * totalWeight;
    let pickIdx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) { pickIdx = i; break; }
    }
    result.push(pool.splice(pickIdx, 1)[0].num);
  }
  return result.sort((a, b) => a - b);
}

/** How many of the user's numbers match the winning numbers, returned as a tier (5/4/3) or null. */
export function scoreMatchTier(userNumbers: number[], winningNumbers: number[]): 3 | 4 | 5 | null {
  const matches = userNumbers.filter((n) => winningNumbers.includes(n)).length;
  if (matches >= 5) return 5;
  if (matches === 4) return 4;
  if (matches === 3) return 3;
  return null;
}
