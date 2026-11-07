import { Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui';

export default function BlogCard({ post, onOpenArticle }) {
  const eventUrl = post.url_evento || post.urlEvento || null;

  return (
    <Card className="group flex flex-col h-full overflow-hidden border border-surface-200 bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
      <div className="relative h-52 w-full overflow-hidden bg-surface-100">
        <img
          src={post.imagen_destacada_url || '/images/portadas/lote.jpg'}
          alt={post.titulo}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/portadas/lote.jpg';
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-3">
        <time
          dateTime={post.fecha_publicacion}
          className="flex items-center gap-1.5 text-xs font-medium text-surface-500"
        >
          <Calendar className="h-3.5 w-3.5 text-brand-orange" />
          {new Date(post.fecha_publicacion).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        <h2 className="text-lg font-extrabold text-surface-900 leading-snug group-hover:text-brand-terracota transition-colors">
          {post.titulo}
        </h2>

        <p className="text-sm text-surface-600 leading-relaxed line-clamp-3">{post.extracto}</p>

        {eventUrl && (
          <div className="pt-1 text-xs text-surface-600 truncate">
            <span className="font-semibold text-surface-700">Ver en: </span>
            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-semibold text-brand-terracota hover:underline"
            >
              <span className="truncate max-w-[200px]">{eventUrl}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={() => onOpenArticle(post)}
          className="mt-auto pt-4 flex items-center gap-2 text-brand-terracota hover:text-brand-orange font-bold text-sm transition-colors cursor-pointer"
        >
          <span>Leer artículo</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
