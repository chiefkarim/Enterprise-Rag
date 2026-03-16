import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { getMe } from '@/features/auth/api/userApi';
import { Sidebar } from './dashboard/Sidebar';
import { Topbar } from './dashboard/Topbar';

export default function DashboardLayout() {
  const { user: storedUser } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    initialData: storedUser ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5DD7AD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0a1628] text-white flex relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#122663] via-[#0a1628] to-[#0d2040] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5DD7AD]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#122663]/40 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Topbar user={user} />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
