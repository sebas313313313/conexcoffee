import { createContext, useCallback, useEffect } from 'react';
import api, { getErrorMessage } from '@/lib/axios';
import useAuthStore from '@/store/useAuthStore';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get('/usuarios-sistema/perfil', {
        skipAuthRedirect: true,
      });
      const payload = res?.data || res;
      const loggedUser = payload?.user || payload?.usuario || payload;
      if (loggedUser && (loggedUser.id || loggedUser.correo_electronico)) {
        setUser(loggedUser);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    }
  }, [clearAuth, setLoading, setUser]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(
    async (credentials, maybePassword) => {
      const email =
        typeof credentials === 'string'
          ? credentials
          : credentials?.email || credentials?.correo_electronico || credentials?.correo;
      const password =
        typeof credentials === 'string'
          ? maybePassword
          : credentials?.password || credentials?.contrasena;

      try {
        const { data: res } = await api.post('/usuarios-sistema/login', {
          correo_electronico: email,
          contrasena: password,
        });
        const payload = res?.data || res;
        const loggedUser = payload?.user || payload?.usuario || payload;
        if (!loggedUser) {
          throw new Error('No se pudo iniciar sesión. Verifica tus credenciales.');
        }
        setUser(loggedUser);
        return loggedUser;
      } catch (error) {
        clearAuth();
        throw new Error(getErrorMessage(error, 'Credenciales inválidas'));
      }
    },
    [clearAuth, setUser]
  );

  const register = useCallback(async (userData) => {
    try {
      const { data: res } = await api.post('/usuarios-sistema/register', userData);
      return res?.data || res;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al registrar el usuario'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/usuarios-sistema/logout');
    } catch {
      // Continuar limpieza local aunque falle la red
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const getDashboardRoute = useCallback(
    () => ROLE_DASHBOARD_ROUTES[role] || '/',
    [role]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading: isLoading,
        isLoading,
        isAuthenticated,
        checkSession,
        login,
        register,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
