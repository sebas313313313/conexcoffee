import { useState, useEffect } from 'react';
import { LandingProvider } from '@/context/LandingContext';
import useLanding from '@/hooks/useLanding';
import { getErrorMessage } from '@/lib/axios';
import BlogHero from '../components/BlogHero';
import BlogCard from '../components/BlogCard';
import BlogModal from '../components/BlogModal';

function BlogPublico() {
  const { listarBlogPublico } = useLanding();
  const [activePost, setActivePost] = useState(null);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ publicaciones: [], meta: null, loading: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    listarBlogPublico(page, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ ...data, loading: false, error: '' });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ publicaciones: [], meta: null, loading: false, error: getErrorMessage(error) });
    });
    return () => controller.abort();
  }, [listarBlogPublico, page, retry]);
  const navegar = (next) => {
    setResult(prev => ({ ...prev, loading: true, error: '' }));
    setPage(next);
  };
  const reintentar = () => {
    setResult(prev => ({ ...prev, loading: true, error: '' }));
    setRetry(prev => prev + 1);
  };
  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      <BlogHero />
      <section aria-label="Publicaciones del blog" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {result.loading ? <p role="status">Cargando publicaciones...</p> : result.error ? (
          <div role="alert" className="p-5 bg-white border border-surface-200 rounded-xl">
            <p>{result.error}</p><button onClick={reintentar} className="mt-3 text-brand-terracota underline">Reintentar</button>
          </div>
        ) : result.publicaciones.length === 0 ? <p className="text-center text-surface-500">Aún no hay publicaciones disponibles.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {result.publicaciones.map(post => <BlogCard key={post.id} post={post} onOpenArticle={setActivePost} />)}
          </div>
        )}
        {!result.loading && !result.error && result.meta?.totalPages > 1 && (
          <nav aria-label="Paginación del blog" className="flex items-center justify-center gap-6 mt-8">
            <button disabled={page <= 1} onClick={() => navegar(page - 1)} className="disabled:opacity-40">Anterior</button>
            <span>Página {page} de {result.meta.totalPages}</span>
            <button disabled={page >= result.meta.totalPages} onClick={() => navegar(page + 1)} className="disabled:opacity-40">Siguiente</button>
          </nav>
        )}
      </section>
      <BlogModal post={activePost} isOpen={Boolean(activePost)} onClose={() => setActivePost(null)} />
    </div>
  );
}
export default function BlogPage() {
  return <LandingProvider cargarContenedores={false}><BlogPublico /></LandingProvider>;
}
