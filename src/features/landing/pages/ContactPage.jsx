import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Paperclip,
  CheckCircle2,
  Building2,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useSEO } from '@/hooks';
import { sanitizeHTML } from '@/lib/sanitize';
import EmpresasRegionalesModal from '../components/EmpresasRegionalesModal';

// ============================================
// ContactPage — Página Oficial de Contáctanos & PQRS
// ============================================

// Preguntas frecuentes auténticas de ConexCoffee
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

// Listado de países para el selector
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

export default function ContactPage() {
  useSEO({
    title: 'Contacto y PQRS | Atención al Cliente',
    description: 'Comunícate con el equipo de ConexCoffee. Atención a caficultores, empresas compradoras, brokers y laboratorios de café.',
  });

  const [openFaq, setOpenFaq] = useState(1); // Primer FAQ abierto por defecto
  const [isEmpresasModalOpen, setIsEmpresasModalOpen] = useState(false);
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
    }, 700);
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      {/* 1. HERO CABECERA CON IMAGEN OFICIAL */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/pagina-web/contact_us/bg_contact_us.png')",
          }}
        />
        {/* Capa de oscurecimiento sólido para contraste (sin gradientes) */}
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#AD2E01]/30 border border-[#F25433]/50 text-[#F25433] text-xs font-bold uppercase tracking-wider mb-4">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Canales Oficiales de Atención</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase mb-4">
            Contáctanos
          </h1>

          <p className="text-surface-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para conectar tu pasión por el café de especialidad con el mercado global.
            Escríbenos, llámanos o radícanos tus consultas y solicitudes PQRS.
          </p>
        </div>
      </section>

      {/* ====================================================
          2. CINTA DE PRIMER PLANO: ATENCIÓN AL CAFICULTOR
          ==================================================== */}
      <section className="relative z-20 -mt-10 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div
          className="relative p-6 sm:p-8 rounded-xl shadow-xl border-2 border-[#AD2E01] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/pagina-web/background-cafe-conexcoffee-two.png')",
            backgroundColor: '#F25433',
          }}
        >
          {/* Capa sólida de tinte terracota (sin gradientes) */}
          <div className="absolute inset-0 bg-[#AD2E01]/90" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-[#F25433]" />
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
                type="button"
                onClick={() => setIsEmpresasModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-[#AD2E01] hover:bg-surface-50 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <MapPin className="h-4 w-4 text-[#F25433] group-hover:scale-110 transition-transform" />
                <span>Explorar Empresas Regionales en el Mapa &gt;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TARJETAS DE CONTACTO DIRECTO (3 CANALES OFICIALES) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ubicación */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-surface-200 shadow-md flex flex-col justify-between hover:border-[#F25433]/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#fee8e3] text-[#AD2E01] flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#AD2E01] block mb-1">
                Sede Principal
              </span>
              <h2 className="text-xl font-extrabold text-surface-900 mb-2">UBICACIÓN</h2>
              <p className="text-sm font-semibold text-surface-800 mb-1">Tecnicafé</p>
              <p className="text-xs text-surface-500 leading-relaxed">
                Parque Tecnológico de Innovación en Café, Cajibío — Cauca, Colombia.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-100 flex items-center gap-1.5 text-xs font-semibold text-[#AD2E01]">
              <Building2 className="h-3.5 w-3.5" />
              <span>Centro de Innovación & Calidad</span>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-surface-200 shadow-md flex flex-col justify-between hover:border-[#F25433]/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#fee8e3] text-[#AD2E01] flex items-center justify-center mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#AD2E01] block mb-1">
                Escríbenos Directamente
              </span>
              <h2 className="text-xl font-extrabold text-surface-900 mb-2">CORREO</h2>
              <a
                href="mailto:conexcoffe@gmail.com"
                className="text-sm font-bold text-[#F25433] hover:text-[#AD2E01] transition-colors break-all"
              >
                conexcoffe@gmail.com
              </a>
              <p className="text-xs text-surface-500 leading-relaxed mt-1">
                Atención a consultas comerciales, registros y alianzas internacionales.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-100 flex items-center gap-1.5 text-xs font-semibold text-surface-600">
              <Clock className="h-3.5 w-3.5 text-[#AD2E01]" />
              <span>Respuesta en menos de 24 horas</span>
            </div>
          </div>

          {/* WhatsApp Directo */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-surface-200 shadow-md flex flex-col justify-between hover:border-[#F25433]/40 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#fee8e3] text-[#AD2E01] flex items-center justify-center mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#AD2E01] block mb-1">
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
                className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-white bg-[#AD2E01] hover:bg-[#8c2503] rounded-lg transition-colors cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Chatear por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN PRINCIPAL: PREGUNTAS FRECUENTES + FORMULARIO */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Columna Izquierda: Preguntas Frecuentes (FAQ Interactivo) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[#AD2E01] font-bold text-xs uppercase tracking-widest mb-2">
                <HelpCircle className="h-4 w-4" />
                <span>Resolución Rápida</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
                Preguntas Frecuentes
              </h2>
              <div className="w-16 h-1 bg-[#F25433] rounded-full mt-3 mb-4" />
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
                    className="border border-surface-200 rounded-xl bg-white overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(item.id)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-surface-900 hover:text-[#AD2E01] transition-colors cursor-pointer"
                    >
                      <span className="pr-4 leading-snug">{item.pregunta}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#AD2E01] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-surface-600 leading-relaxed border-t border-surface-100 bg-surface-50/50">
                        {item.respuesta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tarjeta de soporte adicional */}
            <div className="p-6 rounded-xl bg-stone-900 text-white border border-stone-800">
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#F25433]" />
                <span>Horario de Atención Oficial</span>
              </h3>
              <p className="text-xs text-surface-300 leading-relaxed mb-3">
                Nuestro equipo técnico y administrativo atiende de Lunes a Viernes de 8:00 AM a 6:00 PM
                y Sábados de 8:00 AM a 1:00 PM (Hora Colombia, GMT-5).
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F25433]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Atención prioritaria a productores y tostadores</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Contacto & PQRS */}
          <div className="lg:col-span-6">
            <Card className="p-6 sm:p-10 border border-surface-200 shadow-lg bg-white">
              <div className="mb-6">
                <span className="text-[#AD2E01] font-bold text-xs uppercase tracking-widest block mb-1">
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
              <div className="mb-5 p-3.5 rounded-lg bg-[#fee8e3] border-l-4 border-[#AD2E01] text-xs text-surface-800 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#AD2E01] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#AD2E01] block">¿Eres caficultor y buscas comercializar tu cosecha?</strong>
                  <span className="leading-relaxed">
                    En caso de que tu cosecha sea aprobada por la empresa aliada, podrás formalizar tu venta directa con garantía de precio justo.{' '}
                    <button
                      type="button"
                      onClick={() => setIsEmpresasModalOpen(true)}
                      className="text-[#AD2E01] font-extrabold underline hover:text-[#8c2503] cursor-pointer"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F25433]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F25433]"
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#F25433] placeholder-surface-400"
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
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-dashed border-surface-300 hover:border-[#F25433] bg-surface-50 text-surface-600 text-xs cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-[#AD2E01]" />
                        <span>{fileName || 'Seleccionar archivo desde tu dispositivo...'}</span>
                      </span>
                      {fileName && (
                        <span className="text-[#AD2E01] font-semibold flex items-center gap-1">
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
                    className="h-4 w-4 mt-0.5 rounded border-surface-300 text-[#F25433] focus:ring-[#F25433]"
                  />
                  <label htmlFor="aceptaTerminos" className="text-xs text-surface-600 leading-normal">
                    Acepto el tratamiento de mis datos de acuerdo con la{' '}
                    <a href="/privacy" className="text-[#AD2E01] font-bold hover:underline">
                      Política de Privacidad
                    </a>{' '}
                    de ConexCoffee.
                  </label>
                </div>

                {/* Botón Enviar */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submitting}
                    className="w-full gap-2 bg-[#F25433] hover:bg-[#AD2E01] text-white font-bold tracking-wide"
                  >
                    <Send className="h-4 w-4" />
                    <span>ENVIAR MENSAJE</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. SEDE TECNICAFÉ INSTITUCIONAL */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="bg-stone-900 text-white p-8 sm:p-10 rounded-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F25433]">
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
              href="https://tecnicafe.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-700 bg-stone-800 text-white hover:bg-stone-700 hover:border-stone-500 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Conoce Más de Tecnicafé</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. MODAL DE EMPRESAS REGIONALES & FORMULARIO DE COSECHA */}
      <EmpresasRegionalesModal
        isOpen={isEmpresasModalOpen}
        onClose={() => setIsEmpresasModalOpen(false)}
      />
    </div>
  );
}
