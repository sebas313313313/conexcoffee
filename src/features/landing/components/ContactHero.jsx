import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { animate } from 'animejs';

export default function ContactHero() {
  const containerRef = useRef(null);
  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);
  const bgImageRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Animación de entrada inicial del texto y badge
    animate(el.querySelectorAll('.anime-hero-badge'), {
      opacity: [0, 1],
      translateY: [-16, 0],
      duration: 650,
      ease: 'outBack',
    });

    animate(el.querySelectorAll('.anime-hero-title'), {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 800,
      delay: 100,
      ease: 'outExpo',
    });

    animate(el.querySelectorAll('.anime-hero-desc'), {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: 220,
      ease: 'outExpo',
    });

    // Zoom sutil y constante del fondo
    let bgAnim;
    if (bgImageRef.current) {
      bgAnim = animate(bgImageRef.current, {
        scale: [1, 1.05],
        duration: 9000,
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
        translateY: [-12, 12],
        scale: [0.9, 1.1],
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
        translateY: [12, -12],
        scale: [1.1, 0.9],
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
    <section ref={containerRef} className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-black select-none">
      {/* Fondo con imagen oficial y animación sutil de escala */}
      <div
        ref={bgImageRef}
        className="absolute inset-0 bg-cover bg-center origin-center will-change-transform"
        style={{
          backgroundImage: "url('/images/pagina-web/contact_us/bg_contact_us.png')",
        }}
      />

      {/* Capa de oscurecimiento sólido para contraste */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Orbes de brillo ambiental dinámico anime.js */}
      <div
        ref={glow1Ref}
        className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-brand-terracota/20 blur-3xl pointer-events-none"
      />
      <div
        ref={glow2Ref}
        className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-brand-orange/20 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="anime-hero-badge opacity-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-terracota/30 border border-brand-orange/50 text-brand-orange text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Canales Oficiales de Atención</span>
        </div>

        <h1 className="anime-hero-title opacity-0 text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase mb-4">
          Contáctanos
        </h1>

        <p className="anime-hero-desc opacity-0 text-surface-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Estamos aquí para conectar tu pasión por el café de especialidad con el mercado global.
          Escríbenos, llámanos o radícanos tus consultas y solicitudes PQRS.
        </p>
      </div>
    </section>
  );
}
