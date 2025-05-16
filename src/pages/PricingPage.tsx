import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import PricingTiers from '../components/auth/PricingTiers';
import { ArrowLeft, Check } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = React.useState('');
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  const handlePlanSelection = (plan: 'starter' | 'family') => {
    if (!user) {
      navigate('/auth/sign-up');
      return;
    }
    navigate('/dashboard/subscription', { state: { selectedPlan: plan } });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
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
                onClick={() => handlePlanSelection('starter')}
                className="w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-white text-sm bg-accent-400 hover:bg-accent-500 transform hover:scale-105"
              >
                {user ? 'Select Plan' : 'Start Free Trial'}
              </button>

              <p className="text-center text-xs text-gray-600 mt-4">
                5-day free trial, cancel anytime
              </p>
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
                onClick={() => handlePlanSelection('family')}
                className="w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg text-white text-sm bg-accent-400 hover:bg-accent-500 transform hover:scale-105"
              >
                {user ? 'Select Plan' : 'Start Free Trial'}
              </button>

              <p className="text-center text-xs text-gray-600 mt-4">
                5-day free trial, cancel anytime
              </p>
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