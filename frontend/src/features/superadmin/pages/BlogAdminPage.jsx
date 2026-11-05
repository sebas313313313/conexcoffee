import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { getErrorMessage } from '@/lib/axios';

const inputClass = 'w-full rounded-xl border border-surface-200 px-3 py-2 bg-white text-sm';
const campos = [
  ['titulo', 'Título', 200], ['slug', 'Slug', 220],
  ['imagen_destacada_url', 'URL de imagen destacada'], ['url_video_youtube', 'URL de YouTube (opcional)'],
];
function EditorPublicacion({ publicacion, productores, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    titulo: publicacion?.titulo || '', slug: publicacion?.slug || '',
    extracto: publicacion?.extracto || '', contenido_markdown: publicacion?.contenido_markdown || '',
    imagen_destacada_url: publicacion?.imagen_destacada_url || '', url_video_youtube: publicacion?.url_video_youtube || '',
    caficultor_destacado_id: publicacion?.caficultor_destacado_id || '', publicado: publicacion?.publicado ?? true,
    fecha_publicacion: new Date(publicacion?.fecha_publicacion || Date.now()).toISOString(),
  }));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const cambiar = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const guardar = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      await onSave({ ...form, titulo: form.titulo.trim(), slug: form.slug.trim(),
        caficultor_destacado_id: form.caficultor_destacado_id || null,
        url_video_youtube: form.url_video_youtube.trim() || null });
      onClose();
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="blog-editor-title" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 id="blog-editor-title" className="text-xl font-bold">{publicacion ? 'Editar publicación' : 'Nueva publicación'}</h2>
          <button disabled={busy} onClick={onClose} aria-label="Cerrar"><X /></button>
        </div>
        <form onSubmit={guardar} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {campos.map(([name, label, maxLength]) => (
                <label key={name} className="block text-sm font-medium">{label}
                  <input className={inputClass} name={name} value={form[name]} onChange={cambiar}
                    required={name !== 'url_video_youtube'} maxLength={maxLength}
                    type={name.includes('url') ? 'url' : 'text'}
                    pattern={name === 'slug' ? '[a-z0-9]+(-[a-z0-9]+)*' : undefined} />
                </label>
              ))}
            </div>
            <p className="text-xs text-surface-500">El slug usa letras minúsculas, números y guiones. Ejemplo: historia-del-cafe.</p>
            <label className="block text-sm font-medium">Extracto
              <textarea name="extracto" required rows={3} value={form.extracto} onChange={cambiar} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">Contenido Markdown
              <textarea name="contenido_markdown" required rows={12} value={form.contenido_markdown} onChange={cambiar} className={inputClass + ' font-mono'} />
            </label>
            <label className="block text-sm font-medium">Caficultor destacado (opcional)
              <select name="caficultor_destacado_id" value={form.caficultor_destacado_id} onChange={cambiar} className={inputClass}>
                <option value="">Sin caficultor destacado</option>
                {form.caficultor_destacado_id && !productores.some(p => p.id === form.caficultor_destacado_id) && (
                  <option value={form.caficultor_destacado_id}>Caficultor actual ({form.caficultor_destacado_id})</option>
                )}
                {productores.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} — {p.numero_documento}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Fecha de publicación
              <input type="datetime-local" required className={inputClass}
                value={form.fecha_publicacion ? new Date(new Date(form.fecha_publicacion).getTime() - new Date(form.fecha_publicacion).getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''}
                onChange={e => setForm(prev => ({ ...prev, fecha_publicacion: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
            </label>
            <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={form.publicado} onChange={e => setForm(prev => ({ ...prev, publicado: e.target.checked }))} />Publicada (desmarcar para guardar como borrador)</label>
          </fieldset>
          <div className="flex justify-end gap-3">
            <button type="button" disabled={busy} onClick={onClose} className="px-4 py-2 border rounded-xl">Cancelar</button>
            <button disabled={busy} className="px-4 py-2 rounded-xl bg-brand-terracota text-white">{busy ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default function BlogAdminPage() {
  const { listarPublicaciones, guardarPublicacion, eliminarPublicacion, listarProductoresBlog } = useSuperAdmin();
  const apiRef = useRef({ listarPublicaciones, guardarPublicacion, eliminarPublicacion, listarProductoresBlog });
  useEffect(() => {
    apiRef.current = { listarPublicaciones, guardarPublicacion, eliminarPublicacion, listarProductoresBlog };
  }, [listarPublicaciones, guardarPublicacion, eliminarPublicacion, listarProductoresBlog]);
  const [posts, setPosts] = useState([]);
  const [productores, setProductores] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await apiRef.current.listarPublicaciones(page);
      setPosts(result.publicaciones); setTotalPages(Math.max(1, result.meta?.totalPages || 1));
      if (result.meta?.totalPages && page > result.meta.totalPages) setPage(result.meta.totalPages);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [page]);
  useEffect(() => { load(); }, [load]);
  const abrir = async (post) => {
    try { setProductores(await apiRef.current.listarProductoresBlog()); setEditor({ post }); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };
  const guardar = async (payload) => {
    await apiRef.current.guardarPublicacion(payload, editor.post?.id);
    toast.success('Publicación guardada'); await load();
  };
  const eliminar = async () => {
    if (deleting) return;
    setDeleting(true);
    try { await apiRef.current.eliminarPublicacion(pendingDelete.id); setPendingDelete(null); toast.success('Publicación eliminada'); await load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(false); }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div><h1 className="text-2xl font-bold">Blog</h1><p className="text-surface-500">Gestiona artículos, borradores y publicaciones.</p></div>
        <button onClick={() => abrir(null)} className="flex gap-2 px-4 py-2 rounded-xl bg-brand-terracota text-white"><Plus size={18} />Nueva publicación</button>
      </div>
      {error && <div role="alert" className="p-4 border rounded-xl">{error}<button onClick={load} className="ml-4 underline">Reintentar</button></div>}
      <div className="bg-white border border-surface-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-50"><tr>{['Título', 'Estado', 'Fecha', 'Acciones'].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="p-5">Cargando...</td></tr> : posts.length === 0 ? <tr><td colSpan={4} className="p-5">No hay publicaciones.</td></tr> : posts.map(post => (
              <tr key={post.id} className="border-t border-surface-100">
                <td className="p-4"><strong>{post.titulo}</strong><div className="text-surface-500">{post.slug}</div></td>
                <td className="p-4">{post.publicado ? 'Publicada' : 'Borrador'}</td>
                <td className="p-4">{new Date(post.fecha_publicacion).toLocaleString('es-CO')}</td>
                <td className="p-4"><div className="flex gap-3"><button aria-label={'Editar ' + post.titulo} onClick={() => abrir(post)}><Pencil size={18} /></button><button aria-label={'Eliminar ' + post.titulo} onClick={() => setPendingDelete(post)}><Trash2 size={18} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center">
        <button disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={loading || page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
        <button onClick={load} disabled={loading} aria-label="Actualizar"><RefreshCw size={18} /></button>
      </div>
      {editor && <EditorPublicacion publicacion={editor.post} productores={productores} onClose={() => setEditor(null)} onSave={guardar} />}
      {pendingDelete && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="blog-delete-title" className="bg-white rounded-2xl p-6 max-w-md space-y-4"><h2 id="blog-delete-title" className="font-bold">Eliminar publicación</h2><p>¿Eliminar “{pendingDelete.titulo}”? Esta acción es permanente.</p><div className="flex gap-4"><button disabled={deleting} onClick={() => setPendingDelete(null)}>Cancelar</button><button disabled={deleting} onClick={eliminar} className="text-brand-terracota">{deleting ? 'Eliminando...' : 'Eliminar'}</button></div></div></div>}
    </div>
  );
}
