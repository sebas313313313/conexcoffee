import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { ModalBase } from '@/components/modals';
import { useVentasEmpresa } from '../hooks/useVentasEmpresa';
import { fechaVenta, numeroVentas, usdVentas } from '../lib/formatoVentas';

export default function EmpresaVentasPage() {
  const { contenedores, cargando, error, reintentar } = useVentasEmpresa();
  const [params, setParams] = useSearchParams();
  const contenedor = contenedores.find((item) => item.id === params.get('contenedor'));
  const venta = contenedor?.ventas.find((item) => item.id === params.get('pedido'));
  const demo = contenedor ? (contenedor.esDePrueba ? contenedor : null) : contenedores.find((item) => item.esDePrueba);
  const cerrarDetalle = () => setParams({ contenedor: contenedor.id }, { replace: true });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-surface-900">Ventas</h1>
        <p className="mt-1 text-sm text-surface-600">Consulta las compras, los pagos y el seguimiento por contenedor.</p>
      </header>
      {demo && (
        <p className="rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand-terracota">
          Datos de prueba · Los contenedores DEMO y sus compras son ficticios.
          {demo.actividadNoDisponible && ' No se pudo cargar la actividad real.'}
        </p>
      )}
      {cargando && <p role="status" className="text-sm text-surface-600">Cargando ventas…</p>}
      {error && (
        <Card className="flex flex-wrap items-center gap-3">
          <p role="alert" className="text-sm text-surface-700">{error}</p>
          {reintentar && <Button size="sm" variant="outline" onClick={reintentar}>Reintentar</Button>}
        </Card>
      )}
      {!cargando && !error && (contenedor ? (
        <Card>
          <Link to="/empresa/ventas" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-terracota">
            <ArrowLeft className="h-4 w-4" /> Volver a contenedores
          </Link>
          <h2 className="font-bold text-surface-900">Compras en {contenedor.codigo}</h2>
          <p className="text-sm text-surface-600">{contenedor.destino} · {contenedor.estado}</p>
          <ul className="mt-3 divide-y divide-surface-200">
            {contenedor.ventas.map((item) => (
              <li key={item.id} className="grid items-center gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div>
                  <p className="font-semibold text-surface-900">{item.comprador}</p>
                  <p className="text-sm text-surface-600">{item.identificacion || 'Identificación sin registrar'} · {item.codigo}</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-surface-800">{fechaVenta(item.fecha)}</p>
                  <p className="text-surface-600">{contenedor.estado}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setParams({ contenedor: contenedor.id, pedido: item.id })}>
                  Ver información
                </Button>
              </li>
            ))}
          </ul>
          {!contenedor.ventas.length && <p className="mt-4 text-sm text-surface-600">Este contenedor aún no tiene compras con pagos registrados.</p>}
        </Card>
      ) : (
        <Card>
          <h2 className="font-bold text-surface-900">Contenedores de la empresa</h2>
          <ul className="mt-3 divide-y divide-surface-200">
            {contenedores.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 py-4">
                <Package className="h-5 w-5 text-brand-terracota" aria-hidden="true" />
                <div className="min-w-0 flex-1 basis-36">
                  <p className="font-semibold text-surface-900">{item.codigo}</p>
                  <p className="text-sm text-surface-600">{item.destino} · {item.estado}</p>
                </div>
                <span className="text-sm text-surface-600">{item.ventas.length} {item.ventas.length === 1 ? 'compra' : 'compras'}</span>
                <Link to={`?contenedor=${encodeURIComponent(item.id)}`}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-brand-terracota hover:bg-brand-tint">
                  Ver contenedor <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          {!contenedores.length && <p className="mt-4 text-sm text-surface-600">No hay contenedores registrados para tu empresa.</p>}
        </Card>
      ))}
      {venta && (
        <ModalBase isOpen onClose={cerrarDetalle} title={`Compra ${venta.codigo}${demo ? ' · Datos de prueba' : ''}`} size="xl">
          <p className="font-semibold text-surface-900">{venta.comprador}</p>
          <p className="text-sm text-surface-600">{venta.pais || 'País sin registrar'} · {fechaVenta(venta.fecha)}</p>
          <dl className="my-4 grid gap-3 rounded-xl bg-surface-50 p-4 sm:grid-cols-3">
            <div><dt className="text-xs text-surface-600">Total del pedido</dt><dd className="font-bold">{usdVentas.format(venta.total)}</dd></div>
            <div><dt className="text-xs text-surface-600">Pagado · {numeroVentas.format(venta.porcentaje)} %</dt><dd className="font-bold">{usdVentas.format(venta.pagado)}</dd></div>
            <div><dt className="text-xs text-surface-600">Pendiente de pago</dt><dd className="font-bold">{usdVentas.format(venta.pendiente)}</dd></div>
          </dl>
          <p className="text-sm font-semibold text-surface-800">
            {venta.pendiente === 0 ? 'Pago completo' : venta.anticipo ? 'Reserva con anticipo' : 'Pago parcial'}
          </p>
          {venta.transacciones.length > 0 && (
            <ul className="mt-2 max-h-[40dvh] divide-y divide-surface-100 overflow-y-auto">
              {venta.transacciones.map((pago) => (
                <li key={pago.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span>{fechaVenta(pago.fecha_transaccion)}</span>
                  <span>{usdVentas.format(pago.monto_usd)} · {numeroVentas.format(100 * pago.monto_usd / venta.total)} %</span>
                </li>
              ))}
            </ul>
          )}
        </ModalBase>
      )}
    </div>
  );
}
