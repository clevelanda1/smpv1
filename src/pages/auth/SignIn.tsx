import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { Button } from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import { FileLock, Envelope } from 'react-bootstrap-icons';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password, remember);
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
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
            <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
            <p className="text-accent-50">
              Sign in to continue your magical journey
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-6">
              <Button
                variant="social"
                className="w-full h-11 text-base"
                onClick={() => signInWithGoogle()}
                icon={
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                }
              >
                Continue with Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-500 bg-white">Or continue with email</span>
              </div>
            </div>

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

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <FileLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/auth/reset-password')}
                  className="text-accent-500 hover:text-accent-600"
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-accent-400 hover:bg-accent-500 text-white shadow-md hover:shadow-lg"
                loading={loading}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Sign In
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/auth/sign-up')}
                  className="text-accent-500 hover:text-accent-600"
                >
                  Sign up
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignIn;