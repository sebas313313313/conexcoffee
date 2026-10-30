import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function ContactTecnicafe() {
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

          animate(el, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 750,
            ease: 'outExpo',
          });

          if (btnRef.current) {
            animate(btnRef.current, {
              opacity: [0, 1],
              scale: [0.9, 1],
              duration: 650,
              delay: 200,
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

  const handleBtnHover = (isHover) => {
    if (btnRef.current) {
      animate(btnRef.current, {
        scale: isHover ? 1.04 : 1,
        translateY: isHover ? -2 : 0,
        duration: 250,
        ease: 'outQuad',
      });
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
      <div
        ref={bannerRef}
        className="opacity-0 bg-stone-900 text-white p-8 sm:p-10 rounded-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
      >
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Innovación Cafetera
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Tecnicafé — Parque Tecnológico de Innovación en Café
          </h3>
          <p className="text-xs sm:text-sm text-surface-300 max-w-2xl leading-relaxed">
            El primer parque tecnológico especializado en café del mundo, ubicado en el departamento del Cauca,
            donde se realiza el riguroso análisis físico y sensorial de cada lote de ConexCoffee.
          </p>
        </div>

        <div className="shrink-0">
          <a
            ref={btnRef}
            href="https://tecnicafe.co"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => handleBtnHover(true)}
            onMouseLeave={() => handleBtnHover(false)}
            className="opacity-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-700 bg-stone-800 text-white hover:bg-stone-700 hover:border-stone-500 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none shadow-md"
          >
            <span>Conoce Más de Tecnicafé</span>
          </a>
        </div>
      </div>
    </section>
  );
}
