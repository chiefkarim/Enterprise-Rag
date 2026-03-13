import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { signUpSchema, type SignUpRequest } from '@/features/auth/types';
import { signup } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/stores/authStore';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already logged in, redirect to dashboard
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpRequest>({
    resolver: zodResolver(signUpSchema),
  });

  const signupMutation = useMutation({
    mutationFn: async (userData: SignUpRequest) => {
      return await signup(userData);
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Something went wrong. Please try again.';
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: SignUpRequest) => {
    setErrorMessage(null);
    signupMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
            <p className="text-white/60 mb-6">
              Your account has been successfully created. Redirecting you to the sign-in page...
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Click here if you are not redirected
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-600/5 blur-[150px]" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Glass card */}
        <div
          className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px -12px rgba(0,0,0,0.7)' }}
        >
          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create an account</h1>
            <p className="text-sm text-white/50 mt-1">Join Enterprise RAG today</p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/25 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                  ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-blue-500/50'}`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register('email')}
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/25 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                  ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-blue-500/50'}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-11 text-white placeholder-white/25 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200
                    ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-blue-500/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500
                py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20
                hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Sign up
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
