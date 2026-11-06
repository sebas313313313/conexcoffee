import { Calendar, BookOpen, User, CheckCircle2, ExternalLink } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { Button } from '@/components/ui';

export default function BlogModal({ post, isOpen, onClose }) {
  if (!post) return null;

  const eventLink = post.urlEvento
    ? post.urlEvento.startsWith('http')
      ? post.urlEvento
      : `https://${post.urlEvento}`
    : null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={post.title}
      size="2xl"
    >
      <div className="space-y-5">
        {/* Imagen del Artículo */}
        <div className="relative h-60 w-full rounded-xl overflow-hidden shadow-md">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="font-extrabold text-xs uppercase tracking-wider text-white bg-brand-terracota px-3 py-1 rounded-full shadow-md">
              {post.category}
            </span>
          </div>
        </div>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center justify-between text-xs text-surface-500 pb-3 border-b border-surface-100 gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-surface-700">
            <User className="h-3.5 w-3.5 text-brand-terracota" />
            <span>Por: {post.autor}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-brand-orange" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-brand-terracota" />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Enlace del Evento / Ver en: enlace */}
        {eventLink && (
          <div className="p-4 rounded-xl bg-amber-50/90 border border-brand-orange/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-brand-terracota/10 flex items-center justify-center text-brand-terracota shrink-0">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-surface-900 flex items-baseline gap-1.5 flex-wrap">
                  <span>Ver en:</span>
                  <a
                    href={eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-terracota hover:underline font-semibold break-all"
                  >
                    {post.urlEvento}
                  </a>
                </p>
                <p className="text-[11px] text-surface-500">Enlace oficial del evento / publicación cargado por administración</p>
              </div>
            </div>

            <a
              href={eventLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <span>Abrir Enlace</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Cuerpo del Artículo */}
        <div className="space-y-4 text-sm text-surface-700 leading-relaxed">
          <p className="font-semibold text-surface-900 text-base leading-snug">
            {post.excerpt}
          </p>

          <div className="whitespace-pre-line text-surface-600 bg-surface-50 p-5 rounded-xl border border-surface-200">
            {post.content}
          </div>
        </div>

        {/* ConexCoffee Quality Note */}
        <div className="p-4 rounded-xl bg-primary-100 border border-brand-orange/30 flex items-start gap-3 text-xs text-surface-800">
          <CheckCircle2 className="h-4 w-4 text-brand-terracota shrink-0 mt-0.5" />
          <p>
            Artículo verificado por el equipo técnico y de comercio exterior de <strong>ConexCoffee</strong>.
            Garantía de calidad en origen colombiano.
          </p>
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-5 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Cerrar Lectura
          </Button>
        </div>
      </div>
    </ModalBase>
  );
}
