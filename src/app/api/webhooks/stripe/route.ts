import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'; // Import prisma client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      // Only log subscription completions, as per user clarification.
      // The main logic for subscription creation/DB update is handled by 'customer.subscription.created'.
      if (session.mode === 'subscription') {
         console.log(`Checkout session completed for subscription for userId: ${userId}. Subscription details handled by customer.subscription.created.`);
      } else {
         // Log if a session with an unexpected mode completes, for debugging.
         console.log(`Checkout session completed with unexpected mode: ${session.mode} for userId: ${userId}`);
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const stripeCustomerId = subscription.customer as string;

      console.log(`Subscription created for userId: ${userId}, CustomerId: ${stripeCustomerId}`);

      if (!userId || !stripeCustomerId) {
        console.error('Webhook Error: userId or stripeCustomerId missing from customer.subscription.created event');
        return NextResponse.json({ error: 'Missing userId or customerId in subscription metadata' }, { status: 400 });
      }

      // Ensure subscription items exist and retrieve the priceId
      const priceId = subscription.items?.data[0]?.price?.id;
      if (!priceId) {
          console.error(`Webhook Error: Price ID missing from subscription items for userId ${userId}`);
          return NextResponse.json({ error: 'Price ID missing from subscription items' }, { status: 400 });
      }

      // Determine package name based on Price ID from .env.local
      let packageName: string;
      switch (priceId) {
          case process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID:
              packageName = 'Starter'; // Ensure 'Starter' is valid in your schema
              break;
          case process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID:
              packageName = 'Scholar'; // Ensure 'Scholar' is valid in your schema
              break;
          case process.env.NEXT_PUBLIC_STRIPE_SAVANT_PRICE_ID:
              packageName = 'Savant'; // Ensure 'Savant' is valid in your schema
              break;
          default:
              console.warn(`Webhook Warning: Unrecognized Price ID ${priceId} in subscription for userId ${userId}`);
              packageName = 'Unknown'; // Handle unknown package
              // Potentially return an error or assign a default package if 'Unknown' is not desired
              return NextResponse.json({ error: `Unrecognized Price ID: ${priceId}` }, { status: 400 });
      }

      try {
        await prisma.account.update({
          where: { userId: userId },
          data: {
            status: "ACTIVE", // Directly set status to ACTIVE upon creation
            package: packageName,
            stripeCustomerId: stripeCustomerId,
          },
        });
        console.log(`DB update successful for userId: ${userId}, Package: ${packageName}, Status: ACTIVE`);
      } catch (error) {
        console.error(`Webhook Error processing customer.subscription.created for userId ${userId}:`, error);
        return NextResponse.json({ error: 'Webhook processing failed for subscription creation' }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      console.log(`Subscription updated for userId: ${userId}, Status: ${subscription.status}`);

      if (!userId) {
        console.error('Webhook Error: userId missing from customer.subscription.updated event');
        // If userId is missing, we can't update the specific user account.
        // Log the error and return 200 to Stripe to prevent retries for this issue.
        return NextResponse.json({ error: 'Missing userId in subscription metadata' });
      }

      // if subscription.cancel_at_period_end is true, set status to "CANCELLED"
      // otherwise, set status to "ACTIVE"    
      const newStatus = subscription.cancel_at_period_end ? "CANCELLED" : "ACTIVE"; // Ensure these match your schema
    
      try {
        await prisma.account.update({
          where: { userId: userId },
          data: {
            status: newStatus,
            // Optionally update package if needed, though typically not changed here
          },
        });
        console.log(`DB update successful for userId: ${userId}, Status set to: ${newStatus}`);
      } catch (error) {
        console.error(`Webhook Error processing customer.subscription.updated for userId ${userId}:`, error);
        // Decide if a DB update failure should cause Stripe retry (500) or not (200)
        return NextResponse.json({ error: 'Webhook processing failed for subscription update' }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      console.log(`Subscription deleted for userId: ${userId}`);

      if (!userId) {
        console.error('Webhook Error: userId missing from customer.subscription.deleted event');
        // Log error and return 200 to Stripe
        return NextResponse.json({ error: 'Missing userId in subscription metadata' });
      }

      try {
        await prisma.account.update({
          where: { userId: userId },
          data: {
            status: "INACTIVE", // Ensure 'INACTIVE' is valid in your schema
            package: null, // Set package to null as subscription is gone
            stripeCustomerId: null, // Remove stripe customer ID
          },
        });
        console.log(`DB update successful for userId: ${userId}, Subscription deleted, Status: INACTIVE`);
      } catch (error) {
        console.error(`Webhook Error processing customer.subscription.deleted for userId ${userId}:`, error);
        return NextResponse.json({ error: 'Webhook processing failed for subscription deletion' }, { status: 500 });
      }
      break;
    }

    // Removed 'invoice.payment_failed' and other cases as requested.
    default:
      // It's good practice to handle unexpected event types, even if just logging.
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}