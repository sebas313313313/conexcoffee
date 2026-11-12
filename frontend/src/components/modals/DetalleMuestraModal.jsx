import { useState } from 'react';
import { FlaskConical, Grid3X3, Images } from 'lucide-react';
import ModalBase from './ModalBase';
import { Button } from '@/components/ui';

function FotoMuestra({ foto }) {
  const [fallo, setFallo] = useState(false);
  const url = fallo ? foto.referencia : (foto.url || foto.referencia);
  const ilustrativa = fallo || !foto.url;

  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-surface-200 bg-white">
      {url ? (
        <img src={url} alt={ilustrativa ? `${foto.nombre}, imagen de referencia` : foto.nombre}
          loading="lazy" onError={ilustrativa ? undefined : () => setFallo(true)}
          className="aspect-4/3 w-full bg-surface-100 object-cover" />
      ) : <div className="grid aspect-4/3 place-items-center bg-surface-100 text-xs text-surface-600">Sin fotografía</div>}
      <figcaption className="px-3 py-2">
        <p className="text-sm font-semibold text-surface-900">{foto.nombre}</p>
        {url && ilustrativa && <p className="text-xs text-surface-500">Imagen de referencia</p>}
      </figcaption>
    </figure>
  );
}

function DatosMuestra({ titulo, datos }) {
  return (
    <section className="rounded-xl border border-surface-200 bg-white p-4">
      <h3 className="font-bold text-surface-900">{titulo}</h3>
      <dl className="mt-2 divide-y divide-surface-100 text-sm">
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 py-2">
            <dt className="text-surface-600">{etiqueta}</dt>
            <dd className="whitespace-pre-line break-words font-medium text-surface-900">{valor ?? 'Sin registrar'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ResumenGranulometria({ resultado }) {
  return (
    <section className="mb-3 rounded-xl border border-surface-200 bg-surface-50 p-4">
      <h4 className="flex items-center gap-2 text-sm font-bold text-surface-900">
        <Grid3X3 className="h-4 w-4 text-brand-terracota" aria-hidden="true" /> Granulometría
      </h4>
      {resultado ? (
        <>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-lg font-bold text-surface-900">Malla {resultado.malla}</p>
            <p className="text-sm font-semibold text-brand-terracota">
              {resultado.porcentaje ? `${resultado.porcentaje} retenido en esa malla o superiores` : 'Porcentaje sin registrar'}
            </p>
          </div>
          <p className="mt-1 text-xs text-surface-600">{resultado.origen}</p>
        </>
      ) : <p className="mt-2 text-sm text-surface-600">No hay una malla seleccionada ni datos que alcancen el 95 % acumulado.</p>}
    </section>
  );
}

export default function DetalleMuestraModal({ isOpen, onClose, ficha, sensorial, children }) {
  if (!ficha) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Detalle de la muestra" size="full">
      <div className="max-h-[70dvh] space-y-5 overflow-y-auto pr-1">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-tint px-4 py-3">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-brand-terracota" aria-hidden="true" />
            <div>
              <h2 className="font-mono text-lg font-bold text-surface-900">{ficha.codigoLote || ficha.codigo || 'Muestra'}</h2>
              {ficha.codigo && ficha.codigo !== ficha.codigoLote && <p className="text-xs text-surface-600">{ficha.codigo}</p>}
            </div>
          </div>
          {ficha.estado && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-terracota">{ficha.estado}</span>}
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <section>
            <h3 className="mb-3 flex items-center gap-2 font-bold text-surface-900">
              <Images className="h-4 w-4 text-brand-terracota" aria-hidden="true" /> Registro fotográfico
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ficha.fotos.map((foto) => <FotoMuestra key={foto.id} foto={foto} />)}
            </div>
          </section>
          <div className="min-w-0 space-y-4">
            <DatosMuestra titulo="Información de la muestra" datos={ficha.informacion} />
          </div>
        </div>
        <section aria-label="Resultados del análisis físico">
          <h3 className="mb-3 font-bold text-surface-900">Resultados del análisis físico</h3>
          <ResumenGranulometria resultado={ficha.granulometria} />
          <div className="grid gap-3 md:grid-cols-2">
            {ficha.resultados.map(({ titulo, datos }) => <DatosMuestra key={titulo} titulo={titulo} datos={datos} />)}
          </div>
        </section>
        {sensorial && <DatosMuestra titulo="Análisis sensorial" datos={sensorial} />}
        {children}
      </div>
      <div className="mt-4 flex justify-end border-t border-surface-200 pt-3">
        <Button type="button" variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </ModalBase>
  );
}
