import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';

import {
  Search,
  Eye,
  Pencil,
  X,
  EyeOff,
  ShoppingBag,
  Ship,
  Plus,
  Users,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaContenedores,
  useCrearEmpresaContenedor,
  useActualizarEmpresaContenedor,
  useEmpresaOfertas,
  useEmpresaBrokers,
} from '../hooks/useEmpresaData';

export default function EmpresaContenedoresPage() {
  const contenedoresQuery = useEmpresaContenedores();
  const contenedores = contenedoresQuery.data || [];
  const ofertasQuery = useEmpresaOfertas();
  const ofertasDisponibles = ofertasQuery.data || [];
  const brokersQuery = useEmpresaBrokers();
  const brokersDisponibles = brokersQuery.data || [];
  const crearMutation = useCrearEmpresaContenedor();
  const actualizarMutation = useActualizarEmpresaContenedor();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Modales
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);

  const [contenedorSeleccionado, setContenedorSeleccionado] = useState(null);
  const [contenedorEdicion, setContenedorEdicion] = useState(null);

  // Formulario nuevo contenedor
  const [nuevoContenedor, setNuevoContenedor] = useState({
    codigo: '',
    pais_origen: 'Colombia (Puerto Buenaventura)',
    pais_destino: 'Alemania (Puerto de Hamburgo)',
    cantidad_cafe_kg: 19000,
    capacidad_total_kg: 19000,
    fecha_apertura: new Date().toISOString().split('T')[0],
    fecha_cierre_estimada: '2026-10-30',
    fecha_envio: '2026-11-05',
    fecha_entrega_estimada: '2026-12-01',
    broker: 'OSCAR VALVERDE',
  });

  // Formulario para asignar oferta
  const [ofertaParaAsignarId, setOfertaParaAsignarId] = useState('');

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

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (!nuevoContenedor.codigo || !nuevoContenedor.fecha_apertura) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    const nuevo = {
      id: Date.now(),
      ...nuevoContenedor,
      cantidad_cafe_kg: 0,
      capacidad_total_kg: Number(nuevoContenedor.capacidad_total_kg) || 19000,
      estado: 'Publicado',
      ofertas_asignadas: [],
      brokers_asignados: [nuevoContenedor.broker],
    };

    crearMutation.mutate(nuevo, {
      onSuccess: () => {
        setModalRegistrar(false);
        setNuevoContenedor({
          codigo: '',
          pais_origen: 'Colombia (Puerto Buenaventura)',
          pais_destino: 'Alemania (Puerto de Hamburgo)',
          cantidad_cafe_kg: 19000,
          capacidad_total_kg: 19000,
          fecha_apertura: new Date().toISOString().split('T')[0],
          fecha_cierre_estimada: '2026-10-30',
          fecha_envio: '2026-11-05',
          fecha_entrega_estimada: '2026-12-01',
          broker: 'OSCAR VALVERDE',
        });
      },
    });
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    if (!contenedorEdicion) return;

    actualizarMutation.mutate(contenedorEdicion, {
      onSuccess: () => {
        setModalEditar(false);
      },
    });
  };

  const handleTogglePublicacion = (contenedor) => {
    const nuevoEstado = contenedor.estado === 'Publicado' ? 'Oculto' : 'Publicado';
    actualizarMutation.mutate({ ...contenedor, estado: nuevoEstado });
  };

  const handleAsignarOferta = (e) => {
    e.preventDefault();
    if (!contenedorSeleccionado || !ofertaParaAsignarId) {
      toast.error('Seleccione una oferta para asignar');
      return;
    }

    const oferta = ofertasDisponibles.find((o) => String(o.id) === String(ofertaParaAsignarId));
    if (!oferta) return;

    const ofertasPrevias = contenedorSeleccionado.ofertas_asignadas || [];
    const pesoNuevo = (contenedorSeleccionado.cantidad_cafe_kg || 0) + oferta.cantidad_kg;

    if (pesoNuevo > contenedorSeleccionado.capacidad_total_kg) {
      toast.error('La carga excede la capacidad máxima del contenedor');
      return;
    }

    const nuevaOfertaObj = {
      codigo: oferta.codigo,
      variedad: oferta.variedad,
      sacos: oferta.sacos,
      peso_kg: oferta.cantidad_kg,
    };

    actualizarMutation.mutate(
      {
        ...contenedorSeleccionado,
        cantidad_cafe_kg: pesoNuevo,
        ofertas_asignadas: [...ofertasPrevias, nuevaOfertaObj],
      },
      {
        onSuccess: () => {
          setModalAsignar(false);
          setOfertaParaAsignarId('');
        },
      }
    );
  };

  const abrirEdicion = (c) => {
    setContenedorEdicion({ ...c });
    setModalEditar(true);
  };

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Contenedores de Exportación"
        subtitulo="Gestión de contenedores marítimos, consolidación de carga y logística internacional"
        imagenPortada="/images/portadas/contenedor.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de cada uno de tus contenedores de exportación."
        icono={Ship}
        totalRegistros={contenedores.length}
      />

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, país origen o destino..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-stone-500">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 font-medium text-stone-700"
          >
            <option value="todos">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="oculto">Oculto</option>
          </select>
          <button
            type="button"
            onClick={() => setModalRegistrar(true)}
            className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar
          </button>
        </div>
      </div>

      {/* Tabla Oficial de Contenedores */}
      <QueryState query={contenedoresQuery} />
      {/* Columnas: N°, País origen, País destino, Fecha apertura, Cantidad café (Kg), Estado, Acciones */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">N°</th>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">País Origen</th>
                <th className="py-3.5 px-4">País Destino</th>
                <th className="py-3.5 px-4">Fecha Apertura</th>
                <th className="py-3.5 px-4">Cantidad Café (Kg)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {contenedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-stone-400">
                    No se encontraron contenedores registrados.
                  </td>
                </tr>
              ) : (
                contenedoresFiltrados.map((c, index) => {
                  const porcentaje = Math.round((c.cantidad_cafe_kg / c.capacidad_total_kg) * 100);
                  return (
                    <tr key={c.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 text-center text-stone-400 font-bold">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-stone-900">
                        {c.codigo}
                      </td>
                      <td className="py-4 px-4 font-medium text-stone-700">
                        {c.pais_origen}
                      </td>
                      <td className="py-4 px-4 font-semibold text-stone-900">
                        {c.pais_destino}
                      </td>
                      <td className="py-4 px-4 text-stone-600 font-mono">
                        {c.fecha_apertura}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-stone-900 block">
                            {c.cantidad_cafe_kg.toLocaleString('es-CO')} / {c.capacidad_total_kg.toLocaleString('es-CO')} Kg
                          </span>
                          <div className="w-32 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-400 block font-semibold">
                            {porcentaje}% de llenado
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            c.estado === 'Publicado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => {
                              setContenedorSeleccionado(c);
                              setModalDetalle(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            title="Ver Detalle del Contenedor"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Editar */}
                          <button
                            type="button"
                            onClick={() => abrirEdicion(c)}
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                            title="Editar Contenedor"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* 3. Asignar Oferta */}
                          <button
                            type="button"
                            onClick={() => {
                              setContenedorSeleccionado(c);
                              setModalAsignar(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-100 rounded-lg"
                            title="Asignar Oferta"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>

                          {/* 4. Ocultar / Publicar */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublicacion(c)}
                            className={`p-1.5 rounded-lg ${
                              c.estado === 'Publicado'
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-stone-400 hover:bg-stone-100'
                            }`}
                            title={c.estado === 'Publicado' ? 'Ocultar Contenedor' : 'Publicar Contenedor'}
                          >
                            {c.estado === 'Publicado' ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
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
      </div>

      {/* MODAL 1: REGISTRAR CONTENEDOR (Campos exactos del sistema original) */}
      {modalRegistrar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Ship className="w-5 h-5 text-amber-700" />
                Registrar Contenedor
              </h3>
              <button
                type="button"
                onClick={() => setModalRegistrar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Código de Contenedor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CONT-EMP-2026-03"
                  value={nuevoContenedor.codigo}
                  onChange={(e) => setNuevoContenedor({ ...nuevoContenedor, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    País Origen *
                  </label>
                  <select
                    value={nuevoContenedor.pais_origen}
                    onChange={(e) =>
                      setNuevoContenedor({ ...nuevoContenedor, pais_origen: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                  >
                    <option value="Colombia (Puerto Buenaventura)">Colombia (Puerto Buenaventura)</option>
                    <option value="Colombia (Puerto Santa Marta)">Colombia (Puerto Santa Marta)</option>
                    <option value="Colombia (Puerto Cartagena)">Colombia (Puerto Cartagena)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    País Destino *
                  </label>
                  <select
                    value={nuevoContenedor.pais_destino}
                    onChange={(e) =>
                      setNuevoContenedor({ ...nuevoContenedor, pais_destino: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                  >
                    <option value="Alemania (Puerto de Hamburgo)">Alemania (Puerto de Hamburgo)</option>
                    <option value="Países Bajos (Puerto de Rotterdam)">Países Bajos (Puerto de Rotterdam)</option>
                    <option value="Japón (Puerto de Yokohama)">Japón (Puerto de Yokohama)</option>
                    <option value="Estados Unidos (Puerto de Houston)">Estados Unidos (Puerto de Houston)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Cantidad de café máxima (Kg) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ejemplo: 19000"
                  value={nuevoContenedor.capacidad_total_kg}
                  onChange={(e) =>
                    setNuevoContenedor({
                      ...nuevoContenedor,
                      capacidad_total_kg: e.target.value === '' ? '' : Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha Apertura *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoContenedor.fecha_apertura}
                    onChange={(e) =>
                      setNuevoContenedor({ ...nuevoContenedor, fecha_apertura: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha Cierre *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoContenedor.fecha_cierre_estimada}
                    onChange={(e) =>
                      setNuevoContenedor({
                        ...nuevoContenedor,
                        fecha_cierre_estimada: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha Envío *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoContenedor.fecha_envio}
                    onChange={(e) =>
                      setNuevoContenedor({ ...nuevoContenedor, fecha_envio: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha Entrega Estimada *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoContenedor.fecha_entrega_estimada}
                    onChange={(e) =>
                      setNuevoContenedor({
                        ...nuevoContenedor,
                        fecha_entrega_estimada: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Broker Asignado *
                </label>
                <select
                  value={nuevoContenedor.broker}
                  onChange={(e) => setNuevoContenedor({ ...nuevoContenedor, broker: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                >
                  {brokersDisponibles.map((b) => (
                    <option key={b.id} value={`${b.primer_nombre} ${b.primer_apellido}`}>
                      {b.primer_nombre} {b.primer_apellido} ({b.zona_comercial})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalRegistrar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALLE DEL CONTENEDOR (Secciones: Información, Información ofertas, Información brokers) */}
      {modalDetalle && contenedorSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-mono">
                  {contenedorSeleccionado.codigo}
                </span>
                <h3 className="font-bold text-stone-900 text-base mt-1">
                  Detalle del Contenedor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Sección 1: Información */}
              <div>
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2 text-amber-900">
                  Información Logística
                </h4>
                <div className="grid grid-cols-2 gap-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">País Origen</span>
                    <span className="font-semibold text-stone-800">{contenedorSeleccionado.pais_origen}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">País Destino</span>
                    <span className="font-semibold text-stone-800">{contenedorSeleccionado.pais_destino}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Cantidad de Café</span>
                    <span className="font-bold text-stone-900">
                      {contenedorSeleccionado.cantidad_cafe_kg.toLocaleString('es-CO')} Kg / {contenedorSeleccionado.capacidad_total_kg.toLocaleString('es-CO')} Kg
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Estado</span>
                    <span className="font-semibold text-emerald-700">{contenedorSeleccionado.estado}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Fecha Apertura</span>
                    <span className="font-medium text-stone-700">{contenedorSeleccionado.fecha_apertura}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Fecha de Cierre</span>
                    <span className="font-medium text-stone-700">{contenedorSeleccionado.fecha_cierre_estimada}</span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Información Ofertas */}
              <div>
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2 text-amber-900">
                  Información Ofertas Asignadas
                </h4>
                {contenedorSeleccionado.ofertas_asignadas && contenedorSeleccionado.ofertas_asignadas.length > 0 ? (
                  <div className="space-y-2">
                    {contenedorSeleccionado.ofertas_asignadas.map((of, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-amber-900 text-xs mr-2">
                            {of.codigo}
                          </span>
                          <span className="font-medium text-stone-800">{of.variedad}</span>
                        </div>
                        <span className="font-bold text-stone-900">
                          {of.peso_kg.toLocaleString('es-CO')} Kg ({of.sacos} sacos)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    No hay ofertas asignadas a este contenedor todavía.
                  </p>
                )}
              </div>

              {/* Sección 3: Información Brokers */}
              <div>
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2 text-amber-900">
                  Información Brokers Asignados
                </h4>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-stone-800">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span className="font-semibold">
                    {contenedorSeleccionado.brokers_asignados?.join(', ') || 'OSCAR VALVERDE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ASIGNAR OFERTA (Resumen, capacidad máxima, progreso, selector) */}
      {modalAsignar && contenedorSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-700" />
                  Asignar Oferta al Contenedor
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {contenedorSeleccionado.codigo} • {contenedorSeleccionado.pais_destino}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAsignar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAsignarOferta} className="space-y-4 text-xs">
              {/* Resumen de Capacidad */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Capacidad máxima contenedor:</span>
                  <span className="font-bold text-stone-900">
                    {contenedorSeleccionado.capacidad_total_kg.toLocaleString('es-CO')} Kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Ofertas ya asignadas:</span>
                  <span className="font-bold text-amber-900">
                    {contenedorSeleccionado.cantidad_cafe_kg.toLocaleString('es-CO')} Kg
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-700 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round(
                          (contenedorSeleccionado.cantidad_cafe_kg /
                            contenedorSeleccionado.capacidad_total_kg) *
                            100
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Seleccionar Oferta Disponible *
                </label>
                <select
                  required
                  value={ofertaParaAsignarId}
                  onChange={(e) => setOfertaParaAsignarId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white font-medium text-stone-800"
                >
                  <option value="">-- Seleccione una oferta --</option>
                  {ofertasDisponibles.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} — Cantidad: {o.cantidad_kg.toLocaleString()} Kg • Variedad: {o.variedad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalAsignar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 shadow-sm"
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDITAR CONTENEDOR */}
      {modalEditar && contenedorEdicion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-700" />
                Editar Contenedor ({contenedorEdicion.codigo})
              </h3>
              <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">País Origen</label>
                  <input
                    type="text"
                    value={contenedorEdicion.pais_origen}
                    onChange={(e) =>
                      setContenedorEdicion({ ...contenedorEdicion, pais_origen: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">País Destino</label>
                  <input
                    type="text"
                    value={contenedorEdicion.pais_destino}
                    onChange={(e) =>
                      setContenedorEdicion({ ...contenedorEdicion, pais_destino: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fecha Apertura</label>
                  <input
                    type="date"
                    value={contenedorEdicion.fecha_apertura}
                    onChange={(e) =>
                      setContenedorEdicion({ ...contenedorEdicion, fecha_apertura: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fecha Cierre</label>
                  <input
                    type="date"
                    value={contenedorEdicion.fecha_cierre_estimada}
                    onChange={(e) =>
                      setContenedorEdicion({
                        ...contenedorEdicion,
                        fecha_cierre_estimada: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
