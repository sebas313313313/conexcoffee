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

  const getPushSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration?.pushManager.getSubscription() || null;
  }, []);

  const enablePush = useCallback(async () => {
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      throw new Error('Este navegador requiere HTTPS o localhost para activar notificaciones.');
    }
    const { data } = await api.get('/web-push/public-key', { strictResponse: true });
    const key = data?.publicKey;
    if (!key) throw new Error('La clave pública de notificaciones no está disponible.');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('El navegador no concedió permiso para notificaciones.');
    const registration = await navigator.serviceWorker.register('/push-sw.js');
    const padding = '='.repeat((4 - key.length % 4) % 4);
    const binary = atob((key + padding).replace(/-/g, '+').replace(/_/g, '/'));
    const applicationServerKey = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    try {
      await api.post('/web-push/subscription', { subscription: subscription.toJSON() }, { strictResponse: true });
    } catch (error) {
      if (!existing) await subscription.unsubscribe();
      throw error;
    }
    return subscription;
  }, []);

  const disablePush = useCallback(async () => {
    const subscription = await getPushSubscription();
    if (!subscription) return;
    await api.delete('/web-push/subscription', {
      data: { endpoint: subscription.endpoint }, strictResponse: true,
    });
    await subscription.unsubscribe();
  }, [getPushSubscription]);

  const logout = useCallback(async () => {
    try {
      await disablePush();
    } catch {
      // El cierre de sesión debe continuar si falla la baja de la suscripción.
    }
    try {
      await api.post('/usuarios-sistema/logout');
    } catch {
      // Continuar limpieza local aunque falle la red
    } finally {
      clearAuth();
    }
  }, [clearAuth, disablePush]);

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
        getPushSubscription,
        enablePush,
        disablePush,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
