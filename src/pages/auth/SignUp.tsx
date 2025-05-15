import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { Button } from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import { FileLock, Envelope, Person } from 'react-bootstrap-icons';
import toast from 'react-hot-toast';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      navigate('/pricing');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign up error:', error);
      toast.error('Failed to sign up with Google. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4">
        <BackButton />
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-accent-500 to-accent-400 p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-1">Create Account</h2>
            <p className="text-accent-50">
              Sign up and create wonderful new stories
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-6">
              <Button
                variant="social"
                className="w-full h-11 text-base"
                onClick={handleGoogleSignUp}
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
                  Full Name
                </label>
                <div className="relative">
                  <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
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
                Create Account
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
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

export default SignUp;