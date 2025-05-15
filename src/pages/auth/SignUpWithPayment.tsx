import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import PricingTiers from '../../components/auth/PricingTiers';
import PaymentForm from '../../components/auth/PaymentForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SignUpWithPayment: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (paymentMethodId: string) => {
    setIsLoading(true);

    try {
      // Create the subscription with Stripe
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          paymentMethodId,
          priceId: `price_${selectedTier}_${billingInterval}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      // Sign up the user
      await signUp(email, password);
      
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/auth/sign-in');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Create Your Account
            </h2>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Continue
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/auth/sign-in')}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Choose Your Plan
            </h2>
            <PricingTiers
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
              billingInterval={billingInterval}
              onChangeBillingInterval={setBillingInterval}
            />
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => selectedTier && setStep(3)}
                disabled={!selectedTier}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Continue
              </Button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Payment Information
            </h2>
            <PaymentForm
              onSubmit={handleSignUp}
              isLoading={isLoading}
            />
            <div className="mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNumber
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > stepNumber ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {renderStep()}
      </div>
    </MainLayout>
  );
};

export default SignUpWithPayment;