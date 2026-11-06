import { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  FileText,
  Coffee,
  CheckCircle2,
  DollarSign,
  Download,
  Globe,
  MapPin,
  QrCode,
  Ship,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';

export default function BrokerTrazabilidadPage() {
  const { ventas } = useBroker();
  const [searchTerm, setSearchTerm] = useState('');
  const [ventaExpandidaId, setVentaExpandidaId] = useState(ventas[0]?.id || null);
  const [documentoModal, setDocumentoModal] = useState(null);

  // Filtrado
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const term = searchTerm.toLowerCase().trim();
      return (
        !term ||
        v.codigo_venta?.toLowerCase().includes(term) ||
        v.lote_codigo?.toLowerCase().includes(term) ||
        v.variedad?.toLowerCase().includes(term) ||
        v.comprador_empresa?.toLowerCase().includes(term) ||
        v.comprador_nombre?.toLowerCase().includes(term) ||
        v.pais_destino?.toLowerCase().includes(term) ||
        v.finca?.toLowerCase().includes(term) ||
        v.caficultor?.toLowerCase().includes(term)
      );
    });
  }, [ventas, searchTerm]);

  // Métricas
  const totalKgVendidos = ventas.reduce((acc, v) => acc + (v.kilos_vendidos || 0), 0);
  const totalUsdVendidos = ventas.reduce((acc, v) => acc + (v.total_venta_usd || 0), 0);
  const totalComisiones = ventas.reduce((acc, v) => acc + (v.comision_broker_usd || 0), 0);

  const handleDescargarDocumento = (doc, venta) => {
    toast.success(`Descargando ${doc.nombre} (${venta.codigo_venta})...`);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial */}
      <ModuloCabecera
        titulo="Trazabilidad de Lotes de Café Vendidos"
        subtitulo="Historial completo de lotes comercializados, quién compró, finca de origen, certificados SCA y documentos de exportación"
        imagenPortada="/images/portadas/lote.jpg"
        mensaje="Transparencia total de la cadena de valor: verifica origen geográfico, contratos FOB y comisiones del broker."
        icono={Award}
        totalRegistros={ventasFiltradas.length}
        etiqueta="Historial & Trazabilidad Broker"
      />

      {/* Tarjetas de Métricas de Ventas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Volumen Vendido</p>
            <p className="text-2xl font-black text-surface-900 mt-1">
              {totalKgVendidos?.toLocaleString()} <span className="text-sm font-semibold text-surface-500">kg</span>
            </p>
            <p className="text-xs text-brand-terracota font-medium mt-0.5">
              {Math.round(totalKgVendidos / 70)} sacos exportados
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-terracota/10 flex items-center justify-center text-brand-terracota">
            <Coffee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Valor Transado</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              ${totalUsdVendidos?.toLocaleString()} USD
            </p>
            <p className="text-xs text-surface-400 font-medium mt-0.5">Contratos internacionales cerrados</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Comisiones Broker</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              ${totalComisiones?.toLocaleString()} USD
            </p>
            <p className="text-xs text-surface-400 font-medium mt-0.5">5% de comisión comercial pactada</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por lote, comprador, país, caficultor o finca…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>
      </div>

      {/* Lista de Ventas y Trazabilidad */}
      <div className="space-y-4">
        {ventasFiltradas.map((venta) => {
          const expandida = ventaExpandidaId === venta.id;
          return (
            <div
              key={venta.id}
              className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-2xs transition-all duration-200"
            >
              {/* Resumen de la Venta */}
              <div
                onClick={() => setVentaExpandidaId(expandida ? null : venta.id)}
                className="p-5 sm:p-6 bg-surface-50/70 border-b border-surface-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-surface-600 bg-white px-2 py-0.5 rounded-md border border-surface-200">
                        {venta.codigo_venta}
                      </span>
                      <span className="font-mono text-xs font-black text-brand-terracota bg-brand-tint px-2.5 py-0.5 rounded-full border border-brand-terracota/20">
                        {venta.lote_codigo}
                      </span>
                      <h4 className="font-extrabold text-base text-surface-900">
                        {venta.variedad} ({venta.puntaje_sca} SCA)
                      </h4>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-surface-700 bg-surface-100 px-2.5 py-0.5 rounded-full">
                        <Globe className="h-3 w-3" />
                        {venta.pais_destino}
                      </span>
                    </div>

                    <p className="text-xs text-surface-600">
                      Comprador: <strong>{venta.comprador_empresa}</strong> ({venta.comprador_nombre}) | Origen: {venta.finca} ({venta.caficultor})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end lg:self-center">
                  <div className="text-right">
                    <p className="text-xs text-surface-500 font-medium">Total Contrato FOB</p>
                    <p className="text-base font-black text-surface-900">
                      ${venta.total_venta_usd?.toLocaleString()} USD
                    </p>
                    <p className="text-[11px] font-bold text-amber-600">
                      Comisión: +${venta.comision_broker_usd?.toLocaleString()} USD
                    </p>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-white border border-surface-200 text-surface-600 hover:text-surface-900 shadow-2xs"
                  >
                    {expandida ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Trazabilidad Detallada Expandible */}
              {expandida && (
                <div className="p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
                  {/* Grid de 3 Pilares de Trazabilidad */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Origen y Finca */}
                    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                      <p className="font-bold text-surface-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-brand-terracota">
                        <MapPin className="h-4 w-4" />
                        <span>Origen en Finca</span>
                      </p>
                      <p><strong>Finca:</strong> {venta.finca}</p>
                      <p><strong>Caficultor:</strong> {venta.caficultor}</p>
                      <p><strong>Beneficio:</strong> {venta.proceso}</p>
                      <p><strong>Fecha de Venta:</strong> {venta.fecha_cierre}</p>
                    </div>

                    {/* 2. Logística y Embarque */}
                    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                      <p className="font-bold text-surface-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-brand-green">
                        <Ship className="h-4 w-4" />
                        <span>Logística & Despacho</span>
                      </p>
                      <p><strong>Contenedor Asignado:</strong> {venta.contenedor_asignado}</p>
                      <p><strong>Volumen:</strong> {venta.sacos_vendidos} Sacos ({venta.kilos_vendidos?.toLocaleString()} kg)</p>
                      <p><strong>Precio Pactado:</strong> ${venta.precio_usd_kg} USD/kg</p>
                      <p><strong>Estado de Pago:</strong> {venta.estado_pago}</p>
                    </div>

                    {/* 3. Documentos Oficiales */}
                    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                      <p className="font-bold text-surface-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-brand-orange">
                        <FileText className="h-4 w-4" />
                        <span>Documentos & Certificados</span>
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {venta.documentos?.map((doc) => (
                          <div
                            key={doc.nombre}
                            className="flex items-center justify-between p-2 rounded-lg bg-white border border-surface-200 text-xs"
                          >
                            <span className="font-medium text-surface-800 truncate mr-2">{doc.nombre}</span>
                            <button
                              type="button"
                              onClick={() => handleDescargarDocumento(doc, venta)}
                              className="p-1 rounded text-brand-terracota hover:bg-brand-tint cursor-pointer shrink-0"
                              title="Descargar documento"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

