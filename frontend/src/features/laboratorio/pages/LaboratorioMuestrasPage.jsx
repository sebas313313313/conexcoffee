import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { Eye, Search } from 'lucide-react';
import { QueryState } from '@/components/feedback';
import { useMuestras } from '../hooks/useLaboratorioData';
import { VerMuestraModal } from '../components';

const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });
const mostrarFecha = (valor) => {
  if (!Number.isFinite(Date.parse(valor))) return 'Sin registrar';
  const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T12:00:00Z` : valor;
  return fecha.format(new Date(timestamp));
};

export default function LaboratorioMuestrasPage() {
  const query = useMuestras();
  const muestras = query.data ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [muestraVer, setMuestraVer] = useState(null);

  const term = searchTerm.trim().toLowerCase();
  const muestrasFiltradas = muestras.filter((item) =>
    [item.codigo, item.codigoLote, item.variedad, item.proceso, item.finca]
      .some((valor) => String(valor ?? '').toLowerCase().includes(term))
  );

  if (query.isLoading || query.isError) {
    return <QueryState query={query} />;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Evaluación de Calidad — Muestras de Café
        </h1>
        <p className="text-surface-500 mt-1">
          Consulta las muestras de café verde y sus mediciones.
        </p>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="search"
            aria-label="Buscar muestras"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, variedad, proceso o finca..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        <div className="text-xs text-stone-500 font-semibold">
          Total Muestras:{' '}
          <span className="font-extrabold text-brand-terracota">
            {muestrasFiltradas.length}
          </span>
        </div>
      </div>

      {/* Tabla Principal */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-surface-200 bg-surface-50 text-xs text-surface-600">
              <tr>
                {['N.º', 'Código / lote', 'Fecha de asignación de muestra', 'Peso de la muestra (g)', 'Humedad (%)', 'Acciones'].map((columna) => (
                  <th key={columna} scope="col" className="px-4 py-3.5 font-bold">{columna}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {muestrasFiltradas.map((item, indice) => (
                <tr key={item.id} className="hover:bg-surface-50">
                  <td className="px-4 py-3 tabular-nums text-surface-600">{indice + 1}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-surface-900">
                    {item.codigo || item.codigoLote || 'Sin registrar'}
                    {item.codigoLote && item.codigoLote !== item.codigo && item.codigo && (
                      <span className="block text-xs font-normal text-surface-500">{item.codigoLote}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{mostrarFecha(item.fecha_asignacion ?? item.fechaAsignacion)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {item.peso_muestra_analizada_gramos == null ? '—' : numero.format(Number(item.peso_muestra_analizada_gramos))}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {item.humedad_porcentaje == null ? '—' : numero.format(Number(item.humedad_porcentaje))}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setMuestraVer(item)}
                      aria-label={`Ver muestra ${item.codigo || item.codigoLote || indice + 1}`}>
                      <Eye className="h-4 w-4" aria-hidden="true" /> Ver
                    </Button>
                  </td>
                </tr>
              ))}
              {!muestrasFiltradas.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-surface-600">No se encontraron muestras.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Ver Muestra */}
      <VerMuestraModal
        isOpen={!!muestraVer}
        onClose={() => setMuestraVer(null)}
        muestra={muestraVer}
      />
    </div>
  );
}
