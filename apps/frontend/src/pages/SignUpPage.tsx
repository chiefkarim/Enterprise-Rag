import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { signUpSchema, type SignUpRequest } from '@/features/auth/types';
import { signup } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle organic background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="relative w-full max-w-md">
          <div className="relative rounded-[2.5rem] border border-border/50 bg-card p-10 shadow-2xl shadow-primary/5 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-serif italic text-foreground mb-3 tracking-tight">Account Created</h1>
            <p className="text-muted-foreground font-light mb-8 leading-relaxed">
              Your organic knowledge space is being prepared. Redirecting you to sign in...
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-primary hover:underline transition-all"
            >
              Take me there now
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-serif italic font-medium text-foreground tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground mt-2 font-light">Join the organic knowledge revolution</p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={`w-full rounded-2xl border bg-background px-5 py-4 text-foreground placeholder-muted-foreground/30 text-sm font-light
                  focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300
                  ${errors.name ? 'border-red-500/30 focus:ring-red-500/20' : 'border-border/50 hover:border-primary/20 focus:border-primary/50'}`}
              />
              {errors.name && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                Email address
              </label>
              <input
                id="email"
                type="email"
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
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full mt-6 flex items-center justify-center gap-3 rounded-full bg-primary
                py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20
                hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300"
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign up
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground/60 font-medium">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary font-bold hover:underline ml-1 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
