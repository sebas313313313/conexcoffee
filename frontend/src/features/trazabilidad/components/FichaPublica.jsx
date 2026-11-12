import { Coffee, MapPin, PackageCheck, UserRound } from 'lucide-react';

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const dato = (label, value) => value == null || value === '' ? null : (
  <div className="rounded-xl bg-surface-50 p-4">
    <dt className="text-xs font-semibold uppercase tracking-wide text-surface-500">{label}</dt>
    <dd className="mt-1 font-semibold text-surface-900">{value}</dd>
  </div>
);

export default function FichaPublica({ ficha }) {
  const precio = ficha.precio_esperado_cop == null ? null :
    formatoPrecio.format(Number(ficha.precio_esperado_cop));
  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-brand-tint p-6">
        <div className="flex items-center gap-3 text-brand-terracota"><Coffee className="h-7 w-7" /><span className="text-sm font-bold uppercase tracking-wide">Trazabilidad ConexCoffee</span></div>
        <h1 className="mt-3 text-3xl font-bold text-surface-900">Café con origen verificable</h1>
        <p className="mt-2 text-surface-600">Precinto {ficha.serial} · Saco {ficha.numero_saco_consecutivo}</p>
      </header>
      <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-surface-900"><PackageCheck className="h-5 w-5 text-brand-terracota" />El café</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dato('Variedad', ficha.variedad)}{dato('Especie', ficha.especie)}
          {dato('Proceso', ficha.proceso)}{dato('Secado', ficha.secado)}
          {dato('Código de preoferta', ficha.codigo_preoferta)}{dato('Peso neto del saco', `${ficha.peso_neto_kg} kg`)}
          {dato('Estado del saco', ficha.estado_saco)}{dato('Precio esperado de la oferta', precio)}
        </dl>
      </section>
      <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-surface-900"><MapPin className="h-5 w-5 text-brand-terracota" />Origen</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dato('Finca', ficha.nombre_finca)}{dato('Municipio', ficha.municipio)}
          {dato('Departamento', ficha.departamento)}{dato('Vereda', ficha.vereda)}
          {dato('Altitud', ficha.altitud_msnm == null ? null : `${ficha.altitud_msnm} m s. n. m.`)}
        </dl>
      </section>
      <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-surface-900"><UserRound className="h-5 w-5 text-brand-terracota" />Productor</h2>
        <dl className="grid gap-3 sm:grid-cols-2">{dato('Nombre', ficha.productor_nombre)}{dato('Correo', ficha.productor_correo)}</dl>
      </section>
    </div>
  );
}
