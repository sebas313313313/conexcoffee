import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function BlogHero() {
  const containerRef = useRef(null);
  const bgImageRef = useRef(null);
  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Animación de entrada suave del título y descripción
    animate(el.querySelectorAll('.anime-blog-title'), {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 750,
      ease: 'outExpo',
    });

    animate(el.querySelectorAll('.anime-blog-desc'), {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 750,
      delay: 150,
      ease: 'outExpo',
    });

    // Zoom continuo sutil del fondo
    let bgAnim;
    if (bgImageRef.current) {
      bgAnim = animate(bgImageRef.current, {
        scale: [1, 1.05],
        duration: 10000,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });
    }

    // Luces ambientales orgánicas flotantes
    let glow1Anim;
    if (glow1Ref.current) {
      glow1Anim = animate(glow1Ref.current, {
        translateX: [-18, 18],
        translateY: [-10, 10],
        duration: 5000,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });
    }

    let glow2Anim;
    if (glow2Ref.current) {
      glow2Anim = animate(glow2Ref.current, {
        translateX: [18, -18],
        translateY: [10, -10],
        duration: 6000,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });
    }

    return () => {
      bgAnim?.pause();
      glow1Anim?.pause();
      glow2Anim?.pause();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative pt-24 pb-10 sm:pt-28 sm:pb-12 min-h-[200px] sm:min-h-[240px] flex items-center justify-center overflow-hidden bg-black select-none"
    >
      {/* Fondo con imagen oficial (altura compacta a la mitad) */}
      <div
        ref={bgImageRef}
        className="absolute inset-0 bg-cover bg-center origin-center will-change-transform"
        style={{
          backgroundImage: "url('/images/pagina-web/blog/bg_blog.jpg')",
        }}
      />

      {/* Capa de oscurecimiento sólido para contraste */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Orbes de brillo ambiental dinámico anime.js */}
      <div
        ref={glow1Ref}
        className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-brand-terracota/20 blur-3xl pointer-events-none"
      />
      <div
        ref={glow2Ref}
        className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-brand-orange/20 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="anime-blog-title opacity-0 text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase mb-2">
          Blog Cafetero & Noticias
        </h1>

        <p className="anime-blog-desc opacity-0 text-surface-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Explora las últimas tendencias en café de especialidad, prácticas de cultivo, procesos sensoriales y dinámicas comerciales en origen.
        </p>
      </div>
    </section>
  );
}
