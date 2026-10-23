import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useAuthStore from '@/store/useAuthStore';
import {
  login as loginApi,
  logout as logoutApi,
  getMe as getMeApi,
  register as registerApi,
} from '../api/authApi';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/constants';

// ============================================
// AuthContext — Contexto Oficial de Autenticación
// ============================================
// Provee el estado global y acciones de autenticación
// conectado con la API REST del backend de ConexCoffee.
//
// ⚠️ Cumple estrictamente con las reglas de seguridad:
// - Cero persistencia en localStorage/sessionStorage.
// - Manejo de credenciales en memoria volátil de ejecución.
// ============================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    user,
    role,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    clearAuth,
    setLoading,
  } = useAuthStore();

  const [authError, setAuthError] = useState(null);

  /**
   * Verifica la sesión activa del usuario contra el backend.
   */
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const data = await getMeApi();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      // Si la sesión no es válida o expira, se limpia el estado
      clearAuth();
      setAuthError(err?.response?.data?.error?.message || null);
    } finally {
      setLoading(false);
    }
  }, [setUser, clearAuth, setLoading]);

  /**
   * Inicia sesión con credenciales contra el backend.
   *
   * @param {object} credentials - { email, password }
   * @returns {Promise<object>}
   */
  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);
        setAuthError(null);
        const data = await loginApi(credentials);

        if (data?.user) {
          setUser(data.user, data.token || null);
        } else if (data?.data?.usuario) {
          setUser(data.data.usuario, data.data.token || null);
        }

        return data;
      } catch (err) {
        const errorMsg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Credenciales inválidas';
        setAuthError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading]
  );

  /**
   * Registra un nuevo usuario en la plataforma.
   */
  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setAuthError(null);
        const data = await registerApi(userData);
        return data;
      } catch (err) {
        const errorMsg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Error al registrar el usuario';
        setAuthError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Cierra la sesión activa en el backend y limpia el store.
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutApi();
    } catch {
      // Ignorar fallos de red al cerrar sesión para garantizar salida local
    } finally {
      clearAuth();
      setAuthError(null);
      setLoading(false);
    }
  }, [clearAuth, setLoading]);

  /**
   * Obtiene la ruta del dashboard que corresponde al rol actual.
   */
  const getDashboardRoute = useCallback(() => {
    if (!role) return '/';
    return ROLE_DASHBOARD_ROUTES[role] || '/';
  }, [role]);

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      isAuthenticated,
      isLoading,
      authError,
      login,
      register,
      logout,
      checkSession,
      getDashboardRoute,
      setToken,
    }),
    [
      user,
      role,
      token,
      isAuthenticated,
      isLoading,
      authError,
      login,
      register,
      logout,
      checkSession,
      getDashboardRoute,
      setToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir AuthContext
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser utilizado dentro de un <AuthProvider />');
  }
  return context;
}

export default AuthContext;
