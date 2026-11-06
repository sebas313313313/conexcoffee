import { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Users,
  Coffee,
  Globe,
  ExternalLink,
  MessageCircle,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';

export default function BrokerEventosPage() {
  const {
    eventos,
    compradores,
    crearEvento,
    invitarCompradoresAEvento,
    cambiarEstadoInvitacion,
  } = useBroker();

  const [searchTerm, setSearchTerm] = useState('');
  const [eventoExpandidoId, setEventoExpandidoId] = useState(eventos[0]?.id || null);

  // Modales
  const [modalNuevoEvento, setModalNuevoEvento] = useState(false);
  const [modalInvitar, setModalInvitar] = useState(false);
  const [eventoParaInvitar, setEventoParaInvitar] = useState(null);
  const [compradoresSeleccionadosIds, setCompradoresSeleccionadosIds] = useState([]);

  // Form Nuevo Evento
  const [formNuevo, setFormNuevo] = useState({
    titulo: '',
    tipo: 'Catación Virtual (Live Cupping)',
    fecha: '',
    hora: '10:00 AM EST',
    modalidad: 'Virtual (Zoom Privado con Kit de Muestras DHL)',
    enlace_reunion: 'https://zoom.us/j/',
    ubicacion: 'Plataforma Virtual + Envío previo de muestras por courier',
    descripcion: '',
    lotes_a_catar: '',
  });

  // Filtrado
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      const term = searchTerm.toLowerCase().trim();
      return (
        !term ||
        ev.titulo?.toLowerCase().includes(term) ||
        ev.tipo?.toLowerCase().includes(term) ||
        ev.descripcion?.toLowerCase().includes(term) ||
        ev.lotes_a_catar?.some((l) => l.toLowerCase().includes(term))
      );
    });
  }, [eventos, searchTerm]);

  // Manejador Crear Evento
  const handleGuardarNuevoEvento = (e) => {
    e.preventDefault();
    if (!formNuevo.titulo.trim() || !formNuevo.fecha.trim()) {
      toast.error('Complete el título y la fecha del evento');
      return;
    }

    const lotesArray = formNuevo.lotes_a_catar
      ? formNuevo.lotes_a_catar.split(',').map((l) => l.trim()).filter(Boolean)
      : ['Geisha La Bonita 89.25 SCA', 'Pink Bourbon 88.5 SCA'];

    crearEvento({
      ...formNuevo,
      lotes_a_catar: lotesArray,
      estado: 'Inscripciones Abiertas',
      invitados: [],
    });

    setModalNuevoEvento(false);
    setFormNuevo({
      titulo: '',
      tipo: 'Catación Virtual (Live Cupping)',
      fecha: '',
      hora: '10:00 AM EST',
      modalidad: 'Virtual (Zoom Privado con Kit de Muestras DHL)',
      enlace_reunion: 'https://zoom.us/j/',
      ubicacion: 'Plataforma Virtual + Envío previo de muestras por courier',
      descripcion: '',
      lotes_a_catar: '',
    });
  };

  // Abrir Modal Invitar
  const abrirModalInvitar = (ev) => {
    setEventoParaInvitar(ev);
    const yaInvitadosIds = new Set((ev.invitados || []).map((i) => i.comprador_id));
    // Preseleccionar los que no han sido invitados
    const noInvitados = compradores.filter((c) => !yaInvitadosIds.has(c.id)).map((c) => c.id);
    setCompradoresSeleccionadosIds(noInvitados.length > 0 ? noInvitados : []);
    setModalInvitar(true);
  };

  const toggleSeleccionComprador = (id) => {
    setCompradoresSeleccionadosIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const seleccionarTodosLosCompradores = () => {
    if (compradoresSeleccionadosIds.length === compradores.length) {
      setCompradoresSeleccionadosIds([]);
    } else {
      setCompradoresSeleccionadosIds(compradores.map((c) => c.id));
    }
  };

  const handleEnviarInvitaciones = (e) => {
    e.preventDefault();
    if (!eventoParaInvitar || compradoresSeleccionadosIds.length === 0) {
      toast.error('Selecciona al menos un comprador para invitar');
      return;
    }

    const seleccionados = compradores.filter((c) =>
      compradoresSeleccionadosIds.includes(c.id)
    );

    invitarCompradoresAEvento(eventoParaInvitar.id, seleccionados);
    setModalInvitar(false);
  };

  // Mensaje para WhatsApp / Correo individual de invitación
  const getWhatsAppInvitacionLink = (ev, inv) => {
    const comp = compradores.find((c) => c.id === inv.comprador_id) || inv;
    const cleanPhone = (comp.telefono || '').replace(/[^\d]/g, '');
    const mensaje = encodeURIComponent(
      `Hola ${inv.nombre}, te saluda tu Broker ConexCoffee. Estás cordialmente invitado/a a nuestro evento exclusivo:\n\n"${ev.titulo}"\n📅 Fecha: ${ev.fecha} — ${ev.hora}\n☕ Modalidad: ${ev.modalidad}\n🔗 Enlace de acceso: ${ev.enlace_reunion}\n\nTe enviaremos el kit de muestras previo al evento. Por favor confírmanos tu asistencia. ¡Será un placer contar contigo!`
    );
    return `https://wa.me/${cleanPhone}?text=${mensaje}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial */}
      <ModuloCabecera
        titulo="Centro de Eventos & Cataciones de Café"
        subtitulo="Organiza sesiones de catación en vivo, subastas privadas y envía invitaciones personalizadas a tus compradores internacionales"
        imagenPortada="/images/portadas/catador.jpg"
        mensaje="Fomenta la relación comercial: invita a compradores que ya te han comprado o solicitado muestras para catar nuevas cosechas."
        icono={Calendar}
        totalRegistros={eventosFiltrados.length}
        onRegistrar={() => setModalNuevoEvento(true)}
        textoBotonRegistrar="Programar Evento"
        etiqueta="Gestión Comercial & Cataciones"
      />

      {/* Buscador y Botón Crear */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar evento por título, tipo o lote a catar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <button
          type="button"
          onClick={() => setModalNuevoEvento(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-terracota hover:bg-brand-orange text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Evento de Catación</span>
        </button>
      </div>

      {/* Lista de Eventos del Broker */}
      <div className="space-y-6">
        {eventosFiltrados.map((ev) => {
          const expandido = eventoExpandidoId === ev.id;
          const totalInvitados = ev.invitados?.length || 0;
          const confirmados = ev.invitados?.filter((i) => i.estado_invitacion === 'Confirmado').length || 0;

          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden transition-all duration-200"
            >
              {/* Header Evento */}
              <div
                onClick={() => setEventoExpandidoId(expandido ? null : ev.id)}
                className="p-5 sm:p-6 bg-surface-50/70 border-b border-surface-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-terracota/10 flex items-center justify-center text-brand-terracota shrink-0 mt-0.5">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-block text-xs font-bold text-white bg-brand-terracota px-2.5 py-0.5 rounded-full shadow-2xs">
                        {ev.tipo}
                      </span>
                      <h3 className="font-extrabold text-base text-surface-900 leading-snug">
                        {ev.titulo}
                      </h3>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        {ev.estado}
                      </span>
                    </div>

                    <p className="text-xs text-surface-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>📅 <strong>Fecha:</strong> {ev.fecha} — {ev.hora}</span>
                      <span>•</span>
                      <span>🌐 <strong>Modalidad:</strong> {ev.modalidad}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-center">
                  {/* Conteo de Invitados */}
                  <div className="text-right">
                    <p className="text-xs text-surface-500 font-medium">Asistencia</p>
                    <p className="text-sm font-black text-surface-900">
                      {confirmados} Confirmados{' '}
                      <span className="text-xs font-normal text-surface-500">
                        ({totalInvitados} invitados)
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModalInvitar(ev);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-terracota hover:bg-brand-orange text-white shadow-2xs transition-all cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Invitar Compradores</span>
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-white border border-surface-200 text-surface-600 hover:text-surface-900 shadow-2xs"
                  >
                    {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Contenido Expandido: Detalles y Lista de Invitados */}
              {expandido && (
                <div className="p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
                  {/* Descripción y Lotes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                      <p className="text-xs font-bold text-surface-800 uppercase tracking-wider">
                        Descripción del Evento & Objetivos
                      </p>
                      <p className="text-surface-700 leading-relaxed text-xs">
                        {ev.descripcion}
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-xs">
                        <span className="font-bold text-surface-800">Enlace de Conexión:</span>
                        <a
                          href={ev.enlace_reunion}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-terracota hover:underline font-mono inline-flex items-center gap-1 font-semibold"
                        >
                          <span>{ev.enlace_reunion}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/70 border border-brand-orange/20 space-y-2">
                      <p className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                        <Coffee className="h-3.5 w-3.5 text-brand-orange" />
                        <span>Lotes que se Presentarán</span>
                      </p>
                      <ul className="space-y-1.5 pt-1 text-xs text-surface-800">
                        {ev.lotes_a_catar?.map((lote, i) => (
                          <li key={i} className="flex items-center gap-1.5 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-terracota shrink-0" />
                            <span>{lote}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Lista de Compradores Invitados a este Evento */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-surface-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-brand-terracota" />
                        <span>Compradores Invitados ({totalInvitados})</span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => abrirModalInvitar(ev)}
                        className="text-xs font-bold text-brand-terracota hover:underline cursor-pointer"
                      >
                        + Invitar a más compradores
                      </button>
                    </div>

                    {totalInvitados === 0 ? (
                      <div className="p-6 text-center rounded-xl border border-dashed border-surface-300 bg-surface-50 text-surface-500">
                        <p className="text-xs">Aún no has invitado compradores a este evento.</p>
                        <button
                          type="button"
                          onClick={() => abrirModalInvitar(ev)}
                          className="mt-2 text-xs font-bold text-brand-terracota hover:underline cursor-pointer"
                        >
                          Invitar a compradores ahora
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-surface-200">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-surface-100 text-[11px] font-bold text-surface-600 uppercase tracking-wider border-b border-surface-200">
                            <tr>
                              <th className="py-2.5 px-3">Comprador</th>
                              <th className="py-2.5 px-3">Empresa / País</th>
                              <th className="py-2.5 px-3">Estado Invitación</th>
                              <th className="py-2.5 px-3 text-right">Contactar & Modificar</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-100 bg-white">
                            {ev.invitados?.map((inv) => {
                              const esConfirmado = inv.estado_invitacion === 'Confirmado';
                              return (
                                <tr key={inv.comprador_id} className="hover:bg-surface-50 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <p className="font-bold text-surface-900">{inv.nombre}</p>
                                    <p className="text-[11px] text-surface-500">{inv.correo}</p>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <p className="font-semibold text-surface-800">{inv.empresa}</p>
                                    <p className="text-[11px] text-surface-500">{inv.pais}</p>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        esConfirmado
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                                      }`}
                                    >
                                      {esConfirmado ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                      <span>{inv.estado_invitacion}</span>
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* WhatsApp invitación */}
                                      <a
                                        href={getWhatsAppInvitacionLink(ev, inv)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                                        title="Enviar invitación por WhatsApp"
                                      >
                                        <MessageCircle className="h-4 w-4" />
                                      </a>

                                      {/* Cambiar a Confirmado / Pendiente */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          cambiarEstadoInvitacion(
                                            ev.id,
                                            inv.comprador_id,
                                            esConfirmado ? 'Pendiente' : 'Confirmado'
                                          )
                                        }
                                        className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                                          esConfirmado
                                            ? 'bg-white border-surface-200 text-surface-600 hover:bg-surface-100'
                                            : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                        }`}
                                      >
                                        {esConfirmado ? 'Marcar Pendiente' : 'Marcar Confirmado'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Crear Nuevo Evento */}
      <ModalBase
        isOpen={modalNuevoEvento}
        onClose={() => setModalNuevoEvento(false)}
        title="Programar Nuevo Evento o Catación"
        size="lg"
      >
        <form onSubmit={handleGuardarNuevoEvento} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Título del Evento *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Catación Virtual Cosecha Especial Huila 2026"
              value={formNuevo.titulo}
              onChange={(e) => setFormNuevo({ ...formNuevo, titulo: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Tipo de Evento *
              </label>
              <select
                value={formNuevo.tipo}
                onChange={(e) => setFormNuevo({ ...formNuevo, tipo: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
              >
                <option value="Catación Virtual (Live Cupping)">Catación Virtual (Live Cupping)</option>
                <option value="Subasta Privada Online">Subasta Privada Online</option>
                <option value="Mesa Redonda & Negociación Directa">Mesa Redonda & Negociación Directa</option>
                <option value="Webinar de Lanzamiento de Lote">Webinar de Lanzamiento de Lote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Fecha & Hora *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ej: 25 Nov 2026"
                  value={formNuevo.fecha}
                  onChange={(e) => setFormNuevo({ ...formNuevo, fecha: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
                />
                <input
                  type="text"
                  required
                  placeholder="Ej: 10:00 AM EST"
                  value={formNuevo.hora}
                  onChange={(e) => setFormNuevo({ ...formNuevo, hora: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Modalidad
              </label>
              <input
                type="text"
                placeholder="Ej: Virtual (Zoom Privado con Kit DHL)"
                value={formNuevo.modalidad}
                onChange={(e) => setFormNuevo({ ...formNuevo, modalidad: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Enlace de Conexión (Zoom / Meet)
              </label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={formNuevo.enlace_reunion}
                onChange={(e) => setFormNuevo({ ...formNuevo, enlace_reunion: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Lotes de Café que se Cataran (Separados por coma)
            </label>
            <input
              type="text"
              placeholder="Ej: Geisha La Bonita 89.25 SCA, Pink Bourbon Maceración Carbónica, Caturra Chiroso"
              value={formNuevo.lotes_a_catar}
              onChange={(e) => setFormNuevo({ ...formNuevo, lotes_a_catar: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
              Descripción y Agenda del Evento
            </label>
            <textarea
              rows={3}
              placeholder="Explica el objetivo, envío de muestras por courier y quiénes liderarán la sesión..."
              value={formNuevo.descripcion}
              onChange={(e) => setFormNuevo({ ...formNuevo, descripcion: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <button
              type="button"
              onClick={() => setModalNuevoEvento(false)}
              className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
            >
              Crear y Programar Evento
            </button>
          </div>
        </form>
      </ModalBase>

      {/* Modal Invitar Compradores */}
      <ModalBase
        isOpen={modalInvitar}
        onClose={() => setModalInvitar(false)}
        title={`Invitar Compradores a: ${eventoParaInvitar?.titulo}`}
        size="lg"
      >
        {eventoParaInvitar && (
          <form onSubmit={handleEnviarInvitaciones} className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-surface-100">
              <p className="text-xs text-surface-600">
                Selecciona los compradores de tu cartera para enviarles la invitación formal:
              </p>
              <button
                type="button"
                onClick={seleccionarTodosLosCompradores}
                className="text-xs font-bold text-brand-terracota hover:underline cursor-pointer"
              >
                {compradoresSeleccionadosIds.length === compradores.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </button>
            </div>

            {/* Lista con Checkboxes */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {compradores.map((comp) => {
                const seleccionado = compradoresSeleccionadosIds.includes(comp.id);
                const yaInvitado = (eventoParaInvitar.invitados || []).some((i) => i.comprador_id === comp.id);

                return (
                  <label
                    key={comp.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      seleccionado
                        ? 'bg-amber-50/70 border-brand-orange/40 ring-1 ring-brand-orange/20'
                        : 'bg-surface-50 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => toggleSeleccionComprador(comp.id)}
                        className="rounded text-brand-terracota focus:ring-brand-terracota h-4 w-4 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-surface-900">{comp.nombre}</p>
                        <p className="text-xs text-surface-500">
                          {comp.empresa} ({comp.pais}) — {comp.correo}
                        </p>
                      </div>
                    </div>

                    {yaInvitado && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Ya Invitado
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Vista previa del mensaje */}
            <div className="p-3 bg-surface-100 rounded-xl text-xs text-surface-600">
              <p className="font-bold text-surface-800 mb-0.5">Mensaje de Invitación:</p>
              <p className="italic">
                "Estás cordialmente invitado a la sesión '{eventoParaInvitar.titulo}' el {eventoParaInvitar.fecha} ({eventoParaInvitar.hora}). ConexCoffee enviará las muestras oficiales a tu dirección para la catación en vivo."
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setModalInvitar(false)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={compradoresSeleccionadosIds.length === 0}
                className="px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
              >
                Registrar {compradoresSeleccionadosIds.length} Invitaciones
              </button>
            </div>
          </form>
        )}
      </ModalBase>
    </div>
  );
}

