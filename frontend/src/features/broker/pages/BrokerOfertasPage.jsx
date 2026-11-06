import { useState, useMemo } from 'react';
import {
  Tag,
  Search,
  Filter,
  Coffee,
  CheckCircle2,
  Copy,
  Send,
  Eye,
  Award,
  DollarSign,
  MapPin,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';

export default function BrokerOfertasPage() {
  const { ofertasLibres, compradores, crearSolicitudMuestra } = useBroker();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroVariedad, setFiltroVariedad] = useState('todas');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [modalMuestraAbierto, setModalMuestraAbierto] = useState(false);
  const [ofertaParaMuestra, setOfertaParaMuestra] = useState(null);

  // Formulario Solicitud de Muestra
  const [muestraForm, setMuestraForm] = useState({
    compradorId: compradores[0]?.id || '',
    gramos: 300,
    tipoMuestra: 'Café Verde (Para Muestra de Tostión)',
    notas: '',
  });

  // Variedades únicas para filtro
  const variedadesUnicas = useMemo(() => {
    return Array.from(new Set(ofertasLibres.map((o) => o.variedad).filter(Boolean)));
  }, [ofertasLibres]);

  // Filtrado
  const ofertasFiltradas = useMemo(() => {
    return ofertasLibres.filter((o) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        o.titulo?.toLowerCase().includes(term) ||
        o.variedad?.toLowerCase().includes(term) ||
        o.departamento?.toLowerCase().includes(term) ||
        o.caficultor?.toLowerCase().includes(term) ||
        o.finca?.toLowerCase().includes(term) ||
        o.notas_cata?.toLowerCase().includes(term);

      const matchVar =
        filtroVariedad === 'todas' ||
        o.variedad?.toLowerCase() === filtroVariedad.toLowerCase();

      return matchSearch && matchVar;
    });
  }, [ofertasLibres, searchTerm, filtroVariedad]);

  // Copiar ficha comercial al portapapeles
  const copiarFichaComercial = (oferta) => {
    const texto = `🌟 CONEXCOFFEE — OFERTA DE ESPECIALIDAD DISPONIBLE
Código: ${oferta.codigo}
Título: ${oferta.titulo}
Variedad: ${oferta.variedad} (${oferta.proceso})
Calificación SCA: ${oferta.puntaje_sca} Puntos
Origen: ${oferta.finca} (${oferta.municipio}, ${oferta.departamento}) - ${oferta.altitud}
Disponibilidad: ${oferta.sacos_disponibles} sacos (${oferta.kilos_disponibles} kg)
Precio FOB: $${oferta.precio_usd_kg} USD/kg ($${oferta.precio_usd_lb} USD/lb)
Notas de Cata: "${oferta.notas_cata}"
Certificaciones: ${oferta.certificaciones?.join(', ')}

Para solicitud de muestras o reserva de contenedor, contáctame como broker oficial.`;

    navigator.clipboard.writeText(texto);
    toast.success('Ficha comercial copiada al portapapeles');
  };

  const abrirModalSolicitarMuestra = (oferta) => {
    setOfertaParaMuestra(oferta);
    setMuestraForm({
      compradorId: compradores[0]?.id || '',
      gramos: 300,
      tipoMuestra: 'Café Verde (Para Muestra de Tostión)',
      notas: `Muestra solicitada para evaluar compra de lote ${oferta.codigo}.`,
    });
    setModalMuestraAbierto(true);
  };

  const handleEnviarSolicitudMuestra = (e) => {
    e.preventDefault();
    const comp = compradores.find((c) => c.id === muestraForm.compradorId) || compradores[0];

    crearSolicitudMuestra({
      comprador_nombre: comp.nombre,
      comprador_empresa: comp.empresa,
      pais: comp.pais,
      ciudad: comp.ciudad,
      correo: comp.correo,
      telefono: comp.telefono_formato || comp.telefono,
      lote_solicitado: `${ofertaParaMuestra.codigo} (${ofertaParaMuestra.variedad} — ${ofertaParaMuestra.finca})`,
      variedad: `${ofertaParaMuestra.variedad} (${ofertaParaMuestra.puntaje_sca} SCA)`,
      gramos: Number(muestraForm.gramos) || 300,
      tipo_muestra: muestraForm.tipoMuestra,
      courier: 'DHL Express Internacional',
      guia_tracking: `DHL-${Date.now().toString().slice(-9)}`,
      notas_catacion_comprador: muestraForm.notas,
      fecha_entrega: 'En preparación en laboratorio',
    });

    setModalMuestraAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial */}
      <ModuloCabecera
        titulo="Ofertas Libres de la Empresa"
        subtitulo="Catálogo de lotes de café de especialidad disponibles para promoción, cotización y venta internacional"
        imagenPortada="/images/portadas/oferta.jpg"
        mensaje="Como broker puedes compartir la ficha comercial con tus compradores o solicitarles muestras físicas antes de cerrar contrato."
        icono={Tag}
        totalRegistros={ofertasFiltradas.length}
        etiqueta="Portafolio Comercial Broker"
      />

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por variedad, origen, caficultor o notas…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-surface-400" />
            <select
              value={filtroVariedad}
              onChange={(e) => setFiltroVariedad(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium text-surface-700 outline-none cursor-pointer"
            >
              <option value="todas">Todas las variedades</option>
              {variedadesUnicas.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-surface-500 self-end sm:self-center">
          Mostrando <strong>{ofertasFiltradas.length}</strong> ofertas disponibles
        </div>
      </div>

      {/* Grid de Ofertas */}
      {ofertasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center shadow-2xs">
          <Tag className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-surface-800">No hay ofertas que coincidan con tu búsqueda</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            Intenta borrar los filtros para explorar el catálogo completo de cafés disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {ofertasFiltradas.map((oferta) => (
            <div
              key={oferta.id}
              className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-brand-orange/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Portada y Badges */}
                <div className="relative h-44 w-full bg-surface-100 overflow-hidden">
                  <img
                    src={oferta.foto_portada}
                    alt={oferta.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/portadas/finca.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-white bg-brand-terracota px-2.5 py-1 rounded-full shadow-sm">
                      {oferta.variedad}
                    </span>
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-white bg-amber-600 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{oferta.puntaje_sca} SCA</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-surface-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-white font-mono text-xs font-bold">
                    ${oferta.precio_usd_kg} USD/kg (${oferta.precio_usd_lb} USD/lb)
                  </div>
                </div>

                {/* Contenido Oferta */}
                <div className="p-5">
                  <span className="text-[11px] font-mono font-bold text-surface-400 uppercase tracking-wider">
                    {oferta.codigo}
                  </span>
                  <h3 className="font-extrabold text-surface-900 text-base leading-snug mt-0.5 mb-2 hover:text-brand-terracota transition-colors">
                    {oferta.titulo}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-surface-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-terracota" />
                      {oferta.municipio}, {oferta.departamento} ({oferta.altitud})
                    </span>
                    <span>•</span>
                    <span>Proceso: <strong>{oferta.proceso}</strong></span>
                  </div>

                  {/* Notas Sensoriales */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-brand-orange/20 mb-4">
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <Coffee className="h-3 w-3" />
                      <span>Notas de Taza</span>
                    </p>
                    <p className="text-xs text-surface-700 italic line-clamp-2">
                      "{oferta.notas_cata}"
                    </p>
                  </div>

                  {/* Disponibilidad */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-50 p-2.5 rounded-xl border border-surface-200">
                    <div>
                      <p className="text-[10px] text-surface-500 font-semibold uppercase">Disponibilidad</p>
                      <p className="font-extrabold text-surface-900 mt-0.5">
                        {oferta.sacos_disponibles} Sacos ({oferta.kilos_disponibles?.toLocaleString()} kg)
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-500 font-semibold uppercase">Calidad & Malla</p>
                      <p className="font-bold text-surface-800 mt-0.5">{oferta.tamano_malla}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botonera de Acciones Comerciales */}
              <div className="p-4 bg-surface-50/80 border-t border-surface-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => copiarFichaComercial(oferta)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-surface-200 text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-all cursor-pointer shadow-2xs"
                  title="Copiar especificaciones para enviar a comprador"
                >
                  <Copy className="h-3.5 w-3.5 text-brand-terracota" />
                  <span>Copiar Ficha</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOfertaSeleccionada(oferta)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-surface-700 hover:text-surface-900 hover:bg-surface-100 transition-all cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Detalles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirModalSolicitarMuestra(oferta)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-terracota hover:bg-brand-orange text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Pedir Muestra</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ficha Completa Oferta */}
      <ModalBase
        isOpen={Boolean(ofertaSeleccionada)}
        onClose={() => setOfertaSeleccionada(null)}
        title={ofertaSeleccionada ? `${ofertaSeleccionada.titulo}` : ''}
        size="lg"
      >
        {ofertaSeleccionada && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
              <span className="font-mono text-xs font-bold text-brand-terracota">
                {ofertaSeleccionada.codigo}
              </span>
              <h3 className="text-base font-extrabold text-surface-900 mt-1">
                {ofertaSeleccionada.variedad} — {ofertaSeleccionada.puntaje_sca} SCA
              </h3>
              <p className="text-surface-600 text-xs mt-0.5">
                Finca: <strong>{ofertaSeleccionada.finca}</strong> | Caficultor: {ofertaSeleccionada.caficultor}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-brand-orange/30">
              <p className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Coffee className="h-4 w-4 text-brand-orange" />
                <span>Perfil de Cata Oficial</span>
              </p>
              <p className="text-surface-800 text-xs sm:text-sm leading-relaxed">
                "{ofertaSeleccionada.notas_cata}"
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Precio FOB (kg)</p>
                <p className="font-bold text-surface-900 text-sm mt-0.5">${ofertaSeleccionada.precio_usd_kg} USD</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Precio FOB (lb)</p>
                <p className="font-bold text-surface-900 text-sm mt-0.5">${ofertaSeleccionada.precio_usd_lb} USD</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Disponibilidad</p>
                <p className="font-bold text-brand-terracota text-sm mt-0.5">{ofertaSeleccionada.sacos_disponibles} Sacos</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Humedad</p>
                <p className="font-bold text-surface-900 text-sm mt-0.5">{ofertaSeleccionada.humedad}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-surface-200 text-xs text-surface-600 space-y-1.5">
              <p>
                <strong>Certificaciones:</strong> {ofertaSeleccionada.certificaciones?.join(', ')}
              </p>
              <p>
                <strong>Altitud del Cultivo:</strong> {ofertaSeleccionada.altitud}
              </p>
              <p>
                <strong>Proceso de Beneficio:</strong> {ofertaSeleccionada.proceso}
              </p>
              <p>
                <strong>Garantía:</strong> Trazabilidad satelital en origen ConexCoffee.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOfertaSeleccionada(null)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const ofr = ofertaSeleccionada;
                  setOfertaSeleccionada(null);
                  abrirModalSolicitarMuestra(ofr);
                }}
                className="px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Solicitar Muestra
              </button>
            </div>
          </div>
        )}
      </ModalBase>

      {/* Modal Solicitar Muestra para Comprador */}
      <ModalBase
        isOpen={modalMuestraAbierto}
        onClose={() => setModalMuestraAbierto(false)}
        title="Solicitar Muestra de Café para Comprador"
        size="md"
      >
        {ofertaParaMuestra && (
          <form onSubmit={handleEnviarSolicitudMuestra} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-brand-orange/20 text-xs">
              <p className="font-bold text-surface-900">
                {ofertaParaMuestra.codigo} — {ofertaParaMuestra.variedad} ({ofertaParaMuestra.puntaje_sca} SCA)
              </p>
              <p className="text-surface-600 mt-0.5">
                {ofertaParaMuestra.finca} ({ofertaParaMuestra.departamento})
              </p>
            </div>

            {/* Seleccionar Comprador */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Comprador / Empresa Destinataria *
              </label>
              <select
                required
                value={muestraForm.compradorId}
                onChange={(e) => setMuestraForm({ ...muestraForm, compradorId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
              >
                {compradores.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.nombre} ({comp.empresa} — {comp.pais})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Muestra y Gramos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                  Cantidad (Gramos) *
                </label>
                <select
                  value={muestraForm.gramos}
                  onChange={(e) => setMuestraForm({ ...muestraForm, gramos: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
                >
                  <option value={250}>250 gramos</option>
                  <option value={300}>300 gramos (Estándar SCA)</option>
                  <option value={500}>500 gramos</option>
                  <option value={1000}>1,000 gramos (1 kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                  Presentación *
                </label>
                <select
                  value={muestraForm.tipoMuestra}
                  onChange={(e) => setMuestraForm({ ...muestraForm, tipoMuestra: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
                >
                  <option value="Café Verde (Para Muestra de Tostión)">Café Verde (Green Coffee)</option>
                  <option value="Café Tostado Perfil SCA">Café Tostado Perfil SCA</option>
                  <option value="Kit Combinado Verde + Tostado">Kit Combinado Verde + Tostado</option>
                </select>
              </div>
            </div>

            {/* Notas / Instrucciones de Envío */}
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Instrucciones de Despacho & Courier
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Requiere empaque sellado al vacío GrainPro para tostaduría en San Francisco..."
                value={muestraForm.notas}
                onChange={(e) => setMuestraForm({ ...muestraForm, notas: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setModalMuestraAbierto(false)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Registrar Solicitud DHL
              </button>
            </div>
          </form>
        )}
      </ModalBase>
    </div>
  );
}

