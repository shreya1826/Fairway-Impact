import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send:", subject);
    return;
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Fairway Impact <onboarding@resend.dev>",
    to,
    subject,
    html
  });
}

export const emailTemplates = {
  drawPublished: (month: string, numbers: number[]) => ({
    subject: `This month's draw is in 🎉 — ${month}`,
    html: `<p>The winning numbers for ${month} are: <strong>${numbers.join(", ")}</strong>.</p>
           <p>Log in to your dashboard to see if you matched.</p>`
  }),
  winnerNotice: (tier: number, amount: number) => ({
    subject: `You matched ${tier} numbers! 🏆`,
    html: `<p>Congratulations — you matched ${tier} numbers and won $${amount.toFixed(2)}.</p>
           <p>Upload proof of your score to claim your prize from your dashboard.</p>`
  }),
  subscriptionConfirmed: (plan: string) => ({
    subject: "You're in — subscription confirmed",
    html: `<p>Your ${plan} subscription is active. Welcome to the community.</p>`
  })
};
