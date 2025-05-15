import Stripe from 'npm:stripe@14.19.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found');
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      );
      console.log('🎯 Webhook event received:', {
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString()
      });
    } catch (err) {
      console.error('❌ Error verifying webhook signature:', err);
      return new Response(`Webhook signature verification failed: ${err.message}`, { 
        status: 400 
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('📦 Processing checkout session:', {
          id: session.id,
          customerId: session.customer,
          mode: session.mode,
          paymentStatus: session.payment_status,
          subscriptionId: session.subscription
        });
        
        await handleCheckoutSession(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Processing subscription event:', {
          type: event.type,
          id: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        });
        
        await handleSubscriptionUpdate(subscription);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('❌ Error processing webhook:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  try {
    console.log('🔍 Handling checkout session:', {
      id: session.id,
      mode: session.mode,
      status: session.status,
      customerId: session.customer
    });

    const customerId = session.customer as string;
    if (!customerId) {
      throw new Error('No customer ID in session');
    }

    // Log customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    console.log('👤 Customer details:', {
      id: customer.id,
      email: customer.email,
      metadata: customer.metadata
    });

    // Update customer record
    console.log('💾 Updating customer record in Supabase...');
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .upsert({
        customer_id: customerId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'customer_id'
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error updating customer:', customerError);
      throw customerError;
    }

    console.log('✅ Customer record updated:', customerData);

    // Handle subscription
    if (session.mode === 'subscription' && session.subscription) {
      console.log('🔄 Retrieving subscription details...');
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      console.log('📝 Subscription details:', {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        items: subscription.items.data.map(item => ({
          priceId: item.price.id,
          quantity: item.quantity
        }))
      });

      await handleSubscriptionUpdate(subscription);
    }

    console.log('✅ Successfully processed checkout session:', session.id);
  } catch (error) {
    console.error('❌ Error handling checkout session:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    console.log('🔄 Updating subscription:', {
      id: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    });

    const customerId = subscription.customer as string;

    // Get current subscription record if exists
    const { data: currentSub } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();

    console.log('📝 Current subscription record:', currentSub || 'None');

    // Prepare subscription data
    const subscriptionData = {
      customer_id: customerId,
      subscription_id: subscription.id,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Updating subscription record:', subscriptionData);

    const { data: updatedSub, error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'customer_id'
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('❌ Error updating subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log('✅ Successfully updated subscription record:', updatedSub);
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
    throw error;
  }
}