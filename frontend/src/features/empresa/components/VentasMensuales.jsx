import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import VentasPorCafeChart from '@/components/data-display/VentasPorCafeChart';
import { useVentasEmpresa } from '../hooks/useVentasEmpresa';
import { numeroVentas, usdVentas } from '../lib/formatoVentas';

const claveMes = new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: '2-digit', timeZone: 'America/Bogota' });
const nombreMes = new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', timeZone: 'UTC' });

export default function VentasMensuales() {
  const { contenedores, cargando, error, reintentar } = useVentasEmpresa(true);
  const [seleccion, setSeleccion] = useState('');
  const demo = contenedores.find((item) => item.esDePrueba);
  const ventas = contenedores.flatMap((item) => item.ventas).filter((venta) => Number.isFinite(Date.parse(venta.fecha)));
  const porMes = Map.groupBy(ventas, (venta) => claveMes.format(new Date(venta.fecha)));
  const meses = [...porMes.keys()].sort().reverse();
  const mes = porMes.has(seleccion) ? seleccion : meses[0] ?? '';
  const ventasMes = porMes.get(mes) ?? [];
  const kilosPorVariedad = new Map();
  for (const { variedad, kilos } of ventasMes) {
    if (kilos <= 0) continue;
    const nombre = variedad || 'Variedad sin registrar';
    kilosPorVariedad.set(nombre, (kilosPorVariedad.get(nombre) ?? 0) + kilos);
  }
  const variedades = [...kilosPorVariedad].map(([nombre, valor]) => ({ nombre, valor })).sort((a, b) => b.valor - a.valor);
  const items = variedades.length > 5
    ? [...variedades.slice(0, 4), { nombre: 'Otras variedades', valor: variedades.slice(4).reduce((suma, item) => suma + item.valor, 0) }]
    : variedades;

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-surface-900">Ventas por mes</h2>
          <p className="text-sm text-surface-600">Distribución por kilos en pedidos con pago confirmado.</p>
        </div>
        {meses.length > 0 && (
          <label className="text-sm font-semibold text-surface-700">Mes de compra
            <select value={mes} onChange={(event) => setSeleccion(event.target.value)}
              className="ml-2 rounded-lg border border-surface-200 bg-white px-2 py-1.5">
              {meses.map((item) => <option key={item} value={item}>{nombreMes.format(new Date(`${item}-01T00:00:00Z`))}</option>)}
            </select>
          </label>
        )}
      </div>
      {demo && (
        <p className="mb-4 rounded-lg bg-brand-tint px-3 py-2 text-xs text-brand-terracota">
          Datos de prueba · La gráfica muestra compras ficticias.
          {demo.actividadNoDisponible && ' No se pudo cargar la actividad real.'}
        </p>
      )}
      {cargando ? <p role="status" className="text-sm text-surface-600">Cargando ventas…</p>
        : error ? <div className="flex flex-wrap items-center gap-3">
          <p role="alert" className="text-sm text-surface-600">{error}</p>
          {reintentar && <Button size="sm" variant="outline" onClick={reintentar}>Reintentar</Button>}
        </div>
        : meses.length ? (
          <>
            <p className="mb-3 text-sm font-medium text-surface-700">
              {numeroVentas.format(ventasMes.reduce((suma, item) => suma + item.kilos, 0))} kg ·
              {' '}{usdVentas.format(ventasMes.reduce((suma, item) => suma + item.pagado, 0))} abonados en estos pedidos
            </p>
            {items.length > 0 ? <VentasPorCafeChart items={items} />
              : <p className="text-sm text-surface-600">Los pedidos de este mes no tienen kilos registrados.</p>}
          </>
        ) : <p className="text-sm text-surface-600">Todavía no hay pedidos pagados con fecha de compra.</p>}
      <Link to="/empresa/ventas" className="mt-4 inline-block text-sm font-semibold text-brand-terracota hover:underline">Ver ventas</Link>
    </Card>
  );
}
