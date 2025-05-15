import React, { useEffect } from 'react';
import MainLayout from '../Layout/MainLayout';
import { Check } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStripe } from '../../hooks/useStripe';
import { useSubscription } from '../../hooks/useSubscription';
import toast from 'react-hot-toast';
import { STRIPE_PRODUCTS } from '../../stripe-config';
import BackButton from '../ui/BackButton';
import { ArrowLeft } from 'react-bootstrap-icons';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { createCheckoutSession, loading: checkoutLoading } = useStripe();
  const { 
    checkSubscriptionStatus, 
    hasActiveSubscription, 
    loading: subscriptionLoading,
    subscriptionDetails,
    cancelSubscription 
  } = useSubscription();
  const view = searchParams.get('view');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && user) {
      console.log('Checking subscription after Stripe redirect');
      checkSubscriptionStatus();
    }
  }, [searchParams, user]);

  const handleSubscriptionAction = async (plan: 'starter' | 'family') => {
    try {
      if (!user) {
        navigate('/auth/sign-up');
        return;
      }

      if (isCurrentPlan(STRIPE_PRODUCTS[plan].priceId)) {
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

  const isCurrentPlan = (priceId: string) => {
    return subscriptionDetails?.price_id === priceId && hasActiveSubscription;
  };

  const getButtonText = (plan: 'starter' | 'family') => {
    if (!user) return 'Start Free Trial';
    if (isCurrentPlan(STRIPE_PRODUCTS[plan].priceId)) {
      return subscriptionDetails?.cancel_at_period_end ? 'Subscription Canceled' : 'Cancel Subscription';
    }
    if (hasActiveSubscription) {
      return plan === 'family' ? 'Upgrade Plan' : 'Downgrade Plan';
    }
    return 'Select This Plan';
  };

  const getButtonClasses = (plan: 'starter' | 'family', isCurrentPlan: boolean) => {
    const baseClasses = "w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-white text-sm";
    
    if (!user) {
      return `${baseClasses} bg-accent-400 hover:bg-accent-500 transform hover:scale-105`;
    }
    
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
    if (isCurrentPlan(STRIPE_PRODUCTS[plan].priceId) && subscriptionDetails?.cancel_at_period_end) {
      return true;
    }
    return checkoutLoading;
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4">
        <BackButton
          to={user ? '/dashboard' : '/'} 
          label={user ? 'Back to Story Creator' : 'Back to Home'} 
        />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your family!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl shadow-xl border border-accent-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-gradient-to-r from-accent-500 to-accent-400 p-6 text-white text-center">
              <h2 className="text-xl font-bold mb-px">Storybook Starter</h2>
              <p className="text-accent-50 text-sm">Personalized stories for your little reader</p>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900">$5.99</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-6 w-full">
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <span>Create up to 15 stories per month</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <span>Save up to 2 custom characters</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <span>Standard 5-minute story format</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <span>Advanced fields & saved templates</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscriptionAction('starter')}
                disabled={isButtonDisabled('starter')}
                className={getButtonClasses('starter', isCurrentPlan(STRIPE_PRODUCTS.starter.priceId))}
              >
                {getButtonText('starter')}
              </button>

              {!hasActiveSubscription && (
                <p className="text-center text-xs text-gray-600 mt-4">
                  5-day free trial, cancel anytime
                </p>
              )}
            </div>
          </div>

          {/* Unlimited Plan */}
          <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">            
            <div className="bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white text-center">
              <h2 className="text-xl font-bold mb-px">Family Magic</h2>
              <p className="text-primary-50 text-sm">Endless stories for the entire family</p>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900">$11.99</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-6 w-full">
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>Create unlimited stories per month</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>Save unlimited custom characters</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>Multiple story formats</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>Advanced fields & saved templates</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscriptionAction('family')}
                disabled={isButtonDisabled('family')}
                className={getButtonClasses('family', isCurrentPlan(STRIPE_PRODUCTS.family.priceId))}
              >
                {getButtonText('family')}
              </button>

              {!hasActiveSubscription && (
                <p className="text-center text-xs text-gray-600 mt-4">
                  5-day free trial, cancel anytime
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="mb-3 text-sm">Questions? We're here to help!</p>
          <a href="#" className="text-primary-500 hover:text-primary-600 underline text-sm">
            Contact our support team
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;