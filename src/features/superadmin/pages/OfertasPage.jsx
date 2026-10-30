import { useState, useRef } from 'react';
import {
  Gift,
  Search,
  Eye,
  FileDown,
  X,
  Layers,
  Award,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import { useSuperadminOfertas, useSuperadminPreofertas } from '../hooks/useSuperadminData';

export default function OfertasPage() {
  const [pestanaActiva, setPestanaActiva] = useState('ofertas');

  const ofertasQuery = useSuperadminOfertas();
  const ofertas = ofertasQuery.data ?? [];

  const preofertasQuery = useSuperadminPreofertas();
  const preofertas = preofertasQuery.data ?? [];

  const [searchTerm, setSearchTerm] = useState('');
  const tableOfertasRef = useRef(null);
  const tablePreofertasRef = useRef(null);

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [ofertaActual, setOfertaActual] = useState(null);

  const abrirDetalles = (o) => {
    setOfertaActual(o);
    setModalDetalleAbierto(true);
  };

  const descargarFichaPdf = (o) => {
    alert(`Generando y descargando Ficha Técnica PDF para la oferta ${o.codigo} (Certificado SCA)...`);
  };

  const getStr = (val) => (typeof val === 'string' ? val : val?.nombre || '');

  const ofertasFiltradas = ofertas.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      String(o.codigo || '').toLowerCase().includes(term) ||
      String(o.variedadCafe || o.variedad || '').toLowerCase().includes(term) ||
      getStr(o.caficultor).toLowerCase().includes(term) ||
      String(o.estado || '').toLowerCase().includes(term)
    );
  });

  const preofertasFiltradas = preofertas.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      String(p.codigo || '').toLowerCase().includes(term) ||
      getStr(p.caficultor).toLowerCase().includes(term) ||
      String(p.variedad || '').toLowerCase().includes(term)
    );
  });

  useTableEntranceAnimation(tableOfertasRef, [ofertasFiltradas.length, pestanaActiva]);
  useTableEntranceAnimation(tablePreofertasRef, [preofertasFiltradas.length, pestanaActiva]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo con portada oferta.jpg */}
      <ModuloCabecera
        titulo="Ofertas y Pre-ofertas"
        subtitulo="Lotes calificados listos para subasta internacional y órdenes de compra directa"
        imagenPortada="/images/portadas/oferta.jpg"
        mensaje="En este modulo podras ver la información detallada de cada una de tus ofertas."
        icono={Gift}
        totalRegistros={pestanaActiva === 'ofertas' ? ofertasFiltradas.length : preofertasFiltradas.length}
      />

      <QueryState query={ofertasQuery} />

      {/* Pestañas Submódulos */}
      <div className="flex items-center justify-between border-b border-surface-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPestanaActiva('ofertas')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              pestanaActiva === 'ofertas'
                ? 'border-brand-terracota text-brand-terracota'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            <Gift className="h-4 w-4" />
            Ofertas en Firme ({ofertas.length})
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('preofertas')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              pestanaActiva === 'preofertas'
                ? 'border-brand-terracota text-brand-terracota'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            Pre-Ofertas en Evaluación ({preofertas.length})
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por código, variedad o estado…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>
      </div>

      {/* TABLA OFICIAL OFERTAS: Nº, CODIGO, CANTIDAD, VARIEDAD DE CAFE, ESTADO, ACCIONES */}
      {pestanaActiva === 'ofertas' && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tableOfertasRef} className="w-full text-sm text-left">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Código</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Cantidad (kg)</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Variedad de Café</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Puntaje SCA</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Estado</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {ofertasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-surface-500">
                      No se encontraron ofertas registradas.
                    </td>
                  </tr>
                ) : (
                  ofertasFiltradas.map((o, index) => (
                    <tr key={o.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold text-surface-900">
                        {o.codigo}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-surface-800">
                        {o.cantidad.toLocaleString('es-CO')} kg
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-surface-800 block">{o.variedadCafe}</span>
                        <span className="text-[11px] text-surface-500">{o.proceso}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-brand-tint text-brand-terracota border border-brand-terracota/30">
                          <Award className="h-3 w-3" />
                          {o.puntajeSca} pts
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            o.estado === 'Publicada'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.estado === 'Negociación'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {o.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            icon={Eye}
                            title="Ver Detalles"
                            variant="view"
                            onClick={() => abrirDetalles(o)}
                          />
                          <ActionButton
                            icon={FileDown}
                            title="Descargar Ficha Técnica PDF"
                            variant="primary"
                            onClick={() => descargarFichaPdf(o)}
                          />
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

      {/* TABLA PRE-OFERTAS */}
      {pestanaActiva === 'preofertas' && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tablePreofertasRef} className="w-full text-sm text-left">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Código Pre-oferta</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Caficultor</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Finca</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Variedad</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Estimado (kg)</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {preofertasFiltradas.map((p, index) => (
                  <tr key={p.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-surface-900">
                      {p.codigo}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-surface-800">
                      {getStr(p.caficultor)}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {getStr(p.finca)}
                    </td>
                    <td className="px-5 py-3.5 text-surface-700">
                      {p.variedad}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-surface-800">
                      {p.cantidadEstimada.toLocaleString('es-CO')} kg
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLES OFERTA */}
      {modalDetalleAbierto && ofertaActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{ofertaActual.codigo}</h3>
                  <span className="text-xs text-surface-500">{ofertaActual.empresa}</span>
                </div>
              </div>
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="p-1 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-surface-50 p-3 rounded-xl border border-surface-200 text-xs">
                <div>
                  <span className="text-surface-500 block">Variedad</span>
                  <span className="font-semibold text-surface-800">{ofertaActual.variedadCafe}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Proceso</span>
                  <span className="font-semibold text-surface-800">{ofertaActual.proceso}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Puntaje Catación SCA</span>
                  <span className="font-bold text-brand-terracota">{ofertaActual.puntajeSca} puntos</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Precio / kg</span>
                  <span className="font-bold text-emerald-700">${ofertaActual.precioKg} USD</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Cantidad Total</span>
                  <span className="font-semibold text-surface-800">{ofertaActual.cantidad} kg</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Productor</span>
                  <span className="font-semibold text-surface-800">{getStr(ofertaActual.caficultor)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-surface-700 block mb-1">Notas Sensoriales de Cata</span>
                <p className="text-xs text-surface-700 bg-surface-50 p-3 rounded-lg border border-surface-100 italic leading-relaxed">
                  "{ofertaActual.notasCata}"
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-between items-center">
              <button
                type="button"
                onClick={() => descargarFichaPdf(ofertaActual)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-terracota hover:bg-brand-terracota-dark text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                Descargar Ficha PDF
              </button>
              <button
                type="button"
                onClick={() => setModalDetalleAbierto(false)}
                className="px-4 py-2 rounded-xl bg-surface-900 text-white text-xs font-semibold"
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
