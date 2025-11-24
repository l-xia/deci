import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { FormField } from './FormField';
import deciLogo from '../assets/deci_logo.svg';

const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup, error, setError } = useAuth();

  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const {
    register: signupRegister,
    handleSubmit: signupHandleSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);

    try {
      await signup(data.email, data.password);
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={deciLogo} alt="Deci" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to continue to your daily deck' : 'Get started with your personalized daily deck'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {isLogin ? (
            <form onSubmit={loginHandleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                register={loginRegister('email')}
                error={loginErrors.email}
                disabled={loading}
              />

              <FormField
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                register={loginRegister('password')}
                error={loginErrors.password}
                disabled={loading}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="-ml-1 mr-2 text-white" />
                    Signing in...
                  </>
                ) : (
                  <>Sign In</>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={signupHandleSubmit(onSignupSubmit)} className="space-y-4">
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                register={signupRegister('email')}
                error={signupErrors.email}
                disabled={loading}
              />

              <FormField
                id="password"
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                register={signupRegister('password')}
                error={signupErrors.password}
                disabled={loading}
              />

              <FormField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                register={signupRegister('confirmPassword')}
                error={signupErrors.confirmPassword}
                disabled={loading}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="-ml-1 mr-2 text-white" />
                    Creating account...
                  </>
                ) : (
                  <>Sign Up</>
                )}
              </button>
            </form>
          )}

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
