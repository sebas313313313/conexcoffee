import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import {
  Leaf,
  Layers,
  Tag,
  Gift,
  Package,
  Archive,
  Handshake,
  FlaskConical,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaKpis,
  useEmpresaActividad,
} from '../hooks/useEmpresaData';
import VentasMensuales from '../components/VentasMensuales';

function AnimatedCounter({ value, locationKey }) {
  const spanRef = useRef(null);

  useEffect(() => {
    const numeric = parseFloat(value);
    if (Number.isNaN(numeric) || !spanRef.current) return;

    const counter = { val: 0 };
    const anim = animate(counter, {
      val: numeric,
      duration: 850,
      ease: 'outExpo',
      onUpdate: () => {
        if (spanRef.current) {
          spanRef.current.textContent = Math.round(counter.val).toString();
        }
      },
    });

    return () => {
      anim.pause();
    };
  }, [value, locationKey]);

  return <span ref={spanRef}>{value}</span>;
}

export default function EmpresaDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const kpisQuery = useEmpresaKpis();
  const kpis = kpisQuery.data || [];
  const actividadQuery = useEmpresaActividad();
  const actividades = actividadQuery.data || [];

  const kpisContainerRef = useRef(null);
  const modulesContainerRef = useRef(null);

  // Animación de desplazamiento escalonado para las tarjetas KPI (al montar o al presionar Dashboard)
  useEffect(() => {
    if (!kpisContainerRef.current || kpis.length === 0) return;
    const cards = kpisContainerRef.current.querySelectorAll('.empresa-kpi-card');
    if (cards.length === 0) return;

    const anim = animate(cards, {
      opacity: [0, 1],
      translateY: [42, 0],
      scale: [0.95, 1],
      duration: 650,
      ease: 'outExpo',
      delay: stagger(75),
    });

    return () => {
      anim.pause();
    };
  }, [kpis.length, location.key]);

  // Animación de desplazamiento escalonado para las tarjetas de módulos
  useEffect(() => {
    if (!modulesContainerRef.current) return;
    const cards = modulesContainerRef.current.querySelectorAll('.empresa-module-card');
    if (cards.length === 0) return;

    const anim = animate(cards, {
      opacity: [0, 1],
      translateY: [32, 0],
      scale: [0.96, 1],
      duration: 600,
      ease: 'outExpo',
      delay: stagger(45, { start: 130 }),
    });

    return () => {
      anim.pause();
    };
  }, [location.key]);

  const handleKpiMouseEnter = (e) => {
    animate(e.currentTarget, {
      translateY: -3,
      scale: 1.01,
      duration: 220,
      ease: 'outCubic',
    });
    const icon = e.currentTarget.querySelector('.kpi-icon');
    if (icon) {
      animate(icon, {
        scale: 1.14,
        duration: 220,
        ease: 'outBack',
      });
    }
  };

  const handleKpiMouseLeave = (e) => {
    animate(e.currentTarget, {
      translateY: 0,
      scale: 1,
      duration: 200,
      ease: 'outCubic',
    });
    const icon = e.currentTarget.querySelector('.kpi-icon');
    if (icon) {
      animate(icon, {
        scale: 1,
        duration: 200,
        ease: 'outCubic',
      });
    }
  };

  const handleModuleMouseEnter = (e) => {
    animate(e.currentTarget, {
      translateY: -4,
      scale: 1.015,
      duration: 250,
      ease: 'outCubic',
    });
    const icon = e.currentTarget.querySelector('.module-icon');
    if (icon) {
      animate(icon, {
        scale: 1.12,
        rotate: 3,
        duration: 250,
        ease: 'outBack',
      });
    }
  };

  const handleModuleMouseLeave = (e) => {
    animate(e.currentTarget, {
      translateY: 0,
      scale: 1,
      duration: 220,
      ease: 'outCubic',
    });
    const icon = e.currentTarget.querySelector('.module-icon');
    if (icon) {
      animate(icon, {
        scale: 1,
        rotate: 0,
        duration: 200,
        ease: 'outCubic',
      });
    }
  };

  // Módulos rápidos de la empresa para acceso directo
  const modulosRapidos = [
    {
      titulo: 'Brokers',
      descripcion: 'Negociaciones y contratos de exportación',
      ruta: '/empresa/brokers',
      icono: Handshake,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      titulo: 'Caficultores',
      descripcion: 'Productores vinculados y trazabilidad de fincas',
      ruta: '/empresa/caficultores',
      icono: Leaf,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      titulo: 'Contenedores',
      descripcion: 'Consolidación marítima y rutas de despacho',
      ruta: '/empresa/contenedores',
      icono: Package,
      color: 'from-amber-600 to-orange-700',
    },
    {
      titulo: 'Laboratorios',
      descripcion: 'Análisis sensorial y red Q-Grader',
      ruta: '/empresa/laboratorios',
      icono: FlaskConical,
      color: 'from-cyan-600 to-blue-700',
    },
    {
      titulo: 'Muestras',
      descripcion: 'Control gravimétrico, humedad y reportes',
      ruta: '/empresa/muestras',
      icono: Archive,
      color: 'from-purple-600 to-violet-700',
    },
    {
      titulo: 'Pre-Ofertas',
      descripcion: 'Evaluación agronómica y asignación de técnicos',
      ruta: '/empresa/pre-ofertas',
      icono: Layers,
      color: 'from-amber-600 to-amber-700',
    },
    {
      titulo: 'Ofertas',
      descripcion: 'Lotes en firme y catálogo exportable con protocolo SCA',
      ruta: '/empresa/ofertas',
      icono: Tag,
      color: 'from-rose-600 to-pink-700',
    },
    {
      titulo: 'Técnicos',
      descripcion: 'Ingenieros agrónomos asignados a zonas',
      ruta: '/empresa/tecnicos',
      icono: UserCheck,
      color: 'from-stone-700 to-stone-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Título de Bienvenida Limpio — Sin banner negro */}
      <div className="py-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          ¡Te damos la bienvenida, Empresa!
        </h1>
      </div>

      {/* Tarjetas KPI */}
      <QueryState query={kpisQuery} />
      <div
        ref={kpisContainerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpis.map((kpi) => {
          const Icono =
            kpi.iconoNombre === 'Leaf'
              ? Leaf
              : kpi.iconoNombre === 'Gift'
              ? Gift
              : kpi.iconoNombre === 'Package'
              ? Package
              : Archive;

          return (
            <div
              key={kpi.id}
              onMouseEnter={handleKpiMouseEnter}
              onMouseLeave={handleKpiMouseLeave}
              className="empresa-kpi-card bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {kpi.titulo}
                </span>
                <div className="kpi-icon w-9 h-9 rounded-xl bg-amber-50 text-brand-terracota flex items-center justify-center">
                  <Icono className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-stone-900">
                  <AnimatedCounter value={kpi.valor} locationKey={location.key} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cuadrícula de Accesos Rápidos a Módulos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900">
            Módulos de Gestión Empresarial
          </h2>
          <span className="text-xs text-stone-500">7 módulos activos</span>
        </div>
        <div
          ref={modulesContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {modulosRapidos.map((mod) => {
            const IconoMod = mod.icono;
            return (
              <button
                key={mod.titulo}
                type="button"
                onClick={() => navigate(mod.ruta)}
                onMouseEnter={handleModuleMouseEnter}
                onMouseLeave={handleModuleMouseLeave}
                className="empresa-module-card bg-white rounded-2xl p-4 border border-stone-200 hover:border-amber-700/40 text-left shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`module-icon w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-sm`}>
                      <IconoMod className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-800 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm group-hover:text-amber-900 transition-colors">
                    {mod.titulo}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {mod.descripcion}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-amber-800 mt-3 block">
                  Ir al módulo →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección Inferior: Indicadores de Exportación & Actividad Reciente */}
      <VentasMensuales />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicadores Logísticos */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Capacidad y Despachos</h3>
            <p className="text-xs text-stone-500">Métricas de consolidación marítima</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-stone-700 mb-1">
                <span>Contenedor Rotterdam (#01)</span>
                <span className="text-amber-800">18.500 / 21.600 kg (85%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-stone-700 mb-1">
                <span>Contenedor Hamburgo (#02)</span>
                <span className="text-emerald-700">12.000 / 21.600 kg (55%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '55%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-stone-700 mb-1">
                <span>Muestras Aprobadas SCA (+85 pts)</span>
                <span className="text-teal-700">92% de aprobación</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => navigate('/empresa/contenedores')}
              className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition-colors text-center block"
            >
              Gestionar Contenedores
            </button>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Actividad de la Empresa</h3>
              <p className="text-xs text-stone-500">Eventos registrados en las últimas 24 horas</p>
            </div>
            <span className="text-[11px] font-semibold text-stone-400">En tiempo real</span>
          </div>

          <div className="space-y-3">
            {actividades.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-stone-50/70 border border-stone-100 flex items-start gap-3 hover:bg-amber-50/40 transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  {act.estado === 'completado' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  {act.estado === 'pendiente' && (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                  {act.estado === 'alerta' && (
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-800 leading-snug">
                    {act.titulo}
                  </p>
                  <span className="text-[11px] text-stone-400 mt-0.5 block">
                    {act.tiempo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
