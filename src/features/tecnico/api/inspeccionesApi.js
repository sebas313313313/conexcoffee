import api from '@/lib/axios';

// ============================================
// Inspecciones Técnicas API — Endpoints
// ============================================
// Conecta con:
// - /api/inspecciones-finca
// ============================================

export async function getInspeccionesFinca(params = {}) {
  const { data } = await api.get('/inspecciones-finca', { params });
  return data?.data || data || [];
}

export async function getInspeccionById(id) {
  const { data } = await api.get(`/inspecciones-finca/${id}`);
  return data?.data || data;
}

export async function createInspeccionFinca(payload) {
  const { data } = await api.post('/inspecciones-finca', payload);
  return data?.data || data;
}

export async function updateInspeccionFinca(id, payload) {
  const { data } = await api.put(`/inspecciones-finca/${id}`, payload);
  return data?.data || data;
}

export async function deleteInspeccionFinca(id) {
  const { data } = await api.delete(`/inspecciones-finca/${id}`);
  return data?.data || data;
}
