import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '../../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSubscription);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.log('❌ No userId found in session metadata');
    return;
  }

  // Get the subscription details to determine the plan
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    
    let planType = 'free';
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      planType = 'starter';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planType = 'pro';
    }

    // Update user plan in Supabase
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
      console.log(`✅ Updated user ${userId} to ${planType} plan`);
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Subscription created:', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('✅ Subscription deleted:', subscription.id);
  
  // Downgrade user to free plan
  const { error } = await supabase
    .from('profiles')
    .update({ 
      plan: 'free',
      stripe_subscription_id: null
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.log('❌ Error downgrading user:', error);
  } else {
    console.log('✅ User downgraded to free plan');
  }
}