import { useState, useEffect, useRef } from 'react';
import { getStoredBlogPosts } from '../data/blogData';
import BlogHero from '../components/BlogHero';
import BlogCard from '../components/BlogCard';
import BlogModal from '../components/BlogModal';
import BlogNewsletter from '../components/BlogNewsletter';
import { animate, stagger } from 'animejs';

// ============================================
// BlogPage — Artículos & Actualidad Cafetera
// ============================================

export default function BlogPage() {
  const [posts, setPosts] = useState(() => getStoredBlogPosts());
  const [activePost, setActivePost] = useState(null);
  const gridRef = useRef(null);

  // Sincronización en tiempo real con cambios realizados desde el módulo de Superadmin
  useEffect(() => {
    const handleUpdate = () => {
      setPosts(getStoredBlogPosts());
    };
    window.addEventListener('conexcoffee_blog_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('conexcoffee_blog_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Animación en cascada de las tarjetas al montar la vista o cambiar artículos
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.anime-blog-card');
    if (cards.length > 0) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [35, 0],
        delay: stagger(100),
        duration: 700,
        ease: 'outExpo',
      });
    }
  }, [posts]);

  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      {/* 1. Hero compacto con Fondo Oficial y Efectos Anime.js */}
      <BlogHero />

      {/* 2. Grid de Artículos */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-200 p-8 shadow-xs">
            <p className="text-lg font-semibold text-surface-700">No hay artículos publicados en este momento.</p>
            <p className="text-sm text-surface-400 mt-1">Pronto compartiremos nuevas noticias y novedades cafeteras.</p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onOpenArticle={(selected) => setActivePost(selected)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Boletín Especializado Newsletter */}
      <BlogNewsletter />

      {/* 4. Modal de Lectura Completa */}
      <BlogModal
        post={activePost}
        isOpen={Boolean(activePost)}
        onClose={() => setActivePost(null)}
      />
    </div>
  );
}
