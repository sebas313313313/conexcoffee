import { Calendar, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui';

export default function BlogCard({ post, onOpenArticle }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden border border-surface-200 bg-white rounded-xl">
      <img src={post.imagen_destacada_url} alt={post.titulo} loading="lazy" className="h-48 w-full object-cover bg-surface-100" />
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-3">
        <time dateTime={post.fecha_publicacion} className="flex items-center gap-1.5 text-xs text-surface-500">
          <Calendar className="h-3.5 w-3.5 text-brand-orange" />
          {new Date(post.fecha_publicacion).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}
        </time>
        <h2 className="text-lg font-bold text-surface-900">{post.titulo}</h2>
        <p className="text-sm text-surface-600 leading-relaxed line-clamp-3">{post.extracto}</p>
        <button type="button" onClick={() => onOpenArticle(post)} className="mt-auto pt-4 flex items-center gap-2 text-brand-terracota font-semibold text-sm">
          Leer artículo <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
