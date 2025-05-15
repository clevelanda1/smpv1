import React from 'react';
import { Check, Star } from 'lucide-react';

interface PricingTiersProps {
  selectedTier: string;
  onSelectTier: (tier: string) => void;
  billingInterval: 'monthly' | 'yearly';
  onChangeBillingInterval: (interval: 'monthly' | 'yearly') => void;
}

const tiers = [
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 5.99, yearly: 59.99 },
    features: [
      '25 stories per month',
      'Basic character customization',
      'Email support',
      'Standard story length',
      'Multiple languages'
    ]
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: { monthly: 14.99, yearly: 149.99 },
    features: [
      'Unlimited stories',
      'Advanced character customization',
      'Priority support',
      'Extended story length',
      'Custom themes',
      'Story templates',
      'All languages'
    ],
    popular: true
  }
];

const PricingTiers: React.FC<PricingTiersProps> = ({
  selectedTier,
  onSelectTier,
  billingInterval,
  onChangeBillingInterval
}) => {
  const yearlyDiscount = 15; // 15% discount for yearly billing

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center space-x-4 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
          <button
            onClick={() => onChangeBillingInterval('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => onChangeBillingInterval('yearly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingInterval === 'yearly'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly ({yearlyDiscount}% off)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {tiers.map((tier) => {
          const price = billingInterval === 'yearly'
            ? (tier.price.yearly / 12).toFixed(2)
            : tier.price.monthly.toFixed(2);

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl border transition-all ${
                selectedTier === tier.id
                  ? 'border-primary-500 shadow-lg scale-[1.02]'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="mb-6">
                  <p className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${price}
                    </span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </p>
                  {billingInterval === 'yearly' && (
                    <p className="text-sm text-accent-600 mt-1">
                      Billed annually (${tier.price.yearly}/year)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onSelectTier(tier.id)}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                    selectedTier === tier.id
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
                </button>

                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>5-day free trial, cancel anytime</p>
      </div>
    </div>
  );
};

export default PricingTiers;