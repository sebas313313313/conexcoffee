import { useEffect, useRef } from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { animate } from 'animejs';

export default function ContactBannerCaficultor({ onOpenModal }) {
  const bannerRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          // Entrada animada del banner con rebote elástico
          animate(el, {
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.96, 1],
            duration: 800,
            ease: 'outExpo',
          });

          // Animación suave del badge con icono de destello
          animate(el.querySelectorAll('.anime-sparkle-icon'), {
            rotate: [-30, 0],
            scale: [0.6, 1],
            duration: 700,
            delay: 150,
            ease: 'outBack',
          });

          // Entrada con rebote del botón de acción
          if (btnRef.current) {
            animate(btnRef.current, {
              opacity: [0, 1],
              scale: [0.9, 1],
              duration: 650,
              delay: 300,
              ease: 'outBack',
            });
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleBtnHover = () => {
    if (btnRef.current) {
      animate(btnRef.current, {
        scale: 1.03,
        translateY: -2,
        duration: 250,
        ease: 'outQuad',
      });
    }
  };

  const handleBtnLeave = () => {
    if (btnRef.current) {
      animate(btnRef.current, {
        scale: 1,
        translateY: 0,
        duration: 250,
        ease: 'outQuad',
      });
    }
  };

  return (
    <section className="relative z-20 -mt-10 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div
        ref={bannerRef}
        className="opacity-0 relative p-6 sm:p-8 rounded-xl shadow-xl border-2 border-brand-terracota overflow-hidden bg-cover bg-center bg-brand-orange"
        style={{
          backgroundImage: "url('/images/pagina-web/background-cafe-conexcoffee-two.png')",
        }}
      >
        {/* Capa sólida de tinte terracota */}
        <div className="absolute inset-0 bg-brand-terracota/90" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="anime-sparkle-icon h-3.5 w-3.5 text-brand-orange" />
              <span>Programa de Conexión Directa al Productor</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
              ¿Eres caficultor? Ponte en contacto con una empresa regional
            </h2>
            <p className="text-xs sm:text-sm text-surface-100 leading-relaxed">
              En caso de que tu cosecha sea aprobada por la empresa aliada, podrás formalizar la comercialización
              directa de tu café con garantía de precio justo, recolección y trazabilidad certificada.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto text-center">
            <button
              ref={btnRef}
              type="button"
              onClick={onOpenModal}
              onMouseEnter={handleBtnHover}
              onMouseLeave={handleBtnLeave}
              className="opacity-0 w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-brand-terracota hover:bg-surface-50 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer select-none"
            >
              <MapPin className="h-4 w-4 text-brand-orange" />
              <span>Explorar Empresas Regionales en el Mapa &gt;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
