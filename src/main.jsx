import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/constants';
import { Spinner } from '@/components/ui';

// ============================================
// GuestRoute — Solo para usuarios NO autenticados
// ============================================
// Envuelve rutas como /login y /register.
// Si el usuario YA está autenticado → redirige a su dashboard según su rol.
// Evita que un usuario logueado vea la página de login.
// ============================================

export default function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const role = useAuthStore((s) => s.role);
  const hasValidSession = Boolean(!isLoading && isAuthenticated && role);

  // Mientras verificamos la sesión, mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si ya está autenticado con rol válido, redirigir a su dashboard
  if (hasValidSession) {
    const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] || '/';
    return <Navigate to={dashboardRoute} replace />;
  }

  // Si no está autenticado, mostrar login/register
  return <Outlet />;
}

