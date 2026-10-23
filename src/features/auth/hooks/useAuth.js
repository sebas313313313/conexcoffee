import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import useAuthStore from '@/store/useAuthStore';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/constants';

// ============================================
// useAuth — Hook de autenticación
// ============================================
// Provee acceso unificado al AuthContext y al estado de sesión.
//
// Uso:
//   const { user, role, isAuthenticated, login, logout, checkSession } = useAuth();
// ============================================

export default function useAuth() {
  const context = useContext(AuthContext);
  const store = useAuthStore();

  if (context) {
    return context;
  }

  // Fallback seguro si se usa antes de montar el Provider
  return {
    user: store.user,
    role: store.role,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    setUser: store.setUser,
    clearAuth: store.clearAuth,
    setLoading: store.setLoading,
    checkSession: () => {},
    logout: () => store.clearAuth(),
    getDashboardRoute: () => ROLE_DASHBOARD_ROUTES[store.role] || '/',
  };
}
