import { Calendar, ExternalLink, Video } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { Button } from '@/components/ui';

function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function BlogModal({ post, isOpen, onClose }) {
  if (!post) return null;

  const videoUrl = safeUrl(post.url_video_youtube);
  const eventUrl = safeUrl(post.url_evento || post.urlEvento);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={post.titulo} size="2xl">
      <article className="space-y-5">
        <div className="rounded-2xl overflow-hidden border border-surface-200 bg-surface-100 max-h-96">
          <img
            src={post.imagen_destacada_url || '/images/portadas/lote.jpg'}
            alt={post.titulo}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/portadas/lote.jpg';
            }}
            className="w-full max-h-96 object-cover"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-200">
          <time
            dateTime={post.fecha_publicacion}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
            {new Date(post.fecha_publicacion).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>

          {eventUrl && (
            <div className="inline-flex items-center gap-1.5 text-xs bg-brand-tint/60 border border-brand-terracota/25 px-3 py-1.5 rounded-xl">
              <span className="font-bold text-surface-800">Ver en:</span>
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-brand-terracota hover:underline"
              >
                <span className="truncate max-w-xs">{eventUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}
        </div>

        <p className="text-base font-bold text-surface-900 leading-relaxed">{post.extracto}</p>

        <div className="whitespace-pre-wrap break-words text-sm text-surface-700 leading-relaxed space-y-3">
          {post.contenido_markdown}
        </div>

        {(eventUrl || videoUrl) && (
          <div className="pt-4 border-t border-surface-200 flex flex-wrap items-center gap-3">
            {eventUrl && (
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white text-xs font-bold transition-colors"
              >
                <span>Ver en: {eventUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-300 bg-surface-50 hover:bg-surface-100 text-surface-800 text-xs font-bold transition-colors"
              >
                <Video className="w-4 h-4 text-brand-terracota" />
                <span>Ver video en YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </article>

      <div className="flex justify-end pt-5">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cerrar lectura
        </Button>
      </div>
    </ModalBase>
  );
}
