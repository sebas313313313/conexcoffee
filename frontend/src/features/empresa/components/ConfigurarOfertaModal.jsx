import { useEffect, useState } from 'react';
import { cargarTrmVigente } from '@/context/empresa/trm';
import { ModalBase } from '@/components/modals';
import { Button, Input } from '@/components/ui';
import { calcularEmpaque, empaquesOferta, obtenerMallaOferta } from '../lib/configuracionOferta';

const usd = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', currencyDisplay: 'code' });
const cop = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function ConfigurarOfertaModal({ oferta, configuracion, onClose, onConfirmar }) {
  const [precio, setPrecio] = useState(configuracion?.precioCop ?? '');
  const [trm, setTrm] = useState(null);
  const [intento, setIntento] = useState(0);
  const [empaque, setEmpaque] = useState(configuracion?.empaqueKg ?? '');
  const [instrucciones, setInstrucciones] = useState(configuracion?.instrucciones ?? '');

  const cantidadKg = Number(oferta.cantidad_kg) || 0;
  const mallaOferta = obtenerMallaOferta(oferta);
  const precioKiloCop = Number(precio) > 0 ? Number(precio) : null;
  const tasaDolar = trm?.tasa ? Number(trm.tasa) : null;

  const { sacos, restante } = calcularEmpaque(cantidadKg, Number(empaque));
  const precioUsd = precioKiloCop != null && tasaDolar ? precioKiloCop / tasaDolar : null;
  const totalLoteCop = precioKiloCop != null && cantidadKg > 0 ? precioKiloCop * cantidadKg : null;
  const totalLoteUsd = totalLoteCop != null && tasaDolar ? totalLoteCop / tasaDolar : null;

  useEffect(() => {
    const controller = new AbortController();
    cargarTrmVigente(controller.signal)
      .then((vigente) => { if (!controller.signal.aborted) setTrm(vigente); })
      .catch(() => { if (!controller.signal.aborted) setTrm({ error: true }); });
    return () => controller.abort();
  }, [intento]);

  const confirmar = (event) => {
    event.preventDefault();
    if (!(Number(precio) > 0) || !empaquesOferta.includes(Number(empaque))) return;
    onConfirmar({
      precioCop: Number(precio),
      tasaCop: trm?.tasa ?? null,
      fechaTrm: trm?.fecha ?? null,
      precioUsd: precioUsd == null ? null : Number(precioUsd.toFixed(2)),
      cantidadKg,
      malla: mallaOferta,
      precioProyectadoLoteCop: totalLoteCop == null ? null : Number(totalLoteCop.toFixed(2)),
      precioTotalLoteCop: totalLoteCop == null ? null : Number(totalLoteCop.toFixed(2)),
      precioTotalLoteUsd: totalLoteUsd == null ? null : Number(totalLoteUsd.toFixed(2)),
      empaqueKg: Number(empaque),
      sacos,
      restante,
      instrucciones: instrucciones.trim(),
    });
  };

  return (
    <ModalBase isOpen onClose={onClose} title={`Configurar oferta · ${oferta.codigo}`} size="xl">
      <form onSubmit={confirmar} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-surface-600">{oferta.variedad} · {cantidadKg.toLocaleString('es-CO')} kg</p>
            <span
              role="status"
              aria-label={`Ofertado sobre malla ${mallaOferta}`}
              className="inline-flex items-center rounded-full border border-brand-terracota/30 bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand-terracota"
            >
              Ofertado sobre malla {mallaOferta}
            </span>
          </div>
          <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs text-surface-700">
            <span role="status">
              {trm?.tasa ? <>TRM vigente <strong className="tabular-nums">1 USD = {cop.format(trm.tasa)} COP</strong></>
                : trm?.error ? 'TRM vigente no disponible' : 'Consultando TRM…'}
            </span>
            {trm?.error && <button type="button" className="ml-2 font-semibold text-brand-terracota underline"
              onClick={() => { setTrm(null); setIntento((valor) => valor + 1); }}>Reintentar</button>}
          </div>
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-2">
          <Input label="Precio por kilo (COP)" type="number" min="0.01" step="0.01" required value={precio}
            onChange={(event) => setPrecio(event.target.value)} />
          <div className="rounded-lg bg-brand-tint px-3 py-2">
            <p className="text-xs text-surface-600">Precio estimado en USD/kg</p>
            <output aria-label="Precio estimado en USD por kilo" className="font-bold text-brand-terracota">
              {precioUsd == null ? '—' : usd.format(precioUsd)}
            </output>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-surface-200 bg-surface-50 p-3.5" aria-label="Resumen de valor total del lote">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-200 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-700">
              Valor total del lote (No modificable)
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-surface-600">
              <span className="rounded-md bg-white px-2 py-0.5 font-medium text-surface-700 border border-surface-200 tabular-nums">
                Café: {cantidadKg.toLocaleString('es-CO')} kg
              </span>
              <span className="rounded-md bg-white px-2 py-0.5 font-medium text-surface-700 border border-surface-200 tabular-nums">
                Dólar: {tasaDolar ? `${cop.format(tasaDolar)} COP` : '—'}
              </span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="select-none rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-surface-600">Total del lote en Pesos (COP)</p>
                <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-surface-500">
                  Fijo
                </span>
              </div>
              <output
                aria-label="Total del lote en pesos colombianos"
                className="mt-1 block text-base font-bold text-surface-900 tabular-nums"
              >
                {totalLoteCop == null ? '—' : `$ ${cop.format(totalLoteCop)} COP`}
              </output>
              <p className="mt-0.5 text-[11px] text-surface-500 tabular-nums">
                {precioKiloCop != null
                  ? `${cantidadKg.toLocaleString('es-CO')} kg × $ ${cop.format(precioKiloCop)} COP/kg`
                  : 'Se calcula al ingresar el precio por kilo'}
              </p>
            </div>
            <div className="select-none rounded-lg border border-brand-terracota/25 bg-brand-tint px-3.5 py-2.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-surface-700">Total del lote en Dólares (USD)</p>
                <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-terracota">
                  Fijo
                </span>
              </div>
              <output
                aria-label="Total del lote en dólares"
                className="mt-1 block text-base font-bold text-brand-terracota tabular-nums"
              >
                {totalLoteUsd == null ? '—' : usd.format(totalLoteUsd)}
              </output>
              <p className="mt-0.5 text-[11px] text-surface-600 tabular-nums">
                {totalLoteCop != null && tasaDolar
                  ? `Conversión a TRM (${cop.format(tasaDolar)} COP/USD)`
                  : 'Requiere precio por kilo y TRM vigente'}
              </p>
            </div>
          </div>
          <p id="precio-proyectado-ayuda" className="text-xs text-surface-600">
            Valores calculados automáticamente con la cantidad de café y el precio del dólar; solo cambian si se modifica el precio por kilo.
          </p>
        </div>
        <label className="block text-sm font-medium text-surface-700">Empaque
          <select required value={empaque} onChange={(event) => setEmpaque(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-surface-300 bg-white px-3 py-2">
            <option value="">Selecciona el tamaño del saco</option>
            {empaquesOferta.map((kg) => <option key={kg} value={kg}>Saco de {kg} kg</option>)}
          </select>
        </label>
        {empaque && (
          <p role="status" className="rounded-lg bg-surface-50 p-3 text-sm text-surface-700">
            <strong>{sacos} {sacos === 1 ? 'saco completo' : 'sacos completos'}</strong>
            {restante > 0 && ` · ${restante.toLocaleString('es-CO')} kg sin empacar`}
          </p>
        )}
        <label className="block text-sm font-medium text-surface-700">Instrucciones de empaque o rotulado (opcional)
          <textarea value={instrucciones} maxLength={300} onChange={(event) => setInstrucciones(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2" rows={2} />
        </label>
        <div className="flex flex-wrap justify-end gap-2 border-t border-surface-200 pt-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Aceptar configuración</Button>
        </div>
      </form>
    </ModalBase>
  );
}
