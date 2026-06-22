// PRD Section 07 — Prize Pool Logic
// 40% to the 5-match tier (rolls over if unclaimed), 35% to 4-match, 25% to 3-match.

export const POOL_SHARES = {
  5: 0.4,
  4: 0.35,
  3: 0.25
} as const;

/**
 * @param subscriptionRevenuePool total subscription revenue allocated to prizes this month
 * @param previousRollover unclaimed jackpot carried over from prior month(s)
 */
export function calculatePoolTiers(subscriptionRevenuePool: number, previousRollover = 0) {
  const tier5 = subscriptionRevenuePool * POOL_SHARES[5] + previousRollover;
  const tier4 = subscriptionRevenuePool * POOL_SHARES[4];
  const tier3 = subscriptionRevenuePool * POOL_SHARES[3];
  return { 5: tier5, 4: tier4, 3: tier3, total: tier5 + tier4 + tier3 };
}

/** Splits a tier's pool equally among however many winners landed in that tier. */
export function splitAmongWinners(tierPool: number, winnerCount: number) {
  if (winnerCount === 0) return 0;
  return Math.round((tierPool / winnerCount) * 100) / 100;
}
