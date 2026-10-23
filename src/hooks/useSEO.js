import { useEffect } from 'react';

/**
 * useSEO — Hook personalizado para gestionar el título dinámico y meta descripción
 * en Single Page Applications (React Router) para mejorar el SEO y la UX.
 *
 * @param {Object} options
 * @param {string} options.title - Título específico de la página.
 * @param {string} [options.description] - Descripción meta para motores de búsqueda.
 */
export default function useSEO({ title, description } = {}) {
  useEffect(() => {
    const baseTitle = 'ConexCoffee | Plataforma de Café Especial y Trazabilidad en Colombia';
    if (title) {
      document.title = `${title} | ConexCoffee`;
    } else {
      document.title = baseTitle;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }, [title, description]);
}
