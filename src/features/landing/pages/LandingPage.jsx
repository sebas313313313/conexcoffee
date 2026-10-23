import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  MapPin,
  Mountain,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  Award,
  CheckCircle2,
  Smile,
  Tag,
  Briefcase,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useSEO } from '@/hooks';
import HeroLiquidGlassBanner from '../components/HeroLiquidGlassBanner';



// ============================================
// Diapositivas Oficiales del Hero Carousel
// ============================================
const HERO_SLIDES = [
  {
    id: 1,
    image: '/images/pagina-web/carousel/bg_front_page_one.png',
    titleLine1: 'Compra café verde de especialidad',
    titleHighlight: 'Directamente desde Colombia',
    description:
      'Conectamos pequeños Caficultores de cafés de especialidad en Colombia con compradores internacionales, garantizando la calidad, transparencia, precio justo y la entrega hasta su destino.',
    primaryBtn: {
      text: 'Crear Cuenta Gratis',
      to: '/register',
    },
    secondaryBtn: {
      text: 'Explorar Destinos Cafeteros',
      to: '/destinos',
    },
  },
  {
    id: 2,
    image: '/images/pagina-web/carousel/bg_front_page_two.png',
    titleLine1: 'Explora los secretos del café Colombiano,',
    titleHighlight: 'Un viaje culinario imprescindible',
    description:
      'Descubre las notas sensoriales únicas de nuestras cordilleras, procesos de fermentación artesanal y cosechas evaluadas bajo los rigurosos estándares de la SCA.',
    primaryBtn: {
      text: 'Conocer más',
      to: '/nosotros',
    },
    secondaryBtn: {
      text: 'Ver Destinos',
      to: '/destinos',
    },
  },
  {
    id: 3,
    image: '/images/pagina-web/carousel/bg_front_page_three.jpg',
    titleLine1: 'Embárcate en un viaje sensorial:',
    titleHighlight: 'El tesoro del café Colombiano',
    description:
      'Monitorea en tiempo real los contenedores marítimos activos y asegura lotes de origen certificado con trazabilidad garantizada hasta puerto de destino.',
    primaryBtn: {
      text: 'Conocer más',
      to: '/destinos',
    },
    secondaryBtn: {
      text: 'Publicar Producto',
      to: '/agregar-producto',
    },
  },
];



const FINCAS_MAPA = [
  { id: 1, nombre: 'Finca La Esperanza', region: 'Huila', x: '46%', y: '68%', altitud: '1,820 msnm', variedad: 'Geisha' },
  { id: 2, nombre: 'Hacienda El Paraíso', region: 'Nariño', x: '35%', y: '82%', altitud: '2,050 msnm', variedad: 'Bourbon Rosado' },
  { id: 3, nombre: 'Finca San Alberto', region: 'Quindío (Eje Cafetero)', x: '42%', y: '52%', altitud: '1,650 msnm', variedad: 'Castillo' },
  { id: 4, nombre: 'Finca Los Pinos', region: 'Antioquia', x: '44%', y: '38%', altitud: '1,780 msnm', variedad: 'Caturra' },
  { id: 5, nombre: 'Finca Cumbre Nevada', region: 'Sierra Nevada', x: '58%', y: '16%', altitud: '1,550 msnm', variedad: 'Típica Orgánica' },
  { id: 6, nombre: 'Finca Vista Hermosa', region: 'Tolima', x: '48%', y: '58%', altitud: '1,900 msnm', variedad: 'Tabi' },
];

const ALIADOS = [
  { id: 1, nombre: 'Buxtar', logo: '/images/pagina-web/sponsors/logo_buxtar.png' },
  { id: 2, nombre: 'Cámara de Comercio', logo: '/images/pagina-web/sponsors/logo_camara.png' },
  { id: 3, nombre: 'Innprocafe', logo: '/images/pagina-web/sponsors/logo_innprocafe.png' },
  { id: 4, nombre: 'iNNpulsa Colombia', logo: '/images/pagina-web/sponsors/logo_innpulsa.png' },
  { id: 5, nombre: 'ProColombia', logo: '/images/pagina-web/sponsors/logo_procolombia.png' },
  { id: 6, nombre: 'Tecnicafé', logo: '/images/pagina-web/sponsors/logo_tecnicafe.png' },
];

export default function LandingPage() {
  useSEO({
    title: 'Plataforma de Café Especial y Trazabilidad en Colombia',
    description: 'Conectamos caficultores de café especial con compradores internacionales garantizando calidad SCA, trazabilidad y logística transparente.',
  });

  const [activeFinca, setActiveFinca] = useState(FINCAS_MAPA[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Cambio automático de diapositiva cada 6 segundos
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const current = HERO_SLIDES[currentSlide];

  return (
    <div className="selection:bg-primary-100 selection:text-primary-800">
      {/* ============================================
          1. Hero Section con Carrusel (#hero)
          ============================================ */}
      <section
        id="hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] lg:h-[calc(100vh-10px)] lg:max-h-[700px] flex flex-col justify-center pt-24 sm:pt-26 pb-[120px] sm:pb-[130px] px-4 sm:px-6 lg:px-8 bg-black overflow-hidden select-none"
      >
        {/* Imágenes de Fondo con transición fluida */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 -z-10 scale-105 pointer-events-none'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            <img
              src={slide.image}
              alt={slide.titleHighlight}
              className="w-full h-full object-cover object-center select-none"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            {/* Capa de oscurecimiento con gradiente: lectura nítida a la izquierda y visibilidad del saco a la derecha */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/35 sm:to-black/30" />
            <div className="absolute inset-0 bg-black/25" />
          </div>
        ))}

        {/* Contenido del Slide Activo (Alineación Izquierda) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div key={current.id} className="animate-fadeIn max-w-3xl text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3 sm:mb-4 leading-snug uppercase text-left">
              {current.titleLine1}{' '}
              {current.titleLine2 && <span className="hidden sm:inline">{current.titleLine2} </span>}
              <span className="text-[#F25433] block sm:inline">{current.titleHighlight}</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-surface-200/90 mb-5 leading-relaxed font-normal max-w-2xl text-left">
              {current.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start items-stretch sm:items-center">
              <Link to={current.primaryBtn.to}>
                <Button size="md" variant="primary" className="group w-full sm:w-auto shadow-xl">
                  <span>{current.primaryBtn.text}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={current.secondaryBtn.to}>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-xs transition-all shadow-md cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-[#F25433]" />
                  <span>{current.secondaryBtn.text}</span>
                </button>
              </Link>
            </div>
          </div>

        </div>

        {/* Flecha Anterior (Izquierda) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Diapositiva anterior"
          className="absolute left-3 sm:left-6 top-[42%] -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-[#F25433] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Flecha Siguiente (Derecha) */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Diapositiva siguiente"
          className="absolute right-3 sm:right-6 top-[42%] -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-[#F25433] text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:scale-110"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* ── Cinta Liquid Glass (componente) ── */}
        <HeroLiquidGlassBanner
          currentSlide={currentSlide}
        />
      </section>

      {/* ============================================
          2. Cinta: Conoce Nuestros Destinos
          ============================================ */}
      <section
        id="destinos"
        className="relative py-7 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md border-y border-[#AD2E01] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/pagina-web/background-cafe-conexcoffee-two.png')",
          backgroundColor: '#F25433',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-wider text-center sm:text-left drop-shadow-sm">
            Conoce nuestros destinos
          </h2>
          <Link to="/destinos" className="shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#AD2E01] hover:bg-surface-50 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <span>Click aquí</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-[#F25433]" />
            </button>
          </Link>
        </div>
      </section>

      {/* ============================================
          3. Sección: ¿Por qué elegirnos? (Texto + Imagen de café)
          ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto descriptivo */}
            <div>
              <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-3">
                <Award className="h-4 w-4" />
                <span>Ventaja ConexCoffee</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-6">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-surface-600 text-base sm:text-lg leading-relaxed mb-6">
                En ConexCoffee eliminamos la intermediación especulativa que afecta a los caficultores
                y encarece los costos de los compradores. Facilitamos un canal transparente donde
                cada grano cuenta con origen certificado, análisis físico y sensorial verificado, y
                liquidaciones directas y seguras.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Precios Justos y Transparentes</h3>
                    <p className="text-xs text-surface-500">El caficultor recibe el valor real de su dedicación y calidad.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Trazabilidad Total de Cosecha</h3>
                    <p className="text-xs text-surface-500">Datos verificables desde la finca hasta la entrega final.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">Contratos Seguros y Custodia de Fondos</h3>
                    <p className="text-xs text-surface-500">Operaciones comerciales blindadas de inicio a fin.</p>
                  </div>
                </div>
              </div>

              <Link to="/nosotros">
                <Button variant="primary" size="md">
                  Conoce Más Sobre Nosotros
                </Button>
              </Link>
            </div>

            {/* Imagen de Café */}
            <div className="relative">
              <div className="relative mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-black p-8 sm:p-12 text-white min-h-[380px] flex flex-col justify-end">
                <div className="absolute top-6 right-6 w-20 h-20 bg-[#F25433]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#AD2E01]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#AD2E01] text-white flex items-center justify-center mb-6 shadow-lg">
                    <Coffee className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-300">
                    Café de Origen Colombiano
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-2">
                    Grano Seleccionado a Mano
                  </h3>
                  <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-md">
                    Cosechas recolectadas en su punto óptimo de maduración, secadas al sol en camas
                    africanas y evaluadas bajo los rigurosos estándares de la SCA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          4. Cinta de Métricas: Clientes Satisfechos, Ofertas, Caficultores, Empleados
          ============================================ */}
      <section className="py-12 bg-black text-white border-y border-[#AD2E01] shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-surface-800">
            <div className="pt-4 md:pt-0 px-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c1917] border border-surface-800 flex items-center justify-center mx-auto mb-3 text-[#F25433]">
                <Smile className="h-5 w-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">+2,850</p>
              <p className="text-xs sm:text-sm font-medium text-surface-400 mt-1 uppercase tracking-wider">
                Clientes Satisfechos
              </p>
            </div>

            <div className="pt-4 md:pt-0 px-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c1917] border border-surface-800 flex items-center justify-center mx-auto mb-3 text-[#F25433]">
                <Tag className="h-5 w-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">+420</p>
              <p className="text-xs sm:text-sm font-medium text-surface-400 mt-1 uppercase tracking-wider">
                Ofertas de Lotes Activas
              </p>
            </div>

            <div className="pt-4 md:pt-0 px-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c1917] border border-surface-800 flex items-center justify-center mx-auto mb-3 text-[#F25433]">
                <Coffee className="h-5 w-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">+1,450</p>
              <p className="text-xs sm:text-sm font-medium text-surface-400 mt-1 uppercase tracking-wider">
                Caficultores Vinculados
              </p>
            </div>

            <div className="pt-4 md:pt-0 px-4">
              <div className="w-10 h-10 rounded-xl bg-[#1c1917] border border-surface-800 flex items-center justify-center mx-auto mb-3 text-[#F25433]">
                <Briefcase className="h-5 w-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">+95</p>
              <p className="text-xs sm:text-sm font-medium text-surface-400 mt-1 uppercase tracking-wider">
                Empleados y Especialistas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          5. Sección: Modelo de Negocio (3 tarjetas)
          ============================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-2">
              <TrendingUp className="h-4 w-4" />
              <span>Flujo de Valor Integral</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
              Modelo de Negocio
            </h2>
            <p className="text-surface-600 text-base sm:text-lg">
              Una sinergia directa estructurada en tres pilares que transforman la comercialización
              del café desde la semilla hasta la taza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-50 border border-surface-200 rounded-xl overflow-hidden hover:border-[#F25433] hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-48 bg-[#AD2E01] flex flex-col items-center justify-center p-6 text-white text-center relative">
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-3">
                    <Mountain className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
                    Eslabón de Origen
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-surface-900 mb-3">
                    Productores de café colombiano
                  </h3>
                  <p className="text-sm text-surface-600 leading-relaxed">
                    Caficultores familiares y cooperativas regionales que cultivan micro-lotes de
                    alta especialidad con prácticas sostenibles, accediendo a compradores
                    nacionales e internacionales con pagos justos y sin comisiones abusivas.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link
                  to="/register"
                  className="text-xs font-bold text-[#AD2E01] hover:text-[#8c2503] inline-flex items-center gap-1"
                >
                  <span>Registrar como Productor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-surface-50 border-2 border-[#F25433] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative shadow-md">
              <div className="absolute top-3 right-3 bg-[#F25433] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Núcleo Digital
              </div>
              <div>
                <div className="h-48 bg-black flex flex-col items-center justify-center p-6 text-white text-center relative border-b border-[#F25433]">
                  <div className="w-14 h-14 rounded-xl bg-[#F25433]/20 backdrop-blur-xs flex items-center justify-center mb-3">
                    <Calendar className="h-7 w-7 text-[#F25433]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F25433]">
                    Gestión & Trazabilidad
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-surface-900 mb-3">
                    ConexCoffee y Agenda Cafetera
                  </h3>
                  <p className="text-sm text-surface-600 leading-relaxed">
                    El motor tecnológico que sincroniza calendarios de cosecha, perfiles de catación
                    SCA, contratos inteligentes, verificación de calidad en laboratorio y logística
                    de entrega garantizada en un solo ecosistema confiable.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link
                  to="/destinos"
                  className="text-xs font-bold text-[#AD2E01] hover:text-[#8c2503] inline-flex items-center gap-1"
                >
                  <span>Explorar el Ecosistema</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-surface-50 border border-surface-200 rounded-xl overflow-hidden hover:border-[#F25433] hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-48 bg-[#1c1917] flex flex-col items-center justify-center p-6 text-white text-center relative border-b border-surface-700">
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mb-3">
                    <Coffee className="h-7 w-7 text-[#F25433]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-surface-300">
                    Destino & Experiencia
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-surface-900 mb-3">
                    Consumidor Final
                  </h3>
                  <p className="text-sm text-surface-600 leading-relaxed">
                    Tostadores artesanales, cadenas de cafeterías, empresas gastronómicas y amantes
                    del buen café que reciben lotes frescos con trazabilidad completa, respaldando la
                    sostenibilidad social del campo cafetero.
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link
                  to="/register"
                  className="text-xs font-bold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
                >
                  <span>Comprar Café de Especialidad</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          6. Sección: Nuestras Fincas (Mapa con puntos)
          ============================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-100/70 border-y border-surface-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-2">
              <MapPin className="h-4 w-4" />
              <span>Geolocalización Productiva</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
              Nuestras fincas
            </h2>
            <p className="text-surface-600 text-base sm:text-lg">
              Explora las fincas y predios cafetaleros georreferenciados que forman parte de la red
              ConexCoffee a lo largo de la geografía colombiana.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 bg-black rounded-xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl min-h-[440px] flex items-center justify-center border border-surface-800">

              <div className="relative w-full max-w-md h-80 border-2 border-[#AD2E01] rounded-xl bg-[#1c1917] p-4">
                <div className="text-[11px] font-mono text-primary-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Cartografía Cafetera Colombia</span>
                  <span className="text-surface-400">GPS Coords Activas</span>
                </div>

                {FINCAS_MAPA.map((finca) => {
                  const isSelected = activeFinca.id === finca.id;
                  return (
                    <button
                      key={finca.id}
                      onClick={() => setActiveFinca(finca)}
                      style={{ left: finca.x, top: finca.y }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                      title={`${finca.nombre} (${finca.region})`}
                    >
                      <span
                        className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${isSelected ? 'bg-accent-400' : 'bg-primary-500'
                          }`}
                      />
                      <span
                        className={`relative flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shadow-lg ${isSelected
                          ? 'bg-accent-400 text-surface-950 scale-125 ring-4 ring-accent-400/30'
                          : 'bg-primary-600 text-white hover:scale-110'
                          }`}
                      >
                        <Coffee className="h-3 w-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 mb-4">
                <MapPin className="h-3.5 w-3.5" />
                <span>{activeFinca.region}</span>
              </div>
              <h3 className="text-2xl font-bold text-surface-900 mb-2">{activeFinca.nombre}</h3>
              <p className="text-sm text-surface-600 mb-6 leading-relaxed">
                Finca certificada con trazabilidad de origen disponible. Sus lotes son auditados
                periódicamente en laboratorio y comercializados bajo contratos transparentes.
              </p>

              <div className="space-y-3 text-xs text-surface-600 border-t border-surface-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Altitud:</span>
                  <span className="font-bold text-surface-800">{activeFinca.altitud}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Variedad principal:</span>
                  <span className="font-bold text-surface-800">{activeFinca.variedad}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">Estado de cosecha:</span>
                  <span className="font-bold text-[#AD2E01]">En recolección óptima</span>
                </div>
              </div>

              <Link to="/destinos">
                <Button variant="primary" size="sm" className="w-full justify-center">
                  Explorar Lotes de esta Zona
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          7. Sección: "Contamos con un equipo dedicado y trabajador" + Imagen
          ============================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-3">
                <Users className="h-4 w-4" />
                <span>Talento Humano Cafetero</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-6">
                Contamos con un equipo dedicado y trabajador
              </h2>
              <p className="text-surface-600 text-base sm:text-lg leading-relaxed mb-6">
                Detrás de cada contrato, cada cata y cada envío en ConexCoffee, hay agrónomos,
                catadores con certificación Q-Grader, ingenieros de software y asesores de comercio
                exterior comprometidos con el éxito de nuestros productores y la satisfacción de
                los compradores.
              </p>
              <p className="text-surface-600 text-sm sm:text-base leading-relaxed mb-8">
                Trabajamos en campo de la mano con las familias caficultoras, brindando asesoría
                técnica en procesos de fermentación controlada y empaque al vacío para garantizar
                que la frescura llegue intacta al cliente final.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                  <p className="text-xl font-bold text-[#AD2E01]">100%</p>
                  <p className="text-xs text-surface-500 font-medium">Asistencia Personalizada</p>
                </div>
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                  <p className="text-xl font-bold text-[#AD2E01]">Q-Graders</p>
                  <p className="text-xs text-surface-500 font-medium">Catación Certificada</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-black p-8 sm:p-12 text-white min-h-[380px] flex flex-col justify-end relative">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#AD2E01] flex items-center justify-center mb-4 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-300">
                    Equipo en Campo & Laboratorio
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1 mb-2">
                    Pasión por la Calidad en Cada Taza
                  </h3>
                  <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-md">
                    Nuestro equipo acompaña la evaluación de humedades, conteo de defectos y análisis
                    sensorial para asegurar la excelencia en cada lote.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          8. Sección: Nuestros Aliados (Cinta / Carrusel de logos)
          ============================================ */}
      <section className="py-16 bg-surface-50 border-y border-surface-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h3 className="text-xs font-bold text-surface-500 uppercase tracking-widest">
            Nuestros Aliados Estratégicos
          </h3>
        </div>

        {/* Carrusel Continuo Infinito (Marquee) */}
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-6 sm:gap-8 py-2">
            {[...ALIADOS, ...ALIADOS].map((aliado, idx) => (
              <div
                key={`${aliado.id}-${idx}`}
                className="bg-white border border-surface-200/80 rounded-xl px-8 py-4 flex items-center justify-center min-w-[200px] h-[95px] shadow-xs hover:border-[#F25433] hover:shadow-md transition-all duration-300 group select-none shrink-0"
                title={aliado.nombre}
              >
                <img
                  src={aliado.logo}
                  alt={aliado.nombre}
                  className="max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
