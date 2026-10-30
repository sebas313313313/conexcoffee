import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Send, Paperclip, FileCheck, Sparkles } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { sanitizeHTML } from '@/lib/sanitize';
import { animate } from 'animejs';

const PAISES_OPCIONES = [
  { code: 'CO', name: 'Colombia' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'DE', name: 'Alemania' },
  { code: 'CA', name: 'Canadá' },
  { code: 'JP', name: 'Japón' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'AU', name: 'Australia' },
  { code: 'OTRO', name: 'Otro País' },
];

export default function ContactForm({ onOpenEmpresasModal }) {
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    pais: 'Colombia',
    tipoPqrs: 'Consulta General',
    mensaje: '',
    aceptaTerminos: true,
  });

  const cardRef = useRef(null);
  const submitBtnRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
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
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no debe exceder los 10 MB.');
        return;
      }
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleBtnHover = (isHover) => {
    if (submitBtnRef.current) {
      animate(submitBtnRef.current, {
        scale: isHover ? 1.02 : 1,
        translateY: isHover ? -2 : 0,
        duration: 250,
        ease: 'outQuad',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.aceptaTerminos) {
      toast.error('Debes aceptar la política de privacidad para enviar tu mensaje.');
      return;
    }

    setSubmitting(true);
    const safeNombre = sanitizeHTML(form.nombreCompleto);
    const safeEmail = sanitizeHTML(form.email);

    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        `¡Gracias ${safeNombre || 'por contactarnos'}! Hemos recibido tu solicitud (${form.tipoPqrs}). Te responderemos prontamente a ${safeEmail}.`
      );
      setForm({
        nombreCompleto: '',
        email: '',
        telefono: '',
        pais: 'Colombia',
        tipoPqrs: 'Consulta General',
        mensaje: '',
        aceptaTerminos: true,
      });
      setFileName('');

      // Efecto sutil de confirmación
      if (cardRef.current) {
        animate(cardRef.current, {
          scale: [0.99, 1],
          duration: 400,
          ease: 'outBack',
        });
      }
    }, 700);
  };

  return (
    <div className="lg:col-span-6">
      <div ref={cardRef} className="opacity-0">
        <Card className="p-6 sm:p-10 border border-surface-200 shadow-lg bg-white">
          <div className="mb-6">
            <span className="text-brand-terracota font-bold text-xs uppercase tracking-widest block mb-1">
              Atención Personalizada
            </span>
            <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">
              Envíanos una Solicitud
            </h2>
            <p className="text-xs sm:text-sm text-surface-600 mt-1">
              Diligencia los siguientes campos y nuestro equipo responderá a tu solicitud prontamente.
            </p>
          </div>

          {/* Aviso para Caficultores dentro del Formulario */}
          <div className="mb-5 p-3.5 rounded-lg bg-primary-100 border-l-4 border-brand-terracota text-xs text-surface-800 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-brand-terracota shrink-0 mt-0.5" />
            <div>
              <strong className="text-brand-terracota block">¿Eres caficultor y buscas comercializar tu cosecha?</strong>
              <span className="leading-relaxed">
                En caso de que tu cosecha sea aprobada por la empresa aliada, podrás formalizar tu venta directa con garantía de precio justo.{' '}
                <button
                  type="button"
                  onClick={onOpenEmpresasModal}
                  className="text-brand-terracota font-extrabold underline hover:text-primary-800 cursor-pointer"
                >
                  Haz click aquí para abrir el Directorio & Mapa de Empresas Regionales
                </button>.
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre Completo y País */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nombreCompleto"
                  className="block text-xs font-bold text-surface-800 mb-1.5"
                >
                  Nombre Completo *
                </label>
                <Input
                  id="nombreCompleto"
                  required
                  placeholder="Ej. Carlos Restrepo"
                  value={form.nombreCompleto}
                  onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                />
              </div>

              <div>
                <label
                  htmlFor="pais"
                  className="block text-xs font-bold text-surface-800 mb-1.5"
                >
                  País *
                </label>
                <select
                  id="pais"
                  value={form.pais}
                  onChange={(e) => setForm({ ...form, pais: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                >
                  {PAISES_OPCIONES.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Correo y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-surface-800 mb-1.5"
                >
                  Correo Electrónico *
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="carlos@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="block text-xs font-bold text-surface-800 mb-1.5"
                >
                  Teléfono / WhatsApp
                </label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
            </div>

            {/* Tipo de Solicitud (PQRS) */}
            <div>
              <label
                htmlFor="tipoPqrs"
                className="block text-xs font-bold text-surface-800 mb-1.5"
              >
                Tipo de Solicitud / PQRS *
              </label>
              <select
                id="tipoPqrs"
                value={form.tipoPqrs}
                onChange={(e) => setForm({ ...form, tipoPqrs: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Información de Café / Lotes">Información sobre Café & Muestras</option>
                <option value="Registro de Caficultor">Registro de Caficultor / Finca</option>
                <option value="Compra Mayorista / Contenedores">Compra Internacional de Lotes</option>
                <option value="Alianza Comercial">Alianza Comercial o Institucional</option>
                <option value="Petición o Reclamo">Petición, Queja o Reclamo (PQRS)</option>
                <option value="Sugerencia">Sugerencia</option>
              </select>
            </div>

            {/* Mensaje */}
            <div>
              <label
                htmlFor="mensaje"
                className="block text-xs font-bold text-surface-800 mb-1.5"
              >
                Mensaje o Detalle del Requerimiento *
              </label>
              <textarea
                id="mensaje"
                required
                rows={4}
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                placeholder="Escribe aquí tu consulta, lote de interés o detalles de tu proyecto..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange placeholder-surface-400"
              />
            </div>

            {/* Adjuntar Archivo */}
            <div>
              <label
                htmlFor="archivo"
                className="block text-xs font-bold text-surface-800 mb-1.5"
              >
                Adjuntar Archivo (Opcional - PDF, JPG, PNG máx. 10MB)
              </label>
              <div className="relative">
                <input
                  id="archivo"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                />
                <label
                  htmlFor="archivo"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-dashed border-surface-300 hover:border-brand-orange bg-surface-50 text-surface-600 text-xs cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-brand-terracota" />
                    <span>{fileName || 'Seleccionar archivo desde tu dispositivo...'}</span>
                  </span>
                  {fileName && (
                    <span className="text-brand-terracota font-semibold flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      Listo
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Checkbox Términos */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="aceptaTerminos"
                type="checkbox"
                checked={form.aceptaTerminos}
                onChange={(e) => setForm({ ...form, aceptaTerminos: e.target.checked })}
                className="h-4 w-4 mt-0.5 rounded border-surface-300 text-brand-orange focus:ring-brand-orange"
              />
              <label htmlFor="aceptaTerminos" className="text-xs text-surface-600 leading-normal">
                Acepto el tratamiento de mis datos de acuerdo con la{' '}
                <a href="/privacy" className="text-brand-terracota font-bold hover:underline">
                  Política de Privacidad
                </a>{' '}
                de ConexCoffee.
              </label>
            </div>

            {/* Botón Enviar */}
            <div className="pt-2">
              <div
                ref={submitBtnRef}
                onMouseEnter={() => handleBtnHover(true)}
                onMouseLeave={() => handleBtnHover(false)}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full gap-2 bg-brand-orange hover:bg-brand-terracota text-white font-bold tracking-wide shadow-md hover:shadow-lg transition-shadow"
                >
                  <Send className="h-4 w-4" />
                  <span>ENVIAR MENSAJE</span>
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
