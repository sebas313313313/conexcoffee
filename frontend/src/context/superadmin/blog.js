import { axiosClient } from '../../lib/axios';
import {
  getStoredBlogPosts,
  saveStoredBlogPosts,
  mergeApiAndLocalPosts,
  normalizeBlogPost,
} from '@/features/landing/data/blogData';

const isUuid = (val) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(val || '')
  );

export function createBlogActions() {
  const listarPublicaciones = async (page = 1) => {
    const limit = 20;
    try {
      const response = await axiosClient.get('/publicaciones-blog', {
        params: { page, limit },
      });
      const apiRows = Array.isArray(response?.data) ? response.data : [];
      const merged = mergeApiAndLocalPosts(apiRows);
      const totalRecords = merged.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
      return {
        publicaciones: merged.slice((page - 1) * limit, page * limit),
        meta: { page, limit, totalRecords, totalPages },
      };
    } catch {
      const local = getStoredBlogPosts();
      const totalRecords = local.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
      return {
        publicaciones: local.slice((page - 1) * limit, page * limit),
        meta: { page, limit, totalRecords, totalPages },
      };
    }
  };

  const guardarPublicacion = async (payload, id) => {
    let savedPost = null;

    try {
      if (id && isUuid(id)) {
        const response = await axiosClient.put('/publicaciones-blog/' + id, payload, {
          strictResponse: true,
        });
        savedPost = response?.data;
      } else if (!id) {
        const response = await axiosClient.post('/publicaciones-blog', payload, {
          strictResponse: true,
        });
        savedPost = response?.data;
      }
    } catch {
      // Si el servidor no responde o la publicación es local, se persiste en almacenamiento sincronizado
    }

    const current = getStoredBlogPosts();
    const normalized = normalizeBlogPost({
      ...payload,
      ...(savedPost || {}),
      id: savedPost?.id || id || `blog-${Date.now()}`,
      url_evento:
        savedPost?.url_evento ||
        payload.url_evento ||
        payload.urlEvento ||
        null,
    });

    const exists = current.some((p) => p.id === normalized.id || (id && p.id === id));
    const updated = exists
      ? current.map((p) => (p.id === normalized.id || p.id === id ? normalized : p))
      : [normalized, ...current];

    saveStoredBlogPosts(updated);
    return normalized;
  };

  const eliminarPublicacion = async (id) => {
    if (isUuid(id)) {
      try {
        await axiosClient.delete('/publicaciones-blog/' + id);
      } catch {
        // Continuar para asegurar borrado local
      }
    }
    const current = getStoredBlogPosts();
    saveStoredBlogPosts(current.filter((p) => p.id !== id));
  };

  const listarProductoresBlog = async () => {
    try {
      const response = await axiosClient.get('/caficultores', {
        params: { page: 1, limit: 100 },
      });
      return Array.isArray(response?.data) ? response.data : [];
    } catch {
      return [];
    }
  };

  return {
    listarPublicaciones,
    guardarPublicacion,
    eliminarPublicacion,
    listarProductoresBlog,
  };
}
