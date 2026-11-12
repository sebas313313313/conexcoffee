import api from '@/lib/axios';

const resource = '/ofertas-productores-externos';

export async function listarOfertasExternas(page, signal) {
  const response = await api.get(resource, { params: { page }, signal, strictResponse: true });
  return { ofertas: response.data, hayMas: response.meta?.hasNext };
}

export async function invitarProductorExterno(id) {
  await api.post(`${resource}/${id}/invitar`, {}, { strictResponse: true });
}
