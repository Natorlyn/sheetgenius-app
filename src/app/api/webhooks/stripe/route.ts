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
  console.log('=== WEBHOOK DEBUG START ===');
  console.log('Session ID:', session.id);
  console.log('Session metadata:', session.metadata);
  console.log('Session customer:', session.customer);
  console.log('Session subscription:', session.subscription);
  
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
    
    console.log('Retrieved price ID:', priceId);
    console.log('STRIPE_STARTER_PRICE_ID:', process.env.STRIPE_STARTER_PRICE_ID);
    console.log('STRIPE_PRO_PRICE_ID:', process.env.STRIPE_PRO_PRICE_ID);
    
    let planType = 'free';
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      planType = 'starter';
      console.log('✅ Matched STARTER plan');
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planType = 'pro';
      console.log('✅ Matched PRO plan');
    } else {
      console.log('❌ No plan match found');
    }

    console.log(`Updating user ${userId} to ${planType} plan`);

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        plan: planType,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription
      })
      .eq('id', userId)
      .select();

    console.log('Supabase update result:', { data, error });
    
    if (error) {
      console.log('❌ Supabase error:', error);
    } else {
      console.log('✅ Supabase update successful:', data);
    }
  } catch (error) {
    console.log('❌ Webhook error:', error);
  }
  console.log('=== WEBHOOK DEBUG END ===');
}

export async function GET() {
  return NextResponse.json({ message: 'Stripe webhook endpoint' });
}