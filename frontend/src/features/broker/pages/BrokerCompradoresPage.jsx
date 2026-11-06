import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Coffee,
  Calendar,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';

export default function BrokerCompradoresPage() {
  const navigate = useNavigate();
  const { compradores, eventos, invitarCompradoresAEvento } = useBroker();
  const [searchTerm, setSearchTerm] = useState('');
  const [paisFiltro, setPaisFiltro] = useState('todos');
  const [compradorParaInvitar, setCompradorParaInvitar] = useState(null);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState(eventos[0]?.id || '');

  // Países únicos
  const paisesUnicos = useMemo(() => {
    return Array.from(new Set(compradores.map((c) => c.pais).filter(Boolean)));
  }, [compradores]);

  // Filtrado
  const compradoresFiltrados = useMemo(() => {
    return compradores.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        c.nombre?.toLowerCase().includes(term) ||
        c.empresa?.toLowerCase().includes(term) ||
        c.cargo?.toLowerCase().includes(term) ||
        c.ciudad?.toLowerCase().includes(term) ||
        c.correo?.toLowerCase().includes(term) ||
        c.perfil_preferencia?.toLowerCase().includes(term);

      const matchPais = paisFiltro === 'todos' || c.pais === paisFiltro;

      return matchSearch && matchPais;
    });
  }, [compradores, searchTerm, paisFiltro]);

  const handleInvitarAEvento = (e) => {
    e.preventDefault();
    if (!compradorParaInvitar || !eventoSeleccionadoId) return;

    invitarCompradoresAEvento(eventoSeleccionadoId, [compradorParaInvitar]);
    setCompradorParaInvitar(null);
  };

  const getWhatsAppLink = (c) => {
    const cleanPhone = (c.telefono || '').replace(/[^\d]/g, '');
    const mensaje = encodeURIComponent(
      `Hola ${c.nombre}, te saluda tu Broker Internacional de ConexCoffee. Te comparto las nuevas ofertas de café de especialidad disponibles y los próximos contenedores programados. ¿Tienes disponibilidad para una breve llamada esta semana?`
    );
    return `https://wa.me/${cleanPhone}?text=${mensaje}`;
  };

  const getMailtoLink = (c) => {
    const subject = encodeURIComponent(`Novedades de Cosecha & Ofertas de Café Especial — ConexCoffee`);
    const body = encodeURIComponent(
      `Estimado/a ${c.nombre},\n\nEs un placer saludarte.\n\nDesde ConexCoffee queremos compartirte las nuevas disponibilidades de café de especialidad de origen colombiano, perfiles sensoriales certificados y los contenedores marítimos en consolidación para ${c.pais}.\n\nQuedo a tu total disposición para coordinar muestras o agendar una sesión privada.\n\nAtentamente,\nTu Broker ConexCoffee`
    );
    return `mailto:${c.correo}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Oficial */}
      <ModuloCabecera
        titulo="Directorio de Compradores Internacionales"
        subtitulo="Cartera de tostadurías e importadores globales, historial comercial, perfiles de preferencia y contacto directo"
        imagenPortada="/images/portadas/comprador.jpg"
        mensaje="Comunícate en un clic por WhatsApp o correo electrónico para coordinar muestras, contratos e invitar a eventos de catación."
        icono={Users}
        totalRegistros={compradoresFiltrados.length}
        etiqueta="Relación con Compradores Broker"
      />

      {/* Buscador y Filtro por País */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, tostaduría, cargo o país…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5 text-surface-400" />
            <select
              value={paisFiltro}
              onChange={(e) => setPaisFiltro(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium text-surface-700 outline-none cursor-pointer"
            >
              <option value="todos">Todos los países</option>
              {paisesUnicos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/broker/eventos')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-tint hover:bg-brand-tint/80 text-brand-terracota border border-brand-terracota/20 transition-all cursor-pointer shadow-2xs"
        >
          <Calendar className="h-4 w-4" />
          <span>Ver Centro de Eventos</span>
        </button>
      </div>

      {/* Grid de Compradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {compradoresFiltrados.map((comp) => (
          <div
            key={comp.id}
            className="bg-white rounded-2xl border border-surface-200 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header Comprador */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand-terracota/10 flex items-center justify-center text-brand-terracota font-bold text-base shrink-0 border border-brand-terracota/20">
                    {comp.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-surface-900 leading-snug">
                      {comp.nombre}
                    </h3>
                    <p className="text-xs text-surface-500 font-medium">
                      {comp.cargo} en <strong className="text-surface-700">{comp.empresa}</strong>
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-surface-700 bg-surface-100 px-2.5 py-1 rounded-full">
                  <Globe className="h-3 w-3 text-brand-orange" />
                  {comp.pais}
                </span>
              </div>

              {/* Datos de Contacto Rápidos */}
              <div className="space-y-1.5 text-xs text-surface-600 bg-surface-50 p-3 rounded-xl border border-surface-200 mb-3">
                <p className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-brand-terracota shrink-0" />
                  <span className="font-mono text-surface-800">{comp.correo}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-brand-green shrink-0" />
                  <span className="font-mono text-surface-800">{comp.telefono_formato || comp.telefono}</span>
                </p>
                <p className="flex items-center gap-2 text-surface-500">
                  <Globe className="h-3.5 w-3.5 text-surface-400 shrink-0" />
                  <span>{comp.ciudad}, {comp.pais}</span>
                </p>
              </div>

              {/* Preferencias de Café */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Coffee className="h-3 w-3 text-brand-orange" />
                  <span>Perfil de Café Preferido</span>
                </p>
                <p className="text-xs text-surface-700 italic bg-amber-50/60 p-2.5 rounded-xl border border-brand-orange/20">
                  "{comp.perfil_preferencia}"
                </p>
              </div>

              {/* Resumen Comercial */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-200">
                  <p className="text-[10px] text-surface-500 font-semibold uppercase">Total Compras</p>
                  <p className="font-black text-surface-900 text-sm mt-0.5">
                    {comp.total_sacos_comprados} Sacos
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold">
                    ${comp.total_usd_invertido?.toLocaleString()} USD
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-200">
                  <p className="text-[10px] text-surface-500 font-semibold uppercase">Muestras Pre-Compra</p>
                  <p className="font-black text-surface-900 text-sm mt-0.5">
                    {comp.muestras_solicitadas_count} Solicitadas
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-brand-terracota">
                    {comp.estado_relacion}
                  </span>
                </div>
              </div>
            </div>

            {/* Botonera de Contacto e Invitación */}
            <div className="pt-3 border-t border-surface-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppLink(comp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  title="Abrir WhatsApp con mensaje pre-redactado"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={getMailtoLink(comp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs border border-surface-200 shadow-2xs transition-all cursor-pointer"
                  title="Enviar correo electrónico"
                >
                  <Mail className="h-3.5 w-3.5 text-brand-terracota" />
                  <span>Correo</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setCompradorParaInvitar(comp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Invitar a Evento</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Invitar Comprador a Evento */}
      <ModalBase
        isOpen={Boolean(compradorParaInvitar)}
        onClose={() => setCompradorParaInvitar(null)}
        title={`Invitar a ${compradorParaInvitar?.nombre} a un Evento`}
        size="md"
      >
        {compradorParaInvitar && (
          <form onSubmit={handleInvitarAEvento} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl">
              <p className="font-bold text-surface-900">{compradorParaInvitar.nombre}</p>
              <p className="text-xs text-surface-500">{compradorParaInvitar.empresa} — {compradorParaInvitar.pais}</p>
              <p className="text-xs text-surface-500 font-mono mt-0.5">{compradorParaInvitar.correo}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                Selecciona el Evento o Sesión de Catación *
              </label>
              <select
                required
                value={eventoSeleccionadoId}
                onChange={(e) => setEventoSeleccionadoId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota cursor-pointer"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.titulo} ({ev.fecha} — {ev.tipo})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-brand-orange/20 text-xs text-surface-700">
              <p className="font-bold text-amber-900 mb-0.5">Mensaje Automático de Invitación</p>
              <p className="italic">
                Se enviará una invitación formal a {compradorParaInvitar.nombre} con el enlace de acceso y detalles de las muestras para la catación.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setCompradorParaInvitar(null)}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-terracota hover:bg-brand-orange text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Confirmar y Registrar Invitación
              </button>
            </div>
          </form>
        )}
      </ModalBase>
    </div>
  );
}

