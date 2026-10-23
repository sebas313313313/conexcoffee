import api from '@/lib/axios';

// ============================================
// CVA API — Endpoints de Catación y Protocolo CVA
// ============================================
// Conecta con los módulos backend:
// - /api/sesiones-catacion
// - /api/hojas-catacion-cva
// - /api/evaluaciones-sensoriales-cva (compatibilidad)
// ============================================

/**
 * Obtener lista de sesiones de catación disponibles.
 */
export async function getSesionesCatacion(params = {}) {
  try {
    const { data } = await api.get('/sesiones-catacion', { params });
    return data?.data || data || [];
  } catch (error) {
    // Si la ruta no responde o falla, intentar endpoint de compatibilidad
    if (error.response?.status === 404) {
      const { data } = await api.get('/evaluaciones-sensoriales-cva', { params });
      return data?.data || data || [];
    }
    throw error;
  }
}

/**
 * Obtener detalles de una sesión de catación con sus muestras y hojas.
 */
export async function getSesionDetalles(id) {
  try {
    const { data } = await api.get(`/sesiones-catacion/${id}/detalles`);
    return data?.data || data;
  } catch (error) {
    if (error.response?.status === 404) {
      const { data } = await api.get(`/sesiones-catacion/${id}`);
      return data?.data || data;
    }
    throw error;
  }
}

/**
 * Listar hojas de catación CVA guardadas.
 */
export async function getHojasCatacion(params = {}) {
  const { data } = await api.get('/hojas-catacion-cva', { params });
  return data?.data || data || [];
}

/**
 * Obtener una hoja de catación con todas sus fases desglosadas.
 */
export async function getHojaConFases(id) {
  const { data } = await api.get(`/hojas-catacion-cva/${id}/fases`);
  return data?.data || data;
}

/**
 * Exportar el documento JSON exacto CVA generado por PostgreSQL.
 */
export async function exportarHojaJson(id) {
  const { data } = await api.get(`/hojas-catacion-cva/${id}/exportar-json`);
  return data?.data || data;
}

/**
 * Ingestar una evaluación CVA en una sola transacción ACID.
 * Llama a calidad.fn_guardar_evaluacion_cva_desde_json en backend.
 *
 * @param {object} params
 * @param {object} params.payload - Formato { evaluacion: { codigo, fases, ... } }
 * @param {string} [params.catador_id]
 * @param {string} [params.evaluacion_fisica_id]
 * @param {number} [params.puntuacion_catador]
 */
export async function ingestarEvaluacionCva(params) {
  const { data } = await api.post('/hojas-catacion-cva/ingestar-json', params);
  return data?.data || data;
}
