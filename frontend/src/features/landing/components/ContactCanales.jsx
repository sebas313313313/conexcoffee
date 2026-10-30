import { useEffect, useRef } from 'react';
import { MapPin, Mail, Phone, Building2, Clock, MessageCircle } from 'lucide-react';
import { animate, stagger } from 'animejs';

export default function ContactCanales() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          // Entrada escalonada de las tarjetas de canales
          animate(el.querySelectorAll('.anime-canal-card'), {
            opacity: [0, 1],
            translateY: [40, 0],
            delay: stagger(150),
            duration: 750,
            ease: 'outExpo',
          });

          // Pop y rotación de los iconos
          animate(el.querySelectorAll('.anime-canal-icon'), {
            scale: [0.5, 1],
            rotate: [-15, 0],
            delay: stagger(150, { start: 100 }),
            duration: 650,
            ease: 'outBack',
          });
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleCardHover = (cardEl, isHover) => {
    if (!cardEl) return;
    const iconEl = cardEl.querySelector('.anime-canal-icon');

    animate(cardEl, {
      translateY: isHover ? -6 : 0,
      duration: 300,
      ease: 'outQuad',
    });

    if (iconEl) {
      animate(iconEl, {
        scale: isHover ? 1.12 : 1,
        rotate: isHover ? 6 : 0,
        duration: 300,
        ease: 'outBack',
      });
    }
  };

  return (
    <section ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ubicación */}
        <div
          onMouseEnter={(e) => handleCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleCardHover(e.currentTarget, false)}
          className="anime-canal-card opacity-0 bg-white p-6 sm:p-8 rounded-xl border border-surface-200 shadow-md flex flex-col justify-between hover:border-brand-orange/40 hover:shadow-xl transition-colors"
        >
          <div>
            <div className="anime-canal-icon w-12 h-12 rounded-xl bg-primary-100 text-brand-terracota flex items-center justify-center mb-4 will-change-transform">
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracota block mb-1">
              Sede Principal
            </span>
            <h2 className="text-xl font-extrabold text-surface-900 mb-2">UBICACIÓN</h2>
            <p className="text-sm font-semibold text-surface-800 mb-1">Tecnicafé</p>
            <p className="text-xs text-surface-500 leading-relaxed">
              Parque Tecnológico de Innovación en Café, Cajibío — Cauca, Colombia.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-100 flex items-center gap-1.5 text-xs font-semibold text-brand-terracota">
            <Building2 className="h-3.5 w-3.5" />
            <span>Centro de Innovación & Calidad</span>
          </div>
        </div>

        {/* Correo Electrónico */}
        <div
          onMouseEnter={(e) => handleCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleCardHover(e.currentTarget, false)}
          className="anime-canal-card opacity-0 bg-white p-6 sm:p-8 rounded-xl border border-surface-200 shadow-md flex flex-col justify-between hover:border-brand-orange/40 hover:shadow-xl transition-colors"
        >
          <div>
            <div className="anime-canal-icon w-12 h-12 rounded-xl bg-primary-100 text-brand-terracota flex items-center justify-center mb-4 will-change-transform">
              <Mail className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracota block mb-1">
              Escríbenos Directamente
            </span>
            <h2 className="text-xl font-extrabold text-surface-900 mb-2">CORREO</h2>
            <a
              href="mailto:conexcoffe@gmail.com"
              className="text-sm font-bold text-brand-orange hover:text-brand-terracota transition-colors break-all"
            >
              conexcoffe@gmail.com
            </a>
            <p className="text-xs text-surface-500 leading-relaxed mt-1">
              Atención a consultas comerciales, registros y alianzas internacionales.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-100 flex items-center gap-1.5 text-xs font-semibold text-surface-600">
            <Clock className="h-3.5 w-3.5 text-brand-terracota" />
            <span>Respuesta en menos de 24 horas</span>
          </div>
        </div>

        {/* WhatsApp Directo */}
        <div
          onMouseEnter={(e) => handleCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => handleCardHover(e.currentTarget, false)}
          className="anime-canal-card opacity-0 bg-white p-6 sm:p-8 rounded-xl border border-surface-200 shadow-md flex flex-col justify-between hover:border-brand-orange/40 hover:shadow-xl transition-colors"
        >
          <div>
            <div className="anime-canal-icon w-12 h-12 rounded-xl bg-primary-100 text-brand-terracota flex items-center justify-center mb-4 will-change-transform">
              <Phone className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracota block mb-1">
              Atención Rápida
            </span>
            <h2 className="text-xl font-extrabold text-surface-900 mb-2">WHATSAPP</h2>
            <p className="text-sm font-bold text-surface-900 mb-1">+57 321 711 4140</p>
            <p className="text-xs text-surface-500 leading-relaxed">
              Línea directa para asesoría a caficultores, brokers y compradores.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-100">
            <a
              href="https://wa.me/573217114140?text=Hola%20ConexCoffee,%20deseo%20m%C3%A1s%20informaci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-white bg-brand-terracota hover:bg-primary-800 rounded-lg transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
