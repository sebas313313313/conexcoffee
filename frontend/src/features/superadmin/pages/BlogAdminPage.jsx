import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ExternalLink,
  Eye,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { getErrorMessage } from '@/lib/axios';
import BlogModal from '@/features/landing/components/BlogModal';

const inputClass =
  'w-full rounded-xl border border-surface-300 px-3.5 py-2 bg-white text-sm text-surface-900 focus:outline-none focus:border-brand-terracota';

const IMAGE_PRESETS = [
  { label: 'Catación & Laboratorio', url: '/images/portadas/analisis-sensorial.jpg' },
  { label: 'Sacos de Café', url: '/images/portadas/lote.jpg' },
  { label: 'Finca Cafetera', url: '/images/portadas/finca.jpg' },
  { label: 'Contenedor de Exportación', url: '/images/portadas/contenedor.jpg' },
];

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function EditorPublicacion({ publicacion, productores, onClose, onSave }) {
  const [slugTouched, setSlugTouched] = useState(Boolean(publicacion?.slug));
  const [form, setForm] = useState(() => ({
    titulo: publicacion?.titulo || '',
    slug: publicacion?.slug || '',
    extracto: publicacion?.extracto || '',
    contenido_markdown: publicacion?.contenido_markdown || '',
    imagen_destacada_url:
      publicacion?.imagen_destacada_url || '/images/portadas/analisis-sensorial.jpg',
    url_video_youtube: publicacion?.url_video_youtube || '',
    url_evento: publicacion?.url_evento || publicacion?.urlEvento || '',
    caficultor_destacado_id: publicacion?.caficultor_destacado_id || '',
    publicado: publicacion?.publicado ?? true,
    fecha_publicacion: new Date(
      publicacion?.fecha_publicacion || Date.now()
    ).toISOString(),
  }));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      setSlugTouched(true);
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
      return;
    }
    if (name === 'titulo' && !slugTouched) {
      setForm((prev) => ({
        ...prev,
        titulo: value,
        slug: slugify(value),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);

    try {
      const finalSlug = slugify(form.slug || form.titulo) || `articulo-${Date.now()}`;
      await onSave({
        ...form,
        titulo: form.titulo.trim(),
        slug: finalSlug,
        imagen_destacada_url:
          form.imagen_destacada_url.trim() || '/images/portadas/lote.jpg',
        caficultor_destacado_id: form.caficultor_destacado_id || null,
        url_video_youtube: form.url_video_youtube.trim() || null,
        url_evento: form.url_evento.trim() || null,
      });
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al guardar la publicación'));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-editor-title"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-surface-200 shadow-2xl p-6"
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-surface-200">
          <h2 id="blog-editor-title" className="text-xl font-extrabold text-surface-900">
            {publicacion ? 'Editar publicación del Blog' : 'Nueva publicación del Blog'}
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-xl text-surface-500 hover:bg-surface-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={guardar} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-semibold text-surface-700">
                Título *
                <input
                  className={`${inputClass} mt-1`}
                  name="titulo"
                  value={form.titulo}
                  onChange={cambiar}
                  required
                  maxLength={200}
                  placeholder="Ej. Feria de Catación Especial 2026"
                />
              </label>

              <label className="block text-sm font-semibold text-surface-700">
                Slug (URL amigable) *
                <input
                  className={`${inputClass} mt-1 font-mono`}
                  name="slug"
                  value={form.slug}
                  onChange={cambiar}
                  required
                  maxLength={220}
                  placeholder="feria-de-catacion-especial-2026"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-surface-700">
                URL o ruta de imagen destacada *
                <input
                  className={`${inputClass} mt-1`}
                  name="imagen_destacada_url"
                  value={form.imagen_destacada_url}
                  onChange={cambiar}
                  required
                  placeholder="/images/portadas/analisis-sensorial.jpg o https://..."
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-surface-500">Imágenes sugeridas:</span>
                {IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, imagen_destacada_url: preset.url }))
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      form.imagen_destacada_url === preset.url
                        ? 'bg-brand-tint border-brand-terracota text-brand-terracota font-bold'
                        : 'bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-semibold text-surface-700">
                URL del evento / Enlace externo (Ver en: enlace)
                <input
                  className={`${inputClass} mt-1`}
                  name="url_evento"
                  type="url"
                  value={form.url_evento}
                  onChange={cambiar}
                  placeholder="https://evento-cafe.com/registro"
                />
              </label>

              <label className="block text-sm font-semibold text-surface-700">
                URL de video en YouTube (opcional)
                <input
                  className={`${inputClass} mt-1`}
                  name="url_video_youtube"
                  type="url"
                  value={form.url_video_youtube}
                  onChange={cambiar}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-surface-700">
              Extracto / Resumen corto *
              <textarea
                name="extracto"
                required
                rows={2}
                value={form.extracto}
                onChange={cambiar}
                placeholder="Breve resumen que se mostrará en la tarjeta del blog..."
                className={`${inputClass} mt-1`}
              />
            </label>

            <label className="block text-sm font-semibold text-surface-700">
              Contenido del artículo *
              <textarea
                name="contenido_markdown"
                required
                rows={8}
                value={form.contenido_markdown}
                onChange={cambiar}
                placeholder="Escribe aquí el contenido completo de la publicación..."
                className={`${inputClass} mt-1 font-mono`}
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-semibold text-surface-700">
                Caficultor destacado (opcional)
                <select
                  name="caficultor_destacado_id"
                  value={form.caficultor_destacado_id}
                  onChange={cambiar}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Sin caficultor destacado</option>
                  {productores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos}{' '}
                      {p.numero_documento ? `— ${p.numero_documento}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-surface-700">
                Fecha de publicación *
                <input
                  type="datetime-local"
                  required
                  className={`${inputClass} mt-1`}
                  value={
                    form.fecha_publicacion
                      ? new Date(
                          new Date(form.fecha_publicacion).getTime() -
                            new Date(form.fecha_publicacion).getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      fecha_publicacion: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : new Date().toISOString(),
                    }))
                  }
                />
              </label>
            </div>

            <label className="flex gap-2.5 items-center text-sm font-medium text-surface-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, publicado: e.target.checked }))
                }
                className="rounded border-surface-300 text-brand-terracota focus:ring-brand-terracota"
              />
              <span>
                Publicada en la Landing Page (desmarcar para guardar como borrador)
              </span>
            </label>
          </fieldset>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="px-4 py-2 border border-surface-300 rounded-xl text-sm font-semibold text-surface-700 hover:bg-surface-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white text-sm font-bold cursor-pointer"
            >
              {busy ? 'Guardando...' : 'Guardar publicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BlogAdminPage() {
  const {
    listarPublicaciones,
    guardarPublicacion,
    eliminarPublicacion,
    listarProductoresBlog,
  } = useSuperAdmin();

  const apiRef = useRef({
    listarPublicaciones,
    guardarPublicacion,
    eliminarPublicacion,
    listarProductoresBlog,
  });

  useEffect(() => {
    apiRef.current = {
      listarPublicaciones,
      guardarPublicacion,
      eliminarPublicacion,
      listarProductoresBlog,
    };
  }, [
    listarPublicaciones,
    guardarPublicacion,
    eliminarPublicacion,
    listarProductoresBlog,
  ]);

  const [posts, setPosts] = useState([]);
  const [productores, setProductores] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRef.current.listarPublicaciones(page);
      setPosts(result.publicaciones || []);
      setTotalPages(Math.max(1, result.meta?.totalPages || 1));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const abrir = async (post) => {
    // Abrir el modal de inmediato sin bloquearlo por la consulta de caficultores
    setEditor({ post });
    try {
      const lista = await apiRef.current.listarProductoresBlog();
      setProductores(Array.isArray(lista) ? lista : []);
    } catch {
      setProductores([]);
    }
  };

  const guardar = async (payload) => {
    await apiRef.current.guardarPublicacion(payload, editor?.post?.id);
    toast.success('Publicación guardada y sincronizada con la Landing Page');
    await load();
  };

  const eliminar = async () => {
    if (deleting || !pendingDelete) return;
    setDeleting(true);
    try {
      await apiRef.current.eliminarPublicacion(pendingDelete.id);
      setPendingDelete(null);
      toast.success('Publicación eliminada');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-terracota" />
            Gestión del Blog (Landing Page)
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Administra los artículos, enlaces de eventos (&ldquo;Ver en: enlace&rdquo;) y noticias
            visibles en el blog público.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-300 bg-white hover:bg-surface-50 text-xs font-bold text-surface-700"
          >
            <span>Ver Blog Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => abrir(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white text-sm font-bold cursor-pointer shadow-xs"
          >
            <Plus size={18} />
            Nueva publicación
          </button>
        </div>
      </div>

      <div className="bg-white border border-surface-200 rounded-2xl overflow-x-auto shadow-xs">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-50 text-xs uppercase text-surface-500 border-b border-surface-200">
            <tr>
              {['Artículo', 'Enlace del Evento', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                <th key={h} className="p-4 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-surface-500">
                  Cargando publicaciones...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-surface-500">
                  No hay publicaciones registradas.
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const eventUrl = post.url_evento || post.urlEvento;
                return (
                  <tr
                    key={post.id}
                    className="border-t border-surface-100 hover:bg-surface-50/60"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.imagen_destacada_url || '/images/portadas/lote.jpg'}
                          alt={post.titulo}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/portadas/lote.jpg';
                          }}
                          className="w-12 h-12 rounded-xl object-cover border border-surface-200 shrink-0"
                        />
                        <div>
                          <strong className="text-surface-900 block">{post.titulo}</strong>
                          <span className="text-xs text-surface-500 font-mono">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {eventUrl ? (
                        <a
                          href={eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-terracota hover:underline"
                        >
                          <span className="truncate max-w-[180px]">Ver en: {eventUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-surface-400">Sin enlace externo</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          post.publicado
                            ? 'bg-brand-teal/15 text-brand-teal'
                            : 'bg-surface-200 text-surface-600'
                        }`}
                      >
                        {post.publicado ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-surface-600">
                      {new Date(post.fecha_publicacion).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Vista previa"
                          aria-label={'Ver ' + post.titulo}
                          onClick={() => setPreviewPost(post)}
                          className="p-2 rounded-lg text-surface-600 hover:bg-surface-100 hover:text-surface-900 cursor-pointer"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          title="Editar"
                          aria-label={'Editar ' + post.titulo}
                          onClick={() => abrir(post)}
                          className="p-2 rounded-lg text-surface-600 hover:bg-surface-100 hover:text-brand-terracota cursor-pointer"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          title="Eliminar"
                          aria-label={'Eliminar ' + post.titulo}
                          onClick={() => setPendingDelete(post)}
                          className="p-2 rounded-lg text-surface-600 hover:bg-danger-500/10 hover:text-danger-600 cursor-pointer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3.5 py-1.5 rounded-xl border border-surface-300 bg-white disabled:opacity-40 cursor-pointer"
        >
          Anterior
        </button>
        <span className="font-semibold text-surface-600">
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3.5 py-1.5 rounded-xl border border-surface-300 bg-white disabled:opacity-40 cursor-pointer"
          >
            Siguiente
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Actualizar"
            className="p-2 rounded-xl border border-surface-300 bg-white hover:bg-surface-50 cursor-pointer"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {editor && (
        <EditorPublicacion
          publicacion={editor.post}
          productores={productores}
          onClose={() => setEditor(null)}
          onSave={guardar}
        />
      )}

      <BlogModal
        post={previewPost}
        isOpen={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-surface-900/60 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-delete-title"
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl"
          >
            <h2 id="blog-delete-title" className="text-lg font-extrabold text-surface-900">
              Eliminar publicación
            </h2>
            <p className="text-sm text-surface-600">
              ¿Eliminar &ldquo;{pendingDelete.titulo}&rdquo;? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 rounded-xl border border-surface-300 text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={eliminar}
                className="px-4 py-2 rounded-xl bg-danger-600 text-white text-sm font-bold cursor-pointer"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
