import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { Button } from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import { Envelope } from 'react-bootstrap-icons';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      navigate('/auth/sign-in');
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4">
        <BackButton />
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-accent-500 to-accent-400 p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
            <p className="text-accent-50">
              Enter your email to reset your password
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-accent-400 hover:bg-accent-500 text-white shadow-md hover:shadow-lg"
                loading={loading}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Reset Password
              </Button>

              <div className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/auth/sign-in')}
                  className="text-accent-500 hover:text-accent-600"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;