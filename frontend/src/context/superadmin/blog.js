import { axiosClient } from '../../lib/axios';

export function createBlogActions() {
  const listarPublicaciones = async (page = 1) => {
    const response = await axiosClient.get('/publicaciones-blog', { params: { page, limit: 20 }, strictResponse: true });
    return { publicaciones: response.data, meta: response.meta };
  };

  const guardarPublicacion = async (payload, id) => {
    const response = id
      ? await axiosClient.put('/publicaciones-blog/' + id, payload, { strictResponse: true })
      : await axiosClient.post('/publicaciones-blog', payload, { strictResponse: true });
    return response.data;
  };

  const eliminarPublicacion = async (id) => {
    await axiosClient.delete('/publicaciones-blog/' + id, { strictResponse: true });
  };

  const listarProductoresBlog = async () => {
    const productores = [];
    let page = 1;
    let totalPages;
    do {
      const response = await axiosClient.get('/caficultores', { params: { page, limit: 100 }, strictResponse: true });
      productores.push(...response.data);
      totalPages = response.meta?.totalPages || 1;
      page += 1;
    } while (page <= totalPages);
    return productores;
  };

  return { listarPublicaciones, guardarPublicacion, eliminarPublicacion, listarProductoresBlog };
}
