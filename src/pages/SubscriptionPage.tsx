import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useStripe } from '../hooks/useStripe';
import MainLayout from '../components/Layout/MainLayout';
import BackButton from '../components/ui/BackButton';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createCheckoutSession, loading: checkoutLoading } = useStripe();
  const { 
    checkSubscriptionStatus, 
    hasActiveSubscription, 
    loading: subscriptionLoading,
    subscriptionDetails,
    cancelSubscription 
  } = useSubscription();

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const handleSubscriptionAction = async (plan: 'starter' | 'family') => {
    try {
      if (!user) {
        navigate('/auth/sign-up');
        return;
      }

      if (isCurrentPlan(plan)) {
        await cancelSubscription();
        toast.success('Subscription cancelled. You will have access until the end of your billing period.');
        return;
      }

      if (hasActiveSubscription) {
        if (plan === 'family') {
          await createCheckoutSession(plan);
        } else {
          await cancelSubscription();
          await createCheckoutSession(plan);
        }
        return;
      }

      await createCheckoutSession(plan);
    } catch (error) {
      console.error('Error handling subscription action:', error);
      toast.error('Failed to process subscription request. Please try again.');
    }
  };

  const isCurrentPlan = (plan: string) => {
    if (plan === 'starter') {
      return subscriptionDetails?.price_id === 'price_1RMjaQPLXvC55IxstFbeHc3I' && hasActiveSubscription;
    }
    if (plan === 'family') {
      return subscriptionDetails?.price_id === 'price_1ROmz0AdgMakcX19zsnEttn0' && hasActiveSubscription;
    }
    return false;
  };

  const getButtonText = (plan: 'starter' | 'family') => {
    if (isCurrentPlan(plan)) {
      return subscriptionDetails?.cancel_at_period_end ? 'Subscription Canceled' : 'Cancel Subscription';
    }
    if (hasActiveSubscription) {
      return plan === 'family' ? 'Upgrade Plan' : 'Downgrade Plan';
    }
    return 'Select This Plan';
  };

  const getButtonClasses = (plan: 'starter' | 'family', isCurrentPlan: boolean) => {
    const baseClasses = "w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-white text-xs sm:text-sm";
    
    if (isCurrentPlan) {
      if (subscriptionDetails?.cancel_at_period_end) {
        return `${baseClasses} bg-gray-400 cursor-not-allowed`;
      }
      return `${baseClasses} bg-secondary-500 hover:bg-secondary-600`;
    }
    
    if (hasActiveSubscription) {
      return plan === 'family' 
        ? `${baseClasses} bg-accent-400 hover:bg-accent-500 transform hover:scale-105`
        : `${baseClasses} bg-primary-500 hover:bg-primary-600`;
    }
    
    return `${baseClasses} bg-accent-400 hover:bg-accent-500 transform hover:scale-105`;
  };

  const isButtonDisabled = (plan: 'starter' | 'family') => {
    if (isCurrentPlan(plan) && subscriptionDetails?.cancel_at_period_end) {
      return true;
    }
    return checkoutLoading;
  };

  if (subscriptionLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-2 sm:px-4">
        <BackButton to="/dashboard" label="Back to Story Creator" />

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Manage Your Subscription
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {hasActiveSubscription 
              ? 'Update or manage your current subscription plan'
              : 'Choose a plan to start creating magical stories'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl shadow-xl border border-accent-100 overflow-hidden">
            <div className="bg-gradient-to-r from-accent-500 to-accent-400 p-4 sm:p-6 text-white text-center">
              <h2 className="text-lg sm:text-xl font-bold mb-px">Storybook Starter</h2>
              <p className="text-accent-50 text-xs sm:text-sm">Personalized stories for your little reader</p>
            </div>

            <div className="p-4 sm:p-6 flex flex-col items-center">
              <div className="flex items-baseline gap-1 mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">$5.99</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 w-full">
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" />
                  <span>Create up to 15 stories per month</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" />
                  <span>Save up to 2 custom characters</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" />
                  <span>Standard 5-minute story format</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" />
                  <span>Advanced fields & saved templates</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscriptionAction('starter')}
                disabled={isButtonDisabled('starter')}
                className={getButtonClasses('starter', isCurrentPlan('starter'))}
              >
                {getButtonText('starter')}
              </button>

              {isCurrentPlan('starter') && subscriptionDetails?.cancel_at_period_end && (
                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  Your subscription will end on {new Date(subscriptionDetails.current_period_end * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Unlimited Plan */}
          <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden">            
            <div className="bg-gradient-to-r from-primary-500 to-primary-400 p-4 sm:p-6 text-white text-center">
              <h2 className="text-lg sm:text-xl font-bold mb-px">Family Magic</h2>
              <p className="text-primary-50 text-xs sm:text-sm">Endless stories for the entire family</p>
            </div>

            <div className="p-4 sm:p-6 flex flex-col items-center">
              <div className="flex items-baseline gap-1 mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">$11.99</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 w-full">
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-400 flex-shrink-0" />
                  <span>Create unlimited stories per month</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-400 flex-shrink-0" />
                  <span>Save unlimited custom characters</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-400 flex-shrink-0" />
                  <span>Multiple story formats</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-400 flex-shrink-0" />
                  <span>Advanced fields & saved templates</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscriptionAction('family')}
                disabled={isButtonDisabled('family')}
                className={getButtonClasses('family', isCurrentPlan('family'))}
              >
                {getButtonText('family')}
              </button>

              {isCurrentPlan('family') && subscriptionDetails?.cancel_at_period_end && (
                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  Your subscription will end on {new Date(subscriptionDetails.current_period_end * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-gray-600">
          <p className="mb-2 sm:mb-3 text-xs sm:text-sm">Need help with your subscription?</p>
          <a href="#" className="text-primary-500 hover:text-primary-600 underline text-xs sm:text-sm">
            Contact our support team
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionPage;