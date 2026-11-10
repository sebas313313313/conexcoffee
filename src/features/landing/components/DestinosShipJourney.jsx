import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ArrowRight, ChevronDown, Ship, X } from 'lucide-react';

const DESTINOS = [
  {
    id: 'estados-unidos',
    pais: 'Estados Unidos',
    codigo: 'US',
    iso: 'US',
    descripcion: 'Cafés de especialidad para tostadores norteamericanos',
    color: '#002868',
  },
  {
    id: 'arabia-saudita',
    pais: 'Arabia Saudita',
    codigo: 'SA',
    iso: 'SA',
    descripcion: 'Lotes selectos para el mercado del Golfo',
    color: '#006C35',
  },
  {
    id: 'argentina',
    pais: 'Argentina',
    codigo: 'AR',
    iso: 'AR',
    descripcion: 'Café de altura para distribuidores argentinos',
    color: '#75AADB',
  },
];

function FlagUS({ className = '' }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-label="Bandera Estados Unidos">
      <rect width="100" height="12" fill="#BF0A3E" />
      <rect y="12" width="100" height="12" fill="#FFFFFF" />
      <rect y="24" width="100" height="12" fill="#BF0A3E" />
      <rect y="36" width="100" height="12" fill="#FFFFFF" />
      <rect y="48" width="100" height="12" fill="#BF0A3E" />
      <rect width="40" height="36" fill="#002868" />
    </svg>
  );
}

function FlagSA({ className = '' }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-label="Bandera Arabia Saudita">
      <rect width="100" height="60" fill="#006C35" />
      <path d="M22 56 L 78 4" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function FlagAR({ className = '' }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-label="Bandera Argentina">
      <rect width="100" height="20" fill="#75AADB" />
      <rect y="20" width="100" height="20" fill="#FFFFFF" />
      <rect y="40" width="100" height="20" fill="#75AADB" />
      <circle cx="50" cy="30" r="7" fill="#F39200" />
    </svg>
  );
}

function Flag({ iso, className = 'w-full h-full' }) {
  if (iso === 'US') return <FlagUS className={className} />;
  if (iso === 'SA') return <FlagSA className={className} />;
  if (iso === 'AR') return <FlagAR className={className} />;
  return <div className={`${className} bg-surface-200`} />;
}

export default function DestinosShipJourney() {
  const navigate = useNavigate();
  const journeyRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [containerOpen, setContainerOpen] = useState(false);
  const [showSelection, setShowSelection] = useState(false);

  const updateProgress = useCallback(() => {
    const el = journeyRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = el.offsetHeight - vh;
    if (total <= 0) {
      setProgress(1);
      return;
    }
    const scrolled = Math.max(0, vh - rect.top);
    const p = Math.max(0, Math.min(1, scrolled / total));
    setProgress(p);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [updateProgress]);

  // Trigger container open animation when ship reaches container
  useEffect(() => {
    if (progress >= 0.72 && !containerOpen) {
      // slight delay for cinematic feel
      const t = setTimeout(() => setContainerOpen(true), 400);
      return () => clearTimeout(t);
    }
    if (progress < 0.55 && containerOpen) {
      setContainerOpen(false);
      setShowSelection(false);
    }
  }, [progress, containerOpen]);

  useEffect(() => {
    if (containerOpen && progress >= 0.8) {
      const t = setTimeout(() => setShowSelection(true), 600);
      return () => clearTimeout(t);
    }
    if (progress < 0.75) {
      setShowSelection(false);
    }
  }, [containerOpen, progress]);

  // Ship position along the journey
  const shipX = progress * 38; // moves horizontally as it approaches
  const shipY = progress * 6; // slight rise
  const shipTilt = progress * 2;

  const handleSelectPais = (paisId) => {
    navigate(`/destinos/comprar/${paisId}`);
  };

  return (
    <div className="relative bg-surface-50">
      {/* Intro text */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-tint border border-brand-orange/30 mb-4">
            <Ship className="h-4 w-4 text-brand-orange" />
            <span className="text-xs font-bold text-brand-terracota uppercase tracking-wider">Ruta de Exportación</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 tracking-tight mb-4">
            Destinos Internacionales
          </h1>
          <p className="text-surface-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Sigue el recorrido del buque hasta el puerto. Al llegar al contenedor, ábrelo para descubrir los destinos disponibles y seleccionar tu país para comprar café de especialidad.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-brand-orange animate-bounce">
            <ChevronDown className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Desliza para iniciar el recorrido</span>
          </div>
        </div>
      </section>

      {/* Scroll journey section */}
      <section ref={journeyRef} className="relative h-[350vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Sky/harbor background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-sky-100 to-brand-tint" />
            {/* Distant mountains/port structures */}
            <div className="absolute bottom-[38%] left-0 right-0 h-[18%]">
              <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0 120 L 80 60 L 160 90 L 240 40 L 320 80 L 400 50 L 480 90 L 560 60 L 640 100 L 720 70 L 800 110 L 880 65 L 960 95 L 1040 55 L 1120 85 L 1200 70 L 1200 200 L 0 200 Z" fill="#cbd5e1" opacity="0.7" />
                <path d="M0 140 L 60 100 L 120 125 L 200 90 L 280 115 L 360 95 L 440 125 L 520 105 L 600 135 L 680 110 L 760 140 L 840 115 L 920 135 L 1000 105 L 1080 130 L 1160 115 L 1200 130 L 1200 200 L 0 200 Z" fill="#94a3b8" opacity="0.6" />
              </svg>
            </div>
            {/* Water */}
            <div className="absolute bottom-0 left-0 right-0 h-[42%] bg-gradient-to-b from-sky-300/50 to-sky-600/30">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute bottom-0 left-0 w-full h-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_60px,rgba(255,255,255,0.4)_60px,rgba(255,255,255,0.4)_120px)] animate-pulse" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            {/* Pier/wharf */}
            <div className="absolute bottom-[38%] right-[10%] w-[18%] h-[4%] bg-gradient-to-b from-surface-500 to-surface-700" />
            <div className="absolute bottom-[42%] right-[12%] w-[14%] h-[6%] bg-surface-600/90" />
          </div>

          {/* Ship - approaches from left, moves to dock */}
          <div
            className="absolute bottom-[40%] z-20 transition-all duration-200 ease-out"
            style={{
              left: `${2 + shipX}%`,
              transform: `translateY(${-shipY}px) rotate(${shipTilt}deg) scale(${0.9 + progress * 0.25})`,
              transformOrigin: 'center bottom',
            }}
          >
            <div className="relative w-64 sm:w-80 h-36 sm:h-44 drop-shadow-2xl">
              <svg viewBox="0 0 240 150" className="w-full h-full">
                <defs>
                  <filter id="shipShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1c1917" floodOpacity="0.5" />
                  </filter>
                </defs>
                {/* Hull */}
                <path
                  d="M10 95 L 210 95 L 195 125 L 25 125 Z"
                  fill="#0f172a"
                  stroke="#AD2E01"
                  strokeWidth="3"
                  filter="url(#shipShadow)"
                />
                {/* Deck */}
                <rect x="18" y="78" width="184" height="17" fill="#1e293b" />
                {/* Containers on deck */}
                <g opacity="0.95">
                  <rect x="24" y="62" width="32" height="16" fill="#F25433" rx="2" />
                  <rect x="62" y="56" width="32" height="22" fill="#AD2E01" rx="2" />
                  <rect x="100" y="66" width="32" height="12" fill="#cbd5e1" rx="2" />
                  <rect x="138" y="50" width="32" height="28" fill="#F25433" rx="2" />
                  <rect x="176" y="60" width="26" height="18" fill="#AD2E01" rx="2" />
                </g>
                {/* Bridge */}
                <rect x="110" y="36" width="18" height="20" fill="#0f172a" stroke="#AD2E01" strokeWidth="2" />
                <rect x="112" y="40" width="14" height="8" fill="#38bdf8" opacity="0.4" />
                {/* Stack */}
                <rect x="112" y="24" width="14" height="12" fill="#0f172a" stroke="#AD2E01" strokeWidth="1.5" />
                {/* Smoke */}
                <path d="M119 24 Q 112 14 122 4" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
                </path>
                <path d="M119 24 Q 126 12 134 2" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4">
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>
            {progress < 0.15 && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-terracota text-white text-[10px] font-bold shadow-lg whitespace-nowrap">
                Navegando hacia puerto...
              </div>
            )}
          </div>

          {/* Container at dock - target */}
          <div
            className="absolute bottom-[44%] z-10 transition-all duration-700"
            style={{
              right: `${12 + (1 - progress) * 12}%`,
              opacity: progress > 0.5 ? 1 : 0,
              transform: `scale(${0.65 + progress * 0.45})`,
            }}
          >
            <div className="relative" style={{ perspective: '1200px' }}>
              {/* Container body */}
              <div className="w-40 sm:w-48 h-22 sm:h-26 bg-gradient-to-b from-surface-700 to-surface-900 rounded-sm border-2 border-surface-600 shadow-2xl relative overflow-hidden">
                {/* Container ribs */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-1 bg-surface-800/60" style={{ left: `${15 + i * 12}%` }} />
                ))}
                {/* Doors */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-surface-800 to-surface-900 border-r-2 border-surface-700 transition-transform duration-1000 ease-out origin-left"
                  style={{
                    transform: containerOpen ? 'rotateY(-95deg)' : 'rotateY(0deg)',
                    boxShadow: containerOpen ? 'none' : 'inset -2px 0 8px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-12 bg-brand-orange/60 rounded-full" />
                  </div>
                </div>
                <div
                  className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-surface-800 to-surface-900 border-l-2 border-surface-700 transition-transform duration-1000 ease-out origin-right"
                  style={{
                    transform: containerOpen ? 'rotateY(95deg)' : 'rotateY(0deg)',
                    boxShadow: containerOpen ? 'none' : 'inset 2px 0 8px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-12 bg-brand-orange/60 rounded-full" />
                  </div>
                </div>
                {/* CXCF marking */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-mono font-bold text-surface-400 tracking-widest rotate-90">
                  CXCF-DEST-001
                </div>
              </div>
              {/* Interior glow when open */}
              {containerOpen && (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-orange-900/30 blur-sm animate-pulse" />
              )}
            </div>
            {progress >= 0.6 && progress < 0.72 && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-orange text-white text-[10px] font-bold shadow-lg whitespace-nowrap animate-bounce">
                Aproximándose al contenedor
              </div>
            )}
            {containerOpen && !showSelection && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-lg whitespace-nowrap">
                Contenedor abierto
              </div>
            )}
          </div>

          {/* Coffee sacks with flags inside container area */}
          <div
            className="absolute bottom-[47%] z-15 transition-all duration-1000"
            style={{
              right: containerOpen ? '18%' : '22%',
              opacity: showSelection ? 1 : 0,
              transform: showSelection ? 'scale(1)' : 'scale(0.7)',
              pointerEvents: showSelection ? 'auto' : 'none',
            }}
          >
            <div className="flex items-end gap-4 sm:gap-6">
              {DESTINOS.map((destino, idx) => (
                <button
                  key={destino.id}
                  onClick={() => handleSelectPais(destino.id)}
                  className="group relative flex flex-col items-center cursor-pointer"
                  style={{
                    animation: showSelection ? `floatIn 0.6s ease-out ${idx * 0.15}s both` : 'none',
                  }}
                >
                  {/* Coffee sack */}
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32">
                    <div className="absolute inset-x-2 top-0 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-lg border-2 border-amber-950" />
                    <div className="absolute inset-x-0 top-4 bottom-0 bg-gradient-to-b from-amber-700 to-amber-950 rounded-b-lg border-2 border-amber-950 shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                      {/* Burlap texture effect */}
                      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]" />
                      {/* Flag patch */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-8 sm:w-14 sm:h-9 rounded shadow-md overflow-hidden border border-white/40 group-hover:scale-110 transition-transform duration-300">
                        <Flag iso={destino.iso} />
                      </div>
                      {/* Label */}
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <div className="text-[8px] sm:text-[9px] font-black text-amber-100 tracking-wider">{destino.codigo}</div>
                      </div>
                    </div>
                    {/* Rope ties */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-10 h-1 bg-amber-950" />
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-950" />
                  </div>
                  {/* Country name */}
                  <div className="mt-3 text-center">
                    <div className="text-xs sm:text-sm font-bold text-surface-900 group-hover:text-brand-terracota transition-colors">
                      {destino.pais}
                    </div>
                    <div className="text-[10px] text-surface-600 max-w-[100px] leading-tight mt-0.5 hidden sm:block">
                      {destino.descripcion}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      Seleccionar <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* HUD/Instructions overlay on animation */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 text-center px-4 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-surface-200 mb-3">
              <Ship className="h-4 w-4 text-brand-orange" />
              <span className="text-xs font-bold text-surface-900">Viaje del Buque al Puerto</span>
            </div>
            <p className="text-surface-700 text-xs sm:text-sm bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
              {progress < 0.6 && 'Navegando hacia el puerto...'}
              {progress >= 0.6 && progress < 0.75 && 'Arribando al muelle...'}
              {progress >= 0.75 && !containerOpen && 'Acercándose al contenedor...'}
              {containerOpen && !showSelection && 'Abriendo compuertas...'}
              {showSelection && 'Selecciona tu destino'}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface-900/90 backdrop-blur-md text-white shadow-xl">
              <Anchor className="h-4 w-4 text-brand-orange" />
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className={progress < 0.6 ? 'text-brand-orange font-bold' : 'text-white/60'}>
                  {progress < 0.6 ? 'En Tránsito' : progress < 0.75 ? 'Arribando' : 'En Puerto'}
                </span>
                <span className="text-white/40">•</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info section below */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-surface-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 mb-4">
            Compra directa desde el puerto de destino
          </h2>
          <p className="text-surface-600 leading-relaxed">
            Al seleccionar un destino, accedes a la oferta de cafés de especialidad asignados a ese mercado. 
            ConexCoffee conecta productores colombianos con compradores internacionales con trazabilidad completa.
          </p>
        </div>
      </section>

      <style>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
