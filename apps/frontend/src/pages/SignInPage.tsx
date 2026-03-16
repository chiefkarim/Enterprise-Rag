import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { loginSchema, type LoginRequest } from '@/features/auth/types';
import { login } from '@/features/auth/api/authApi';
import { getMe } from '@/features/auth/api/userApi';
import { useAuthStore } from '@/features/auth/stores/authStore';

export default function SignInPage() {
  const navigate = useNavigate();
  const { accessToken, setAccessToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const tokenData = await login(credentials);
      setAccessToken(tokenData.access_token);
      const user = await getMe();
      setUser(user);
      return user;
    },
    onSuccess: () => {
      navigate('/dashboard', { replace: true });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Something went wrong. Please try again.';
      setErrorMessage(message);
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setErrorMessage(null);
    loginMutation.mutate(data);
  };

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
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-white/50 mt-1">Sign in to your Enterprise RAG account</p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              id="signin-submit"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500
                py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20
                hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Divider hint */}
          <p className="mt-6 text-center text-xs text-white/30">
            Don't have an account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
