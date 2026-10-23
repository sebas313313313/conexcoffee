import api from '@/lib/axios';

// ============================================
// Seguridad & Administración API — Endpoints
// ============================================
// Conecta con:
// - /api/alertas-seguridad
// - /api/catalogo-errores
// - /api/usuarios-sistema
// ============================================

// --- Alertas de Seguridad ---
export async function getAlertasSeguridad(params = {}) {
  const { data } = await api.get('/alertas-seguridad', { params });
  return data?.data || data || [];
}

export async function getAlertaById(id) {
  const { data } = await api.get(`/alertas-seguridad/${id}`);
  return data?.data || data;
}

export async function resolverAlertaSeguridad(id, payload = {}) {
  const { data } = await api.patch(`/alertas-seguridad/${id}/resolver`, payload);
  return data?.data || data;
}

// --- Catálogo de Errores CC-XXXX ---
export async function getCatalogoErrores(params = {}) {
  const { data } = await api.get('/catalogo-errores', { params });
  return data?.data || data || [];
}

export async function getErrorByCodigo(codigo) {
  const { data } = await api.get(`/catalogo-errores/codigo/${codigo}`);
  return data?.data || data;
}

// --- Usuarios del Sistema ---
export async function getUsuariosSistema(params = {}) {
  const { data } = await api.get('/usuarios-sistema', { params });
  return data?.data || data || [];
}

export async function getUsuarioSistemaById(id) {
  const { data } = await api.get(`/usuarios-sistema/${id}`);
  return data?.data || data;
}

export async function createUsuarioSistema(payload) {
  const { data } = await api.post('/usuarios-sistema', payload);
  return data?.data || data;
}

export async function updateUsuarioSistema(id, payload) {
  const { data } = await api.put(`/usuarios-sistema/${id}`, payload);
  return data?.data || data;
}

export async function deleteUsuarioSistema(id) {
  const { data } = await api.delete(`/usuarios-sistema/${id}`);
  return data?.data || data;
}
