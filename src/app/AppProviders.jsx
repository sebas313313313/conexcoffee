import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import useAuthStore from '@/store/useAuthStore';
import { setUnauthorizedHandler } from '@/lib/axios';
import { startKeepAliveRobot } from '@/lib/keepAliveBot';

// Registrar el callback de 401 en Axios (Inversión de dependencias)
setUnauthorizedHandler(() => {
  useAuthStore.getState().clearAuth();
});

// ============================================
// AppProviders — Wrapper de todos los providers globales
// ============================================
// Centraliza la inicialización de la app:
// - Monta el AuthProvider (verifica sesión vía cookies HttpOnly)
// - Monta el sistema de toasts (react-hot-toast)
// - Activa el robot keep-alive opcional
// ============================================

export default function AppProviders({ children }) {
  useEffect(() => {
    const cleanupRobot = startKeepAliveRobot();
    return () => cleanupRobot?.();
  }, []);

  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1917',
            color: '#fafaf9',
            borderRadius: '13px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#F25433',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </AuthProvider>
  );
}
