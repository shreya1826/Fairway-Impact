export type SubscriptionStatus = "active" | "inactive" | "canceled" | "past_due";
export type DrawStatus = "draft" | "simulated" | "published";
export type WinnerStatus = "pending" | "approved" | "rejected" | "paid";

export interface Profile {
  id: string;
  full_name: string | null;
  role: "subscriber" | "admin";
  stripe_customer_id: string | null;
  charity_id: string | null;
  charity_percent: number;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  website: string | null;
  featured: boolean;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_on: string;
}

export interface Draw {
  id: string;
  month: number;
  year: number;
  draw_type: "random" | "algorithmic";
  status: DrawStatus;
  winning_numbers: number[];
  prize_pool_total: number;
  jackpot_rollover: number;
  published_at: string | null;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  tier: 3 | 4 | 5;
  prize_amount: number;
  proof_url: string | null;
  status: WinnerStatus;
}
