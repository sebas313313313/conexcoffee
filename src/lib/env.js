// ============================================
// Configuración de entorno — ConexCoffee
// ============================================
// Punto único de lectura de variables VITE_*.
// Conectado por defecto al Backend Real en http://localhost:3001/api
// ============================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001/api';

export const IS_DEMO_MODE = false;

export const HAS_API = Boolean(API_BASE_URL);
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ConexCoffee';
export const PAYMENT_PUBLIC_KEY = import.meta.env.VITE_PAYMENT_PUBLIC_KEY || '';
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
export const KEEPALIVE_ENABLED = import.meta.env.VITE_ENABLE_KEEPALIVE === 'true';

if (!IS_DEMO_MODE && !HAS_API) {
  console.error(
    '[ConexCoffee] VITE_API_BASE_URL no está definida y el modo demo está desactivado.'
  );
}

