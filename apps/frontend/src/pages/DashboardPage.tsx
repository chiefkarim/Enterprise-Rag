import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ChatModule } from '@/features/chat/components/ChatModule';

export default function DashboardPage() {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="p-8">
      <ChatModule />
    </div>
  );
}
