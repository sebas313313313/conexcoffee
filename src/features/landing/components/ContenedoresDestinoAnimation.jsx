import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar,
  ChevronDown,
  CheckCircle2,
  Anchor,
  Compass,
  ArrowRight,
} from 'lucide-react';
import useLanding from '@/hooks/useLanding';
import { CountryFlag } from '../components/Flags';
import BarcoRealistaZoom from '../components/BarcoRealistaZoom';
import ContenedorRealistaViewer from '../components/ContenedorRealistaViewer';

// ==========================================================
// ConexCoffee — ContenedoresDestinoAnimation
// Experiencia Fotorrealista: Buque en Altamar -> Zoom a Cubierta
// -> Terminal de Contenedores Dinámicos (Rol Empresa)
// ==========================================================

export default function ContenedoresDestinoAnimation() {
  const { contenedores: CONTENEDORES_GLOBALES } = useLanding();
  const [selectedPaisId, setSelectedPaisId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollTrackRef = useRef(null);
  const terminalRef = useRef(null);

  const activePaisId = selectedPaisId || CONTENEDORES_GLOBALES[0]?.id || '';

  // Monitorear el progreso de scroll normalizado (0.0 a 1.0)
  const handleScroll = useCallback(() => {
    if (!scrollTrackRef.current) return;
    const rect = scrollTrackRef.current.getBoundingClientRect();
    const trackHeight = rect.height - window.innerHeight;

    if (trackHeight <= 0) return;

    const rawProgress = -rect.top / trackHeight;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));
    setScrollProgress(clampedProgress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Contenedor seleccionado
  const selectedContenedor =
    CONTENEDORES_GLOBALES.find((c) => c.id === activePaisId) || CONTENEDORES_GLOBALES[0];

  // Desplazamiento directo a la terminal
  const scrollToTerminal = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Zoom del buque durante el scroll (0.0 a 1.0)
  const zoomFactor = Math.min(1, scrollProgress / 0.85);

  return (
    <div className="relative bg-surface-50 text-surface-900">
      {/* ==========================================================
          1. PISTA DE SCROLL FOTORREALISTA (160vh)
          Permite al usuario descender suavemente hacia la cubierta
          ========================================================== */}
      <div ref={scrollTrackRef} className="relative h-[160vh]">
        {/* Escena Sticky que permanece fija mientras se realiza el scroll */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-24 pb-6">
          {/* Capa Fotorrealista con Zoom Progresivo */}
          <div className="absolute inset-0 w-full h-full">
            <BarcoRealistaZoom zoomProgress={zoomFactor} />
          </div>

          {/* Barra Superior con Bitácora y Acceso Directo */}
          <div className="relative z-20 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-mono shadow-xl">
              <Compass className="h-3.5 w-3.5 text-primary-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span>ConexCoffee Maritime Line • Buque de Exportación</span>
            </div>

            {/* Botón para saltar directo a los contenedores */}
            <button
              onClick={scrollToTerminal}
              type="button"
              className="pointer-events-auto px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-surface-950 font-extrabold text-xs shadow-2xl border border-surface-200 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Ver Contenedores</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary-600" />
            </button>
          </div>

          {/* Guía Visual Central de Desplazamiento */}
          <div
            className="relative z-20 max-w-xl mx-auto text-center px-4 pb-16 pointer-events-none transition-all duration-500"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 2.5),
              transform: `translateY(${scrollProgress * 30}px)`,
            }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-950/80 backdrop-blur-md text-primary-300 text-xs font-bold uppercase tracking-wider mb-2 border border-primary-500/30 shadow-2xl">
              <Anchor className="h-3.5 w-3.5 text-primary-400" />
              <span>Rutas Transoceánicas de Café</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg mb-2">
              El Viaje del Café en Alta Mar
            </h2>

            <p className="text-xs sm:text-sm text-white/90 bg-surface-950/70 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-xl inline-block">
              Desliza hacia abajo para aproximarte a la cubierta del buque e inspeccionar los contenedores activos.
            </p>

            <div className="flex justify-center mt-3">
              <div className="flex flex-col items-center gap-1 text-white animate-bounce">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          2. TERMINAL DE INSPECCIÓN DE CONTENEDORES
          Aparece al completar el scroll o pulsar "Ver Contenedores"
          ========================================================== */}
      <section
        ref={terminalRef}
        className="relative z-20 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6"
      >
        {/* Encabezado de la Terminal */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-surface-200">
          <div>
            <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Anchor className="h-4 w-4" />
              <span>Llegada a Muelle • Terminal de Exportación</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
              Contenedores Ofertados por Empresas
            </h2>
            <p className="text-surface-600 text-xs sm:text-sm mt-1">
              Selecciona un país para examinar el contenedor asignado, fechas de carga e inspeccionar sus variedades interiores.
            </p>
          </div>

          <div className="text-xs text-surface-500 font-medium">
            <span className="font-bold text-surface-900">{CONTENEDORES_GLOBALES.length}</span> destinos internacionales activos
          </div>
        </div>

        {/* ==========================================================
            SELECTOR DINÁMICO DE PAÍSES (ROL EMPRESA)
            REGLA ESTRICTA: Solo Bandera, Fecha de Apertura y Fecha de Cierre.
            (NO MOSTRAR CAPACIDAD en las tarjetas de selección)
            ========================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CONTENEDORES_GLOBALES.map((pais) => {
            const isSelected = pais.id === activePaisId;

            return (
              <button
                key={pais.id}
                onClick={() => setSelectedPaisId(pais.id)}
                type="button"
                className={`relative p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer shadow-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-primary-600 ring-2 ring-primary-500/30 shadow-md scale-[1.02]'
                    : 'bg-white/80 hover:bg-white border-surface-300/80 hover:border-surface-400'
                }`}
              >
                {/* Indicador de selección activa */}
                {isSelected && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}

                {/* Cabecera de la tarjeta: Bandera y Nombre del País */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-7 rounded-sm overflow-hidden shadow-xs border border-surface-200 shrink-0">
                    <CountryFlag
                      codigoIso={pais.codigoIso}
                      pais={pais.pais}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-surface-900 leading-tight truncate">
                      {pais.pais}
                    </h3>
                    <span className="text-[11px] font-mono text-surface-500">
                      {pais.contenedorId}
                    </span>
                  </div>
                </div>

                {/* Fechas de Apertura y Cierre (REGLA SOLICITADA) */}
                <div className="pt-2 border-t border-surface-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-surface-600">
                    <span className="text-surface-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-brand-orange" />
                      <span>Apertura:</span>
                    </span>
                    <span className="font-semibold text-surface-800">{pais.fechaApertura}</span>
                  </div>

                  <div className="flex items-center justify-between text-surface-600">
                    <span className="text-surface-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-red-500" />
                      <span>Cierre:</span>
                    </span>
                    <span className="font-semibold text-surface-800">{pais.fechaCierre}</span>
                  </div>
                </div>

                {/* Estado del contenedor */}
                <div className="mt-3 pt-2 border-t border-surface-100/70 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pais.colorTema.badge}`}>
                    {pais.estado}
                  </span>
                  <span className="text-[11px] font-medium text-primary-600 group-hover:underline">
                    {isSelected ? 'Inspeccionando' : 'Seleccionar'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ==========================================================
            3. VISOR FOTORREALISTA DEL CONTENEDOR SELECCIONADO
            Compuertas reales y vista de sacos de café de exportación
            ========================================================== */}
        <div className="mt-4">
          <ContenedorRealistaViewer contenedor={selectedContenedor} />
        </div>
      </section>
    </div>
  );
}
