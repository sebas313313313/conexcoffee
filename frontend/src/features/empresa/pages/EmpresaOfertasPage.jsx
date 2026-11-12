import { useState } from 'react';
import { ModuloCabecera } from '@/components/data-display';
import {
  Search,
  Eye,
  X,
  Tag,
  Award,
  FileText,
  UserCheck,
  Ban,
  Printer,
  Layers,
  Send,
  Coffee,
  MapPin,
  Phone,
  Mail,
  Home,
  ShieldCheck,
  Ship,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaPreofertas,
  useActualizarEmpresaPreoferta,
  useEmpresaOfertas,
  useCrearEmpresaOferta,
  useActualizarEmpresaOferta,
  useEmpresaTecnicos,
  useEmpresaContenedores,
} from '../hooks/useEmpresaData';

export default function EmpresaOfertasPage({ vistaInicial = 'ofertas' }) {
  // Pestaña principal activa: 'ofertas' | 'preofertas'
  const [tabPrincipal, setTabPrincipal] = useState(vistaInicial);

  // Estados de datos vía TanStack Query
  const preofertasQuery = useEmpresaPreofertas();
  const preofertas = preofertasQuery.data || [];
  const actualizarPreoferta = useActualizarEmpresaPreoferta();

  const ofertasQuery = useEmpresaOfertas();
  const ofertas = ofertasQuery.data || [];
  const crearOferta = useCrearEmpresaOferta();
  const actualizarOferta = useActualizarEmpresaOferta();

  const tecnicosQuery = useEmpresaTecnicos();
  const tecnicos = tecnicosQuery.data || [];

  const contenedoresQuery = useEmpresaContenedores();
  const contenedores = contenedoresQuery.data || [];

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstadoPreoferta, setFiltroEstadoPreoferta] = useState('todos');

  // Modales Preofertas
  const [modalDetallePreoferta, setModalDetallePreoferta] = useState(false);
  const [preofertaSeleccionada, setPreofertaSeleccionada] = useState(null);
  const [tabDetallePreoferta, setTabDetallePreoferta] = useState('preoferta'); // 'preoferta' | 'caficultor' | 'finca'

  const [modalAsignarTecnico, setModalAsignarTecnico] = useState(false);
  const [tecnicoSeleccionadoId, setTecnicoSeleccionadoId] = useState('');

  const [modalRechazar, setModalRechazar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const [modalConvertirOferta, setModalConvertirOferta] = useState(false);
  const [datosConversion, setDatosConversion] = useState({
    puntaje_sca: 86.0,
    precio_kg_usd: 8.5,
    sacos: 16,
    notas_cata: '',
  });

  // Modales Ofertas
  const [modalDetalleOferta, setModalDetalleOferta] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);

  const [modalHojaCatacion, setModalHojaCatacion] = useState(false);
  const [ofertaCatacion, setOfertaCatacion] = useState(null);

  const [modalAsignarContenedor, setModalAsignarContenedor] = useState(false);
  const [contenedorDestino, setContenedorDestino] = useState('');

  // ----------------------------------------------------
  // Filtrado de Preofertas
  // ----------------------------------------------------
  const preofertasFiltradas = preofertas.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchTerm =
      p.codigo.toLowerCase().includes(term) ||
      p.variedad.toLowerCase().includes(term) ||
      p.caficultor.nombre.toLowerCase().includes(term) ||
      p.finca.nombre.toLowerCase().includes(term);

    if (filtroEstadoPreoferta !== 'todos') {
      return matchTerm && p.estado === filtroEstadoPreoferta;
    }
    return matchTerm;
  });

  // ----------------------------------------------------
  // Filtrado de Ofertas
  // ----------------------------------------------------
  const ofertasFiltradas = ofertas.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.codigo.toLowerCase().includes(term) ||
      o.variedad.toLowerCase().includes(term) ||
      o.caficultor.nombre.toLowerCase().includes(term) ||
      o.estado.toLowerCase().includes(term)
    );
  });

  // ----------------------------------------------------
  // Acciones: Preofertas
  // ----------------------------------------------------
  const handleAbrirDetallePreoferta = (item) => {
    setPreofertaSeleccionada(item);
    setTabDetallePreoferta('preoferta');
    setModalDetallePreoferta(true);
  };

  const handleAbrirAsignarTecnico = (item) => {
    setPreofertaSeleccionada(item);
    setTecnicoSeleccionadoId(tecnicos[0] ? String(tecnicos[0].id) : '');
    setModalAsignarTecnico(true);
  };

  const handleGuardarAsignarTecnico = (e) => {
    e.preventDefault();
    if (!preofertaSeleccionada) return;

    const tec = tecnicos.find((t) => String(t.id) === String(tecnicoSeleccionadoId));
    const nombreTecnico = tec
      ? `${tec.primer_nombre} ${tec.primer_apellido}`
      : 'Técnico Agrónomo Asignado';

    actualizarPreoferta.mutate(
      { ...preofertaSeleccionada, estado: 'Asignada', tecnico_asignado: nombreTecnico },
      {
        onSuccess: () => {
          setModalAsignarTecnico(false);
        },
      }
    );
  };

  const handleAbrirRechazar = (item) => {
    setPreofertaSeleccionada(item);
    setMotivoRechazo('');
    setModalRechazar(true);
  };

  const handleConfirmarRechazo = (e) => {
    e.preventDefault();
    if (!preofertaSeleccionada) return;

    actualizarPreoferta.mutate(
      {
        ...preofertaSeleccionada,
        estado: 'Rechazada',
        motivo_rechazo: motivoRechazo || 'No cumple requisitos mínimos de calidad',
      },
      {
        onSuccess: () => {
          setModalRechazar(false);
        },
      }
    );
  };

  const handleAbrirConversion = (item) => {
    setPreofertaSeleccionada(item);
    const sacosCalculados = Math.round(item.cantidad_kg / 60);
    setDatosConversion({
      puntaje_sca: 87.5,
      precio_kg_usd: item.precio_kg_usd || 8.5,
      sacos: sacosCalculados || 16,
      notas_cata: 'Perfil balanceado con acidez cítrica, notas dulces a panela y cuerpo sedoso',
    });
    setModalConvertirOferta(true);
  };

  const handleConfirmarConversion = (e) => {
    e.preventDefault();
    if (!preofertaSeleccionada) return;

    const nuevaOferta = {
      id: Date.now(),
      codigo: `EMP-0${ofertas.length + 9}`,
      cantidad_kg: preofertaSeleccionada.cantidad_kg,
      sacos: Number(datosConversion.sacos) || Math.round(preofertaSeleccionada.cantidad_kg / 60),
      variedad: preofertaSeleccionada.variedad,
      especie: preofertaSeleccionada.especie || 'Arábica',
      fecha_produccion: preofertaSeleccionada.fecha_produccion,
      secado: preofertaSeleccionada.secado,
      proceso_postcosecha: preofertaSeleccionada.proceso_postcosecha,
      puntaje_sca: Number(datosConversion.puntaje_sca) || 86.0,
      precio_kg_usd: Number(datosConversion.precio_kg_usd) || 8.0,
      precio_total_usd:
        (Number(datosConversion.precio_kg_usd) || 8.0) * preofertaSeleccionada.cantidad_kg,
      estado: 'Aceptada',
      contenedor_asignado: 'Sin asignar',
      notas_cata: datosConversion.notas_cata,
      atributos_sca: {
        fragancia_aroma: 8.5,
        sabor: 8.5,
        sabor_residual: 8.5,
        acidez: 8.5,
        cuerpo: 8.5,
        uniformidad: 10.0,
        balance: 8.5,
        taza_limpia: 10.0,
        dulzor: 10.0,
        puntaje_catador: 8.5,
        total: Number(datosConversion.puntaje_sca) || 87.5,
      },
      caficultor: {
        nombre: preofertaSeleccionada.caficultor.nombre,
        finca: preofertaSeleccionada.finca.nombre,
        vereda: preofertaSeleccionada.finca.vereda,
        municipio: preofertaSeleccionada.caficultor.municipio,
        altura_msnm: preofertaSeleccionada.finca.altura_msnm,
        asociacion: preofertaSeleccionada.finca.asociacion,
      },
    };

    crearOferta.mutate(nuevaOferta, {
      onSuccess: () => {
        actualizarPreoferta.mutate({ ...preofertaSeleccionada, estado: 'Aprobada' });
        setModalConvertirOferta(false);
        setTabPrincipal('ofertas');
      },
    });
  };

  // ----------------------------------------------------
  // Acciones: Ofertas
  // ----------------------------------------------------
  const handleAbrirDetalleOferta = (item) => {
    setOfertaSeleccionada(item);
    setModalDetalleOferta(true);
  };

  const handleGenerarPdf = (item) => {
    setOfertaCatacion(item);
    setModalHojaCatacion(true);
  };

  const handleAbrirAsignarContenedor = (item) => {
    setOfertaSeleccionada(item);
    setContenedorDestino(contenedores[0] ? contenedores[0].codigo : '');
    setModalAsignarContenedor(true);
  };

  const handleGuardarAsignarContenedor = (e) => {
    e.preventDefault();
    if (!ofertaSeleccionada || !contenedorDestino) return;

    actualizarOferta.mutate(
      { ...ofertaSeleccionada, contenedor_asignado: contenedorDestino },
      {
        onSuccess: () => {
          setModalAsignarContenedor(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial idéntica a ConexCoffee */}
      <ModuloCabecera
        titulo="Ofertas y Preofertas"
        subtitulo="Gestión del ciclo comercial: desde la recepción de preofertas hasta lotes exportables aceptados"
        imagenPortada="/images/portadas/oferta.jpg"
        mensaje={
          tabPrincipal === 'ofertas'
            ? 'En este módulo podrás ver la información detallada de cada una de tus ofertas de café listas para comercialización internacional.'
            : 'En este módulo podrás registrar y gestionar la información detallada de cada una de tus preofertas recibidas de caficultores.'
        }
        icono={Tag}
        totalRegistros={tabPrincipal === 'ofertas' ? ofertasFiltradas.length : preofertasFiltradas.length}
        textoBotonRegistrar={tabPrincipal === 'ofertas' ? 'Nueva Oferta' : 'Nueva Preoferta'}
        onRegistrar={() => {
          if (tabPrincipal === 'ofertas') {
            toast.info('Para crear una Oferta, selecciona y aprueba una Preoferta evaluada o registrada.');
          } else {
            toast.info('Las preofertas son enviadas por los caficultores o registradas en campo.');
          }
        }}
      />

      {/* Selector de Pestañas Principales (Ofertas vs Preofertas) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTabPrincipal('ofertas')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              tabPrincipal === 'ofertas'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-700" />
            Ofertas ({ofertas.length})
          </button>
          <button
            type="button"
            onClick={() => setTabPrincipal('preofertas')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              tabPrincipal === 'preofertas'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            Preofertas ({preofertas.length})
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {tabPrincipal === 'preofertas' && (
            <select
              value={filtroEstadoPreoferta}
              onChange={(e) => setFiltroEstadoPreoferta(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none text-stone-700"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Asignada">Asignada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Aprobada">Aprobada</option>
            </select>
          )}

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                tabPrincipal === 'ofertas'
                  ? 'Buscar por código, variedad, productor...'
                  : 'Buscar por código, variedad, finca...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: OFERTAS (Idéntica a conexcoffee.co/ofertas)             */}
      {/* Columnas: N°, CODIGO, CANTIDAD, VARIEDAD DE CAFE, ESTADO, ACCIONES        */}
      {/* ========================================================================= */}
      <QueryState query={tabPrincipal === 'ofertas' ? ofertasQuery : preofertasQuery} />
      {tabPrincipal === 'ofertas' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">N°</th>
                  <th className="px-6 py-3.5">CODIGO</th>
                  <th className="px-6 py-3.5">CANTIDAD</th>
                  <th className="px-6 py-3.5">VARIEDAD DE CAFE</th>
                  <th className="px-6 py-3.5 text-center">PUNTAJE SCA</th>
                  <th className="px-6 py-3.5 text-center">ESTADO</th>
                  <th className="px-6 py-3.5 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {ofertasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400">
                      No se encontraron ofertas registradas con esos criterios.
                    </td>
                  </tr>
                ) : (
                  ofertasFiltradas.map((item, index) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-stone-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-stone-900">
                        {item.codigo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900">
                          {item.cantidad_kg.toLocaleString('es-CO', { minimumFractionDigits: 2 })} KG
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {item.sacos} sacos de 60kg
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-900">{item.variedad}</div>
                        <div className="text-[11px] text-stone-500">
                          {item.proceso_postcosecha} • {item.caficultor.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          {item.puntaje_sca} SCA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            item.estado === 'Aceptada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.estado === 'En Negociación'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {item.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Ver Detalle */}
                          <button
                            type="button"
                            onClick={() => handleAbrirDetalleOferta(item)}
                            title="Ver Detalle"
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Botón Generar PDF / Hoja de Catación */}
                          <button
                            type="button"
                            onClick={() => handleGenerarPdf(item)}
                            title="Generar PDF / Hoja de Catación"
                            className="p-1.5 text-amber-800 hover:text-amber-900 hover:bg-amber-100/50 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Botón Asignar a Contenedor */}
                          <button
                            type="button"
                            onClick={() => handleAbrirAsignarContenedor(item)}
                            title="Asignar a Contenedor Marítimo"
                            className="p-1.5 text-sky-700 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Ship className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PREOFERTAS (Idéntica a conexcoffee.co/pre-ofertas)              */}
      {/* Columnas: N°, Código, Cantidad, Variedad de café, Estado, Acciones        */}
      {/* ========================================================================= */}
      {tabPrincipal === 'preofertas' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">N°</th>
                  <th className="px-6 py-3.5">Código</th>
                  <th className="px-6 py-3.5">Cantidad</th>
                  <th className="px-6 py-3.5">Variedad de café</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {preofertasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                      No se encontraron preofertas con esos criterios.
                    </td>
                  </tr>
                ) : (
                  preofertasFiltradas.map((item, index) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-stone-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-stone-900">
                        {item.codigo}
                      </td>
                      <td className="px-6 py-4 font-semibold text-stone-900">
                        {item.cantidad_kg.toLocaleString('es-CO', { minimumFractionDigits: 2 })} KG
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-900">{item.variedad}</div>
                        <div className="text-[11px] text-stone-500">
                          {item.caficultor.nombre} • Finca {item.finca.nombre} ({item.finca.altura_msnm} msnm)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            item.estado === 'Pendiente'
                              ? 'bg-amber-100 text-amber-800'
                              : item.estado === 'Asignada'
                              ? 'bg-cyan-100 text-cyan-800'
                              : item.estado === 'Aprobada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.estado}
                        </span>
                        {item.tecnico_asignado && (
                          <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                            {item.tecnico_asignado}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Botón Ver Detalle (3 pestañas) */}
                          <button
                            type="button"
                            onClick={() => handleAbrirDetallePreoferta(item)}
                            title="Ver Detalle Preoferta"
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 2. Botón Asignar Técnico (Solo disponible si Pendiente) */}
                          {item.estado === 'Pendiente' && (
                            <button
                              type="button"
                              onClick={() => handleAbrirAsignarTecnico(item)}
                              title="Asignar Técnico Agrónomo"
                              className="p-1.5 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* 3. Botón Rechazar (Disponible en Pendiente o Asignada) */}
                          {(item.estado === 'Pendiente' || item.estado === 'Asignada') && (
                            <button
                              type="button"
                              onClick={() => handleAbrirRechazar(item)}
                              title="Rechazar Preoferta"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Botón Promover a Oferta */}
                          {item.estado !== 'Rechazada' && item.estado !== 'Aprobada' && (
                            <button
                              type="button"
                              onClick={() => handleAbrirConversion(item)}
                              title="Aprobar y Promover a Oferta"
                              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DETALLE PREOFERTA (CON LAS 3 PESTAÑAS IDÉNTICAS A LA ORIGINAL)    */}
      {/* Tab 1: Preoferta, Tab 2: Caficultor, Tab 3: Finca                       */}
      {/* ========================================================================= */}
      {modalDetallePreoferta && preofertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/60">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {preofertaSeleccionada.codigo}
                </span>
                <h3 className="font-bold text-stone-900 text-base mt-1">
                  Detalle de Preoferta de Café
                </h3>
              </div>
              <button
                onClick={() => setModalDetallePreoferta(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de 3 Pestañas Oficiales */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-6">
              <button
                type="button"
                onClick={() => setTabDetallePreoferta('preoferta')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  tabDetallePreoferta === 'preoferta'
                    ? 'border-amber-800 text-amber-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-amber-700" />
                1. Preoferta
              </button>
              <button
                type="button"
                onClick={() => setTabDetallePreoferta('caficultor')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  tabDetallePreoferta === 'caficultor'
                    ? 'border-amber-800 text-amber-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                2. Caficultor
              </button>
              <button
                type="button"
                onClick={() => setTabDetallePreoferta('finca')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  tabDetallePreoferta === 'finca'
                    ? 'border-amber-800 text-amber-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-amber-700" />
                3. Finca
              </button>
            </div>

            {/* Contenido según pestaña activa */}
            <div className="p-6 text-xs text-stone-700 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* PESTAÑA 1: PREOFERTA */}
              {tabDetallePreoferta === 'preoferta' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Código</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {preofertaSeleccionada.codigo}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Fecha Creación</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.fecha_creacion}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Especie</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.especie || 'Arábica'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Variedad</span>
                      <span className="font-bold text-stone-900">
                        {preofertaSeleccionada.variedad}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Cantidad (KG)</span>
                      <span className="font-bold text-amber-900">
                        {preofertaSeleccionada.cantidad_kg.toLocaleString()} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Fecha Producción</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.fecha_produccion}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Método Secado</span>
                      <span className="font-semibold text-stone-800">{preofertaSeleccionada.secado}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Sombrío</span>
                      <span className="font-semibold text-stone-800">{preofertaSeleccionada.sombrio}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Tipo Sombrío</span>
                      <span className="font-semibold text-stone-800">{preofertaSeleccionada.tipo_sombrio}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-stone-900 block mb-1">
                        Proceso Postcosecha y Beneficio:
                      </span>
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 font-semibold text-amber-950">
                        {preofertaSeleccionada.proceso_postcosecha}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-stone-900 block mb-1">
                        Descripción del Proceso de Fermentación:
                      </span>
                      <p className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 italic text-stone-600">
                        &ldquo;{preofertaSeleccionada.descripcion_fermentacion}&rdquo;
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-stone-900 block mb-1">
                        Descripción del Proceso General:
                      </span>
                      <p className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-stone-600">
                        {preofertaSeleccionada.descripcion_proceso}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="font-bold text-emerald-900">
                        Precio Estimado Solicitado:
                      </span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        ${preofertaSeleccionada.precio_estimado_cop?.toLocaleString('es-CO')} COP
                        {preofertaSeleccionada.precio_kg_usd && (
                          <span className="ml-2 text-emerald-700 font-normal">
                            (~${preofertaSeleccionada.precio_kg_usd} USD/kg)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: CAFICULTOR */}
              {tabDetallePreoferta === 'caficultor' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl border border-amber-200 shrink-0">
                      {preofertaSeleccionada.caficultor.nombre[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">
                        {preofertaSeleccionada.caficultor.nombre}
                      </h4>
                      <p className="text-stone-500 text-xs">
                        Productor Cafetero Afiliado
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Teléfono</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {preofertaSeleccionada.caficultor.telefono}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Correo Electrónico</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        {preofertaSeleccionada.caficultor.correo}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Dirección de Contacto</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.caficultor.direccion}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">País y Municipio</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        {preofertaSeleccionada.caficultor.municipio}, {preofertaSeleccionada.caficultor.pais}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: FINCA */}
              {tabDetallePreoferta === 'finca' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Nombre de la Finca</span>
                      <span className="font-bold text-stone-900 text-sm">
                        {preofertaSeleccionada.finca.nombre}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Vereda</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.finca.vereda}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Altura</span>
                      <span className="font-bold text-amber-800">
                        {preofertaSeleccionada.finca.altura_msnm} m s.n.m.
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Asociación</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.finca.asociacion}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Área en Café</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.finca.area_cafe_ha} Ha
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Área Conservación</span>
                      <span className="font-semibold text-stone-800">
                        {preofertaSeleccionada.finca.area_conservacion_ha} Ha
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="font-bold text-stone-900 block mb-2">
                      Verificación de Cédula y Documento de Identidad:
                    </span>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-stone-800">
                          C.C. {preofertaSeleccionada.finca.cedula_numero}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Documento validado en plataforma y vinculado al caficultor.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con Acciones */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preofertaSeleccionada.estado === 'Pendiente' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetallePreoferta(false);
                      handleAbrirAsignarTecnico(preofertaSeleccionada);
                    }}
                    className="px-3 py-1.5 bg-cyan-700 text-white rounded-xl text-xs font-semibold hover:bg-cyan-800 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Asignar Técnico
                  </button>
                )}
                {preofertaSeleccionada.estado !== 'Aprobada' && preofertaSeleccionada.estado !== 'Rechazada' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetallePreoferta(false);
                      handleAbrirConversion(preofertaSeleccionada);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Aprobar y Crear Oferta
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setModalDetallePreoferta(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ASIGNAR TÉCNICO A PREOFERTA (Idéntico a modal conexcoffee.co)    */}
      {/* ========================================================================= */}
      {modalAsignarTecnico && preofertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-700" />
                  Asignar Técnico Agrónomo
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Preoferta {preofertaSeleccionada.codigo} • {preofertaSeleccionada.variedad}
                </p>
              </div>
              <button
                onClick={() => setModalAsignarTecnico(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarAsignarTecnico} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Seleccione Técnico Agrónomo *
                </label>
                <select
                  required
                  value={tecnicoSeleccionadoId}
                  onChange={(e) => setTecnicoSeleccionadoId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-700/20 bg-white font-medium text-stone-800"
                >
                  <option value="">-- Seleccionar Técnico --</option>
                  {tecnicos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.primer_nombre} {t.primer_apellido} — Zona: {t.zona_asignada}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 text-cyan-900 text-[11px] leading-relaxed">
                El técnico seleccionado recibirá la notificación para realizar la visita agronómica a la finca <strong>{preofertaSeleccionada.finca.nombre}</strong> y recolectar la muestra para análisis físico y sensorial.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalAsignarTecnico(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-700 text-white font-semibold rounded-xl hover:bg-cyan-800 shadow-sm"
                >
                  Guardar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECHAZAR PREOFERTA                                              */}
      {/* ========================================================================= */}
      {modalRechazar && preofertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                Rechazar Preoferta
              </h3>
              <button
                onClick={() => setModalRechazar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarRechazo} className="space-y-4 text-xs">
              <p className="text-stone-600">
                ¿Está seguro de que desea desestimar la preoferta{' '}
                <strong>{preofertaSeleccionada.codigo}</strong> enviada por{' '}
                <strong>{preofertaSeleccionada.caficultor.nombre}</strong>?
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Motivo de Rechazo (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ej: Defectos físicos elevados, taza fuera de estándar SCA requerido..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-700/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalRechazar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: APROBAR PREOFERTA Y PROMOVER A OFERTA                   */}
      {/* ========================================================================= */}
      {modalConvertirOferta && preofertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  Aprobar y Crear Oferta
                </h3>
                <p className="text-xs text-stone-500">
                  Promocionar preoferta {preofertaSeleccionada.codigo} al catálogo comercial
                </p>
              </div>
              <button
                onClick={() => setModalConvertirOferta(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarConversion} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 grid grid-cols-2 gap-2 text-emerald-950">
                <div>
                  <span className="text-[10px] text-emerald-700 block uppercase font-bold">Caficultor</span>
                  <span className="font-semibold">{preofertaSeleccionada.caficultor.nombre}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block uppercase font-bold">Variedad</span>
                  <span className="font-semibold">{preofertaSeleccionada.variedad}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block uppercase font-bold">Volumen Total</span>
                  <span className="font-semibold">{preofertaSeleccionada.cantidad_kg.toLocaleString()} KG</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block uppercase font-bold">Beneficio</span>
                  <span className="font-semibold">{preofertaSeleccionada.proceso_postcosecha}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Puntaje SCA *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={datosConversion.puntaje_sca}
                    onChange={(e) =>
                      setDatosConversion({ ...datosConversion, puntaje_sca: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Precio (USD/kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={datosConversion.precio_kg_usd}
                    onChange={(e) =>
                      setDatosConversion({ ...datosConversion, precio_kg_usd: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Sacos (60kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={datosConversion.sacos}
                    onChange={(e) =>
                      setDatosConversion({ ...datosConversion, sacos: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notas de Cata y Descriptor Sensorial *
                </label>
                <textarea
                  rows={2}
                  required
                  value={datosConversion.notas_cata}
                  onChange={(e) =>
                    setDatosConversion({ ...datosConversion, notas_cata: e.target.value })
                  }
                  placeholder="Ej: Jazmín, flor de naranjo, panela, acidez cítrica brillante..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalConvertirOferta(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 shadow-sm"
                >
                  Publicar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETALLE DE OFERTA                                       */}
      {/* ========================================================================= */}
      {modalDetalleOferta && ofertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-mono">
                  {ofertaSeleccionada.codigo}
                </span>
                <h3 className="font-bold text-stone-900 text-base mt-1">
                  {ofertaSeleccionada.variedad}
                </h3>
              </div>
              <button
                onClick={() => setModalDetalleOferta(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Caficultor</span>
                  <span className="font-semibold text-stone-800">{ofertaSeleccionada.caficultor.nombre}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Finca & Altura</span>
                  <span className="font-semibold text-stone-800">
                    {ofertaSeleccionada.caficultor.finca} ({ofertaSeleccionada.caficultor.altura_msnm} msnm)
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Volumen Disponible</span>
                  <span className="font-bold text-stone-900">
                    {ofertaSeleccionada.cantidad_kg.toLocaleString()} kg ({ofertaSeleccionada.sacos} sacos)
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Precio FOB USD/kg</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ${ofertaSeleccionada.precio_kg_usd} USD
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Proceso Postcosecha</span>
                  <span className="font-semibold text-stone-800">{ofertaSeleccionada.proceso_postcosecha}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Contenedor Asignado</span>
                  <span className="font-semibold text-sky-800">{ofertaSeleccionada.contenedor_asignado}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-stone-800 block mb-1">Certificación Sensorial:</span>
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <Award className="w-5 h-5 text-amber-700" />
                  <div>
                    <span className="font-bold text-amber-900 text-sm">
                      {ofertaSeleccionada.puntaje_sca} Puntos SCA
                    </span>
                    <p className="text-[11px] text-amber-800 italic mt-0.5">
                      &ldquo;{ofertaSeleccionada.notas_cata}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setModalDetalleOferta(false);
                  handleGenerarPdf(ofertaSeleccionada);
                }}
                className="px-3 py-1.5 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Ver Hoja de Catación
              </button>
              <button
                type="button"
                onClick={() => setModalDetalleOferta(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: HOJA OFICIAL DE CATACIÓN / REPORTE SCA (GENERAR PDF)             */}
      {/* Cumple exactamente la función 'generarPdf' de conexcoffee.co/ofertas      */}
      {/* ========================================================================= */}
      {modalHojaCatacion && ofertaCatacion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-stone-200 space-y-6 my-6 print:m-0 print:border-none print:shadow-none animate-in fade-in zoom-in-95">
            {/* Header del Certificado */}
            <div className="flex items-center justify-between border-b-2 border-stone-900 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo-dark_conex.png"
                  alt="ConexCoffee"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h2 className="text-base font-extrabold text-stone-900 uppercase tracking-wider">
                    Certificado Oficial de Calidad Sensorial
                  </h2>
                  <p className="text-xs text-stone-500 font-mono">
                    Protocolo Specialty Coffee Association (SCA) • ConexCoffee Platform
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md block">
                  {ofertaCatacion.codigo}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Fecha: {new Date().toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>

            {/* Metadatos del Lote */}
            <div className="grid grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Caficultor Productor</span>
                <span className="font-bold text-stone-900">{ofertaCatacion.caficultor.nombre}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Finca y Vereda</span>
                <span className="font-semibold text-stone-800">
                  {ofertaCatacion.caficultor.finca}, {ofertaCatacion.caficultor.vereda}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Municipio y Origen</span>
                <span className="font-semibold text-stone-800">{ofertaCatacion.caficultor.municipio}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Variedad</span>
                <span className="font-bold text-stone-900">{ofertaCatacion.variedad}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Altitud</span>
                <span className="font-bold text-amber-800">{ofertaCatacion.caficultor.altura_msnm} m s.n.m.</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Proceso Postcosecha</span>
                <span className="font-semibold text-stone-800">{ofertaCatacion.proceso_postcosecha}</span>
              </div>
            </div>

            {/* Desglose de Puntuación Sensorial SCA (10 Atributos Oficiales) */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-stone-900 text-white text-xs font-bold px-4 py-2 flex items-center justify-between">
                <span>DESGLOSE DE ATRIBUTOS EN TAZA (FORMATO SCA)</span>
                <span className="text-amber-400">Puntaje Máximo: 100 pts</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2">Atributo Sensorial</th>
                    <th className="px-4 py-2 text-center">Rango Normal</th>
                    <th className="px-4 py-2 text-center">Puntaje Obtenido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Fragancia / Aroma</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.fragancia_aroma?.toFixed(2) || '8.75'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Sabor</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.sabor?.toFixed(2) || '8.75'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Sabor Residual (Aftertaste)</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.sabor_residual?.toFixed(2) || '8.50'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Acidez</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.acidez?.toFixed(2) || '8.75'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Cuerpo</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.cuerpo?.toFixed(2) || '8.50'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Uniformidad</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.uniformidad?.toFixed(2) || '10.00'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Balance</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.balance?.toFixed(2) || '8.75'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Taza Limpia (Clean Cup)</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.taza_limpia?.toFixed(2) || '10.00'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Dulzor</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.dulzor?.toFixed(2) || '10.00'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1.5 font-medium">Puntuación del Catador</td>
                    <td className="px-4 py-1.5 text-center text-stone-400">6.00 - 10.00</td>
                    <td className="px-4 py-1.5 text-center font-bold text-stone-900">
                      {ofertaCatacion.atributos_sca?.puntaje_catador?.toFixed(2) || '8.75'}
                    </td>
                  </tr>
                  <tr className="bg-amber-50 font-bold text-amber-950 text-sm">
                    <td colSpan={2} className="px-4 py-2.5 text-right uppercase">
                      Puntaje Total SCA Final:
                    </td>
                    <td className="px-4 py-2.5 text-center text-base font-extrabold text-amber-900">
                      {ofertaCatacion.puntaje_sca} PTS
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Descriptor y Notas de Cata */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-900 text-xs block mb-1">
                Descriptor Sensorial y Notas de Cata:
              </span>
              <p className="text-xs text-stone-800 italic leading-relaxed">
                &ldquo;{ofertaCatacion.notas_cata}&rdquo;
              </p>
            </div>

            {/* Firmas de Certificación */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-stone-200 text-center text-xs">
              <div>
                <div className="w-44 border-b border-stone-400 mx-auto mb-1"></div>
                <span className="font-bold text-stone-900 block">Q-Grader Certificado #QG-7842</span>
                <span className="text-stone-500 text-[11px]">Laboratorio Central TecniCafé</span>
              </div>
              <div>
                <div className="w-44 border-b border-stone-400 mx-auto mb-1"></div>
                <span className="font-bold text-stone-900 block">Director de Calidad Exportaciones</span>
                <span className="text-stone-500 text-[11px]">ConexCoffee International</span>
              </div>
            </div>

            {/* Botones de acción (ocultos en impresión) */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar como PDF
              </button>

              <button
                type="button"
                onClick={() => setModalHojaCatacion(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: ASIGNAR OFERTA A CONTENEDOR MARÍTIMO                             */}
      {/* ========================================================================= */}
      {modalAsignarContenedor && ofertaSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <Ship className="w-5 h-5 text-sky-700" />
                  Asignar a Contenedor
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Oferta {ofertaSeleccionada.codigo} ({ofertaSeleccionada.cantidad_kg.toLocaleString()} kg)
                </p>
              </div>
              <button
                onClick={() => setModalAsignarContenedor(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarAsignarContenedor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Seleccionar Contenedor de Exportación *
                </label>
                <select
                  required
                  value={contenedorDestino}
                  onChange={(e) => setContenedorDestino(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-700/20 bg-white font-medium text-stone-800"
                >
                  <option value="">-- Seleccionar Contenedor --</option>
                  {contenedores.map((c) => (
                    <option key={c.id} value={`${c.codigo} (${c.pais_destino.split('(')[0].trim()})`}>
                      {c.codigo} — {c.pais_destino} (Capacidad: {c.capacidad_total_kg.toLocaleString()} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-sky-900 text-[11px] leading-relaxed">
                Al asignar la oferta al contenedor, se reserva el espacio volumétrico y los sacos quedan comprometidos para el despacho marítimo de exportación.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalAsignarContenedor(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-800 shadow-sm"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
