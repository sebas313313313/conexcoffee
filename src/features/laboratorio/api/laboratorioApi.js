import api from '@/lib/axios';

// ============================================
// Laboratorio API — Endpoints
// ============================================
// Conecta con:
// - /api/evaluaciones-fisicas
// - /api/catadores
// ============================================

// --- Evaluaciones Físicas ---
export async function getEvaluacionesFisicas(params = {}) {
  const { data } = await api.get('/evaluaciones-fisicas', { params });
  return data?.data || data || [];
}

export async function getEvaluacionFisicaById(id) {
  const { data } = await api.get(`/evaluaciones-fisicas/${id}`);
  return data?.data || data;
}

export async function createEvaluacionFisica(payload) {
  const { data } = await api.post('/evaluaciones-fisicas', payload);
  return data?.data || data;
}

export async function updateEvaluacionFisica(id, payload) {
  const { data } = await api.put(`/evaluaciones-fisicas/${id}`, payload);
  return data?.data || data;
}

export async function deleteEvaluacionFisica(id) {
  const { data } = await api.delete(`/evaluaciones-fisicas/${id}`);
  return data?.data || data;
}

// --- Catadores ---
export async function getCatadores(params = {}) {
  const { data } = await api.get('/catadores', { params });
  return data?.data || data || [];
}

export async function getCatadorById(id) {
  const { data } = await api.get(`/catadores/${id}`);
  return data?.data || data;
}

export async function createCatador(payload) {
  const { data } = await api.post('/catadores', payload);
  return data?.data || data;
}

export async function updateCatador(id, payload) {
  const { data } = await api.put(`/catadores/${id}`, payload);
  return data?.data || data;
}

export async function deleteCatador(id) {
  const { data } = await api.delete(`/catadores/${id}`);
  return data?.data || data;
}
