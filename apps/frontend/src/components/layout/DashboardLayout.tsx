import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LogOut, LayoutDashboard, FileText, Settings, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getMe } from '@/features/auth/api/userApi';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: FileText, label: 'Documents', path: '/dashboard/documents' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardLayout() {
  const { user: storedUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    initialData: storedUser ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Determine current active page title
  const currentNav = navItems.find((item) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(item.path);
  });
  const pageTitle = currentNav ? currentNav.label : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#122663] via-[#0a1628] to-[#0d2040] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5DD7AD]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#122663]/40 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#080f1e]/95 backdrop-blur-xl shrink-0 z-10">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/vector/default-monochrome-white.svg"
              alt="latafarraqo logo"
              className="h-6 group-hover:scale-110 transition-transform duration-200"
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = path === '/dashboard' 
              ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
              : location.pathname.startsWith(path);
              
            return (
              <Link
                key={label}
                to={path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-[#5DD7AD]/10 text-[#5DD7AD] border border-[#5DD7AD]/20'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Top bar */}
        <header className="border-b border-white/5 px-8 py-4 flex items-center justify-between bg-[#080f1e]/80 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
            {pageTitle === 'Overview' && (
              <p className="text-xs text-white/40 mt-0.5">Your account at a glance</p>
            )}
            {pageTitle === 'Documents' && (
              <p className="text-xs text-white/40 mt-0.5">Manage and embed your workspace documents</p>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5DD7AD] to-[#3ab88e] flex items-center justify-center text-[10px] font-bold text-[#0a1628] shadow-md">
                {getInitials(user.name)}
              </div>
              <span className="text-sm text-white/70 font-medium">{user.name}</span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
