import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Use server import for App Router
import Stripe from 'stripe';

// Initialize Stripe with the secret key
// Remove apiVersion to use the default
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(req: Request) {
  try {
    // Get authenticated user ID from Clerk
    // Try awaiting auth() to satisfy linter expectation of a Promise
    const authResult = await auth(); 
    if (!authResult?.userId) {
      console.error('User not authenticated');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = authResult.userId;

    // Parse request body for priceId
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      console.error('Price ID is missing in request body');
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Define success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/upload`; // New: Redirect to packages page on success
    const cancelUrl = `${baseUrl}/packages`; // New: Redirect to landing page on cancellation

    console.log('userId from checkout_sessions', userId);

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Assuming these are subscription plans
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Add subscription_data to pass metadata to the subscription object
      subscription_data: {
        metadata: {
          userId: userId,
        }
      }
    });

    // Return the session URL
    if (!session.url) {
        console.error('Stripe session URL is null');
        throw new Error('Could not create checkout session.');
    }
    
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 