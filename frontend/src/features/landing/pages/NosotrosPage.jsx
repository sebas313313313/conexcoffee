import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Globe2,
  Scale,
  Ship,
  Sparkles,
  ArrowRight,
  FlaskConical,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { animate, stagger } from 'animejs';

// ============================================
// NosotrosPage — Acerca de ConexCoffee & Agenda Cafetera
// ============================================

export default function NosotrosPage() {
  const heroRef = useRef(null);
  const historiaRef = useRef(null);
  const promesaRef = useRef(null);
  const misionRef = useRef(null);

  useEffect(() => {
    // 1. Hero text and seals animation
    if (heroRef.current) {
      const items = heroRef.current.querySelectorAll('.hero-anim');
      animate(items, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 750,
        delay: stagger(90),
        ease: 'outExpo',
      });
    }

    // 2. Observer for scroll sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (entry.target === historiaRef.current) {
            const blocks = historiaRef.current.querySelectorAll('.historia-block');
            animate(blocks, {
              opacity: [0, 1],
              translateX: [25, 0],
              duration: 650,
              delay: stagger(120),
              ease: 'outCubic',
            });
            const img = historiaRef.current.querySelector('.historia-img');
            if (img) {
              animate(img, {
                opacity: [0, 1],
                scale: [0.93, 1],
                duration: 800,
                ease: 'outExpo',
              });
            }
          }

          if (entry.target === promesaRef.current) {
            const quote = promesaRef.current.querySelector('.promesa-quote');
            if (quote) {
              animate(quote, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 700,
                ease: 'outExpo',
              });
            }
            const pillars = promesaRef.current.querySelectorAll('.promesa-pillar');
            animate(pillars, {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 600,
              delay: stagger(100, { start: 150 }),
              ease: 'outExpo',
            });
            const shipImg = promesaRef.current.querySelector('.promesa-img');
            if (shipImg) {
              animate(shipImg, {
                opacity: [0, 1],
                scale: [0.93, 1],
                duration: 800,
                delay: 200,
                ease: 'outExpo',
              });
            }
          }

          if (entry.target === misionRef.current) {
            const mvCards = misionRef.current.querySelectorAll('.mv-card');
            animate(mvCards, {
              opacity: [0, 1],
              translateY: [24, 0],
              duration: 700,
              delay: stagger(140),
              ease: 'outExpo',
            });
          }

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    if (historiaRef.current) observer.observe(historiaRef.current);
    if (promesaRef.current) observer.observe(promesaRef.current);
    if (misionRef.current) observer.observe(misionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      {/* 1. HERO SECTION CON VIDEO INSTITUCIONAL */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-black">
        {/* Fondo fotográfico panorámico */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/pagina-web/nosotros-conexcoffee.png')",
          }}
        />
        {/* Capa de oscurecimiento sólido para contraste premium (sin gradientes) */}
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Columna Texto Hero */}
            <div ref={heroRef} className="lg:col-span-6 text-left space-y-6">
              <div className="hero-anim inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-terracota/30 border border-brand-orange/50 text-brand-orange text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sobre ConexCoffee & Agenda Cafetera</span>
              </div>

              <h1 className="hero-anim text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase leading-tight">
                ¿Quiénes <br className="hidden sm:inline" />
                <span className="text-brand-orange">Somos?</span>
              </h1>

              <p className="hero-anim text-surface-200 text-base sm:text-lg leading-relaxed max-w-xl">
                Somos el puente tecnológico y logístico que conecta a los pequeños caficultores de cafés
                de especialidad en Colombia con tostadores y compradores de todo el mundo, garantizando
                rigor de laboratorio, transparencia, precio justo y entregas directas en contenedores.
              </p>

              {/* Sellos de confianza en el Hero */}
              <div className="hero-anim grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-orange shrink-0" />
                  <span className="text-xs font-semibold text-white">100% Origen Colombiano</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <FlaskConical className="h-4 w-4 text-brand-orange shrink-0" />
                  <span className="text-xs font-semibold text-white">Evaluación SCA</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                  <Ship className="h-4 w-4 text-brand-orange shrink-0" />
                  <span className="text-xs font-semibold text-white">Logística Global</span>
                </div>
              </div>
            </div>

            {/* Columna Video Institucional */}
            <div className="lg:col-span-6">
              <div className="bg-stone-900 p-2.5 sm:p-3 rounded-xl border border-stone-800 shadow-2xl">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/2ZyR9PwfyEo"
                    title="ConexCoffee — ¿Quiénes somos?"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between px-3 pt-3 pb-1 text-xs text-surface-400">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-orange inline-block animate-pulse" />
                    Conoce nuestra historia en video
                  </span>
                  <span>Agenda Cafetera</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN: NUESTRA HISTORIA (DISTRIBUCIÓN MEJORADA) */}
      <section ref={historiaRef} className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Imagen ilustrativa con marcos y detalles */}
          <div className="lg:col-span-5 order-2 lg:order-1 historia-img">
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border-2 border-surface-200 shadow-xl bg-stone-900">
                <img
                  src="/images/pagina-web/about_us/img_about_us_one.png"
                  alt="Caficultor recolectando granos de café de especialidad"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Badge flotante inferior */}
              <div className="absolute -bottom-6 -right-3 sm:right-6 bg-white p-4 rounded-xl border border-surface-200 shadow-lg max-w-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-brand-terracota flex items-center justify-center shrink-0">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-surface-900">Comercio 100% Justo</p>
                  <p className="text-[11px] text-surface-500">Valor real y directo al productor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Texto de Nuestra Historia distribuido en 3 pasos legibles */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div>
              <span className="text-brand-terracota font-bold text-xs uppercase tracking-widest block mb-2">
                Orígenes & Propósito
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-surface-900 tracking-tight">
                NUESTRA HISTORIA
              </h2>
              <div className="w-16 h-1 bg-brand-orange rounded-full mt-3" />
            </div>

            {/* Párrafos estructurados con micro-bloques */}
            <div className="space-y-4 pt-2">
              <div className="historia-block p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
                <h3 className="text-sm font-bold text-surface-900 mb-1.5 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-brand-terracota" />
                  <span>Laboratorio y Análisis de Calidad</span>
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  Agenda Cafetera es una plataforma web diseñada para ayudar a los caficultores a comercializar
                  sus cultivos de café de manera efectiva. Nos encargamos de recolectar muestras de los cultivos
                  y someterlas a rigurosas pruebas de laboratorio para determinar su tipo y puntaje de calidad SCA.
                  Esto permite obtener una información detallada y precisa sobre cada grano.
                </p>
              </div>

              <div className="historia-block p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
                <h3 className="text-sm font-bold text-surface-900 mb-1.5 flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-brand-terracota" />
                  <span>Comercialización Internacional en Contenedores</span>
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  Una vez obtenidos los resultados analíticos, se asigna un precio adecuado al café y se procede
                  a su comercialización a nivel internacional a través de contenedores consolidados. De esta manera,
                  cualquier persona o empresa interesada en el café podrá realizar su compra con certeza,
                  independientemente de su ubicación geográfica en el mundo.
                </p>
              </div>

              <div className="historia-block p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
                <h3 className="text-sm font-bold text-surface-900 mb-1.5 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand-terracota" />
                  <span>Empoderamiento y Valor Real para el Caficultor</span>
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  El objetivo principal de Agenda Cafetera es proporcionar a los caficultores una plataforma
                  confiable y eficiente para promover sus productos en el mercado global. Al utilizar esta herramienta,
                  los productores obtienen un valor justo por su café de alta calidad y acceden a un público
                  internacional, maximizando así sus oportunidades comerciales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: PROMESA DE VALOR (DISTRIBUCIÓN MEJORADA CON IMAGEN 2) */}
      <section ref={promesaRef} className="py-20 bg-stone-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Contenido de la Promesa */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-brand-orange font-bold text-xs uppercase tracking-widest block mb-2">
                  Nuestro Compromiso Inquebrantable
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  PROMESA DE VALOR
                </h2>
                <div className="w-16 h-1 bg-brand-orange rounded-full mt-3" />
              </div>

              {/* Frase textual oficial destacada en bloque */}
              <div className="promesa-quote p-6 rounded-xl bg-black/60 border-l-4 border-brand-orange border-r border-t border-b border-stone-800">
                <p className="text-base sm:text-lg text-surface-100 font-medium leading-relaxed italic">
                  &ldquo;Facilitamos la conexión entre pequeños caficultores de cafés de especialidad en Colombia
                  y compradores internacionales, asegurando una experiencia basada en calidad, transparencia,
                  precio justo y entrega puntual hasta su destino.&rdquo;
                </p>
              </div>

              {/* 4 Pilares de la Promesa de Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="promesa-pillar p-4 rounded-xl bg-stone-800/80 border border-stone-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-brand-terracota/30 text-brand-orange">
                      <Award className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Calidad Certificada</h3>
                  </div>
                  <p className="text-xs text-surface-300 leading-relaxed">
                    Catación oficial y parámetros de taza medidos bajo estándar internacional SCA.
                  </p>
                </div>

                <div className="promesa-pillar p-4 rounded-xl bg-stone-800/80 border border-stone-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-brand-terracota/30 text-brand-orange">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Transparencia Total</h3>
                  </div>
                  <p className="text-xs text-surface-300 leading-relaxed">
                    Trazabilidad de la finca, lote, proceso de secado y análisis físico accesible en línea.
                  </p>
                </div>

                <div className="promesa-pillar p-4 rounded-xl bg-stone-800/80 border border-stone-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-brand-terracota/30 text-brand-orange">
                      <Scale className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Precio Justo</h3>
                  </div>
                  <p className="text-xs text-surface-300 leading-relaxed">
                    Remuneración digna eliminando cadenas de intermediación que castigan al caficultor.
                  </p>
                </div>

                <div className="promesa-pillar p-4 rounded-xl bg-stone-800/80 border border-stone-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-brand-terracota/30 text-brand-orange">
                      <Ship className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Entrega a Destino</h3>
                  </div>
                  <p className="text-xs text-surface-300 leading-relaxed">
                    Operaciones logísticas marítimas consolidadas con seguimiento y cumplimiento estricto.
                  </p>
                </div>
              </div>
            </div>

            {/* Imagen 2 de la Promesa (Buque portacontenedores) */}
            <div className="lg:col-span-5 promesa-img">
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden border-2 border-stone-700 shadow-2xl bg-black">
                  <img
                    src="/images/pagina-web/about_us/img_about_us_two.png"
                    alt="Buque con contenedores de café transportado internacionalmente"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Badge flotante inferior */}
                <div className="absolute -bottom-6 -left-3 sm:left-6 bg-stone-900 p-4 rounded-xl border border-stone-700 shadow-2xl max-w-xs flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-brand-terracota text-white flex items-center justify-center shrink-0">
                    <Ship className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Envíos Internacionales</p>
                    <p className="text-[11px] text-surface-300">Contenedores de exportación directa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISIÓN Y VISIÓN */}
      <section ref={misionRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-terracota font-bold text-xs uppercase tracking-widest block mb-2">
            Nuestros Fundamentos
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Misión y Visión
          </h2>
          <p className="text-sm text-surface-600 mt-2">
            Los principios que guían nuestras operaciones diarias con los caficultores y los mercados del mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mv-card bg-white p-8 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-brand-terracota flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Nuestra Misión</h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                Empoderar a los productores de café de Colombia mediante una plataforma tecnológica que elimina
                la intermediación desmedida, garantizando un pago digno por su calidad y ofreciendo a compradores
                internacionales cafés excepcionales con trazabilidad y laboratorio garantizados.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-surface-100 flex items-center gap-2 text-xs font-semibold text-brand-terracota">
              <span>Rigor • Equidad • Calidad</span>
            </div>
          </div>

          <div className="mv-card bg-white p-8 rounded-xl border border-surface-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center mb-6">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-3">Nuestra Visión</h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                Ser el estándar global en el comercio digital y exportación de café de especialidad colombiano,
                reconocidos por la equidad en las relaciones comerciales, la preservación del origen y la
                sostenibilidad económica, ambiental y social de las familias cafeteras.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-surface-100 flex items-center gap-2 text-xs font-semibold text-stone-700">
              <span>Sostenibilidad • Futuro • Origen</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BANNER LLAMADO A LA ACCIÓN (CTA) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="bg-stone-900 text-white p-8 sm:p-12 rounded-xl border border-stone-800 text-center relative overflow-hidden">
          {/* Acento lateral decorativo */}
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-brand-orange" />

          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¿Listo para formar parte del ecosistema ConexCoffee?
            </h2>
            <p className="text-sm sm:text-base text-surface-300 leading-relaxed max-w-xl mx-auto">
              Si eres caficultor, broker, tostaduría o comprador internacional, conéctate directamente
              con el mercado de cafés de especialidad más transparente de Colombia.
            </p>

            <div className="pt-4 flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="md" className="gap-2 bg-brand-orange hover:bg-brand-terracota text-white">
                  <span>Registrarme Ahora</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/destinos">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-2 text-sm border border-stone-600 bg-stone-800 text-white hover:bg-stone-700 hover:border-stone-500 transition-colors cursor-pointer"
                >
                  <Ship className="h-4 w-4 text-brand-orange" />
                  <span>Conocer Nuestros Destinos</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
