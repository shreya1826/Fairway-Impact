import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/lib/email";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan as "monthly" | "yearly";
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          plan,
          status: sub.status === "active" ? "active" : "inactive",
          current_period_end: new Date(sub.current_period_end * 1000).toISOString()
        }, { onConflict: "stripe_subscription_id" });

        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
        // requires a verified sender / domain in Resend for production use
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user?.email) {
          const tpl = emailTemplates.subscriptionConfirmed(plan);
          await sendEmail(authUser.user.email, tpl.subject, tpl.html);
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status =
        sub.status === "active" ? "active" :
        sub.status === "past_due" ? "past_due" :
        event.type === "customer.subscription.deleted" ? "canceled" : "inactive";
      await supabase.from("subscriptions").update({
        status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString()
      }).eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
