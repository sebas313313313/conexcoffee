import { useEffect, useRef, useState } from 'react';
import { HelpCircle, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { animate, stagger } from 'animejs';

const FAQ_ITEMS = [
  {
    id: 1,
    pregunta: '¿Cómo funciona la compra de café de especialidad a través de ConexCoffee?',
    respuesta:
      'Conectamos pequeños caficultores de Colombia con compradores y tostadores internacionales. Cada lote publicado en la plataforma cuenta con análisis físico y sensorial en laboratorio (Tecnicafé), puntaje SCA certificado y consolidación en contenedores marítimos con logística garantizada hasta su destino.',
  },
  {
    id: 2,
    pregunta: '¿Cómo puede un caficultor vincular su café a la plataforma?',
    respuesta:
      'El caficultor se registra en ConexCoffee y entrega una muestra representativa de su cosecha a través de nuestro centro de laboratorio asociado. Tras la catación oficial bajo protocolo SCA, se determina el perfil de taza y se fija un precio justo y transparente para su publicación en el mercado global.',
  },
  {
    id: 3,
    pregunta: '¿Qué garantías de calidad y trazabilidad se ofrecen?',
    respuesta:
      'Garantía del 100% de origen colombiano con trazabilidad verificable de la finca, productor, altitud y variedad. Además, cada lote cuenta con certificado de catación avalado por catadores Q-Grader y análisis de humedad y actividad de agua.',
  },
  {
    id: 4,
    pregunta: '¿Cuáles son los tiempos de entrega y destinos logísticos?',
    respuesta:
      'Coordinamos despachos consolidados en contenedores marítimos hacia los principales puertos de Norteamérica, Europa y Asia. Puedes consultar las fechas estimadas de zarpe y arribo en nuestra sección oficial de Destinos.',
  },
  {
    id: 5,
    pregunta: '¿Qué tipos de requerimientos puedo gestionar a través de este canal?',
    respuesta:
      'A través de este formulario puedes radicar Preguntas, Consultas de Compra, Solicitudes de Registro para Caficultores, Alianzas Comerciales, Quejas o Sugerencias (PQRS). Todas las solicitudes son atendidas en un plazo máximo de 24 horas hábiles.',
  },
];

export default function ContactFaq() {
  const [openFaq, setOpenFaq] = useState(1);
  const containerRef = useRef(null);
  const answerRefs = useRef({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          // Entrada animada de la cabecera
          animate(el.querySelectorAll('.anime-faq-header'), {
            opacity: [0, 1],
            translateX: [-25, 0],
            duration: 700,
            ease: 'outExpo',
          });

          // Entrada escalonada de las preguntas frecuentes
          animate(el.querySelectorAll('.anime-faq-item'), {
            opacity: [0, 1],
            translateY: [20, 0],
            delay: stagger(90),
            duration: 650,
            ease: 'outExpo',
          });

          // Entrada de la caja de horario
          animate(el.querySelectorAll('.anime-faq-schedule'), {
            opacity: [0, 1],
            translateY: [25, 0],
            delay: 450,
            duration: 700,
            ease: 'outBack',
          });
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (id) => {
    const nextOpen = openFaq === id ? null : id;
    setOpenFaq(nextOpen);

    // Animación suave del contenido al abrir
    if (nextOpen && answerRefs.current[nextOpen]) {
      setTimeout(() => {
        const target = answerRefs.current[nextOpen];
        if (target) {
          animate(target, {
            opacity: [0, 1],
            translateY: [-6, 0],
            duration: 300,
            ease: 'outQuad',
          });
        }
      }, 10);
    }
  };

  return (
    <div ref={containerRef} className="lg:col-span-6 space-y-6">
      <div className="anime-faq-header opacity-0">
        <div className="inline-flex items-center gap-2 text-brand-terracota font-bold text-xs uppercase tracking-widest mb-2">
          <HelpCircle className="h-4 w-4" />
          <span>Resolución Rápida</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
          Preguntas Frecuentes
        </h2>
        <div className="w-16 h-1 bg-brand-orange rounded-full mt-3 mb-4" />
        <p className="text-sm text-surface-600 leading-relaxed">
          Encuentra respuestas inmediatas a las consultas más comunes sobre compras, ventas, calidad
          y logística en ConexCoffee.
        </p>
      </div>

      {/* Acordeón de FAQ */}
      <div className="space-y-3 pt-2">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openFaq === item.id;
          return (
            <div
              key={item.id}
              className="anime-faq-item opacity-0 border border-surface-200 rounded-xl bg-white overflow-hidden shadow-xs hover:border-brand-orange/50 transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(item.id)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-surface-900 hover:text-brand-terracota transition-colors cursor-pointer select-none"
              >
                <span className="pr-4 leading-snug">{item.pregunta}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-brand-terracota transition-transform duration-250 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div
                  ref={(el) => {
                    answerRefs.current[item.id] = el;
                  }}
                  className="px-5 pb-5 pt-1 text-xs sm:text-sm text-surface-600 leading-relaxed border-t border-surface-100 bg-surface-50/50 will-change-transform"
                >
                  {item.respuesta}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tarjeta de soporte / Horario */}
      <div className="anime-faq-schedule opacity-0 p-6 rounded-xl bg-stone-900 text-white border border-stone-800 shadow-md">
        <h3 className="text-base font-bold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-orange" />
          <span>Horario de Atención Oficial</span>
        </h3>
        <p className="text-xs text-surface-300 leading-relaxed mb-3">
          Nuestro equipo técnico y administrativo atiende de Lunes a Viernes de 8:00 AM a 6:00 PM
          y Sábados de 8:00 AM a 1:00 PM (Hora Colombia, GMT-5).
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
          <CheckCircle2 className="h-4 w-4" />
          <span>Atención prioritaria a productores y tostadores</span>
        </div>
      </div>
    </div>
  );
}
