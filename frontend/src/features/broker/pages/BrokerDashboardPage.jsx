import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '@/components/ui';
import { ModalBase } from '@/components/modals';
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
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { useBroker } from '@/hooks/useBroker';
import { NegociacionesTable, VentasPorCafeChart } from '../components';

export default function BrokerDashboardPage() {
  const [isPreofertasOpen, setIsPreofertasOpen] = useState(false);
  const {
    contenedores,
    ofertasLibres,
    muestras,
    ventas,
    compradores,
    eventos,
    preofertas,
  } = useBroker();

  const totalUsdVendidos = ventas.reduce((acc, v) => acc + (v.total_venta_usd || 0), 0);
  const totalComisiones = ventas.reduce((acc, v) => acc + (v.comision_broker_usd || 0), 0);
  const muestrasPendientes = muestras.filter((m) => !m.estado.includes('Aprobada'));
  const cafesVendidos = Object.values(
    contenedores.flatMap((contenedor) => contenedor.lotes_dentro || []).reduce((acc, lote) => {
      const nombre = lote.variedad || 'Café de especialidad';
      acc[nombre] = acc[nombre] || { nombre, valor: 0 };
      acc[nombre].valor += Number(lote.peso_kg || 0);
      return acc;
    }, {})
  ).sort((a, b) => b.valor - a.valor).slice(0, 5);
  const preofertasPriorizadas = [...preofertas]
    .sort((a, b) => Number(b.puntajeSca || b.puntaje_sca || 0) - Number(a.puntajeSca || a.puntaje_sca || 0))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-surface-900 px-6 py-7 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="h-5 w-5 text-brand-orange" />
            <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
              Portal del Broker Internacional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Centro de control comercial
          </h1>
          <p className="text-surface-300 mt-1 text-sm max-w-2xl">
            Prioriza oportunidades, monitorea exportaciones y activa compradores con información clara de cada lote.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/15 shrink-0">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Operación activa
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-2 p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4"><div className="h-9 w-9 rounded-lg bg-brand-tint text-brand-terracota flex items-center justify-center"><BarChart3 className="h-5 w-5" /></div><div><h2 className="font-extrabold text-surface-900">Café más vendido</h2><p className="text-xs text-surface-500">Distribución por kg de los lotes consolidados.</p></div></div>
          {cafesVendidos.length ? <VentasPorCafeChart items={cafesVendidos} /> : <p className="text-sm text-surface-500 py-8 text-center">Aún no hay ventas consolidadas para graficar.</p>}
        </Card>
        <Card className="xl:col-span-3 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><ClipboardList className="h-5 w-5" /></div><div><h2 className="font-extrabold text-surface-900">Preofertas de la empresa</h2><p className="text-xs text-surface-500">Prioriza lotes por puntaje SCA y volumen disponible.</p></div></div><button type="button" onClick={() => setIsPreofertasOpen(true)} className="text-xs font-bold text-brand-terracota hover:underline cursor-pointer">Ver todas</button></div>
          <div className="space-y-2">{preofertasPriorizadas.length ? preofertasPriorizadas.map((oferta) => <div key={oferta.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-surface-100 bg-surface-50 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-bold text-surface-900">{oferta.codigo || oferta.codigo_preoferta || oferta.nombre}</p><p className="truncate text-xs text-surface-500">{oferta.finca_nombre || oferta.finca?.nombre || oferta.ubicacion}</p></div><div className="text-right"><b className="text-sm text-emerald-700">{Number(oferta.puntajeSca || oferta.puntaje_sca || 0).toFixed(1)} SCA</b><p className="text-[11px] text-surface-500">{oferta.cantidad_kg || oferta.kilos_disponibles || '—'} kg</p></div></div>) : <p className="text-sm text-surface-500 py-8 text-center">No hay preofertas disponibles para tu empresa.</p>}</div>
        </Card>
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
      <ModalBase isOpen={isPreofertasOpen} onClose={() => setIsPreofertasOpen(false)} title="Todas las preofertas de la empresa" size="xl">
        <div className="space-y-3"><p className="text-sm text-surface-500">Ordenadas por puntaje SCA para facilitar tu recomendación comercial.</p><div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">{[...preofertas].sort((a, b) => Number(b.puntajeSca || b.puntaje_sca || 0) - Number(a.puntajeSca || a.puntaje_sca || 0)).map((oferta) => <div key={oferta.id} className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3"><div className="min-w-0"><p className="font-mono text-[11px] text-surface-400">{oferta.codigo || oferta.codigo_preoferta || 'SIN-CÓDIGO'}</p><p className="mt-1 truncate text-sm font-bold text-surface-900">{oferta.variedad || oferta.nombre || 'Café de especialidad'}</p><p className="mt-1 truncate text-xs text-surface-500">{oferta.finca_nombre || oferta.finca?.nombre || oferta.ubicacion || 'Origen por confirmar'}</p></div><div className="text-right"><p className="font-bold text-emerald-700">{Number(oferta.puntajeSca || oferta.puntaje_sca || 0).toFixed(1)} SCA</p><p className="mt-1 text-xs text-surface-500">{oferta.cantidad_kg || oferta.kilos_disponibles || '—'} kg</p></div></div>)}{!preofertas.length && <p className="py-10 text-center text-sm text-surface-500">No hay preofertas disponibles.</p>}</div><div className="flex justify-end pt-2"><Link to="/broker/preofertas" onClick={() => setIsPreofertasOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-brand-terracota px-4 py-2 text-sm font-bold text-white hover:bg-brand-orange">Abrir catálogo completo <ArrowRight className="h-4 w-4" /></Link></div></div>
      </ModalBase>
    </div>
  );
}
