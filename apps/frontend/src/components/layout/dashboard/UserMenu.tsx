import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { User } from '@/features/auth/types';

export function UserMenu({ user }: { user: User | null | undefined }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
       <button
        id="logout-btn"
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
      
      <div className="flex items-center gap-3 pl-4 border-l border-white/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5DD7AD] to-[#3ab88e] flex items-center justify-center text-[10px] font-bold text-[#0a1628] shadow-md">
          {getInitials(user.name)}
        </div>
        <span className="text-sm text-white/70 font-medium hidden sm:inline-block">{user.name}</span>
      </div>
    </div>
  );
}
