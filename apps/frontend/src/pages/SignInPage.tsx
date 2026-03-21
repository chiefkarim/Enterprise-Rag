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
  const { accessToken, setAuth } = useAuthStore();
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
      // Set access token immediately so subsequent requests (like getMe) 
      // can use it in the axios interceptor.
      useAuthStore.getState().setAccessToken(tokenData.access_token);
      
      const user = await getMe();
      setAuth(tokenData.access_token, tokenData.refresh_token, user);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div
          className="relative rounded-[2.5rem] border border-border/50 bg-card p-10 shadow-2xl shadow-primary/5"
        >
          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif italic font-medium text-foreground tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-2 font-light">Sign in to your organic knowledge hub</p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email')}
                className={`w-full rounded-2xl border bg-background px-5 py-4 text-foreground placeholder-muted-foreground/30 text-sm font-light
                  focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300
                  ${errors.email ? 'border-red-500/30 focus:ring-red-500/20' : 'border-border/50 hover:border-primary/20 focus:border-primary/50'}`}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-2xl border bg-background px-5 py-4 pr-12 text-foreground placeholder-muted-foreground/30 text-sm font-light
                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300
                    ${errors.password ? 'border-red-500/30 focus:ring-red-500/20' : 'border-border/50 hover:border-primary/20 focus:border-primary/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signin-submit"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full mt-4 flex items-center justify-center gap-3 rounded-full bg-primary
                py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20
                hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cultivating…
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <div className="mt-10 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground/60 font-medium">
              New here? <a href="/signup" className="text-primary font-bold hover:underline">Request Access</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
