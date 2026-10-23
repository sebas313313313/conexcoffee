import api from '@/lib/axios';

// ============================================
// Logística API — Sacos, Precintos QR, Trazabilidad y Contenedores
// ============================================
// Conecta con:
// - /api/sacos-cafe
// - /api/inventario-precintos-qr
// - /api/trazabilidad-escaneos
// - /api/contenedores-virtuales
// ============================================

// --- Sacos de Café ---
export async function getSacosCafe(params = {}) {
  const { data } = await api.get('/sacos-cafe', { params });
  return data?.data || data || [];
}

export async function getSacoCafeById(id) {
  const { data } = await api.get(`/sacos-cafe/${id}`);
  return data?.data || data;
}

export async function getSacosByPreoferta(preofertaId) {
  const { data } = await api.get(`/sacos-cafe/preoferta/${preofertaId}`);
  return data?.data || data || [];
}

export async function createSacoCafe(payload) {
  const { data } = await api.post('/sacos-cafe', payload);
  return data?.data || data;
}

export async function canjearQrInterno(payload) {
  const { data } = await api.post('/sacos-cafe/canjear-qr-interno', payload);
  return data?.data || data;
}

export async function updateSacoCafe(id, payload) {
  const { data } = await api.put(`/sacos-cafe/${id}`, payload);
  return data?.data || data;
}

export async function deleteSacoCafe(id) {
  const { data } = await api.delete(`/sacos-cafe/${id}`);
  return data?.data || data;
}

// --- Inventario Precintos QR ---
export async function getPrecintosQr(params = {}) {
  const { data } = await api.get('/inventario-precintos-qr', { params });
  return data?.data || data || [];
}

export async function createPrecintoQr(payload) {
  const { data } = await api.post('/inventario-precintos-qr', payload);
  return data?.data || data;
}

export async function updatePrecintoQr(id, payload) {
  const { data } = await api.put(`/inventario-precintos-qr/${id}`, payload);
  return data?.data || data;
}

// --- Trazabilidad Escaneos ---
export async function getTrazabilidadEscaneos(params = {}) {
  const { data } = await api.get('/trazabilidad-escaneos', { params });
  return data?.data || data || [];
}

export async function getTrazabilidadTecnica(tokenQrExterno) {
  const { data } = await api.get(`/trazabilidad-escaneos/tecnico/${tokenQrExterno}`);
  return data?.data || data;
}

export async function registrarEscaneoTrazabilidad(payload) {
  const { data } = await api.post('/trazabilidad-escaneos', payload);
  return data?.data || data;
}

// --- Contenedores Virtuales ---
export async function getContenedoresVirtuales(params = {}) {
  const { data } = await api.get('/contenedores-virtuales', { params });
  return data?.data || data || [];
}

export async function getContenedorById(id) {
  const { data } = await api.get(`/contenedores-virtuales/${id}`);
  return data?.data || data;
}

export async function createContenedorVirtual(payload) {
  const { data } = await api.post('/contenedores-virtuales', payload);
  return data?.data || data;
}

export async function updateContenedorVirtual(id, payload) {
  const { data } = await api.put(`/contenedores-virtuales/${id}`, payload);
  return data?.data || data;
}

export async function deleteContenedorVirtual(id) {
  const { data } = await api.delete(`/contenedores-virtuales/${id}`);
  return data?.data || data;
}
