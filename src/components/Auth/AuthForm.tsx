"use client"
import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  TrendingUp, 
  Gift, 
  Shield, 
  Zap,
  Chrome,  // Para Gmail/Google
  Twitter   // Para X/Twitter
} from 'lucide-react';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const isSignUp = mode === 'signup';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignUpFormData | SignInFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  const onSubmit = async (data: SignUpFormData | SignInFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        // Registro
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          setSuccess(result.message);
          reset();
          
          // Auto-login después del registro
          const signInResult = await signIn('credentials', {
            email: (data as SignUpFormData).email,
            password: (data as SignUpFormData).password,
            redirect: false,
          });

          if (signInResult?.ok) {
            router.push('/trade-v2');
          }
        } else {
          setError(result.message);
        }
      } else {
        // Login
        const result = await signIn('credentials', {
          email: (data as SignInFormData).email,
          password: (data as SignInFormData).password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/trade-v2');
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'twitter') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/trade-v2' });
    } catch (error) {
      setError('Social login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element floating-element--primary"></div>
        <div className="floating-element floating-element--secondary"></div>
        <div className="floating-element floating-element--accent"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center animate-glow">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              BinaryPro
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-300">
            {isSignUp 
              ? 'Join thousands of successful traders and get $5000 welcome bonus!' 
              : 'Sign in to continue your trading journey'
            }
          </p>
        </div>

        {/* Welcome Bonus Banner for Sign Up */}
        {isSignUp && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-6 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-green-400 font-bold text-lg">$5,000 Welcome Bonus!</div>
                <div className="text-green-300 text-sm">Start trading immediately with our generous welcome gift</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              Continue with Google
            </button>
            
            <button
              onClick={() => handleSocialLogin('twitter')}
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Twitter className="w-5 h-5" />
              Continue with X
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full bg-primary-600/20 border border-primary-500/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full bg-primary-600/20 border border-primary-500/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-primary-600/20 border border-primary-500/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-primary-600/20 border border-primary-500/30 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full bg-primary-600/20 border border-primary-500/30 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? <Gift className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  {isSignUp ? 'Create Account & Get $5000' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a
                href={isSignUp ? '/auth/signin' : '/auth/signup'}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </a>
            </p>
          </div>

          {/* Security Features for Sign Up */}
          {isSignUp && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-xs text-gray-400">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-400" />
                  <span className="text-xs text-gray-400">Fast</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Gift className="w-6 h-6 text-purple-400" />
                  <span className="text-xs text-gray-400">Bonus</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms and Privacy */}
        {isSignUp && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;