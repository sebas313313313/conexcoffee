import api from '@/lib/axios';

// ============================================
// Caficultura API — Endpoints
// ============================================
// Conecta con:
// - /api/caficultores
// - /api/fincas
// - /api/lotes-cultivo
// - /api/variedades-cafe
// ============================================

// --- Caficultores ---
export async function getCaficultores(params = {}) {
  const { data } = await api.get('/caficultores', { params });
  return data?.data || data || [];
}

export async function getCaficultorById(id) {
  const { data } = await api.get(`/caficultores/${id}`);
  return data?.data || data;
}

export async function createCaficultor(payload) {
  const { data } = await api.post('/caficultores', payload);
  return data?.data || data;
}

export async function updateCaficultor(id, payload) {
  const { data } = await api.put(`/caficultores/${id}`, payload);
  return data?.data || data;
}

export async function deleteCaficultor(id) {
  const { data } = await api.delete(`/caficultores/${id}`);
  return data?.data || data;
}

// --- Fincas ---
export async function getFincas(params = {}) {
  const { data } = await api.get('/fincas', { params });
  return data?.data || data || [];
}

export async function getFincaById(id) {
  const { data } = await api.get(`/fincas/${id}`);
  return data?.data || data;
}

export async function createFinca(payload) {
  const { data } = await api.post('/fincas', payload);
  return data?.data || data;
}

export async function updateFinca(id, payload) {
  const { data } = await api.put(`/fincas/${id}`, payload);
  return data?.data || data;
}

export async function deleteFinca(id) {
  const { data } = await api.delete(`/fincas/${id}`);
  return data?.data || data;
}

// --- Lotes de Cultivo ---
export async function getLotesCultivo(params = {}) {
  const { data } = await api.get('/lotes-cultivo', { params });
  return data?.data || data || [];
}

export async function getLoteCultivoById(id) {
  const { data } = await api.get(`/lotes-cultivo/${id}`);
  return data?.data || data;
}

export async function createLoteCultivo(payload) {
  const { data } = await api.post('/lotes-cultivo', payload);
  return data?.data || data;
}

export async function updateLoteCultivo(id, payload) {
  const { data } = await api.put(`/lotes-cultivo/${id}`, payload);
  return data?.data || data;
}

export async function deleteLoteCultivo(id) {
  const { data } = await api.delete(`/lotes-cultivo/${id}`);
  return data?.data || data;
}

// --- Variedades de Café ---
export async function getVariedadesCafe(params = {}) {
  const { data } = await api.get('/variedades-cafe', { params });
  return data?.data || data || [];
}

export async function createVariedadCafe(payload) {
  const { data } = await api.post('/variedades-cafe', payload);
  return data?.data || data;
}

export async function updateVariedadCafe(id, payload) {
  const { data } = await api.put(`/variedades-cafe/${id}`, payload);
  return data?.data || data;
}

export async function deleteVariedadCafe(id) {
  const { data } = await api.delete(`/variedades-cafe/${id}`);
  return data?.data || data;
}
