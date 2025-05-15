import Stripe from 'npm:stripe@14.19.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// Validate required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
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
    // Log request details for debugging
    console.log('🔍 Incoming webhook request:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      contentType: req.headers.get('content-type'),
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Validate request method
    if (req.method !== 'POST') {
      console.error('❌ Invalid request method:', req.method);
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('❌ Invalid content type:', contentType);
      return new Response('Invalid content type', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable');
      return new Response('Configuration error: Missing webhook secret', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Find Stripe signature (case-insensitive)
    let signature = null;
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() === 'stripe-signature') {
        signature = value;
        break;
      }
    }

    if (!signature) {
      console.error('❌ No Stripe signature found in headers:', 
        Object.fromEntries(req.headers.entries())
      );
      return new Response('No Stripe signature found', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log('📦 Raw webhook payload:', rawBody.substring(0, 500) + '...');
    console.log('🔑 Webhook signature:', signature.substring(0, 20) + '...');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      console.log('✅ Webhook signature verified:', {
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString()
      });
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', {
        error: err.message,
        signature: signature.substring(0, 20) + '...',
        rawBody: rawBody.substring(0, 100) + '...'
      });
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('💳 Processing checkout session:', {
            id: session.id,
            customerId: session.customer,
            mode: session.mode,
            status: session.status,
            clientReferenceId: session.client_reference_id
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
            status: subscription.status
          });
          
          await handleSubscriptionUpdate(subscription);
          break;
        }

        default:
          console.log('⚠️ Unhandled event type:', event.type);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('❌ Error processing webhook:', {
        error: err.message,
        eventType: event.type,
        eventId: event.id
      });
      
      return new Response(
        JSON.stringify({ error: `Error processing webhook: ${err.message}` }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (err) {
    console.error('❌ Fatal webhook error:', err);
    return new Response(
      JSON.stringify({ error: `Fatal webhook error: ${err.message}` }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  try {
    console.log('🔍 Processing checkout session:', {
      id: session.id,
      customerId: session.customer,
      mode: session.mode,
      clientReferenceId: session.client_reference_id
    });

    // Get customer ID from session
    const customerId = session.customer as string;
    if (!customerId) {
      throw new Error('No customer ID in session');
    }

    // Get user ID from client_reference_id or customer metadata
    let userId = session.client_reference_id;
    if (!userId) {
      const customer = await stripe.customers.retrieve(customerId);
      userId = customer.metadata.userId;
      console.log('📝 Retrieved user ID from customer metadata:', userId);
    }

    if (!userId) {
      throw new Error('Unable to determine user ID from session or customer metadata');
    }

    // Log customer details
    const customer = await stripe.customers.retrieve(customerId);
    console.log('👤 Customer details:', {
      id: customer.id,
      email: customer.email,
      metadata: customer.metadata,
      userId: userId
    });

    // Update customer record with user_id
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .upsert({
        user_id: userId,
        customer_id: customerId,
        updated_at: new Date().toISOString()
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
      console.log('🔄 Retrieving subscription:', session.subscription);
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      console.log('📝 Subscription details:', {
        id: subscription.id,
        status: subscription.status,
        items: subscription.items.data.map(item => ({
          price: item.price.id,
          quantity: item.quantity
        }))
      });

      await handleSubscriptionUpdate(subscription);
    }

    console.log('✅ Checkout session processed successfully:', session.id);
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

    // Get current subscription record
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
      updated_at: new Date().toISOString()
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

    console.log('✅ Subscription record updated:', updatedSub);
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
    throw error;
  }
}