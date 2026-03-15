import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User as UserIcon, Shield, Mail, Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getMe } from '@/features/auth/api/userApi';

function getRoleBadgeStyle(role: string) {
  if (role === 'admin')
    return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
  return 'bg-[#5DD7AD]/15 text-[#5DD7AD] border border-[#5DD7AD]/30';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const { accessToken, user: storedUser } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    initialData: storedUser ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="p-8 space-y-6">
      {user ? (
        <>
          {/* Profile card */}
          <div
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 relative overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 48px -12px rgba(0,0,0,0.4)' }}
          >
            {/* BG glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-600/8 blur-[80px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5DD7AD] to-[#3ab88e] flex items-center justify-center text-2xl font-bold text-[#0a1628] shadow-xl shadow-[#5DD7AD]/20 shrink-0">
                {getInitials(user.name)}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getRoleBadgeStyle(user.role)}`}
                  >
                    {user.role}
                  </span>
                </div>
                {user.email && (
                  <p className="text-sm text-white/50 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start gap-4 hover:border-[#5DD7AD]/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-lg bg-[#5DD7AD]/15 border border-[#5DD7AD]/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-[#5DD7AD]" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Email</p>
                <p className="text-sm text-white/80 mt-1 break-all">{user.email ?? '—'}</p>
              </div>
            </div>

            {/* Role card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start gap-4 hover:border-blue-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Role</p>
                <p className="text-sm text-white/80 mt-1 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Member since card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start gap-4 hover:border-blue-500/30 transition-all duration-200">
              <div className="w-9 h-9 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Member since</p>
                <p className="text-sm text-white/80 mt-1">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Account ID */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Account ID</p>
              <p className="text-sm text-white/80 mt-1 font-mono">#{user.id}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/40">Could not load user data.</p>
        </div>
      )}
    </div>
  );
}
