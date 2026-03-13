import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import DashboardPage from '@/pages/DashboardPage';
import { useAuthStore } from '@/stores/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignInPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
