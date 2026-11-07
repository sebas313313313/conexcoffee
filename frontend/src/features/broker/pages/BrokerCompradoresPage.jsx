import { useState } from 'react';
import { ArrowRight, Globe, Search } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import ModalBase from '@/components/modals/ModalBase';
import { useBroker } from '@/hooks/useBroker';
import { crearCarteraDemo } from '../data/carteraDemo';

const usd = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', currencyDisplay: 'code' });
const kilos = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });

export default function BrokerCompradoresPage() {
  const { cartera: { pais, clientes: clientesReales }, loading, error, refetch } = useBroker();
  const mostrarDemo = import.meta.env.DEV && Boolean(pais) && !loading && !error && clientesReales.length === 0;
  const clientes = mostrarDemo ? crearCarteraDemo(pais) : clientesReales;
  const [busqueda, setBusqueda] = useState('');
  const [clienteId, setClienteId] = useState(null);
  const cliente = clientes.find((item) => item.id === clienteId);
  const termino = busqueda.trim().toLowerCase();
  const visibles = clientes.filter((item) =>
    [item.nombre_empresa, item.ciudad, ...item.historial.map((pedido) => pedido.codigo_pedido)]
      .some((valor) => valor?.toLowerCase().includes(termino))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-terracota">
          <Globe className="h-4 w-4" aria-hidden="true" />
          {pais || 'Mercado asignado'}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-surface-900">Compradores</h1>
        <p className="mt-1 text-sm text-surface-600">Consulta los clientes de tu mercado con anticipos o pagos completos.</p>
      </header>

      <Card>
        {mostrarDemo && (
          <p className="mb-4 rounded-lg bg-brand-tint px-3 py-2 text-sm font-medium text-brand-terracota">
            Datos de prueba · Clientes y pedidos ficticios de {pais}.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 pb-4">
          <h2 className="font-semibold text-surface-900">Cartera de clientes <span className="ml-1 text-sm text-surface-500">({clientes.length})</span></h2>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Buscar clientes</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" aria-hidden="true" />
            <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Empresa, ciudad o pedido"
              className="w-full rounded-lg border border-surface-200 py-2 pl-9 pr-3 text-sm" />
          </label>
        </div>

        {loading ? <p className="py-8 text-sm text-surface-600" role="status">Cargando compradores…</p>
          : error ? (
            <div className="flex flex-wrap items-center gap-3 py-8">
              <p className="text-sm text-surface-600">No se pudo cargar la cartera completa.</p>
              <Button variant="outline" size="sm" onClick={refetch}>Reintentar</Button>
            </div>
          ) : visibles.length ? (
            <ul className="divide-y divide-surface-100">
              {visibles.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="font-semibold text-surface-900">{item.nombre_empresa}</p>
                    <p className="text-sm text-surface-500">{item.ciudad || item.pais_destino}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-surface-900">{usd.format(item.totalUsd)} pagados</p>
                    <p className="text-surface-500">{item.historial.length} {item.historial.length === 1 ? 'compra' : 'compras'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setClienteId(item.id)} aria-label={`Ver historial de ${item.nombre_empresa}`}>
                    Ver historial <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-sm text-surface-600">
            {!pais ? 'Tu perfil de broker no tiene un país de operación disponible.'
              : termino ? 'No se encontraron clientes para esta búsqueda.'
              : 'Todavía no hay pedidos con pagos registrados en este mercado.'}
          </p>}
      </Card>

      <ModalBase isOpen={Boolean(cliente) && !loading && !error} onClose={() => setClienteId(null)}
        title={cliente ? `${cliente.nombre_empresa}${mostrarDemo ? ' · Datos de prueba' : ''}` : 'Historial de compras'} size="2xl">
        {cliente && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-surface-600">{[cliente.ciudad, cliente.pais_destino].filter(Boolean).join(', ')}</p>
              {cliente.telefono_contacto && <a className="text-sm font-medium text-brand-terracota" href={`tel:${cliente.telefono_contacto}`}>{cliente.telefono_contacto}</a>}
            </div>
            <h3 className="font-semibold text-surface-900">Historial de compras</h3>
            <ul className="max-h-[55vh] divide-y divide-surface-200 overflow-y-auto">
              {cliente.historial.map((pedido) => (
                <li key={pedido.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-surface-900">{pedido.codigo_pedido}</p>
                    <p className="text-surface-500">{pedido.fecha_pedido ? fecha.format(new Date(pedido.fecha_pedido)) : 'Fecha sin registrar'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-surface-900">{usd.format(pedido.montoPagado)} pagados</p>
                    <p className="text-surface-500">
                      {kilos.format(pedido.total_kilos)} kg · {pedido.pagoCompleto ? 'Pago completo' : 'Anticipo pagado'}
                    </p>
                    {!pedido.pagoCompleto && <p className="text-surface-500">Total del pedido: {usd.format(pedido.monto_total_usd)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ModalBase>
    </div>
  );
}

