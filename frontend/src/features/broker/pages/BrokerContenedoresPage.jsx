import { useState, useMemo } from 'react';
import {
  PackageCheck,
  Ship,
  Truck,
  MapPin,
  Calendar,
  Globe,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  QrCode,
  Coffee,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Thermometer,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';

export default function BrokerContenedoresPage() {
  const { contenedores, paisesDestino } = useBroker();
  const [paisFiltro, setPaisFiltro] = useState('Todos los Países');
  const [searchTerm, setSearchTerm] = useState('');
  const [contenedorExpandidoId, setContenedorExpandidoId] = useState(
    contenedores[0]?.id || null
  );
  const [loteDetalleModal, setLoteDetalleModal] = useState(null);

  // Filtrado por país y búsqueda
  const contenedoresFiltrados = useMemo(() => {
    return contenedores.filter((cnt) => {
      const matchPais =
        paisFiltro === 'Todos los Países' || cnt.pais_destino === paisFiltro;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        cnt.codigo?.toLowerCase().includes(term) ||
        cnt.pais_destino?.toLowerCase().includes(term) ||
        cnt.ciudad_destino?.toLowerCase().includes(term) ||
        cnt.naviera?.toLowerCase().includes(term) ||
        cnt.buque?.toLowerCase().includes(term) ||
        cnt.lotes_dentro?.some(
          (l) =>
            l.variedad?.toLowerCase().includes(term) ||
            l.finca?.toLowerCase().includes(term) ||
            l.caficultor?.toLowerCase().includes(term) ||
            l.comprador?.toLowerCase().includes(term)
        );
      return matchPais && matchSearch;
    });
  }, [contenedores, paisFiltro, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial */}
      <ModuloCabecera
        titulo="Contenedores & Tracker Internacional"
        subtitulo="Monitorea en tiempo real los contenedores marítimos asignados a tu país y los lotes de café consolidados dentro"
        imagenPortada="/images/portadas/contenedor.jpg"
        mensaje="Seguimiento de atmósfera controlada (humedad y temperatura IoT), aduana y trazabilidad de los lotes por comprador."
        icono={PackageCheck}
        totalRegistros={contenedoresFiltrados.length}
        etiqueta="Logística de Exportación Broker"
      />

      {/* Barra de Filtros por País y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por código, buque, naviera o lote…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          {/* Selector de País del Broker */}
          <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl">
            <Globe className="h-4 w-4 text-brand-terracota shrink-0" />
            <span className="text-xs font-semibold text-surface-500 whitespace-nowrap">País Destino:</span>
            <select
              value={paisFiltro}
              onChange={(e) => setPaisFiltro(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-surface-800 outline-none cursor-pointer"
            >
              {paisesDestino.map((pais) => (
                <option key={pais} value={pais}>
                  {pais}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de ocupación general */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-surface-600 bg-surface-50 px-3 py-2 rounded-xl border border-surface-200">
          <Ship className="h-4 w-4 text-brand-terracota" />
          <span>FOB Buenaventura / Cartagena</span>
        </div>
      </div>

      {/* Lista de Contenedores con Tracker y Lotes */}
      {contenedoresFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center shadow-2xs">
          <Ship className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-surface-800">No se encontraron contenedores para {paisFiltro}</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            Prueba seleccionando otro país de destino o ajustando los términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {contenedoresFiltrados.map((cnt) => {
            const expandido = contenedorExpandidoId === cnt.id;
            return (
              <div
                key={cnt.id}
                className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden transition-all duration-200 hover:border-brand-orange/40"
              >
                {/* Cabecera del Contenedor */}
                <div
                  onClick={() => setContenedorExpandidoId(expandido ? null : cnt.id)}
                  className="p-5 sm:p-6 bg-surface-50/70 border-b border-surface-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-terracota/10 flex items-center justify-center text-brand-terracota shrink-0 mt-0.5">
                      <Ship className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-extrabold text-surface-900 bg-white px-2.5 py-0.5 rounded-lg border border-surface-200 shadow-2xs">
                          {cnt.codigo}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-terracota text-white shadow-xs">
                          <Globe className="h-3 w-3" />
                          {cnt.pais_destino} ({cnt.ciudad_destino})
                        </span>
                        <span className="text-xs font-semibold text-surface-600 bg-white px-2 py-0.5 rounded-md border border-surface-200">
                          Naviera: {cnt.naviera}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-surface-500">
                        <span>
                          <strong>Buque:</strong> {cnt.buque}
                        </span>
                        <span>
                          <strong>Booking:</strong> {cnt.booking_numero}
                        </span>
                        <span>
                          <strong>Zarpe Est.:</strong> {cnt.fecha_estimada_zarpe}
                        </span>
                        <span>
                          <strong>Arribo Est.:</strong> {cnt.fecha_estimada_arribo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado IoT & Indicador de Capacidad */}
                  <div className="flex items-center gap-4 self-end lg:self-center">
                    {/* Sensores IoT */}
                    <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white border border-surface-200 text-xs">
                      <div className="flex items-center gap-1 text-amber-700 font-bold" title="Temperatura interna controlada">
                        <Thermometer className="h-3.5 w-3.5" />
                        <span>{cnt.temperatura}</span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-700 font-bold" title="Humedad relativa del contenedor">
                        <Droplets className="h-3.5 w-3.5" />
                        <span>{cnt.humedad}</span>
                      </div>
                    </div>

                    {/* Capacidad ocupada */}
                    <div className="text-right">
                      <p className="text-xs text-surface-500 font-medium">Ocupación</p>
                      <p className="text-sm font-black text-surface-900">
                        {cnt.porcentaje_llenado}%{' '}
                        <span className="text-xs font-normal text-surface-500">
                          ({cnt.kilos_ocupados?.toLocaleString()} kg / {cnt.sacos_totales} sacos)
                        </span>
                      </p>
                    </div>

                    {/* Botón Acordeón */}
                    <button
                      type="button"
                      className="p-2 rounded-xl bg-white border border-surface-200 text-surface-600 hover:text-surface-900 shadow-2xs"
                    >
                      {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Contenido Expandible: Tracker Visual + Lotes dentro */}
                {expandido && (
                  <div className="p-5 sm:p-6 space-y-8">
                    {/* 1. Tracker Logístico Interactivo */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-brand-terracota" />
                          <span>Línea de Tiempo del Tracker Marítimo</span>
                        </h4>
                        <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full border border-brand-green/20">
                          Etapa: {cnt.etapas_tracker[cnt.etapa_actual_indice]?.nombre}
                        </span>
                      </div>

                      {/* Timeline horizontal para pantallas grandes, vertical para móviles */}
                      <div className="relative">
                        {/* Línea conectora */}
                        <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-surface-200 -z-0" />

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
                          {cnt.etapas_tracker.map((etapa, idx) => {
                            const completado = idx < cnt.etapa_actual_indice;
                            const enCurso = idx === cnt.etapa_actual_indice;
                            return (
                              <div
                                key={etapa.nombre}
                                className={`p-3 rounded-xl border text-xs transition-all ${
                                  completado
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : enCurso
                                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20 text-amber-950 shadow-xs'
                                    : 'bg-surface-50 border-surface-200 text-surface-500 opacity-75'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                      completado
                                        ? 'bg-emerald-600 text-white'
                                        : enCurso
                                        ? 'bg-amber-500 text-white animate-pulse'
                                        : 'bg-surface-200 text-surface-500'
                                    }`}
                                  >
                                    {completado ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                                  </div>
                                  <span className="font-bold text-[11px] leading-tight truncate">
                                    {etapa.nombre}
                                  </span>
                                </div>
                                <p className="text-[10px] text-surface-500 font-medium mb-1 truncate">
                                  {etapa.ubicacion}
                                </p>
                                <p className="text-[11px] font-semibold">{etapa.fecha}</p>
                                <p className="text-[10px] text-surface-600 mt-1 line-clamp-2">
                                  {etapa.detalle}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 2. Lotes de Café dentro de este contenedor */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Coffee className="h-4 w-4 text-brand-orange" />
                          <span>Lotes de Café Consolidados en este Contenedor ({cnt.lotes_dentro?.length || 0})</span>
                        </h4>
                        <span className="text-xs text-surface-500">
                          Haz clic en cualquier lote para ver trazabilidad sensorial y documental
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-surface-200">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-surface-100 text-[11px] font-bold text-surface-600 uppercase tracking-wider border-b border-surface-200">
                            <tr>
                              <th className="py-2.5 px-3">Código & Variedad</th>
                              <th className="py-2.5 px-3">Finca & Caficultor</th>
                              <th className="py-2.5 px-3">Proceso & Calidad</th>
                              <th className="py-2.5 px-3">Sacos / Peso</th>
                              <th className="py-2.5 px-3">Precio USD/kg</th>
                              <th className="py-2.5 px-3">Comprador Asignado</th>
                              <th className="py-2.5 px-3 text-right">Ficha</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-100 bg-white">
                            {cnt.lotes_dentro?.map((lote) => (
                              <tr
                                key={lote.id}
                                className="hover:bg-surface-50 transition-colors cursor-pointer"
                                onClick={() => setLoteDetalleModal({ ...lote, contenedor_codigo: cnt.codigo })}
                              >
                                <td className="py-2.5 px-3">
                                  <p className="font-mono font-bold text-surface-900">{lote.codigo_lote}</p>
                                  <p className="text-xs text-brand-terracota font-semibold">{lote.variedad}</p>
                                </td>
                                <td className="py-2.5 px-3">
                                  <p className="font-semibold text-surface-900">{lote.finca}</p>
                                  <p className="text-xs text-surface-500">
                                    {lote.caficultor} ({lote.municipio}, {lote.departamento})
                                  </p>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-block text-xs font-bold text-surface-700 bg-surface-100 px-2 py-0.5 rounded-md mb-0.5">
                                    {lote.proceso}
                                  </span>
                                  <p className="text-xs font-black text-amber-600">
                                    {lote.puntaje_sca} SCA
                                  </p>
                                </td>
                                <td className="py-2.5 px-3">
                                  <p className="font-bold text-surface-900">{lote.sacos} sacos</p>
                                  <p className="text-xs text-surface-500">{lote.peso_kg?.toLocaleString()} kg</p>
                                </td>
                                <td className="py-2.5 px-3">
                                  <p className="font-bold text-surface-900">${lote.precio_usd_kg} USD</p>
                                  <p className="text-xs text-surface-500 font-medium">${lote.total_usd?.toLocaleString()} total</p>
                                </td>
                                <td className="py-2.5 px-3">
                                  <p className="font-bold text-surface-900">{lote.comprador}</p>
                                  <p className="text-xs text-surface-500">{lote.comprador_ciudad}</p>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLoteDetalleModal({ ...lote, contenedor_codigo: cnt.codigo });
                                    }}
                                    className="p-1.5 rounded-lg bg-surface-100 hover:bg-brand-tint text-surface-600 hover:text-brand-terracota transition-all cursor-pointer shadow-2xs"
                                    title="Ver ficha técnica completa"
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Ficha Técnica y Trazabilidad del Lote */}
      <ModalBase
        isOpen={Boolean(loteDetalleModal)}
        onClose={() => setLoteDetalleModal(null)}
        title={`Trazabilidad del Lote: ${loteDetalleModal?.codigo_lote}`}
        size="lg"
      >
        {loteDetalleModal && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Header del Lote */}
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracota">
                  {loteDetalleModal.variedad} — {loteDetalleModal.puntaje_sca} SCA
                </span>
                <h3 className="text-base font-extrabold text-surface-900 mt-0.5">
                  {loteDetalleModal.finca}
                </h3>
                <p className="text-surface-600 text-xs">
                  Productor: <strong>{loteDetalleModal.caficultor}</strong> | Altitud: {loteDetalleModal.altitud}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
                  En Contenedor: {loteDetalleModal.contenedor_codigo}
                </span>
                <p className="text-xs text-surface-500 mt-1">
                  Código QR: <strong>{loteDetalleModal.qr_trazabilidad}</strong>
                </p>
              </div>
            </div>

            {/* Perfil Sensorial */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-brand-orange/30">
              <h5 className="font-bold text-surface-900 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Coffee className="h-3.5 w-3.5 text-brand-orange" />
                <span>Perfil Sensorial & Notas de Cata</span>
              </h5>
              <p className="text-surface-700 italic text-xs sm:text-sm leading-relaxed">
                "{loteDetalleModal.notas_cata}"
              </p>
            </div>

            {/* Datos Comerciales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Volumen</p>
                <p className="font-bold text-surface-900 text-sm mt-0.5">{loteDetalleModal.sacos} Sacos ({loteDetalleModal.peso_kg?.toLocaleString()} kg)</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Precio FOB</p>
                <p className="font-bold text-surface-900 text-sm mt-0.5">${loteDetalleModal.precio_usd_kg} USD/kg</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Valor Total</p>
                <p className="font-bold text-brand-terracota text-sm mt-0.5">${loteDetalleModal.total_usd?.toLocaleString()} USD</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] text-surface-500 font-medium">Comprador</p>
                <p className="font-bold text-surface-900 text-xs mt-0.5 truncate">{loteDetalleModal.comprador}</p>
              </div>
            </div>

            {/* Certificaciones y Trazabilidad */}
            <div className="p-4 rounded-xl border border-surface-200 text-xs text-surface-600 space-y-1.5">
              <p>
                <strong>Proceso de Beneficio:</strong> {loteDetalleModal.proceso}
              </p>
              <p>
                <strong>Origen Geográfico:</strong> {loteDetalleModal.municipio}, {loteDetalleModal.departamento}, Colombia.
              </p>
              <p>
                <strong>Certificación de Calidad:</strong> Laboratorio Central TecniCafé con protocolos SCA.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLoteDetalleModal(null)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        )}
      </ModalBase>
    </div>
  );
}

