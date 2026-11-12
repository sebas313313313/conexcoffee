const COLORS = ['var(--color-brand-terracota)', 'var(--color-brand-orange)', 'var(--color-brand-amber)', 'var(--color-brand-teal)', 'var(--color-surface-500)'];

export default function VentasPorCafeChart({ items = [] }) {
  const total = items.reduce((sum, item) => sum + item.valor, 0);
  let offset = 0;
  const circumference = 2 * Math.PI * 40;
  const slices = items.map((item, index) => {
    const size = total ? (item.valor / total) * circumference : 0;
    const slice = { ...item, color: COLORS[index % COLORS.length], size, offset };
    offset += size;
    return slice;
  });
  const top = slices[0];
  return (
    <div className="flex flex-col sm:flex-row items-center gap-7">
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="Distribución de café vendido por variedad"><circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />{slices.map((slice) => <circle key={slice.nombre} cx="50" cy="50" r="40" fill="none" stroke={slice.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${Math.max(slice.size - 2, 0)} ${circumference}`} strokeDashoffset={-slice.offset} />)}</svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"><strong className="max-w-24 text-sm leading-tight text-surface-900">{top?.nombre || '—'}</strong><span className="mt-1 text-[10px] text-surface-500">más vendido</span></div>
      </div>
      <div className="w-full space-y-2">
          {slices.map((slice) => <div key={slice.nombre} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 min-w-0"><i className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} /><span className="truncate text-surface-700">{slice.nombre}</span></span><b className="text-surface-900">{total ? Math.round((slice.valor / total) * 100) : 0}%</b></div>)}
      </div>
    </div>
  );
}
