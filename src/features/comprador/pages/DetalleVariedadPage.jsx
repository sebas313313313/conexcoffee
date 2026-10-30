import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, Package, Star, MapPin, Calendar,
  Award, Leaf, ChevronLeft, ChevronRight, User, FlaskConical,
  Truck, Info, Plus, Minus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import RadarChart from '../components/RadarChart';
import { useContenedoresComprador } from '../hooks/useCompradorData';
import { useComprador } from '@/hooks/useComprador';

// ============================================
// DetalleVariedadPage — Vista completa de una variedad de café
// ============================================

export default function DetalleVariedadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { variedadId } = useParams();

  const contenedoresQuery = useContenedoresComprador();
  const contenedores = contenedoresQuery.data ?? [];
  const { createPedido } = useComprador();

  // Recuperar datos desde state de navegación o buscar en query
  const { variedad: variedadState, contenedor: contenedorState } = location.state || {};
  let variedad = variedadState;
  let contenedor = contenedorState;

  if (!variedad) {
    for (const cnt of contenedores) {
      const found = cnt.variedades?.find((v) => v.id === variedadId);
      if (found) { variedad = found; contenedor = cnt; break; }
    }
  }

  const [slideIdx, setSlideIdx] = useState(0);
  const [cajasQty, setCajasQty] = useState(1);
  const [muestraQty, setMuestraQty] = useState(1);

  if (!variedad) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-surface-500">Variedad no encontrada.</p>
      </div>
    );
  }

  const imagenes = variedad.imagenesFinca || [];
  const totalSlides = imagenes.length;

  const prevSlide = () => setSlideIdx((i) => (i - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setSlideIdx((i) => (i + 1) % totalSlides);

  const addToCart = async (tipo, cantidad) => {
    const totalEstimado =
      tipo === 'caja'
        ? cantidad * Number(variedad.precioCaja || 240)
        : cantidad * Number(variedad.precioMuestra || 35);
    try {
      await createPedido({
        contenedorId: contenedor?.id,
        contenedor: contenedor?.codigo,
        variedad: variedad.nombre,
        cantidad: tipo === 'caja' ? `${cantidad * 24} Kg` : `${cantidad * 120} g`,
        totalEstimado,
      });
    } catch {
      const desc =
        tipo === 'caja'
          ? `${cantidad} caja(s) × 24 Kg de ${variedad.nombre}`
          : `${cantidad} muestra(s) × 120 g de ${variedad.nombre}`;
      toast.success(`Añadido al carrito: ${desc}`);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a variedades
      </button>

      {/* ============================
          Encabezado + Carrusel
      ============================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Carrusel de imágenes */}
        <div className="relative rounded-2xl overflow-hidden bg-surface-100 h-72 lg:h-96 shadow-md">
          {imagenes.length > 0 ? (
            <>
              <img
                src={imagenes[slideIdx]}
                alt={`Finca - imagen ${slideIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Controles */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Indicadores */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {imagenes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlideIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          i === slideIdx ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Overlay etiqueta finca */}
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {variedad.historia?.finca}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-300">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Info principal + compra */}
        <div className="space-y-4">
          {/* Nombre y puntaje */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                {contenedor?.codigo}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                {variedad.puntajeSCA} SCA
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-surface-900 mt-1">
              {variedad.nombre}
            </h1>
            <p className="text-surface-500 text-sm">Tipo de secado: {variedad.tipoSecado}</p>
          </div>

          {/* Disponibilidad */}
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-surface-700">
              <Truck className="h-4 w-4 text-primary-600" />
              EN DESTINO + IVA
            </div>
            <div className="flex items-center gap-1.5 text-sm text-surface-500">
              <Calendar className="h-3.5 w-3.5" />
              Entrega disponible a partir de{' '}
              <span className="font-semibold text-surface-700">{contenedor?.fechaDisponible}</span>
            </div>
            <p className="text-xs text-surface-400 italic">
              Su café se encuentra almacenado según normativas de calidad
            </p>
            <div className="flex gap-3 text-xs text-surface-600 pt-1">
              <span className="font-semibold">{variedad.unidadesDisponibles} unidades disponibles</span>
              <span>|</span>
              <span>{variedad.pedidoMinKg} Kg pedido mín.</span>
            </div>
          </div>

          {/* Precio */}
          <div>
            <p className="text-3xl font-extrabold text-primary-600">
              ${variedad.precioCOP.toLocaleString('es-CO')}
              <span className="text-base font-medium text-surface-400 ml-1">COP / Kg</span>
            </p>
            <p className="text-sm text-surface-400">≈ USD ${variedad.precioUSD.toFixed(2)} / Kg</p>
          </div>

          {/* Añadir cajas de 24 Kg */}
          <div className="border border-surface-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-surface-700">Cajas de 24 Kg</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-surface-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCajasQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-surface-100 transition cursor-pointer"
                >
                  <Minus className="h-4 w-4 text-surface-600" />
                </button>
                <span className="px-4 py-2 text-sm font-bold text-surface-900 border-x border-surface-300">
                  {cajasQty}
                </span>
                <button
                  onClick={() => setCajasQty((q) => Math.min(variedad.unidadesDisponibles, q + 1))}
                  className="px-3 py-2 hover:bg-surface-100 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-surface-600" />
                </button>
              </div>
              <span className="text-sm text-surface-500">= {cajasQty * 24} Kg</span>
              <span className="text-sm font-bold text-primary-600 ml-auto">
                ${(cajasQty * 24 * variedad.precioCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <button
              id="btn-add-caja"
              onClick={() => addToCart('caja', cajasQty)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              Añadir al carrito — Caja 24 Kg
            </button>
          </div>

          {/* Solicitar muestra 120g */}
          <div className="border border-dashed border-primary-300 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-surface-700">Solicitar muestra de 120 g</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-surface-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setMuestraQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-surface-100 transition cursor-pointer"
                >
                  <Minus className="h-4 w-4 text-surface-600" />
                </button>
                <span className="px-4 py-2 text-sm font-bold text-surface-900 border-x border-surface-300">
                  {muestraQty}
                </span>
                <button
                  onClick={() => setMuestraQty((q) => q + 1)}
                  className="px-3 py-2 hover:bg-surface-100 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-surface-600" />
                </button>
              </div>
              <span className="text-sm text-surface-500">= {muestraQty * 120} g</span>
            </div>
            <button
              id="btn-add-muestra"
              onClick={() => addToCart('muestra', muestraQty)}
              className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              <Package className="h-4 w-4" />
              Añadir muestra al carrito
            </button>
          </div>
        </div>
      </div>

      {/* ============================
          Fila inferior: 4 tarjetas
      ============================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tarjeta: Historia del caficultor */}
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <User className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="font-bold text-surface-900">Historia del caficultor</h2>
          </div>
          {variedad.historia && (
            <div className="flex gap-4">
              <img
                src={variedad.historia.foto}
                alt={variedad.historia.caficultor}
                className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-surface-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-900">{variedad.historia.caficultor}</p>
                <p className="text-xs text-primary-600 font-medium mb-2">{variedad.historia.finca} — {variedad.historia.municipio}</p>
                <p className="text-sm text-surface-500 leading-relaxed mb-3">
                  {variedad.historia.descripcion}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {variedad.historia.certificaciones.map((cert) => (
                    <span
                      key={cert}
                      className="flex items-center gap-1 px-2 py-0.5 bg-success-50 text-success-700 text-xs rounded-full border border-success-200"
                    >
                      <Award className="h-3 w-3" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tarjeta: Detalles del café */}
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Info className="h-4 w-4 text-primary-600" />
            </div>
            <h2 className="font-bold text-surface-900">Detalles del café</h2>
          </div>
          {variedad.detalles && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Object.entries(variedad.detalles).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-surface-400 uppercase tracking-wide mb-0.5 font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-surface-700 font-medium">{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarjeta: Análisis sensorial */}
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <FlaskConical className="h-4 w-4 text-teal-600" />
            </div>
            <h2 className="font-bold text-surface-900">Análisis sensorial</h2>
          </div>
          {variedad.analisisSensorial && (
            <div className="flex flex-col items-center gap-4">
              {/* Gráfica */}
              <RadarChart data={variedad.analisisSensorial} size={260} />
              {/* Leyenda */}
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <span className="w-6 h-0.5 bg-teal-500 inline-block rounded" />
                Análisis sensorial
              </div>
              {/* Valores numéricos */}
              <div className="w-full grid grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(variedad.analisisSensorial).map(([attr, val]) => (
                  <div key={attr} className="flex items-center justify-between text-xs">
                    <span className="text-surface-500">{attr}</span>
                    <span className="font-bold text-surface-700">{val.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tarjeta: Mapa de la finca */}
        <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="font-bold text-surface-900">Ubicación de la finca</h2>
          </div>
          {variedad.ubicacionFinca && (
            <>
              <p className="text-xs text-surface-500 mb-3 flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5 text-green-500" />
                {variedad.ubicacionFinca.nombre}
              </p>
              <div className="rounded-xl overflow-hidden border border-surface-200 h-52">
                <iframe
                  title={`Mapa ${variedad.historia?.finca || variedad.nombre}`}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  sandbox="allow-scripts allow-popups"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${variedad.ubicacionFinca.lat},${variedad.ubicacionFinca.lng}&zoom=12`}
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
              <div className="flex gap-3 mt-2 text-xs text-surface-400">
                <span>Lat: {variedad.ubicacionFinca.lat}</span>
                <span>Lng: {variedad.ubicacionFinca.lng}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
