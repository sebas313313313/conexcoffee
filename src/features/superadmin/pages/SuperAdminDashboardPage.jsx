import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Globe,
  Activity,
  ArrowRight,
  Leaf,
  Building2,
  Handshake,
  ShoppingBag,
  Coffee,
  FlaskConical,
  Package,
  UserCheck,
  Users,
  Search,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';

import { QueryState } from '@/components/feedback';
import ModalBase from '@/components/modals/ModalBase';

import StatKPI from '../components/StatKPI';
import ActivityItem from '../components/ActivityItem';
import ModuleCard from '../components/ModuleCard';
import MiniProgressBar from '../components/MiniProgressBar';
import {
  useSuperadminStats,
  useSuperadminMetrics,
  useSuperadminActivity,
  useSuperadminModules,
} from '../hooks/useSuperadminData';
import { useDashboardEntranceAnimation } from '../hooks/useSuperadminAnimations';

const ICON_MAP = {
  Leaf,
  Building2,
  Handshake,
  ShoppingBag,
  Coffee,
  FlaskConical,
  Package,
  UserCheck,
  Users,
  Globe,
};

const TABS = [
  { id: 'general',   label: 'Vista General', icon: BarChart3 },
  { id: 'modulos',   label: 'Módulos',       icon: Globe     },
  { id: 'actividad', label: 'Actividad',     icon: Activity  },
];

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const statsQuery = useSuperadminStats();
  const stats = statsQuery.data || [];
  const metricsQuery = useSuperadminMetrics();
  const metrics = metricsQuery.data || [];
  const activityQuery = useSuperadminActivity();
  const activities = activityQuery.data || [];
  const modulesQuery = useSuperadminModules();
  const modules = modulesQuery.data || [];

  const [activeTab, setActiveTab] = useState('general');
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [filtroHistorial, setFiltroHistorial] = useState('');
  const displayName = user?.name || user?.nombres || 'Administrador';

  const kpisRef = useRef(null);
  const quickModulesRef = useRef(null);

  useDashboardEntranceAnimation(kpisRef, quickModulesRef, [stats.length, modules.length]);

  const actividadesFiltradas = activities.filter((act) =>
    act.message.toLowerCase().includes(filtroHistorial.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-brand-terracota" />
            <span className="text-xs font-semibold text-brand-terracota uppercase tracking-wider">Panel de Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900">Bienvenido, {displayName}</h1>
          <p className="text-surface-500 mt-1 text-sm">Resumen general de la plataforma ConexCoffee</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-tint rounded-xl border border-brand-terracota/20 shrink-0">
          <div className="h-2 w-2 rounded-full bg-brand-terracota animate-pulse" />
          <span className="text-xs font-bold text-brand-terracota uppercase tracking-wider">Superadmin</span>
        </div>
      </div>

      {/* KPIs */}
      <QueryState query={statsQuery} />
      <div ref={kpisRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => <StatKPI key={stat.id} stat={stat} />)}
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200">
        <div className="flex gap-6">
          {TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              id={`tab-superadmin-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === id ? 'border-brand-terracota text-brand-terracota' : 'border-transparent text-surface-500 hover:text-surface-700'
              }`}
            >
              <TabIcon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Vista General */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-brand-terracota" />
              <h2 className="text-base font-bold text-surface-900">Indicadores</h2>
            </div>
            <div className="space-y-5">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-surface-600">{m.label}</span>
                    <span className="text-sm font-bold text-surface-900">{m.value} / {m.total}</span>
                  </div>
                  <MiniProgressBar value={m.value} total={m.total} color={m.color} />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-terracota" />
                <h2 className="text-base font-bold text-surface-900">Actividad Reciente</h2>
              </div>
              <button
                type="button"
                onClick={() => setModalHistorialAbierto(true)}
                className="text-xs font-semibold text-brand-terracota hover:text-brand-orange transition-colors cursor-pointer"
              >
                Ver historial completo
              </button>
            </div>
            {activities.map((item) => <ActivityItem key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* Tab: Módulos */}
      {activeTab === 'modulos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {modules.map((mod) => <ModuleCard key={mod.id} mod={mod} />)}
        </div>
      )}

      {/* Tab: Actividad */}
      {activeTab === 'actividad' && (
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-terracota" />
              <h2 className="text-base font-bold text-surface-900">Registro de Actividad</h2>
            </div>
            <span className="text-xs text-surface-500">Total eventos: {activities.length}</span>
          </div>
          {activities.map((item) => <ActivityItem key={item.id} item={item} />)}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setModalHistorialAbierto(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-terracota/30 text-sm font-semibold text-brand-terracota hover:bg-brand-tint transition-colors cursor-pointer"
            >
              <span>Ver historial completo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Historial Completo de Actividad */}
      <ModalBase
        isOpen={modalHistorialAbierto}
        onClose={() => setModalHistorialAbierto(false)}
        title="Historial Completo de Actividad"
        size="2xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar en el historial de actividades…"
              value={filtroHistorial}
              onChange={(e) => setFiltroHistorial(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
            />
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-surface-100 pr-1">
            {actividadesFiltradas.length === 0 ? (
              <p className="text-center py-8 text-sm text-surface-500">
                No se encontraron actividades que coincidan con la búsqueda.
              </p>
            ) : (
              actividadesFiltradas.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))
            )}
          </div>

          <div className="pt-3 border-t border-surface-200 flex items-center justify-between text-xs text-surface-500">
            <span>Mostrando {actividadesFiltradas.length} de {activities.length} eventos</span>
            <button
              type="button"
              onClick={() => setModalHistorialAbierto(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </ModalBase>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="h-5 w-5 text-brand-terracota" />
          <h2 className="text-base font-bold text-surface-900">Accesos Rápidos</h2>
        </div>
        <div ref={quickModulesRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {modules.slice(0, 6).map((mod) => {
            const Icon = mod.icon || ICON_MAP[mod.iconName] || Globe;

            return (
              <Link key={mod.id} to={mod.path} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-200 hover:border-brand-terracota/40 hover:bg-brand-tint transition-colors duration-200 group text-center">
                <div className="p-2.5 bg-surface-100 group-hover:bg-brand-terracota rounded-xl transition-colors duration-200">
                  <Icon className="h-5 w-5 text-surface-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="text-xs font-semibold text-surface-600 group-hover:text-brand-terracota transition-colors">{mod.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
