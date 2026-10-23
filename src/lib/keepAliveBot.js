// ============================================
// Keep-Alive Robot — ConexCoffee
// ============================================
// Robot de ping periódico para evitar caídas por inactividad
// y mantener despiertos los servicios de despliegue (Vercel / Render / Backend).
// ============================================

import api from './axios';

let keepAliveInterval = null;
const PING_INTERVAL_MS = 4 * 60 * 1000; // Cada 4 minutos

export function startKeepAliveRobot() {
  if (keepAliveInterval) return;

  const pingServer = async () => {
    try {
      // Intenta ping al endpoint de salud o ruta base
      await api.get('/health', { timeout: 8000 }).catch(async () => {
        // Fallback al endpoint raíz de la API
        await api.get('/', { timeout: 8000 }).catch(() => {});
      });
      // Ping silencioso exitoso
    } catch {
      // Ignorar fallos de red silenciosamente sin bloquear la interfaz
    }
  };

  // Ping inicial tras 10 segundos de carga
  const initialTimer = setTimeout(pingServer, 10000);

  // Intervalo recurrente
  keepAliveInterval = setInterval(pingServer, PING_INTERVAL_MS);

  return () => {
    clearTimeout(initialTimer);
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  };
}

export function stopKeepAliveRobot() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}
