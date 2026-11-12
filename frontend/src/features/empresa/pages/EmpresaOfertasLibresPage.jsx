import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Eye,
  Store,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaOfertasLibres,
  useActualizarEmpresaOfertaLibre,
  useCrearEmpresaPreoferta,
} from '../hooks/useEmpresaData';
import DetalleOfertaLibreModal from '../components/DetalleOfertaLibreModal';
import OfertasProductoresExternos from '../components/OfertasProductoresExternos';

export default function EmpresaOfertasLibresPage() {
  const navigate = useNavigate();
  const ofertasQuery = useEmpresaOfertasLibres();
  const ofertas = ofertasQuery.data || [];
  const actualizarOfertaLibre = useActualizarEmpresaOfertaLibre();
  const crearPreoferta = useCrearEmpresaPreoferta();
  const [searchTerm, setSearchTerm] = useState('');
  const [departamentoFiltro, setDepartamentoFiltro] = useState('Todos');

  // Modal de Detalle
  const [modalDetalle, setModalDetalle] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);

  // Departamentos únicos para el filtro
  const departamentos = [
    'Todos',
    ...Array.from(new Set(ofertas.map((o) => o.departamento))),
  ];

  const ofertasFiltradas = ofertas.filter((o) => {
    const term = searchTerm.toLowerCase();
    const coincideTexto =
      o.finca_nombre.toLowerCase().includes(term) ||
      o.variedad.toLowerCase().includes(term) ||
      o.ubicacion.toLowerCase().includes(term) ||
      o.caficultor_nombre.toLowerCase().includes(term);

    const coincideDep =
      departamentoFiltro === 'Todos' || o.departamento === departamentoFiltro;

    return coincideTexto && coincideDep;
  });

  const abrirDetalle = (oferta) => {
    setOfertaSeleccionada(oferta);
    setModalDetalle(true);
  };

  const handleReservarCarga = (oferta) => {
    actualizarOfertaLibre.mutate(
      { ...oferta, estado: 'Reservada', dias_reserva: 3 },
      {
        onSuccess: () => {
          setOfertaSeleccionada((prev) =>
            prev ? { ...prev, estado: 'Reservada', dias_reserva: 3 } : null
          );
          toast.success(
            `¡Lote de ${oferta.finca_nombre} reservado por 3 días! Queda apartado de otras empresas mientras gestionas con el caficultor.`,
            { duration: 4500 }
          );
        },
      }
    );
  };

  const handleAceptarCarga = (oferta) => {
    // 1. Marcar la oferta como aceptada
    actualizarOfertaLibre.mutate({ ...oferta, estado: 'Aceptada' });

    // 2. Insertar en la lista de Pre-Ofertas de la empresa a través del hook
    crearPreoferta.mutate({
      codigo: oferta.codigo,
      cantidad_kg: oferta.cantidad_kg,
      variedad: oferta.variedad,
      especie: oferta.especie || 'Arábica',
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_produccion: '2026-09-10',
      secado: oferta.secado || 'Marquesina solar protegida',
      sombrio: 'Si',
      tipo_sombrio: 'Árboles nativos y frutales',
      descripcion_fermentacion: oferta.proceso,
      descripcion_proceso: `Carga aceptada desde Ofertas Libres para gestión directa con el caficultor.`,
      proceso_postcosecha: oferta.proceso,
      precio_estimado_cop: oferta.precio_estimado_cop || 19500000,
      precio_kg_usd: oferta.precio_kg_usd || 7.50,
      estado: 'Pendiente',
      tecnico_asignado: null,
      caficultor: {
        nombre: oferta.caficultor_nombre,
        telefono: oferta.caficultor_telefono,
        correo: oferta.caficultor_correo || 'contacto@caficultor.co',
        direccion: oferta.ubicacion,
        pais: 'Colombia',
        municipio: `${oferta.municipio}, ${oferta.departamento}`,
      },
      finca: {
        nombre: oferta.finca_nombre,
        vereda: oferta.vereda || 'Vereda Central',
        altura_msnm: oferta.altura_msnm || 1750,
        asociacion: oferta.asociacion || 'Asociación Local',
        area_cafe_ha: 3.5,
        area_otros_cultivos_ha: 1.0,
        area_conservacion_ha: 1.5,
        cedula_numero: '1098234551',
      },
    }, {
      onSuccess: () => {
        setModalDetalle(false);
        toast.success(
          `¡Carga de ${oferta.finca_nombre} aceptada! Se transfirió a Pre-Ofertas. Redirigiendo para asignar asistente técnico...`,
          { duration: 4000 }
        );
        setTimeout(() => {
          navigate('/empresa/pre-ofertas');
        }, 1500);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Cabecera Oficial — Estilo sólido sin gradientes */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-brand-terracota">
              <Store className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracota">
              Marketplace B2B
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Ofertas Libres
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Lotes de café disponibles para negociar, apartar por 3 días o aceptar directamente con el caficultor.
          </p>
        </div>

        {/* Botón directo a Pre-Ofertas */}
        <button
          type="button"
          onClick={() => navigate('/empresa/pre-ofertas')}
          className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Layers className="w-4 h-4 text-brand-terracota" />
          <span>Ver Mis Pre-Ofertas</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>

      <OfertasProductoresExternos />

      {/* Barra de Filtros y Búsqueda en la parte superior */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Buscador */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por finca, variedad o ubicación..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
            />
          </div>

          {/* Filtro por Departamento */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">
              Región:
            </span>
            <select
              value={departamentoFiltro}
              onChange={(e) => setDepartamentoFiltro(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
            >
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador */}
        <div className="text-xs text-stone-500 font-semibold self-end md:self-auto">
          Lotes disponibles:{' '}
          <span className="font-extrabold text-brand-terracota">
            {ofertasFiltradas.filter((o) => o.estado === 'Disponible').length}
          </span>
        </div>
      </div>

      {/* Grid de Tarjetas de Ofertas Libres */}
      <QueryState query={ofertasQuery} />
      {ofertasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 text-xs">
          No se encontraron ofertas libres que coincidan con los criterios de búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertasFiltradas.map((item) => {
            const yaAceptada = item.estado === 'Aceptada';
            const estaReservada = item.estado === 'Reservada';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Imagen de la Finca */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.finca_imagen}
                      alt={item.finca_nombre}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                        {item.codigo}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {yaAceptada ? (
                        <span className="text-[11px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Carga Aceptada
                        </span>
                      ) : estaReservada ? (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1 shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-brand-terracota" />
                          Reservado (3 días)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-stone-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-5 space-y-3">
                    {/* Finca y Ubicación */}
                    <div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {item.finca_nombre}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{item.ubicacion}</span>
                        <span>•</span>
                        <span>{item.altura_msnm} msnm</span>
                      </p>
                    </div>

                    {/* Fila de Métricas: Tipo de café y Cantidad ofertada */}
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Tipo de Café:</span>
                        <strong className="text-stone-900 font-bold">
                          {item.variedad} ({item.especie || 'Arábica'})
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Cantidad:</span>
                        <strong className="text-stone-900 font-mono font-bold">
                          {item.cantidad_kg.toLocaleString('es-CO')} Kg ({item.sacos} Sacos)
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Proceso:</span>
                        <span className="text-stone-700 font-semibold truncate ml-2">
                          {item.proceso}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón Ver Detalle */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => abrirDetalle(item)}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle */}
      <DetalleOfertaLibreModal
        isOpen={modalDetalle}
        onClose={() => setModalDetalle(false)}
        oferta={ofertaSeleccionada}
        onAceptarCarga={handleAceptarCarga}
        onReservar={handleReservarCarga}
      />
    </div>
  );
}
