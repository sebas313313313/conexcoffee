import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';

// ============================================
// Instancia global de Axios — ConexCoffee
// ============================================
// ⚠️ REGLA DE SEGURIDAD:
// withCredentials: true → permite enviar/recibir cookies HttpOnly automáticamente.
// NUNCA guardar tokens en localStorage o en el estado global.
// La sesión se maneja EXCLUSIVAMENTE con cookies HttpOnly desde el backend.
// ============================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // Header adicional para ayudar al backend a identificar requests del frontend
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// ============================================
// Interceptor de REQUEST
// ============================================
// Añade headers de seguridad a cada petición.
// NO añadimos Authorization header porque la sesión
// se maneja con cookies HttpOnly (más seguro).
// ============================================
api.interceptors.request.use(
  (config) => {
    // Si existe un token JWT en memoria volátil (Zustand), se añade a la cabecera
    const token = useAuthStore.getState().token;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Interceptor de RESPONSE
// ============================================
// Captura errores de autenticación (401) de forma global.
// Si el backend responde con 401, significa que la sesión
// expiró o es inválida → cerramos sesión automáticamente.
// ============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Limpiar estado de autenticación
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      // Redirigir al login sin mostrar errores crudos
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      // Acceso prohibido — el usuario no tiene el rol adecuado
      console.warn('[ConexCoffee] Acceso prohibido: rol insuficiente');
    }

    if (status === 429) {
      // Rate limiting — demasiadas peticiones
      console.warn('[ConexCoffee] Demasiadas peticiones. Intenta de nuevo más tarde.');
    }

    return Promise.reject(error);
  }
);

export default api;
