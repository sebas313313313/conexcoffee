import { useState, useEffect, useRef } from 'react';
import { BLOG_POSTS } from '../data/blogData';
import BlogHero from '../components/BlogHero';
import BlogCard from '../components/BlogCard';
import BlogModal from '../components/BlogModal';
import BlogNewsletter from '../components/BlogNewsletter';
import { animate, stagger } from 'animejs';

// ============================================
// BlogPage — Artículos & Actualidad Cafetera
// ============================================

export default function BlogPage() {
  const [activePost, setActivePost] = useState(null);
  const gridRef = useRef(null);

  // Animación en cascada de las tarjetas al montar la vista
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
  }, []);

  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      {/* 1. Hero compacto con Fondo Oficial y Efectos Anime.js */}
      <BlogHero />

      {/* 2. Grid de Artículos */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {BLOG_POSTS.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              onOpenArticle={(selected) => setActivePost(selected)}
            />
          ))}
        </div>
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
