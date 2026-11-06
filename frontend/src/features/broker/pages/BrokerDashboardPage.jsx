import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import {
  Handshake,
  DollarSign,
  Users,
  Clock,
  PackageCheck,
  Tag,
  FlaskConical,
  Award,
  Calendar,
  Ship,
  ArrowRight,
  Globe,
  Sparkles,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useBroker } from '@/hooks/useBroker';
import { NegociacionesTable } from '../components';

export default function BrokerDashboardPage() {
  const {
    contenedores,
    ofertasLibres,
    muestras,
    ventas,
    compradores,
    eventos,
  } = useBroker();

  const totalUsdVendidos = ventas.reduce((acc, v) => acc + (v.total_venta_usd || 0), 0);
  const totalComisiones = ventas.reduce((acc, v) => acc + (v.comision_broker_usd || 0), 0);
  const muestrasPendientes = muestras.filter((m) => !m.estado.includes('Aprobada'));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="h-5 w-5 text-brand-terracota" />
            <span className="text-xs font-semibold text-brand-terracota uppercase tracking-wider">
              Portal del Broker Internacional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900">
            Panel de Operaciones Comerciales
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            Monitorea contenedores en ruta hacia tu país, lotes de café, ofertas libres, muestras solicitadas e invitaciones a cataciones
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-tint rounded-xl border border-brand-terracota/20 shrink-0">
          <div className="h-2 w-2 rounded-full bg-brand-terracota animate-pulse" />
          <span className="text-xs font-bold text-brand-terracota uppercase tracking-wider">
            Broker Global Activo
          </span>
        </div>
      </div>

      {/* Grid de KPIs Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contenedores */}
        <Link
          to="/broker/contenedores"
          className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-brand-terracota/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
              Contenedores en Tracker
            </span>
            <div className="h-10 w-10 rounded-xl bg-brand-terracota/10 flex items-center justify-center text-brand-terracota group-hover:scale-110 transition-transform">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-surface-900 mt-2">{contenedores.length}</p>
          <p className="text-xs text-brand-terracota font-semibold flex items-center gap-1 mt-1">
            <span>Ver lotes y ruta satelital</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Ofertas Libres */}
        <Link
          to="/broker/ofertas"
          className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-brand-orange/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
              Ofertas Libres
            </span>
            <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-surface-900 mt-2">{ofertasLibres.length}</p>
          <p className="text-xs text-brand-orange font-semibold flex items-center gap-1 mt-1">
            <span>Catálogo de especialidad</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Muestras Pre-Compra */}
        <Link
          to="/broker/muestras"
          className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
              Muestras Solicitadas
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <FlaskConical className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{muestras.length}</p>
          <p className="text-xs text-surface-500 font-semibold flex items-center gap-1 mt-1">
            <span>{muestrasPendientes.length} pendientes de feedback</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Comisiones Ganadas */}
        <Link
          to="/broker/ventas"
          className="bg-white p-5 rounded-2xl border border-surface-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
              Comisiones Ganadas
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            ${totalComisiones?.toLocaleString()} <span className="text-xs font-bold text-surface-400">USD</span>
          </p>
          <p className="text-xs text-surface-500 font-semibold flex items-center gap-1 mt-1">
            <span>${totalUsdVendidos?.toLocaleString()} USD en ventas</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>
      </div>

      {/* Acceso Rápido: Eventos de Catación */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-terracota/10 to-brand-orange/10 border border-brand-orange/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-terracota text-white flex items-center justify-center shrink-0 shadow-md">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-surface-900">
              Invitaciones a Eventos & Sesiones de Catación
            </h3>
            <p className="text-xs text-surface-600 mt-0.5">
              Tienes <strong>{eventos.length} eventos programados</strong> para invitar a tus compradores por WhatsApp o correo.
            </p>
          </div>
        </div>

        <Link
          to="/broker/eventos"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white text-xs font-bold shadow-xs transition-all shrink-0"
        >
          <span>Gestionar e Invitar Compradores</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Contenedores en Tránsito Destacados */}
      <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-surface-900 flex items-center gap-2">
              <Ship className="h-5 w-5 text-brand-terracota" />
              <span>Contenedores Asignados a tu Región</span>
            </h3>
            <p className="text-xs text-surface-500">
              Lotes de café consolidados, naviera y fecha estimada de arribo
            </p>
          </div>
          <Link
            to="/broker/contenedores"
            className="text-xs font-bold text-brand-terracota hover:underline flex items-center gap-1"
          >
            <span>Ver todos los contenedores</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contenedores.slice(0, 3).map((cnt) => (
            <div
              key={cnt.id}
              className="p-4 rounded-xl border border-surface-200 bg-surface-50/70 hover:bg-white hover:border-brand-orange/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-surface-800">{cnt.codigo}</span>
                  <span className="font-bold text-brand-terracota bg-brand-tint px-2 py-0.5 rounded-full text-[10px]">
                    {cnt.pais_destino}
                  </span>
                </div>
                <p className="text-xs font-bold text-surface-900">{cnt.ciudad_destino}</p>
                <p className="text-[11px] text-surface-500">{cnt.naviera} — {cnt.buque}</p>

                <div className="mt-3 text-xs space-y-1 text-surface-600">
                  <p>Lotes dentro: <strong>{cnt.lotes_dentro?.length || 0} lotes de especialidad</strong></p>
                  <p>Arribo Est.: <strong>{cnt.fecha_estimada_arribo}</strong></p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-surface-200 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-emerald-700">
                  {cnt.porcentaje_llenado}% Ocupado
                </span>
                <Link
                  to="/broker/contenedores"
                  className="font-bold text-brand-terracota hover:underline"
                >
                  Ver Tracker →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Negociaciones y Contratos en Curso */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">Negociaciones y Contratos en Curso</h2>
            <p className="text-xs text-surface-500">Historial transaccional con compradores internacionales</p>
          </div>
          <span className="text-xs font-medium text-brand-terracota bg-brand-tint px-2.5 py-1 rounded-full border border-brand-terracota/20">
            Exportación Internacional
          </span>
        </div>
        <NegociacionesTable />
      </Card>
    </div>
  );
}
