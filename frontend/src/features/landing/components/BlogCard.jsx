import { useRef } from 'react';
import { Calendar, BookOpen, ArrowRight, User } from 'lucide-react';
import { Card } from '@/components/ui';
import { animate } from 'animejs';

export default function BlogCard({ post, onOpenArticle }) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const arrowRef = useRef(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        translateY: -6,
        duration: 250,
        ease: 'outQuad',
      });
    }

    if (imgRef.current) {
      animate(imgRef.current, {
        scale: 1.06,
        duration: 400,
        ease: 'outQuad',
      });
    }

    if (arrowRef.current) {
      animate(arrowRef.current, {
        translateX: 4,
        duration: 200,
        ease: 'outQuad',
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        translateY: 0,
        duration: 250,
        ease: 'outQuad',
      });
    }

    if (imgRef.current) {
      animate(imgRef.current, {
        scale: 1,
        duration: 400,
        ease: 'outQuad',
      });
    }

    if (arrowRef.current) {
      animate(arrowRef.current, {
        translateX: 0,
        duration: 200,
        ease: 'outQuad',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="anime-blog-card opacity-0 h-full flex flex-col will-change-transform"
    >
      <Card className="flex flex-col justify-between h-full overflow-hidden border border-surface-200 hover:border-brand-orange/60 hover:shadow-xl transition-all duration-300 bg-white rounded-xl">
        <div>
          {/* Imagen de Portada del Artículo */}
          <div className="relative h-48 w-full overflow-hidden bg-surface-100">
            <img
              ref={imgRef}
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover will-change-transform"
              loading="lazy"
            />
            <div className="absolute top-3 left-3">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-white bg-brand-terracota px-3 py-1 rounded-full shadow-md">
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between text-xs text-surface-500 mb-2.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-brand-orange" />
                {post.date}
              </span>
              <span className="flex items-center gap-1 text-surface-400">
                <BookOpen className="h-3.5 w-3.5 text-brand-terracota" />
                {post.readTime}
              </span>
            </div>

            <h2
              onClick={() => onOpenArticle(post)}
              className="text-lg font-bold text-surface-900 mb-2 leading-snug hover:text-brand-terracota transition-colors cursor-pointer"
            >
              {post.title}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-3.5 font-medium">
              <User className="h-3 w-3 text-brand-terracota shrink-0" />
              <span>Por: {post.autor}</span>
            </div>

            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 pt-0 mt-auto">
          <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Especialidad ConexCoffee
            </span>
            <button
              type="button"
              onClick={() => onOpenArticle(post)}
              className="font-bold text-xs uppercase tracking-wider text-brand-orange hover:text-brand-terracota cursor-pointer inline-flex items-center gap-1.5 transition-colors select-none"
            >
              <span>Leer artículo</span>
              <span ref={arrowRef} className="inline-block will-change-transform">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
