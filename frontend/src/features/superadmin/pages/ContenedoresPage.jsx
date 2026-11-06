import { useState, useRef } from 'react';
import { ModuloCabecera } from '@/components/data-display';
import {
  Search,
  Eye,
  X,
  Package,
  Send,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminContenedores,
  useActualizarSuperadminContenedor,
} from '../hooks/useSuperadminData';

export default function ContenedoresPage() {
  const query = useSuperadminContenedores();
  const contenedores = query.data ?? [];
  const actualizarContenedor = useActualizarSuperadminContenedor();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const tableRef = useRef(null);

  // Modales
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const [contenedorSeleccionado, setContenedorSeleccionado] = useState(null);

  // Filtrar
  const contenedoresFiltrados = contenedores.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.codigo.toLowerCase().includes(term) ||
      c.pais_origen.toLowerCase().includes(term) ||
      c.pais_destino.toLowerCase().includes(term);

    const matchesEstado =
      filtroEstado === 'todos' || c.estado.toLowerCase() === filtroEstado.toLowerCase();

    return matchesSearch && matchesEstado;
  });

  useTableEntranceAnimation(tableRef, [contenedoresFiltrados.length]);

  // Toggle publicar / ocultar
  const handleTogglePublicacion = (contenedor) => {
    const nuevoEstado = contenedor.estado === 'Publicado' ? 'Creado' : 'Publicado';
    actualizarContenedor.mutate({ ...contenedor, estado: nuevoEstado });
    toast.success(
      `Contenedor ${contenedor.codigo} ${
        nuevoEstado === 'Publicado' ? 'publicado para subasta' : 'ocultado'
      }`
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica al componente Blade original */}
      <ModuloCabecera
        titulo="Contenedores"
        subtitulo="Gestión logística de consolidación marítima y despacho internacional de café"
        imagenPortada="/images/portadas/contenedor.jpg"
        mensaje="Consulta y supervisión de los contenedores registrados por las empresas."
        icono={Package}
        totalRegistros={contenedores.length}
      />

      <QueryState query={query} />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-surface-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, puerto, país..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-medium text-surface-500">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-sm border border-surface-200 rounded-xl px-3 py-2 bg-surface-50 text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="creado">Creado (Borrador)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Contenedores */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left text-sm">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nº</th>
                <th className="py-3 px-4">Código Contenedor</th>
                <th className="py-3 px-4">País Origen</th>
                <th className="py-3 px-4">País Destino</th>
                <th className="py-3 px-4">Apertura</th>
                <th className="py-3 px-4">Cantidad Café (Kg)</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {contenedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-surface-400">
                    No se encontraron contenedores registrados.
                  </td>
                </tr>
              ) : (
                contenedoresFiltrados.map((c, index) => {
                  const porcentajeLlenado = Math.round(
                    (c.cantidad_cafe_kg / c.capacidad_total_kg) * 100
                  );
                  return (
                    <tr key={c.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="py-3 px-4 text-surface-500 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-surface-900">
                        <span>{c.codigo}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 text-xs">{c.pais_origen}</td>
                      <td className="py-3 px-4 text-surface-800 font-medium text-xs">
                        {c.pais_destino}
                      </td>
                      <td className="py-3 px-4 text-surface-600 text-xs">{c.fecha_apertura}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-surface-900 text-xs">
                            {c.cantidad_cafe_kg.toLocaleString('es-CO')} kg
                          </span>
                          <div className="w-28 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                porcentajeLlenado > 80
                                  ? 'bg-emerald-600'
                                  : 'bg-brand-terracota'
                              }`}
                              style={{ width: `${porcentajeLlenado}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-surface-400 block">
                            {porcentajeLlenado}% capacidad
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            c.estado === 'Publicado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-surface-100 text-surface-700 border border-surface-200'
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            icon={Eye}
                            title="Ver trazabilidad"
                            variant="view"
                            onClick={() => {
                              setContenedorSeleccionado(c);
                              setModalDetalleAbierto(true);
                            }}
                          />
                          <ActionButton
                            icon={c.estado === 'Publicado' ? EyeOff : Send}
                            title={
                              c.estado === 'Publicado'
                                ? 'Ocultar contenedor'
                                : 'Publicar contenedor'
                            }
                            variant={c.estado === 'Publicado' ? 'warning' : 'success'}
                            onClick={() => handleTogglePublicacion(c)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between text-xs text-surface-500">
          <span>
            Total registros: <b>{contenedoresFiltrados.length}</b> de {contenedores.length}
          </span>
          <span className="text-stone-400">Página 1 de 1</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL: VER DETALLE / TRAZABILIDAD CONTENEDOR                              */}
      {/* ========================================================================= */}
      {modalDetalleAbierto && contenedorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-stone-900 p-6 text-white relative">
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-800/60 border border-amber-600/30 flex items-center justify-center text-amber-300">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{contenedorSeleccionado.codigo}</h3>
                  <p className="text-xs text-amber-300/80">
                    Estado: {contenedorSeleccionado.estado} • {contenedorSeleccionado.temperatura_controlada}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block mb-0.5">Ruta Marítima</span>
                  <span className="font-semibold text-stone-800">
                    {contenedorSeleccionado.pais_origen} → {contenedorSeleccionado.pais_destino}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block mb-0.5">Capacidad Ocupada</span>
                  <span className="font-semibold text-stone-800">
                    {contenedorSeleccionado.cantidad_cafe_kg.toLocaleString('es-CO')} /{' '}
                    {contenedorSeleccionado.capacidad_total_kg.toLocaleString('es-CO')} kg
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">
                  Ofertas Consolidadas en este Contenedor
                </h4>
                {contenedorSeleccionado.ofertas_asignadas.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2">
                    Aún no hay lotes u ofertas asignadas a este contenedor.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contenedorSeleccionado.ofertas_asignadas.map((of, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-stone-800">{of.codigo}</span>
                          <span className="text-stone-500 block">{of.variedad}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-amber-800">{of.sacos} sacos</span>
                          <span className="text-stone-400 block">{of.peso_kg} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="px-4 py-2 text-sm bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
