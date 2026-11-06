import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Info,
  Leaf,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Ship,
  ShoppingCart,
  Star,
  Sun,
  Truck,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RadarChart, FincaMapa } from '@/components/data-display';
import useCartStore, { formatCOP } from '@/store/useCartStore';
import { getDestinoById, PAIS_ORIGEN } from '../data/destinosData';

export function DestinoContenedorPage() {
  const { destinoId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const loteParam = searchParams.get('lote');

  const destino = getDestinoById(destinoId);
  const selectedLote = destino?.lotes.find((l) => l.id === loteParam) || null;

  const containerRef = useRef(null);
  const detailRef = useRef(null);

  // Estados de la vista de detalle ("Conoce más")
  const [slideIdx, setSlideIdx] = useState(0);
  const [cajasQty, setCajasQty] = useState(1);
  const [muestraQty, setMuestraQty] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSlideIdx(0);
    setCajasQty(1);
    setMuestraQty(1);
  }, [destinoId, loteParam]);

  // Animación para la lista de lotes del contenedor
  useEffect(() => {
    if (selectedLote || !containerRef.current) return;
    const scope = containerRef.current;

    animate(scope.querySelectorAll('[data-anim="header"]'), {
      translateY: [22, 0],
      opacity: [0, 1],
      delay: stagger(80, { start: 60 }),
      duration: 600,
      ease: 'outCubic',
    });

    animate(scope.querySelectorAll('[data-anim="lote-card"]'), {
      translateY: [28, 0],
      opacity: [0, 1],
      delay: stagger(110, { start: 220 }),
      duration: 620,
      ease: 'outCubic',
    });
  }, [destinoId, selectedLote]);

  // Animación para la vista "Conoce más"
  useEffect(() => {
    if (!selectedLote || !detailRef.current) return;
    const scope = detailRef.current;

    animate(scope.querySelectorAll('[data-anim="detail-block"]'), {
      translateY: [24, 0],
      opacity: [0, 1],
      delay: stagger(100, { start: 60 }),
      duration: 580,
      ease: 'outCubic',
    });
  }, [selectedLote]);

  if (!destino) {
    return (
      <div className="bg-surface-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-surface-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <Ship className="w-12 h-12 text-brand-terracota mx-auto mb-3" />
          <h1 className="text-xl font-bold text-surface-900">Destino no encontrado</h1>
          <p className="text-sm text-surface-600 mt-1 mb-5">
            El contenedor o país solicitado no existe o no se encuentra disponible.
          </p>
          <Link
            to="/destinos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracota text-white text-sm font-semibold hover:bg-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Nuestros Destinos
          </Link>
        </div>
      </div>
    );
  }

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleOpenLote = (loteId) => {
    setSearchParams({ lote: loteId });
  };

  const handleBackToContenedor = () => {
    setSearchParams({});
  };

  const handleAddToCart = (tipo, lote) => {
    const pesoCajaKg = lote.pesoCajaKg || 24;
    const pesoMuestraG = lote.pesoMuestraG || 120;
    const precioKiloNum = Number(lote.precioKiloCOPNum) || 120000;
    const precioCajaCOP = precioKiloNum * pesoCajaKg;
    const precioMuestraCOP = Number(lote.precioMuestraCOPNum) || 35000;

    if (tipo === 'caja') {
      addItem({
        id: `${lote.id}-caja`,
        loteId: lote.id,
        tipo: 'caja',
        nombre: lote.nombre,
        variedad: lote.variedad,
        destinoId: destino.id,
        destinoNombre: destino.nombre,
        imagen: lote.imagenSacos,
        presentacion: `Caja de ${pesoCajaKg} kg`,
        cantidad: cajasQty,
        maxCantidad: lote.unidadesDisponibles || 50,
        precioUnitarioCOP: precioCajaCOP,
      });
      toast.success(
        `Añadido al carrito: ${cajasQty} caja(s) de ${pesoCajaKg} kg — ${formatCOP(
          precioCajaCOP * cajasQty
        )}`
      );
      openCart();
    } else {
      addItem({
        id: `${lote.id}-muestra`,
        loteId: lote.id,
        tipo: 'muestra',
        nombre: lote.nombre,
        variedad: lote.variedad,
        destinoId: destino.id,
        destinoNombre: destino.nombre,
        imagen: lote.imagenSacos,
        presentacion: `Muestra de ${pesoMuestraG} g`,
        cantidad: muestraQty,
        maxCantidad: 25,
        precioUnitarioCOP: precioMuestraCOP,
      });
      toast.success(
        `Muestra añadida al carrito: ${muestraQty} × ${pesoMuestraG}g — ${formatCOP(
          precioMuestraCOP * muestraQty
        )}`
      );
      openCart();
    }
  };

  // ==========================================================
  // VISTA 2: Detalle del lote al presionar "Conoce más"
  // ==========================================================
  if (selectedLote) {
    const imagenes = selectedLote.imagenesFinca || [selectedLote.imagenSacos];
    const totalSlides = imagenes.length;
    const prevSlide = () => setSlideIdx((i) => (i - 1 + totalSlides) % totalSlides);
    const nextSlide = () => setSlideIdx((i) => (i + 1) % totalSlides);

    return (
      <div ref={detailRef} className="bg-surface-50 min-h-screen pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Barra superior de retorno y ruta de banderas */}
          <div
            data-anim="detail-block"
            className="flex flex-wrap items-center justify-between gap-4 opacity-0"
          >
            <button
              type="button"
              onClick={handleBackToContenedor}
              className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-brand-terracota transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a cargas del contenedor ({destino.nombre})
            </button>

            <div className="inline-flex items-center gap-2.5 bg-white border border-surface-200 rounded-xl px-3.5 py-2 shadow-xs">
              <img
                src={PAIS_ORIGEN.bandera}
                alt={PAIS_ORIGEN.nombre}
                className="w-6 h-4 object-cover rounded-xs border border-surface-200"
              />
              <span className="text-xs font-bold text-surface-800">{PAIS_ORIGEN.nombre}</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-terracota" />
              <img
                src={destino.bandera}
                alt={destino.nombre}
                className="w-6 h-4 object-cover rounded-xs border border-surface-200"
              />
              <span className="text-xs font-bold text-surface-800">{destino.nombre}</span>
            </div>
          </div>

          {/* ==========================================================
              SECCIÓN SUPERIOR:
              Izquierda: Carrusel de imágenes del café y la finca
              Derecha: Tarjeta de precio, destino + IVA, normativa,
                       contador de unidades, caja 24kg y muestra 120g
          ========================================================== */}
          <div
            data-anim="detail-block"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0"
          >
            {/* Izquierda: Carrusel de imágenes del café y de la finca */}
            <div className="relative rounded-2xl overflow-hidden bg-surface-900 h-80 sm:h-96 lg:h-full min-h-96 border border-surface-200 shadow-md">
              <img
                src={imagenes[slideIdx]}
                alt={`${selectedLote.nombre} — Imagen ${slideIdx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900/75 via-transparent to-surface-900/20" />

              {totalSlides > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Imagen anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-900/55 hover:bg-surface-900/80 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Siguiente imagen"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-900/55 hover:bg-surface-900/80 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Indicadores de carrusel */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {imagenes.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSlideIdx(i)}
                        aria-label={`Ir a imagen ${i + 1}`}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          i === slideIdx ? 'w-7 bg-white' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Etiquetas sobre el carrusel */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-surface-900/75 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                  {selectedLote.historia.finca} · {selectedLote.historia.municipio}
                </span>
                <span className="inline-flex items-center gap-1 bg-brand-gold text-surface-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-surface-900" />
                  SCA {selectedLote.puntajeSCA} pts
                </span>
              </div>

              {/* Miniaturas en la parte inferior izquierda */}
              <div className="absolute bottom-10 left-4 right-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
                  Variedad {selectedLote.variedad} · {selectedLote.tipoProceso}
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {selectedLote.nombre}
                </h1>
              </div>
            </div>

            {/* Derecha: Tarjeta de compra, normativa, caja 24 kg y muestra 120 g */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5">
              {/* Encabezado: Precio por kilo + Destino + IVA */}
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                      Precio por kilo
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-extrabold text-brand-terracota">
                        {selectedLote.precioKiloCOP}
                      </span>
                      <span className="text-sm font-semibold text-surface-500">
                        / kg ({selectedLote.precioKiloUSD})
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs bg-brand-tint text-brand-terracota border border-brand-terracota/25 px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">
                    En Destino ({destino.nombre}) + IVA
                  </span>
                </div>

                {/* Entrega disponible a partir de */}
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-surface-600">
                  <Truck className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>
                    Entrega disponible a partir de:{' '}
                    <strong className="text-surface-900">
                      {destino.contenedor.fechaDisponible}
                    </strong>
                  </span>
                </div>

                {/* Aviso de normativa de seguridad */}
                <div className="mt-3 flex items-start gap-2.5 text-xs text-surface-600 bg-surface-50 border border-surface-200 rounded-xl p-3">
                  <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <span>
                    Este café se encuentra almacenado según la normativa de seguridad{' '}
                    <strong className="text-surface-800">
                      {destino.contenedor.normativaSeguridad}
                    </strong>
                    .
                  </span>
                </div>

                {/* Contador de unidades disponibles y pedido mínimo de 12 kilos */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-brand-tint/40 border border-brand-orange/25 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-surface-800">
                    <Package className="w-4 h-4 text-brand-terracota" />
                    <span>
                      Unidades disponibles:{' '}
                      <strong className="text-brand-terracota">
                        {selectedLote.unidadesDisponibles} cajas
                      </strong>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-terracota bg-white px-2.5 py-1 rounded-full border border-brand-terracota/20">
                    <Info className="w-3.5 h-3.5" />
                    Pedido mínimo de {selectedLote.pedidoMinKg} kilos
                  </span>
                </div>
              </div>

              {/* Selector 1: Caja de 24 kg con Añadir al carrito */}
              <div className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-surface-900">
                      Caja de {selectedLote.pesoCajaKg} kg
                    </p>
                    <p className="text-xs text-surface-500">
                      Empaque al vacío listo para exportación ({cajasQty * selectedLote.pesoCajaKg}{' '}
                      kg total)
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand-terracota bg-brand-tint px-2.5 py-1 rounded-lg">
                    {selectedLote.precioKiloCOP} / kg
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setCajasQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-surface-600 hover:bg-surface-100 transition cursor-pointer"
                      aria-label="Disminuir cajas"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-surface-900">
                      {cajasQty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCajasQty((q) => Math.min(selectedLote.unidadesDisponibles, q + 1))
                      }
                      className="px-3 py-2 text-surface-600 hover:bg-surface-100 transition cursor-pointer"
                      aria-label="Aumentar cajas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart('caja', selectedLote)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-terracota hover:bg-brand-orange text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Añadir al carrito
                  </button>
                </div>
              </div>

              {/* Selector 2: Solicitar muestra de 120 gramos con Añadir al carrito */}
              <div className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-surface-900">
                      Solicitar muestra de {selectedLote.pesoMuestraG} gramos
                    </p>
                    <p className="text-xs text-surface-500">
                      Solicita una o más muestras para perfilación y catación previa
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-brand-teal bg-brand-teal/10 px-2.5 py-1 rounded-lg">
                    {selectedLote.pesoMuestraG}g / muestra
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setMuestraQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-surface-600 hover:bg-surface-100 transition cursor-pointer"
                      aria-label="Disminuir muestras"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-surface-900">
                      {muestraQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMuestraQty((q) => q + 1)}
                      className="px-3 py-2 text-surface-600 hover:bg-surface-100 transition cursor-pointer"
                      aria-label="Aumentar muestras"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart('muestra', selectedLote)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-900 hover:bg-surface-800 text-white text-sm font-bold rounded-xl transition cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Añadir al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================================
              SECCIÓN INFERIOR:
              3 Tarjetas: Historia, Detalles del café y Análisis sensorial
          ========================================================== */}
          <div
            data-anim="detail-block"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-0"
          >
            {/* 1. Tarjeta de Historia */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-tint flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-terracota" />
                  </div>
                  <div>
                    <h2 className="font-bold text-surface-900">Historia</h2>
                    <p className="text-xs text-surface-500">Productor y tradición cafetera</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 mb-4 p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <img
                    src={selectedLote.historia.foto}
                    alt={selectedLote.historia.caficultor}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-surface-200"
                  />
                  <div>
                    <p className="font-bold text-surface-900 text-sm">
                      {selectedLote.historia.caficultor}
                    </p>
                    <p className="text-xs text-brand-terracota font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedLote.historia.finca} — {selectedLote.historia.municipio}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-surface-600 leading-relaxed">
                  {selectedLote.historia.descripcion}
                </p>
              </div>

              {selectedLote.historia.certificaciones?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-surface-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
                    Certificaciones de la finca
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLote.historia.certificaciones.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 text-xs bg-brand-tint/60 text-brand-terracota px-2.5 py-1 rounded-full font-semibold"
                      >
                        <Award className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tarjeta de Detalles del café */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand-tint flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-brand-terracota" />
                </div>
                <div>
                  <h2 className="font-bold text-surface-900">Detalles del café</h2>
                  <p className="text-xs text-surface-500">Ficha técnica y trazabilidad de origen</p>
                </div>
              </div>

              <div className="divide-y divide-surface-100">
                {[
                  { label: 'Origen', value: selectedLote.detalles.origen },
                  { label: 'Productor', value: selectedLote.detalles.productor },
                  { label: 'Variedad', value: selectedLote.detalles.variedad },
                  { label: 'Tipo de proceso', value: selectedLote.detalles.tipoDeProceso },
                  { label: 'Rango de altitud', value: selectedLote.detalles.rangoDeAltitud },
                  { label: 'Periodo de cosecha', value: selectedLote.detalles.periodoDeCosecha },
                  { label: 'Puntaje de cata SCA', value: selectedLote.detalles.puntajeDeCataSCA },
                  {
                    label: 'Última actualización',
                    value: selectedLote.detalles.ultimaActualizacion,
                  },
                  {
                    label: 'Cantidad disponible',
                    value: selectedLote.detalles.cantidadDisponible,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 text-sm gap-3">
                    <span className="text-surface-500">{label}</span>
                    <span className="font-bold text-surface-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Tarjeta de Análisis sensorial (Gráfica tipo araña sobre máximo 10) */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-teal/15 flex items-center justify-center">
                      <Star className="w-4 h-4 text-brand-teal" />
                    </div>
                    <div>
                      <h2 className="font-bold text-surface-900">Análisis sensorial</h2>
                      <p className="text-xs text-surface-500">Escala oficial SCA sobre máx. 10</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-brand-teal/15 text-brand-teal">
                    Máx. 10.0
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <RadarChart data={selectedLote.analisisSensorial} size={255} animated />
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-x-5 gap-y-1.5 pt-3 border-t border-surface-100">
                {Object.entries(selectedLote.analisisSensorial).map(([attr, val]) => (
                  <div key={attr} className="flex items-center justify-between text-xs">
                    <span className="text-surface-500 truncate">{attr}</span>
                    <span className="font-bold text-surface-800">{Number(val).toFixed(1)}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==========================================================
              MAPA DE UBICACIÓN DE LA FINCA (Debajo de las 3 tarjetas)
          ========================================================== */}
          <div
            data-anim="detail-block"
            className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm opacity-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-teal/15 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-teal" />
                </div>
                <div>
                  <h2 className="font-bold text-surface-900">Ubicación de la finca</h2>
                  <p className="text-xs text-surface-500 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-brand-teal" />
                    {selectedLote.ubicacionFinca.nombre}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-surface-500 bg-surface-100 px-3 py-1.5 rounded-lg">
                Coordenadas verificadas de origen
              </span>
            </div>

            <FincaMapa
              lat={selectedLote.ubicacionFinca.lat}
              lng={selectedLote.ubicacionFinca.lng}
              nombre={selectedLote.ubicacionFinca.nombre}
              className="h-72 sm:h-80"
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VISTA 1: Lotes del Contenedor ("Ver todos")
  // ==========================================================
  return (
    <div ref={containerRef} className="bg-surface-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navegación superior */}
        <div data-anim="header" className="opacity-0">
          <Link
            to="/destinos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-brand-terracota transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Nuestros Destinos
          </Link>
        </div>

        {/* Cabecera del Contenedor:
            - País origen (Colombia + bandera) y bandera seleccionada
            - Nombre de la empresa que vende esa carga
            - Fecha de apertura, fecha de cierre y fecha de envío */}
        <header
          data-anim="header"
          className="bg-white border border-surface-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 opacity-0"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Banderas: País origen (Colombia) -> País destino seleccionado */}
            <div className="space-y-3">
              <div className="inline-flex flex-wrap items-center gap-3 bg-surface-50 border border-surface-200 rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={PAIS_ORIGEN.bandera}
                    alt={`Bandera de ${PAIS_ORIGEN.nombre}`}
                    className="w-9 h-6 object-cover rounded-xs border border-surface-200 shadow-2xs"
                  />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                      País Origen
                    </p>
                    <p className="text-sm font-extrabold text-surface-900">{PAIS_ORIGEN.nombre}</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-brand-terracota mx-1" />

                <div className="flex items-center gap-2.5">
                  <img
                    src={destino.bandera}
                    alt={`Bandera de ${destino.nombre}`}
                    className="w-9 h-6 object-cover rounded-xs border border-surface-200 shadow-2xs"
                  />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
                      País Destino
                    </p>
                    <p className="text-sm font-extrabold text-surface-900">{destino.nombre}</p>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
                Cargas de Café — Ruta {PAIS_ORIGEN.nombre} a {destino.nombre}
              </h1>

              {/* Nombre de la empresa que vende la carga */}
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-terracota bg-brand-tint/60 px-3.5 py-1.5 rounded-xl">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Empresa exportadora: {destino.contenedor.empresa}</span>
              </div>
            </div>

            {/* Fechas de apertura, cierre y envío */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Fecha de apertura</span>
                </div>
                <p className="text-sm font-extrabold text-surface-900">
                  {destino.contenedor.fechaApertura}
                </p>
              </div>

              <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Fecha de cierre</span>
                </div>
                <p className="text-sm font-extrabold text-surface-900">
                  {destino.contenedor.fechaCierre}
                </p>
              </div>

              <div className="bg-brand-tint/50 border border-brand-terracota/25 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-terracota mb-1">
                  <Ship className="w-3.5 h-3.5 text-brand-terracota" />
                  <span>Fecha de envío</span>
                </div>
                <p className="text-sm font-extrabold text-surface-900">
                  {destino.contenedor.fechaEnvio}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tarjetas de cada carga de café almacenada en el contenedor */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destino.lotes.map((lote) => (
            <article
              key={lote.id}
              data-anim="lote-card"
              className="group bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between opacity-0"
            >
              <div>
                {/* Imagen de la carga de café (sacos almacenados) */}
                <div className="relative h-56 overflow-hidden bg-surface-100">
                  <img
                    src={lote.imagenSacos}
                    alt={`Carga de café ${lote.variedad}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 via-transparent to-transparent" />

                  {/* Puntaje SCA destacado sobre imagen */}
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-brand-gold text-surface-900 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-surface-900" />
                    SCA {lote.puntajeSCA}
                  </span>

                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-surface-900/75 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                    <Package className="w-3.5 h-3.5 text-brand-gold" />
                    {lote.unidadesDisponibles} cajas disponibles
                  </span>
                </div>

                {/* Datos debajo de la imagen: Variedad, Tipo de secado, Puntaje SCA, Precio por kilo */}
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-terracota">
                      Variedad del café
                    </p>
                    <h2 className="text-lg font-extrabold text-surface-900 mt-0.5">
                      {lote.variedad}
                    </h2>
                    <p className="text-xs text-surface-500">{lote.nombre}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-surface-100 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-surface-500 flex items-center gap-1 shrink-0">
                        <Sun className="w-3.5 h-3.5 text-brand-orange" />
                        Tipo de secado:
                      </span>
                      <span className="text-xs font-semibold text-surface-800 text-right">
                        {lote.tipoSecado}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-surface-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-brand-gold" />
                        Puntaje SCA:
                      </span>
                      <span className="text-xs font-extrabold text-surface-900">
                        {lote.puntajeSCA} puntos
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-surface-500">Precio por kilo:</span>
                      <span className="text-base font-extrabold text-brand-terracota">
                        {lote.precioKiloCOP}{' '}
                        <span className="text-xs font-medium text-surface-500">/ kg</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Conoce más */}
              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => handleOpenLote(lote.id)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white text-sm font-bold transition-colors cursor-pointer"
                >
                  <span>Conoce más</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default DestinoContenedorPage;
