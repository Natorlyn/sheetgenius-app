import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '../../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  // Check if webhook secret exists
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('❌ STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!sig) {
    console.log('❌ No stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log('❌ Webhook signature verification failed:', errorMessage);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Processing checkout session:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.log('❌ No userId in session metadata');
    return;
  }

  if (!session.subscription) {
    console.log('❌ No subscription in session');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    
    let planType = 'free';
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      planType = 'starter';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planType = 'pro';
    }

    console.log(`Upgrading user ${userId} to ${planType} plan`);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: planType,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      })
      .eq('id', userId);

    if (error) {
      console.log('❌ Error updating user plan:', error);
    } else {
      console.log(`✅ Successfully upgraded user ${userId} to ${planType}`);
    }
  } catch (error) {
    console.log('❌ Error processing webhook:', error);
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}