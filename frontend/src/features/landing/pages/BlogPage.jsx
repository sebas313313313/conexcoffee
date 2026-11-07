import { useState, useEffect } from 'react';
import { LandingProvider } from '@/context/LandingContext';
import useLanding from '@/hooks/useLanding';
import BlogHero from '../components/BlogHero';
import BlogCard from '../components/BlogCard';
import BlogModal from '../components/BlogModal';
import { getStoredBlogPosts } from '../data/blogData';

function BlogPublico() {
  const { listarBlogPublico } = useLanding();
  const [activePost, setActivePost] = useState(null);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(() => {
    const initial = getStoredBlogPosts().filter((p) => p.publicado !== false);
    return {
      publicaciones: initial.slice(0, 12),
      meta: {
        page: 1,
        limit: 12,
        totalRecords: initial.length,
        totalPages: Math.max(1, Math.ceil(initial.length / 12)),
      },
      loading: false,
      error: '',
    };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    listarBlogPublico(page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && data?.publicaciones) {
          setResult({
            publicaciones: data.publicaciones,
            meta: data.meta,
            loading: false,
            error: '',
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          const fallback = getStoredBlogPosts().filter((p) => p.publicado !== false);
          setResult({
            publicaciones: fallback.slice((page - 1) * 12, page * 12),
            meta: {
              page,
              limit: 12,
              totalRecords: fallback.length,
              totalPages: Math.max(1, Math.ceil(fallback.length / 12)),
            },
            loading: false,
            error: '',
          });
        }
      });

    return () => controller.abort();
  }, [listarBlogPublico, page]);

  useEffect(() => {
    const onStorage = () => {
      const updated = getStoredBlogPosts().filter((p) => p.publicado !== false);
      setResult((prev) => ({
        ...prev,
        publicaciones: updated.slice((page - 1) * 12, page * 12),
        meta: {
          page,
          limit: 12,
          totalRecords: updated.length,
          totalPages: Math.max(1, Math.ceil(updated.length / 12)),
        },
      }));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [page]);

  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      <BlogHero />

      <section
        aria-label="Publicaciones del blog"
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {result.publicaciones.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-2xl p-10 text-center">
            <p className="text-base font-bold text-surface-800">
              Aún no hay publicaciones disponibles en el blog.
            </p>
            <p className="text-sm text-surface-500 mt-1">
              Puedes crear nuevas publicaciones desde el módulo Blog del rol SuperAdministrador.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {result.publicaciones.map((post) => (
              <BlogCard key={post.id} post={post} onOpenArticle={setActivePost} />
            ))}
          </div>
        )}

        {result.meta?.totalPages > 1 && (
          <nav
            aria-label="Paginación del blog"
            className="flex items-center justify-center gap-6 mt-10"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border border-surface-300 bg-white text-sm font-semibold text-surface-800 hover:bg-surface-100 disabled:opacity-40 cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-sm font-semibold text-surface-700">
              Página {page} de {result.meta.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= result.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl border border-surface-300 bg-white text-sm font-semibold text-surface-800 hover:bg-surface-100 disabled:opacity-40 cursor-pointer"
            >
              Siguiente
            </button>
          </nav>
        )}
      </section>

      <BlogModal
        post={activePost}
        isOpen={Boolean(activePost)}
        onClose={() => setActivePost(null)}
      />
    </div>
  );
}

export default function BlogPage() {
  return (
    <LandingProvider cargarContenedores={false}>
      <BlogPublico />
    </LandingProvider>
  );
}
