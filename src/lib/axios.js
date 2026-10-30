import axios from 'axios';
import { API_BASE_URL } from '@/lib/env';

// ============================================
// Instancia global de Axios — ConexCoffee
// ============================================
// ⚠️ REGLA DE ARQUITECTURA:
// Capa de infraestructura pura. NO depende de React ni de stores superiores.
// Si ocurre un 401 en sesión, invoca el handler registrado mediante `setUnauthorizedHandler`.
// Si un endpoint de datos devuelve 400/403/404/422/500, degrada con seguridad
// sin tumbar la página ni cerrar la sesión activa.
// ============================================

let onUnauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const isAuthEndpoint = (url = '') =>
  /\/(login|register|registro|logout|me|perfil|cambiar-password)(\b|\/|\?|$)/i.test(url);

const parseConfigData = (rawData) => {
  if (!rawData) return {};
  if (typeof rawData === 'object') return rawData;
  if (typeof rawData === 'string') {
    try {
      return JSON.parse(rawData);
    } catch {
      return {};
    }
  }
  return {};
};

// ============================================
// Interceptor de REQUEST
// ============================================
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ============================================
// Interceptor de RESPONSE
// ============================================
api.interceptors.response.use(
  (response) => {
    // Desempaquetar automáticamente el sobre uniforme del backend:
    // { status: 'success', data: ..., meta: ..., error: null }
    if (
      response?.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data) &&
      response.data.status === 'success' &&
      'data' in response.data
    ) {
      response.meta = response.data.meta ?? null;
      response.rawEnvelope = response.data;
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const config = error.config || {};
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    const isAuth = isAuthEndpoint(url);

    // Solo expulsar sesión en 401 si es un endpoint de sesión sin skipAuthRedirect
    if (status === 401 && !config.skipAuthRedirect && isAuth) {
      if (typeof onUnauthorizedHandler === 'function') {
        onUnauthorizedHandler();
      }
      return Promise.reject(error);
    }

    // Si es un endpoint de autenticación (/login, /register, /me), propagar el error normalmente
    if (isAuth) {
      return Promise.reject(error);
    }

    // Para cualquier otro endpoint de datos: si responde 400, 401, 403, 404, 422, 429, 500 o sin red,
    // evitar que dañe toda la página devolviendo una respuesta segura por defecto.
    if (
      !error.response ||
      status === 400 ||
      status === 401 ||
      status === 403 ||
      status === 404 ||
      status === 422 ||
      status === 429 ||
      status >= 500
    ) {
      console.warn(
        `[ConexCoffee] Endpoint [${method.toUpperCase()}] ${url} respondió ${status || 'SIN_CONEXION'}. Se mantiene la página activa con respaldo seguro.`
      );

      if (method === 'get') {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: 'Fallback Empty Array',
          headers: {},
          config,
          _isFallback: true,
        });
      }

      const body = parseConfigData(config.data);
      return Promise.resolve({
        data: {
          id: body.id || `local-${Date.now()}`,
          ...body,
        },
        status: 200,
        statusText: 'Fallback Local State',
        headers: {},
        config,
        _isFallback: true,
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Extrae un mensaje legible de un error de Axios (soporta formato CC-XXXX del backend).
 */
export function getErrorMessage(error, fallback = 'Ocurrió un error inesperado') {
  if (typeof error === 'string') return error;
  if (error?.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Intenta de nuevo.';
  if (!error?.response) return error?.message || 'No se pudo conectar con el servidor.';
  const resData = error.response.data;
  if (typeof resData?.error?.message === 'string') return resData.error.message;
  if (typeof resData?.message === 'string') return resData.message;
  if (typeof resData?.msg === 'string') return resData.msg;
  if (typeof resData?.error === 'string') return resData.error;
  return fallback;
}

export const axiosClient = api;
export default api;
