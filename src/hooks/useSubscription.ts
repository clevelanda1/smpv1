import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useSubscription = () => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    } else {
      setHasActiveSubscription(false);
      setLoading(false);
    }
  }, [user]);

  const verifyConnection = async () => {
    try {
      const { error } = await supabase.from('stripe_user_subscriptions').select('count').single();
      // If we get here, the connection is working
      return !error;
    } catch (e) {
      console.error('Connection verification failed:', e);
      return false;
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      // Verify Supabase connection first
      const isConnected = await verifyConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to the database. Please check your connection.');
      }

      console.log('Checking subscription status for user:', user?.id);

      const { data: subscriptions, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Subscription check error:', error);
        throw error;
      }

      console.log('Subscription data:', subscriptions);

      if (!subscriptions) {
        console.log('No subscription found');
        setHasActiveSubscription(false);
        setSubscriptionDetails(null);
        return;
      }

      const isActive = 
        subscriptions.subscription_status === 'active' || 
        subscriptions.subscription_status === 'trialing';

      console.log('Subscription status:', subscriptions.subscription_status);
      console.log('Is active:', isActive);

      setHasActiveSubscription(isActive);
      setSubscriptionDetails(subscriptions);
    } catch (error) {
      console.error('Error checking subscription:', error);
      
      // More specific error messages based on the error type
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to verify subscription status. Please try again later.');
      }
      
      setHasActiveSubscription(false);
      setSubscriptionDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      
      // Verify connection before attempting to cancel
      const isConnected = await verifyConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to the database. Please check your connection.');
      }
      
      // Call the cancel-subscription edge function
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: subscriptionDetails?.subscription_id
        }
      });

      if (error) throw error;

      // Refresh the subscription status
      await checkSubscriptionStatus();
      
      return { error: null };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to cancel subscription. Please try again later.');
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { 
    hasActiveSubscription,
    subscriptionDetails,
    loading,
    checkSubscriptionStatus,
    cancelSubscription
  };
};