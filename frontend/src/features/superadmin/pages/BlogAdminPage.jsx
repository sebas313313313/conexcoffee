import { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  Globe,
  Calendar,
  BookOpen,
  User,
  Image as ImageIcon,
  RotateCcw,
  LayoutGrid,
  List,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import BlogModal from '@/features/landing/components/BlogModal';
import {
  getStoredBlogPosts,
  saveStoredBlogPosts,
  resetStoredBlogPosts,
  DEFAULT_BLOG_CATEGORIES,
  PRESET_BLOG_IMAGES,
} from '@/features/landing/data/blogData';

// Formato de fecha estándar colombiano: '02 Mar 2026'
function getFormattedCurrentDate() {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, '0');
  const mes = meses[now.getMonth()];
  const anio = now.getFullYear();
  return `${dia} ${mes} ${anio}`;
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState(() => getStoredBlogPosts());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [filtroDestacado, setFiltroDestacado] = useState('todos');
  const [vistaModo, setVistaModo] = useState('grid'); // 'grid' | 'tabla'

  // Modales
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [modalResetAbierto, setModalResetAbierto] = useState(false);
  const [postSeleccionado, setPostSeleccionado] = useState(null);
  const [postParaEliminar, setPostParaEliminar] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);

  // Form State
  const initialFormState = {
    id: null,
    title: '',
    category: DEFAULT_BLOG_CATEGORIES[0] || 'Mercado',
    date: getFormattedCurrentDate(),
    readTime: '5 min lectura',
    excerpt: '',
    autor: 'Equipo Editorial ConexCoffee',
    image: PRESET_BLOG_IMAGES[0]?.url || '/images/pagina-web/cafe2-conexcoffe.png',
    destacado: false,
    urlEvento: '',
    content: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Sincronizar en caso de cambios externos en localStorage
  useEffect(() => {
    const handleSync = () => {
      setPosts(getStoredBlogPosts());
    };
    window.addEventListener('conexcoffee_blog_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('conexcoffee_blog_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Persistir cambios
  const updateAndPersist = (newPosts, successMsg) => {
    setPosts(newPosts);
    saveStoredBlogPosts(newPosts);
    if (successMsg) toast.success(successMsg);
  };

  // KPIs
  const totalPosts = posts.length;
  const totalDestacados = posts.filter((p) => p.destacado).length;
  const categoriasUnicas = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [posts]);

  // Filtrado
  const postsFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return posts.filter((p) => {
      const matchSearch =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.excerpt?.toLowerCase().includes(term) ||
        p.autor?.toLowerCase().includes(term) ||
        p.content?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term);

      const matchCat =
        categoriaFiltro === 'todas' ||
        p.category?.toLowerCase() === categoriaFiltro.toLowerCase();

      const matchDestacado =
        filtroDestacado === 'todos' ||
        (filtroDestacado === 'destacados' && p.destacado) ||
        (filtroDestacado === 'estandar' && !p.destacado);

      return matchSearch && matchCat && matchDestacado;
    });
  }, [posts, searchTerm, categoriaFiltro, filtroDestacado]);

  // Manejadores de Formularios
  const abrirModalCrear = () => {
    setEsEdicion(false);
    setFormData({
      ...initialFormState,
      date: getFormattedCurrentDate(),
    });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (post) => {
    setEsEdicion(true);
    setFormData({
      id: post.id,
      title: post.title || '',
      category: post.category || 'Mercado',
      date: post.date || getFormattedCurrentDate(),
      readTime: post.readTime || '5 min lectura',
      excerpt: post.excerpt || '',
      autor: post.autor || 'Equipo Editorial ConexCoffee',
      image: post.image || PRESET_BLOG_IMAGES[0]?.url,
      destacado: Boolean(post.destacado),
      urlEvento: post.urlEvento || '',
      content: post.content || '',
    });
    setModalFormAbierto(true);
  };

  const handleGuardarPost = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('El título del artículo es obligatorio');
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error('El resumen o extracto es obligatorio');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('El contenido completo del artículo es obligatorio');
      return;
    }

    if (esEdicion && formData.id) {
      const actualizados = posts.map((p) =>
        p.id === formData.id ? { ...p, ...formData } : p
      );
      updateAndPersist(actualizados, 'Artículo actualizado correctamente');
    } else {
      const nuevo = {
        ...formData,
        id: Date.now(),
      };
      updateAndPersist([nuevo, ...posts], 'Artículo publicado en el blog');
    }

    setModalFormAbierto(false);
  };

  // Alternar Destacado
  const handleToggleDestacado = (postId, e) => {
    if (e) e.stopPropagation();
    const actualizados = posts.map((p) =>
      p.id === postId ? { ...p, destacado: !p.destacado } : p
    );
    const postModificado = actualizados.find((p) => p.id === postId);
    updateAndPersist(
      actualizados,
      postModificado.destacado
        ? 'Artículo marcado como destacado'
        : 'Artículo retirado de destacados'
    );
  };

  // Confirmar y Eliminar
  const solicitarEliminar = (post, e) => {
    if (e) e.stopPropagation();
    setPostParaEliminar(post);
    setModalEliminarAbierto(true);
  };

  const confirmarEliminar = () => {
    if (!postParaEliminar) return;
    const actualizados = posts.filter((p) => p.id !== postParaEliminar.id);
    updateAndPersist(actualizados, 'Artículo eliminado del blog');
    setModalEliminarAbierto(false);
    setPostParaEliminar(null);
  };

  // Restablecer por defecto
  const confirmarReset = () => {
    const defaultPosts = resetStoredBlogPosts();
    setPosts(defaultPosts);
    toast.success('Artículos restablecidos a los valores predeterminados');
    setModalResetAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Cabecera Oficial del Módulo */}
      <ModuloCabecera
        titulo="Gestión del Blog"
        subtitulo="Crea, edita y administra los artículos de la landing page pública"
        imagenPortada="/images/pagina-web/portada-conexcoffee.png"
        mensaje="Todas las modificaciones realizadas en este módulo se reflejan en tiempo real en la página de Blog de ConexCoffee."
        icono={Newspaper}
        totalRegistros={posts.length}
        onRegistrar={abrirModalCrear}
        textoBotonRegistrar="Nuevo Artículo"
        onConsultar={() => window.open('/blog', '_blank')}
        textoBotonConsultar="Ver Blog Público"
        etiqueta="Landing Page / Blog"
      />

      {/* 2. Tarjetas de Métricas & KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Artículos</p>
            <p className="text-2xl font-black text-surface-900 mt-1">{totalPosts}</p>
            <p className="text-xs text-brand-terracota font-medium mt-0.5">Publicaciones en plataforma</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-terracota/10 flex items-center justify-center text-brand-terracota">
            <Newspaper className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Destacados</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{totalDestacados}</p>
            <p className="text-xs text-surface-400 font-medium mt-0.5">Prioridad en portada</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Categorías Activas</p>
            <p className="text-2xl font-black text-brand-green mt-1">{categoriasUnicas.length}</p>
            <p className="text-xs text-surface-400 font-medium mt-0.5">Temáticas cubiertas</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Enlace Público</p>
            <a
              href="/blog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-terracota hover:underline mt-1.5"
            >
              <span>/blog</span>
              <Globe className="h-4 w-4" />
            </a>
            <p className="text-xs text-surface-400 font-medium mt-0.5">Abrir en nueva pestaña</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Globe className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda, Filtros y Acciones */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por título, contenido o autor…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          {/* Filtro Categoría */}
          <div className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-surface-400" />
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium text-surface-700 outline-none cursor-pointer"
            >
              <option value="todas">Todas las categorías</option>
              {DEFAULT_BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Destacados */}
          <select
            value={filtroDestacado}
            onChange={(e) => setFiltroDestacado(e.target.value)}
            className="bg-surface-50 border border-surface-200 text-xs sm:text-sm font-medium text-surface-700 px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="destacados">Solo Destacados ⭐</option>
            <option value="estandar">Estándar</option>
          </select>
        </div>

        {/* Acciones del listado */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          {/* Toggle vista Grid / Tabla */}
          <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-surface-200">
            <button
              type="button"
              onClick={() => setVistaModo('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                vistaModo === 'grid'
                  ? 'bg-white text-surface-900 shadow-2xs'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
              title="Vista en tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setVistaModo('tabla')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                vistaModo === 'tabla'
                  ? 'bg-white text-surface-900 shadow-2xs'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
              title="Vista en tabla"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Botón Restablecer */}
          <button
            type="button"
            onClick={() => setModalResetAbierto(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200 transition-all cursor-pointer"
            title="Restablecer artículos iniciales del blog"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* 4. Listado de Artículos (Grid o Tabla) */}
      {postsFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center shadow-2xs">
          <Newspaper className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-surface-800">No se encontraron artículos</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            {searchTerm || categoriaFiltro !== 'todas' || filtroDestacado !== 'todos'
              ? 'Intenta ajustar tus criterios de búsqueda o filtros.'
              : 'Aún no hay artículos creados. Pulsa "Nuevo Artículo" para agregar el primero.'}
          </p>
          <button
            type="button"
            onClick={abrirModalCrear}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Primer Artículo</span>
          </button>
        </div>
      ) : vistaModo === 'grid' ? (
        /* VISTA EN GRID DE TARJETAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsFiltrados.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-brand-orange/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Portada del artículo */}
                <div className="relative h-44 w-full bg-surface-100 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/images/pagina-web/cafe2-conexcoffe.png';
                    }}
                  />
                  {/* Badge de Categoría */}
                  <div className="absolute top-3 left-3">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-white bg-brand-terracota px-2.5 py-1 rounded-full shadow-sm">
                      {post.category}
                    </span>
                  </div>

                  {/* Badge Destacado */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleDestacado(post.id, e)}
                    className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${
                      post.destacado
                        ? 'bg-amber-500 text-white'
                        : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                    }`}
                    title={post.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                  >
                    <Star className={`h-4 w-4 ${post.destacado ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Contenido Card */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-brand-orange" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-brand-terracota" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-surface-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-brand-terracota transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-surface-600 line-clamp-3 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>

                  {post.urlEvento && (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-brand-orange/20 flex items-center justify-between text-xs text-surface-700">
                      <span className="font-semibold text-brand-terracota flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        Ver en:
                      </span>
                      <a
                        href={post.urlEvento.startsWith('http') ? post.urlEvento : `https://${post.urlEvento}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-brand-terracota font-bold hover:underline truncate max-w-[170px]"
                        title={post.urlEvento}
                      >
                        {post.urlEvento}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-surface-500 pt-3 border-t border-surface-100">
                    <User className="h-3.5 w-3.5 text-brand-terracota" />
                    <span className="truncate">{post.autor}</span>
                  </div>
                </div>
              </div>

              {/* Botonera de Acciones */}
              <div className="p-3 bg-surface-50 border-t border-surface-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPostSeleccionado(post)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-surface-600 hover:text-surface-900 hover:bg-white transition-all cursor-pointer"
                  title="Ver vista previa completa"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Previsualizar</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(post)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-surface-200 text-surface-700 hover:bg-brand-tint hover:border-brand-terracota/30 hover:text-brand-terracota transition-all cursor-pointer shadow-2xs"
                    title="Editar artículo"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => solicitarEliminar(post, e)}
                    className="p-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA EN TABLA */
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200 text-xs font-bold text-surface-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Artículo</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Autor</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-center">Destacado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {postsFiltrados.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-md">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-12 w-16 object-cover rounded-lg shrink-0 border border-surface-200"
                          onError={(e) => {
                            e.currentTarget.src = '/images/pagina-web/cafe2-conexcoffe.png';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-surface-900 truncate">{post.title}</p>
                          <p className="text-xs text-surface-500 truncate mt-0.5">{post.excerpt}</p>
                          {post.urlEvento && (
                            <p className="text-[11px] text-brand-terracota font-semibold truncate mt-0.5 flex items-center gap-1">
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span>Ver en: {post.urlEvento}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block font-bold text-[11px] uppercase tracking-wider text-brand-terracota bg-brand-tint px-2.5 py-1 rounded-full border border-brand-terracota/20">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-surface-700">{post.autor}</td>
                    <td className="py-3 px-4 text-xs text-surface-500 whitespace-nowrap">{post.date}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleDestacado(post.id, e)}
                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                          post.destacado ? 'text-amber-500 hover:text-amber-600' : 'text-surface-300 hover:text-surface-500'
                        }`}
                        title={post.destacado ? 'Destacado activo' : 'Marcar como destacado'}
                      >
                        <Star className={`h-4 w-4 ${post.destacado ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPostSeleccionado(post)}
                          className="p-1.5 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-lg cursor-pointer"
                          title="Previsualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(post)}
                          className="p-1.5 text-brand-terracota hover:bg-brand-tint rounded-lg cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => solicitarEliminar(post, e)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modal Crear / Editar Artículo */}
      <ModalBase
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        title={esEdicion ? 'Editar Artículo del Blog' : 'Publicar Nuevo Artículo en el Blog'}
        size="2xl"
      >
        <form onSubmit={handleGuardarPost} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Título del Artículo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Nuevas Prácticas de Secado Solar en Fincas de Altura"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          {/* Categoría y Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
              >
                {DEFAULT_BLOG_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Autor o Entidad *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Q-Grader Certificado ConexCoffee"
                value={formData.autor}
                onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
          </div>

          {/* Fecha, Tiempo de Lectura y Destacado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Fecha de Publicación *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 02 Mar 2026"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Tiempo de Lectura
              </label>
              <input
                type="text"
                placeholder="Ej: 5 min lectura"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 bg-surface-50 border border-surface-200 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.destacado}
                  onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                  className="rounded text-brand-terracota focus:ring-brand-terracota h-4 w-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-surface-800">Artículo Destacado ⭐</span>
              </label>
            </div>
          </div>

          {/* URL del Evento / Enlace Externo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider">
                URL del Evento o Enlace Web (Opcional)
              </label>
              <span className="text-[11px] text-surface-500">
                Al abrir el artículo aparecerá: <strong>"Ver en: [enlace]"</strong>
              </span>
            </div>
            <div className="relative">
              <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="https://ejemplo.com/evento-cafe-2026 o enlace relacionado"
                value={formData.urlEvento}
                onChange={(e) => setFormData({ ...formData, urlEvento: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
          </div>

          {/* Selector de Imagen Portada */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Imagen de Portada
            </label>

            {/* Presets de imágenes de ConexCoffee */}
            <p className="text-xs text-surface-500 mb-2">Selecciona una imagen del sistema o escribe una URL personalizada:</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2">
              {PRESET_BLOG_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setFormData({ ...formData, image: preset.url })}
                  className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    formData.image === preset.url
                      ? 'border-brand-terracota ring-2 ring-brand-terracota/30 scale-95'
                      : 'border-surface-200 hover:border-surface-400 opacity-80 hover:opacity-100'
                  }`}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {formData.image === preset.url && (
                    <div className="absolute inset-0 bg-brand-terracota/30 flex items-center justify-center text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Input URL directa */}
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Ruta relativa (/images/...) o URL completa (https://...)"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
          </div>

          {/* Resumen / Extracto */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Extracto o Resumen Breve * (Visible en la tarjeta)
            </label>
            <textarea
              required
              rows={2}
              placeholder="Breve introducción que motive la lectura (máx. 250 caracteres)..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota resize-none"
            />
          </div>

          {/* Contenido Completo del Artículo */}
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Cuerpo Completo del Artículo * (Visible al abrir el artículo)
            </label>
            <textarea
              required
              rows={8}
              placeholder="Escribe aquí el contenido completo del artículo, noticias, puntos clave o entrevistas..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota resize-y"
            />
          </div>

          {/* Acciones del formulario */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100">
            <button
              type="button"
              onClick={() => setModalFormAbierto(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-surface-100 hover:bg-surface-200 text-surface-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-terracota hover:bg-brand-orange text-white shadow-xs transition-all cursor-pointer"
            >
              {esEdicion ? 'Guardar Cambios' : 'Publicar Artículo'}
            </button>
          </div>
        </form>
      </ModalBase>

      {/* 6. Modal Confirmar Eliminación */}
      <ModalBase
        isOpen={modalEliminarAbierto}
        onClose={() => setModalEliminarAbierto(false)}
        title="Confirmar Eliminación"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold text-sm text-rose-900 mb-1">¿Estás seguro de eliminar este artículo?</p>
              <p>
                El artículo <strong>"{postParaEliminar?.title}"</strong> será retirado de forma permanente de la landing page.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalEliminarAbierto(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-200 text-surface-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
            >
              Eliminar Definitivamente
            </button>
          </div>
        </div>
      </ModalBase>

      {/* 7. Modal Confirmar Reset por Defecto */}
      <ModalBase
        isOpen={modalResetAbierto}
        onClose={() => setModalResetAbierto(false)}
        title="Restablecer Artículos Predeterminados"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <RotateCcw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold text-sm text-amber-900 mb-1">¿Restablecer el contenido original?</p>
              <p>
                Esta acción restaurará los 6 artículos de semilla predeterminados de ConexCoffee. Los artículos creados o modificados manualmente se sobrescribirán.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalResetAbierto(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-200 text-surface-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarReset}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
            >
              Sí, Restablecer
            </button>
          </div>
        </div>
      </ModalBase>

      {/* 8. Modal de Previsualización Oficial (Reutiliza BlogModal de la landing) */}
      <BlogModal
        post={postSeleccionado}
        isOpen={Boolean(postSeleccionado)}
        onClose={() => setPostSeleccionado(null)}
      />
    </div>
  );
}

