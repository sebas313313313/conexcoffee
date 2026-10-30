import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Coffee,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { animate, stagger } from 'animejs';

const FEATURES = [
  {
    title: 'Precios Justos y Transparentes',
    desc: 'El caficultor recibe el valor real de su dedicación y calidad, sin comisiones abusivas.',
  },
  {
    title: 'Trazabilidad Total de Cosecha',
    desc: 'Datos verificables desde la finca y altimetría hasta el análisis de laboratorio.',
  },
  {
    title: 'Contratos Seguros y Custodia de Fondos',
    desc: 'Operaciones comerciales blindadas de inicio a fin con liquidación garantizada.',
  },
];

export default function SeccionNosotros() {
  const sectionRef = useRef(null);
  const textColRef = useRef(null);
  const cardRef = useRef(null);
  const coffeeIconRef = useRef(null);
  const glowOrb1Ref = useRef(null);
  const glowOrb2Ref = useRef(null);
  const ctaBtnRef = useRef(null);
  const featureListRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    // 1. Loops flotantes orgánicos para orbes de resplandor ambiental
    let loopOrb1;
    let loopOrb2;
    if (glowOrb1Ref.current && glowOrb2Ref.current) {
      loopOrb1 = animate(glowOrb1Ref.current, {
        translateY: [-10, 10],
        translateX: [-6, 6],
        scale: [1, 1.15],
        duration: 3800,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });

      loopOrb2 = animate(glowOrb2Ref.current, {
        translateY: [12, -12],
        translateX: [8, -8],
        scale: [1.15, 1],
        duration: 4400,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });
    }

    // 2. IntersectionObserver para activar la entrada al hacer scroll a la sección
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Entrada de textos (tag, título, párrafo)
            if (textColRef.current) {
              const textElements = textColRef.current.querySelectorAll('.nosotros-anim-text');
              animate(textElements, {
                opacity: [0, 1],
                translateY: [24, 0],
                duration: 750,
                delay: stagger(100),
                ease: 'outExpo',
              });
            }

            // Entrada escalonada de ventajas
            if (featureListRef.current) {
              const items = featureListRef.current.children;
              animate(items, {
                opacity: [0, 1],
                translateX: [-25, 0],
                duration: 650,
                delay: stagger(120, { start: 200 }),
                ease: 'outCubic',
              });
            }

            // Entrada con rebote del botón CTA
            if (ctaBtnRef.current) {
              animate(ctaBtnRef.current, {
                opacity: [0, 1],
                scale: [0.92, 1],
                translateY: [12, 0],
                duration: 600,
                delay: 550,
                ease: 'outBack',
              });
            }

            // Entrada de la tarjeta de café
            if (cardRef.current) {
              animate(cardRef.current, {
                opacity: [0, 1],
                scale: [0.92, 1],
                translateY: [25, 0],
                duration: 850,
                delay: 150,
                ease: 'outExpo',
              });
            }

            // Icono de café flotante con rotación y escala
            if (coffeeIconRef.current) {
              animate(coffeeIconRef.current, {
                opacity: [0, 1],
                scale: [0, 1],
                rotate: [-20, 0],
                duration: 750,
                delay: 450,
                ease: 'outBack',
              });
            }

            // Badges dentro de la tarjeta
            if (cardRef.current) {
              const badges = cardRef.current.querySelectorAll('.nosotros-badge');
              if (badges.length > 0) {
                animate(badges, {
                  opacity: [0, 1],
                  translateY: [15, 0],
                  scale: [0.9, 1],
                  duration: 600,
                  delay: stagger(100, { start: 600 }),
                  ease: 'outBack',
                });
              }
            }

            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      if (loopOrb1?.pause) loopOrb1.pause();
      if (loopOrb2?.pause) loopOrb2.pause();
    };
  }, []);

  // Micro-interacción anime.js en botón CTA
  const handleBtnEnter = () => {
    if (ctaBtnRef.current) {
      animate(ctaBtnRef.current, {
        scale: 1.04,
        translateY: -2,
        duration: 250,
        ease: 'outExpo',
      });
    }
  };

  const handleBtnLeave = () => {
    if (ctaBtnRef.current) {
      animate(ctaBtnRef.current, {
        scale: 1,
        translateY: 0,
        duration: 250,
        ease: 'outExpo',
      });
    }
  };

  const handleBtnDown = () => {
    if (ctaBtnRef.current) {
      animate(ctaBtnRef.current, {
        scale: 0.96,
        duration: 120,
        ease: 'outQuad',
      });
    }
  };

  // Micro-interacción anime.js al pasar el cursor sobre cada ventaja
  const handleFeatureEnter = (e) => {
    const icon = e.currentTarget.querySelector('.feature-icon-badge');
    if (icon) {
      animate(icon, {
        scale: 1.2,
        rotate: 8,
        duration: 240,
        ease: 'outBack',
      });
    }
  };

  const handleFeatureLeave = (e) => {
    const icon = e.currentTarget.querySelector('.feature-icon-badge');
    if (icon) {
      animate(icon, {
        scale: 1,
        rotate: 0,
        duration: 240,
        ease: 'outCubic',
      });
    }
  };

  return (
    <section
      id="nosotros"
      ref={sectionRef}
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-surface-50 relative overflow-hidden"
    >
      {/* Resplandores ambientales de fondo suave */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-terracota/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Columna Texto descriptivo */}
          <div ref={textColRef}>
            <div className="nosotros-anim-text inline-flex items-center gap-2 text-brand-terracota font-bold text-xs uppercase tracking-wider mb-3 px-3 py-1 rounded-full bg-brand-tint border border-brand-terracota/20">
              <Award className="h-4 w-4" />
              <span>Ventaja ConexCoffee</span>
            </div>

            <h2 className="nosotros-anim-text text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-6">
              ¿Por qué elegirnos?
            </h2>

            <p className="nosotros-anim-text text-surface-600 text-base sm:text-lg leading-relaxed mb-6">
              En ConexCoffee eliminamos la intermediación especulativa que afecta a los caficultores
              y encarece los costos de los compradores. Facilitamos un canal transparente donde
              cada grano cuenta con origen certificado, análisis físico y sensorial verificado, y
              liquidaciones directas y seguras.
            </p>

            <div ref={featureListRef} className="space-y-3 mb-8">
              {FEATURES.map((item, index) => (
                <div
                  key={index}
                  onMouseEnter={handleFeatureEnter}
                  onMouseLeave={handleFeatureLeave}
                  className="nosotros-feature-item flex items-start gap-3.5 p-3 rounded-xl hover:bg-white hover:shadow-xs transition-colors cursor-default border border-transparent hover:border-surface-200"
                >
                  <div className="feature-icon-badge w-7 h-7 rounded-lg bg-brand-tint text-brand-terracota flex items-center justify-center shrink-0 mt-0.5 border border-brand-terracota/20 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">{item.title}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div ref={ctaBtnRef} className="inline-block">
              <Link to="/nosotros">
                <Button
                  variant="primary"
                  size="md"
                  className="gap-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onMouseEnter={handleBtnEnter}
                  onMouseLeave={handleBtnLeave}
                  onMouseDown={handleBtnDown}
                >
                  <span>Conoce Más Sobre Nosotros</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Columna Tarjeta de Café (Showcase interactivo) */}
          <div
            ref={cardRef}
            className="relative group transition-transform duration-500 hover:-translate-y-1"
          >
            {/* Luces y resplandores animados por Anime.js */}
            <div
              ref={glowOrb1Ref}
              className="absolute top-4 right-4 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl pointer-events-none"
            />
            <div
              ref={glowOrb2Ref}
              className="absolute -bottom-8 -left-8 w-44 h-44 bg-brand-terracota/20 rounded-full blur-3xl pointer-events-none"
            />

            <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black p-8 sm:p-12 text-white min-h-[400px] flex flex-col justify-end">
              {/* Imagen fotográfica de fondo con zoom sutil al hover */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none scale-105 group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: "url('/images/pagina-web/nosotros-conexcoffee.png')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div
                  ref={coffeeIconRef}
                  className="w-14 h-14 rounded-2xl bg-brand-terracota text-white flex items-center justify-center mb-6 shadow-xl border border-white/10"
                >
                  <Coffee className="h-7 w-7" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-1">
                  Café de Origen Colombiano
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 tracking-tight">
                  Grano Seleccionado a Mano
                </h3>
                <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-md">
                  Cosechas recolectadas en su punto óptimo de maduración por familias caficultoras,
                  secadas al sol en camas africanas y evaluadas bajo los rigurosos estándares de la SCA.
                </p>

                {/* Badges animados */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <span className="nosotros-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
                    +86 Puntos SCA
                  </span>
                  <span className="nosotros-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm">
                    <Award className="h-3.5 w-3.5 text-brand-orange" />
                    Micro-Lotes Exclusivos
                  </span>
                  <span className="nosotros-badge inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    100% Trazable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
