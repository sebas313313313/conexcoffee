import ModalBase from '@/components/modals/ModalBase';
import { Button } from '@/components/ui';

function youtubeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname) ? url.href : null;
  } catch { return null; }
}
export default function BlogModal({ post, isOpen, onClose }) {
  if (!post) return null;
  const video = youtubeUrl(post.url_video_youtube);
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={post.titulo} size="2xl">
      <article className="space-y-5">
        <img src={post.imagen_destacada_url} alt={post.titulo} className="w-full max-h-96 object-cover rounded-xl" />
        <time dateTime={post.fecha_publicacion} className="text-xs text-surface-500">
          {new Date(post.fecha_publicacion).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}
        </time>
        <p className="font-semibold text-surface-900">{post.extracto}</p>
        <div className="whitespace-pre-wrap break-words text-sm text-surface-700 leading-relaxed">{post.contenido_markdown}</div>
        {video && <a href={video} target="_blank" rel="noopener noreferrer" className="inline-block text-brand-terracota underline">Ver video en YouTube</a>}
      </article>
      <div className="flex justify-end pt-5"><Button type="button" variant="secondary" onClick={onClose}>Cerrar lectura</Button></div>
    </ModalBase>
  );
}
