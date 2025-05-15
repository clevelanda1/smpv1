import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PRODUCTS, type StripePlan } from '../stripe-config';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function useStripe() {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (plan: StripePlan) => {
    try {
      setLoading(true);

      const product = STRIPE_PRODUCTS[plan];
      if (!product) {
        throw new Error('Invalid plan selected');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            price_id: product.priceId,
            success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/pricing`,
            mode: product.mode,
          }),
        }
      );

      const { sessionId, url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
      if (redirectError) {
        throw redirectError;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCheckoutSession,
  };
}