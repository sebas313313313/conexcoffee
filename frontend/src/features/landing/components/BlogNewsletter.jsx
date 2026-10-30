import { useEffect, useRef, useState } from 'react';
import { Mail, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Button } from '@/components/ui';
import { sanitizeHTML } from '@/lib/sanitize';
import { animate } from 'animejs';

export default function BlogNewsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;

          animate(el, {
            opacity: [0, 1],
            translateY: [35, 0],
            duration: 800,
            ease: 'outExpo',
          });

          if (btnRef.current) {
            animate(btnRef.current, {
              opacity: [0, 1],
              scale: [0.9, 1],
              duration: 600,
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
        scale: isHover ? 1.03 : 1,
        translateY: isHover ? -2 : 0,
        duration: 250,
        ease: 'outQuad',
      });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const safeEmail = sanitizeHTML(email);

    setTimeout(() => {
      setLoading(false);
      toast.success(`¡Gracias por suscribirte! Te enviaremos novedades a ${safeEmail}`);
      setEmail('');

      if (sectionRef.current) {
        animate(sectionRef.current, {
          scale: [0.99, 1],
          duration: 400,
          ease: 'outBack',
        });
      }
    }, 600);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div
        ref={sectionRef}
        className="opacity-0 relative rounded-2xl overflow-hidden p-8 sm:p-12 border-2 border-brand-terracota shadow-xl bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/pagina-web/background-conexcoffee.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-stone-950/85" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-terracota/30 border border-brand-orange/40 text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Boletín Especializado ConexCoffee</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mantente al día con el mercado del café de especialidad
          </h3>

          <p className="text-surface-200 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Recibe semanalmente análisis de precios internacionales, fechas de nuevos zarpes consolidados
            y convocatorias para caficultores y catadores.
          </p>

          <form onSubmit={handleSubscribe} className="pt-3 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="email"
                required
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/95 text-surface-900 border-surface-200 focus:border-brand-orange shadow-md text-sm rounded-xl pl-10"
              />
              <Mail className="h-4 w-4 text-surface-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>

            <div
              ref={btnRef}
              onMouseEnter={() => handleBtnHover(true)}
              onMouseLeave={() => handleBtnHover(false)}
            >
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-orange hover:bg-brand-terracota text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-shadow gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Suscribirme</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
