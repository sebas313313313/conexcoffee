import { useState } from 'react';
import { Card } from '@/components/ui';
import { FileText, Check } from 'lucide-react';
import { QueryState } from '@/components/feedback';
import { useHojasCatacion, useActualizarHojaCatacion } from '../hooks/useLaboratorioData';
import { GenerarReporteModal } from '../components';

export default function LaboratorioHojasCatacionPage() {
  const query = useHojasCatacion();
  const actualizarHoja = useActualizarHojaCatacion();
  const hojas = query.data ?? [];
  const [hojaReporte, setHojaReporte] = useState(null);

  const handleTerminarHoja = (id) => {
    const item = hojas.find((h) => h.id === id);
    if (item) {
      actualizarHoja.mutate({
        ...item,
        estado: 'Completada',
      });
    }
  };

  if (query.isLoading || query.isError) {
    return <QueryState query={query} />;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Evaluación de Calidad — Hoja de Catación</h1>
        <p className="text-surface-500 mt-1">
          Registro formal de lotes por variedad, proceso de beneficio y emisión de reportes SCA
        </p>
      </div>

      {/* Tabla Principal */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface-50 text-surface-600 border-b border-surface-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Código de Lote</th>
                <th className="py-3 px-4">Variedad</th>
                <th className="py-3 px-4">Proceso</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {hojas.map((item, index) => (
                <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-surface-500 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-surface-900 bg-surface-100 px-2.5 py-1 rounded">
                      {item.codigoLote}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-surface-900 font-medium">
                    {item.variedad}
                  </td>
                  <td className="py-3.5 px-4 text-surface-900 font-medium">
                    {item.proceso}
                  </td>
                  <td className="py-3.5 px-4 text-center text-surface-900 font-medium">
                    {item.estado}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón 1: Generar un reporte */}
                      <button
                        type="button"
                        onClick={() => setHojaReporte(item)}
                        title="Generar un reporte"
                        aria-label="Generar un reporte"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-surface-200 bg-white text-surface-600 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-5 h-5 text-primary-600" />
                      </button>

                      {/* Botón 2: Terminar hojas de catación */}
                      <button
                        type="button"
                        disabled={item.estado === 'Completada'}
                        onClick={() => handleTerminarHoja(item.id, item.codigoLote)}
                        title={item.estado === 'Completada' ? 'Hoja de catación terminada' : 'Terminar hoja de catación'}
                        aria-label="Terminar hoja de catación"
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors shadow-2xs ${
                          item.estado === 'Completada'
                            ? 'opacity-40 cursor-not-allowed bg-surface-100 border-surface-200 text-surface-400'
                            : 'bg-white border-surface-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Generar Reporte */}
      <GenerarReporteModal
        isOpen={!!hojaReporte}
        onClose={() => setHojaReporte(null)}
        hoja={hojaReporte}
      />
    </div>
  );
}
