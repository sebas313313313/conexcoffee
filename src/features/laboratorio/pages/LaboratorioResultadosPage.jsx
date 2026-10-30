import { useState } from 'react';
import { Card } from '@/components/ui';
import {
  Search,
  Eye,
  CheckCircle2,
  Printer,
  FlaskConical,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import { useResultados, useActualizarResultado } from '../hooks/useLaboratorioData';
import { VerResultadoModal, GenerarReporteModal } from '../components';

export default function LaboratorioResultadosPage() {
  const query = useResultados();
  const actualizarResultado = useActualizarResultado();
  const resultados = query.data ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Modales
  const [modalVer, setModalVer] = useState(false);
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState(null);

  const [modalReporte, setModalReporte] = useState(false);
  const [hojaReporte, setHojaReporte] = useState(null);

  const listaResultados = resultados;

  // Filtrado
  const resultadosFiltrados = listaResultados.filter((item) => {
    const term = searchTerm.toLowerCase();
    const coincideTexto =
      item.codigo.toLowerCase().includes(term) ||
      item.variedad.toLowerCase().includes(term) ||
      item.proceso.toLowerCase().includes(term) ||
      item.finca.toLowerCase().includes(term);

    const coincideEstado =
      filtroEstado === 'Todos' || item.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  if (query.isLoading || query.isError) {
    return <QueryState query={query} />;
  }

  // Acciones
  const handleAbrirVer = (item) => {
    setResultadoSeleccionado(item);
    setModalVer(true);
  };

  const handleAprobarMuestra = (item) => {
    actualizarResultado.mutate({
      ...item,
      estado: 'Aprobada',
      es_conforme: true,
    });

    if (resultadoSeleccionado && resultadoSeleccionado.id === item.id) {
      setResultadoSeleccionado((prev) => ({ ...prev, estado: 'Aprobada' }));
    }
  };

  const handleAbrirReporte = (item) => {
    // Adaptar formato esperado por GenerarReporteModal
    setHojaReporte({
      codigoLote: item.codigo,
      variedad: item.variedad,
      proceso: item.proceso,
      caficultor: item.caficultor,
      finca: item.finca,
      fecha: item.analisisFisico?.fechaAnalisisLaboratorio?.split(' ')[0] || '2024-01-16',
      puntajeFinal: 86.5,
    });
    setModalReporte(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-brand-terracota">
              <FlaskConical className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracota">
              Laboratorio de Calidad
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Resultados de Muestras
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Consulta los resultados gravimétricos, análisis físico, evidencias fotográficas y emite aprobaciones oficiales.
          </p>
        </div>

        {/* Resumen rápido */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200/80 text-xs font-semibold text-stone-700">
          <span>Aprobadas:</span>
          <span className="font-extrabold text-emerald-700">
            {resultados.filter((r) => r.estado === 'Aprobada').length}
          </span>
          <span className="text-stone-300">|</span>
          <span>Pendientes:</span>
          <span className="font-extrabold text-amber-700">
            {resultados.filter((r) => r.estado === 'Pendiente').length}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, variedad, proceso o finca..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-semibold">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobada">Aprobada</option>
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Código</th>
                <th className="py-3.5 px-4 font-bold">Variedad</th>
                <th className="py-3.5 px-4 font-bold">Proceso</th>
                <th className="py-3.5 px-4 font-bold">Peso</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs">
              {resultadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-stone-400">
                    No se encontraron resultados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                resultadosFiltrados.map((item) => {
                  const estaAprobada = item.estado === 'Aprobada';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/80 transition-colors"
                    >
                      {/* Código */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-stone-900 bg-amber-50 text-brand-terracota px-2.5 py-1 rounded-md border border-amber-200/60">
                          {item.codigo}
                        </span>
                      </td>

                      {/* Variedad */}
                      <td className="py-3.5 px-4">
                        <strong className="text-stone-900 font-bold block">
                          {item.variedad}
                        </strong>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {item.finca}
                        </span>
                      </td>

                      {/* Proceso */}
                      <td className="py-3.5 px-4 text-stone-700 font-medium">
                        {item.proceso}
                      </td>

                      {/* Peso */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                        {item.peso}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            estaAprobada
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {estaAprobada ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Aprobada
                            </>
                          ) : (
                            'Pendiente'
                          )}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botón 1: Ver */}
                          <button
                            type="button"
                            onClick={() => handleAbrirVer(item)}
                            title="Ver detalle completo y evidencias"
                            aria-label="Ver detalle completo"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-700 hover:text-brand-terracota hover:border-brand-terracota hover:bg-amber-50/50 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Botón 2: Aprobar esa muestra */}
                          <button
                            type="button"
                            onClick={() => handleAprobarMuestra(item)}
                            disabled={estaAprobada}
                            title={
                              estaAprobada
                                ? 'Muestra ya aprobada'
                                : 'Aprobar esta muestra'
                            }
                            aria-label="Aprobar esta muestra"
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors shadow-2xs cursor-pointer ${
                              estaAprobada
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default opacity-80'
                                : 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 active:scale-95'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Botón 3: Generar reporte */}
                          <button
                            type="button"
                            onClick={() => handleAbrirReporte(item)}
                            title="Generar reporte oficial"
                            aria-label="Generar reporte oficial"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Ver Detalle con 5 fotos y resultados físicos */}
      <VerResultadoModal
        isOpen={modalVer}
        onClose={() => setModalVer(false)}
        resultado={resultadoSeleccionado}
        onAprobar={handleAprobarMuestra}
        onGenerarReporte={handleAbrirReporte}
      />

      {/* Modal Generar Reporte */}
      <GenerarReporteModal
        isOpen={modalReporte}
        onClose={() => setModalReporte(false)}
        hoja={hojaReporte}
      />
    </div>
  );
}
