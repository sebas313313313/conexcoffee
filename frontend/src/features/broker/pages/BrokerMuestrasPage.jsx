import { useState, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  MessageCircle,
  Mail,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Coffee,
  Globe,
  MapPin,
  Sparkles,
  ChevronRight,
  Eye,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';

export default function BrokerMuestrasPage() {
  const { muestras, actualizarEstadoMuestra } = useBroker();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [muestraSeleccionada, setMuestraSeleccionada] = useState(null);
  const [modalFeedbackAbierto, setModalFeedbackAbierto] = useState(false);
  const [feedbackMuestra, setFeedbackMuestra] = useState(null);
  const [nuevoFeedbackTexto, setNuevoFeedbackTexto] = useState('');
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('');

  // Filtrado
  const muestrasFiltradas = useMemo(() => {
    return muestras.filter((m) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        m.codigo?.toLowerCase().includes(term) ||
        m.comprador_nombre?.toLowerCase().includes(term) ||
        m.comprador_empresa?.toLowerCase().includes(term) ||
        m.pais?.toLowerCase().includes(term) ||
        m.lote_solicitado?.toLowerCase().includes(term) ||
        m.guia_tracking?.toLowerCase().includes(term);

      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'aprobadas' && m.estado?.includes('Aprobada')) ||
        (filtroEstado === 'transito' && m.estado?.includes('Tránsito')) ||
        (filtroEstado === 'entregadas' && m.estado?.includes('Entregada')) ||
        (filtroEstado === 'preparacion' && m.estado?.includes('Preparación'));

      return matchSearch && matchEstado;
    });
  }, [muestras, searchTerm, filtroEstado]);

  // Generar link WhatsApp con mensaje pre-rellenado
  const getWhatsAppLink = (m) => {
    const cleanPhone = (m.telefono || '').replace(/[^\d+]/g, '');
    const mensaje = encodeURIComponent(
      `Hola ${m.comprador_nombre}, te saluda tu Broker Internacional de ConexCoffee. Te contacto sobre tu solicitud de muestra ${m.codigo} para el lote ${m.variedad}. ¿Cómo van las pruebas de tostión y catación? Quedo atento a tus comentarios.`
    );
    return `https://wa.me/${cleanPhone.replace('+', '')}?text=${mensaje}`;
  };

  // Generar link mailto
  const getMailtoLink = (m) => {
    const subject = encodeURIComponent(`Seguimiento Muestra de Café ConexCoffee — ${m.codigo}`);
    const body = encodeURIComponent(
      `Estimado/a ${m.comprador_nombre},\n\nEspero que te encuentres muy bien.\n\nTe contacto desde ConexCoffee respecto a la muestra solicitada:\n- Lote: ${m.lote_solicitado}\n- Guía Courier: ${m.courier} (${m.guia_tracking})\n- Estado actual: ${m.estado}\n\nNos encantaría conocer tus notas de catación y perfil sensorial para coordinar la reserva en los próximos contenedores marítimos.\n\nCordialmente,\nTu Broker ConexCoffee`
    );
    return `mailto:${m.correo}?subject=${subject}&body=${body}`;
  };

  const abrirModalFeedback = (m) => {
    setFeedbackMuestra(m);
    setNuevoFeedbackTexto(m.notas_catacion_comprador || '');
    setNuevoEstadoSeleccionado(m.estado || 'Catada con Éxito (Compra Aprobada)');
    setModalFeedbackAbierto(true);
  };

  const guardarFeedbackYEstado = (e) => {
    e.preventDefault();
    if (!feedbackMuestra) return;

    actualizarEstadoMuestra(feedbackMuestra.id, nuevoEstadoSeleccionado);
    toast.success('Actualizado seguimiento de catación del comprador');
    setModalFeedbackAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial */}
      <ModuloCabecera
        titulo="Muestras Solicitadas por Compradores (Pre-Compra)"
        subtitulo="Identifica quién solicitó muestras físicas de café antes de comprar, guía DHL y canales de contacto directo"
        imagenPortada="/images/portadas/analisis-sensorial.jpg"
        mensaje="Facilita el cierre comercial: contacta al comprador por WhatsApp o correo para consultar su feedback de catación."
        icono={FlaskConical}
        totalRegistros={muestrasFiltradas.length}
        etiqueta="Gestión Pre-Compra Broker"
      />

      {/* Buscador y Filtro de Estados */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por comprador, tostaduría, lote o guía DHL…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-surface-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium text-surface-700 outline-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="aprobadas">Compra Aprobada ⭐</option>
              <option value="entregadas">Muestra Entregada</option>
              <option value="transito">En Tránsito Courier</option>
              <option value="preparacion">En Preparación Lab</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-surface-500 self-end sm:self-center">
          {muestrasFiltradas.filter((m) => m.estado.includes('Aprobada')).length} muestras convertidas en compras
        </div>
      </div>

      {/* Listado de Muestras */}
      {muestrasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center shadow-2xs">
          <FlaskConical className="h-12 w-12 text-surface-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-surface-800">No se encontraron solicitudes de muestras</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            Ajusta los filtros de búsqueda o ingresa nuevas solicitudes desde el catálogo de Ofertas Libres.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {muestrasFiltradas.map((m) => {
            const esAprobada = m.estado.includes('Aprobada');
            const esTransito = m.estado.includes('Tránsito');
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-surface-200 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-100">
                  {/* Info Comprador y Empresa */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0 mt-0.5">
                      <Coffee className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-surface-500 bg-surface-100 px-2.5 py-0.5 rounded-md">
                          {m.codigo}
                        </span>
                        <h3 className="font-extrabold text-base text-surface-900">
                          {m.comprador_nombre}
                        </h3>
                        <span className="text-xs font-bold text-surface-700 bg-surface-50 border border-surface-200 px-2.5 py-0.5 rounded-full">
                          {m.comprador_empresa}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-terracota bg-brand-tint px-2 py-0.5 rounded-md">
                          <Globe className="h-3 w-3" />
                          {m.ciudad}, {m.pais}
                        </span>
                      </div>

                      <p className="text-xs text-surface-600 font-medium">
                        Lote Solicitado: <strong>{m.lote_solicitado}</strong> ({m.gramos}g — {m.tipo_muestra})
                      </p>
                    </div>
                  </div>

                  {/* Estado Badge & Tracking */}
                  <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                          esAprobada
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : esTransito
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{m.estado}</span>
                      </span>
                      <p className="text-[11px] text-surface-400 mt-1 font-mono">
                        {m.courier}: {m.guia_tracking}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feedback del Comprador & Botones de Contacto */}
                <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  {/* Feedback notes */}
                  <div className="flex-1 bg-surface-50 p-3 rounded-xl border border-surface-200">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-0.5">
                      Feedback de Catación & Pruebas
                    </p>
                    <p className="text-surface-700 italic">
                      "{m.notas_catacion_comprador || 'A la espera de recepción y protocolo de tueste por el cliente.'}"
                    </p>
                    <p className="text-[10px] text-surface-400 mt-1">
                      Fecha entrega: <strong>{m.fecha_entrega}</strong> | Solicitado: {m.fecha_solicitud}
                    </p>
                  </div>

                  {/* Acciones de Contacto Inmediato */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Botón WhatsApp */}
                    <a
                      href={getWhatsAppLink(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                      title={`Enviar WhatsApp a ${m.comprador_nombre}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Botón Correo */}
                    <a
                      href={getMailtoLink(m)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs border border-surface-200 shadow-2xs transition-all cursor-pointer"
                      title={`Enviar correo a ${m.correo}`}
                    >
                      <Mail className="h-3.5 w-3.5 text-brand-terracota" />
                      <span>Correo</span>
                    </a>

                    {/* Botón Actualizar Estado */}
                    <button
                      type="button"
                      onClick={() => abrirModalFeedback(m)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-brand-tint border border-surface-200 text-brand-terracota font-bold text-xs shadow-2xs transition-all cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Feedback</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registrar Feedback y Actualizar Estado */}
      <ModalBase
        isOpen={modalFeedbackAbierto}
        onClose={() => setModalFeedbackAbierto(false)}
        title="Actualizar Seguimiento de la Muestra"
        size="md"
      >
        {feedbackMuestra && (
          <form onSubmit={guardarFeedbackYEstado} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl">
              <p className="font-bold text-surface-900">{feedbackMuestra.comprador_nombre} ({feedbackMuestra.comprador_empresa})</p>
              <p className="text-xs text-surface-500 mt-0.5">Lote: {feedbackMuestra.lote_solicitado}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Estado del Proceso Pre-Compra *
              </label>
              <select
                value={nuevoEstadoSeleccionado}
                onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
              >
                <option value="En Preparación en Laboratorio">En Preparación en Laboratorio</option>
                <option value="En Tránsito Internacional">En Tránsito Internacional (DHL)</option>
                <option value="Muestra Entregada (Esperando Feedback)">Muestra Entregada (Esperando Feedback)</option>
                <option value="Catada con Éxito (Compra Aprobada)">Catada con Éxito (Compra Aprobada) ⭐</option>
                <option value="Muestra Descartada / Sin Compra">Muestra Descartada / Sin Compra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Feedback Sensorial & Comentarios del Cliente
              </label>
              <textarea
                rows={3}
                placeholder="Escribe el puntaje otorgado por el comprador, notas de tueste o interés en volumen de sacos..."
                value={nuevoFeedbackTexto}
                onChange={(e) => setNuevoFeedbackTexto(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setModalFeedbackAbierto(false)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Guardar Seguimiento
              </button>
            </div>
          </form>
        )}
      </ModalBase>
    </div>
  );
}

