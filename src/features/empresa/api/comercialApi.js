import api from '@/lib/axios';

// ============================================
// Comercial API — Preofertas y Pedidos Internacionales
// ============================================
// Conecta con:
// - /api/preofertas
// - /api/pedidos-internacionales
// ============================================

// --- Preofertas ---
export async function getPreofertas(params = {}) {
  const { data } = await api.get('/preofertas', { params });
  return data?.data || data || [];
}

export async function getPreofertaById(id) {
  const { data } = await api.get(`/preofertas/${id}`);
  return data?.data || data;
}

export async function createPreoferta(payload) {
  const { data } = await api.post('/preofertas', payload);
  return data?.data || data;
}

export async function updatePreoferta(id, payload) {
  const { data } = await api.put(`/preofertas/${id}`, payload);
  return data?.data || data;
}

export async function cambiarEstadoPreoferta(id, nuevoEstado) {
  const { data } = await api.patch(`/preofertas/${id}/estado`, { nuevoEstado });
  return data?.data || data;
}

export async function deletePreoferta(id) {
  const { data } = await api.delete(`/preofertas/${id}`);
  return data?.data || data;
}

// --- Pedidos Internacionales ---
export async function getPedidosInternacionales(params = {}) {
  const { data } = await api.get('/pedidos-internacionales', { params });
  return data?.data || data || [];
}

export async function getPedidoInternacionalById(id) {
  const { data } = await api.get(`/pedidos-internacionales/${id}`);
  return data?.data || data;
}

export async function createPedidoInternacional(payload) {
  const { data } = await api.post('/pedidos-internacionales', payload);
  return data?.data || data;
}

export async function updatePedidoInternacional(id, payload) {
  const { data } = await api.put(`/pedidos-internacionales/${id}`, payload);
  return data?.data || data;
}

export async function deletePedidoInternacional(id) {
  const { data } = await api.delete(`/pedidos-internacionales/${id}`);
  return data?.data || data;
}
