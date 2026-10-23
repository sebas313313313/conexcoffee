import { useState } from 'react';
import { Card } from '@/components/ui';
import { Eye, Coffee, Award, Sparkles, Scale, Search } from 'lucide-react';
import { MUESTRAS_DATA } from '../data/laboratorioData';
import { VerMuestraModal } from '../components';

export default function LaboratorioMuestrasPage() {
  const [muestras] = useState(MUESTRAS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [muestraVer, setMuestraVer] = useState(null);

  // Estado para el tooltip flotante no genérico (Fixed sin recortes)
  const [activeTooltip, setActiveTooltip] = useState(null);

  const handleMouseEnterPerfil = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      item,
    });
  };

  const handleMouseLeavePerfil = () => {
    setActiveTooltip(null);
  };

  const muestrasFiltradas = muestras.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.codigoLote.toLowerCase().includes(term) ||
      item.variedad.toLowerCase().includes(term) ||
      item.proceso.toLowerCase().includes(term) ||
      item.finca.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Evaluación de Calidad — Muestras de Café
        </h1>
        <p className="text-surface-500 mt-1">
          Control de muestras de café verde, factor de rendimiento y evaluación del perfil sensorial
        </p>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-4">
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

        <div className="text-xs text-stone-500 font-semibold">
          Total Muestras:{' '}
          <span className="font-extrabold text-[#AD2E01]">
            {muestrasFiltradas.length}
          </span>
        </div>
      </div>

      {/* Tabla Principal */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface-50 text-surface-600 border-b border-surface-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Código</th>
                <th className="py-3.5 px-4 font-bold">Variedad</th>
                <th className="py-3.5 px-4 font-bold">Proceso</th>
                <th className="py-3.5 px-4 font-bold text-center">Factor de Rendimiento</th>
                <th className="py-3.5 px-4 font-bold text-center">Puntaje SCA</th>
                <th className="py-3.5 px-4 font-bold">Perfil</th>
                <th className="py-3.5 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 text-xs">
              {muestrasFiltradas.map((item) => (
                <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                  {/* Código */}
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className="text-surface-900 bg-surface-100 px-2.5 py-1 rounded">
                      {item.codigoLote}
                    </span>
                  </td>

                  {/* Variedad */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-stone-900 block">
                      {item.variedad}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {item.finca}
                    </span>
                  </td>

                  {/* Proceso */}
                  <td className="py-3.5 px-4 text-stone-700 font-medium">
                    {item.proceso}
                  </td>

                  {/* Factor de Rendimiento */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-xs">
                      <Scale className="w-3.5 h-3.5 text-stone-500" />
                      {item.factorRendimiento}
                    </span>
                  </td>

                  {/* Puntaje SCA */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-[#AD2E01] font-mono font-bold rounded-lg border border-amber-200/60 text-xs shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {item.puntajeSca} pts
                    </span>
                  </td>

                  {/* Perfil con TOOLTIP NO GENÉRICO (Fixed sin recortes) */}
                  <td className="py-3.5 px-4">
                    <div
                      onMouseEnter={(e) => handleMouseEnterPerfil(e, item)}
                      onMouseLeave={handleMouseLeavePerfil}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/90 border border-amber-200 hover:border-amber-400 text-stone-800 hover:text-[#AD2E01] transition-all shadow-2xs cursor-help select-none group"
                    >
                      <Coffee className="w-3.5 h-3.5 text-[#AD2E01] shrink-0" />
                      <span className="font-semibold text-xs max-w-[160px] truncate">
                        {item.tituloPerfil || 'Perfil Sensorial'}
                      </span>
                      <Sparkles className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setMuestraVer(item)}
                      title="Ver detalle completo de la muestra"
                      aria-label="Ver detalle de la muestra"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-surface-200 bg-white text-surface-600 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/50 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-surface-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* TOOLTIP NO GENÉRICO FLOTANTE (Fixed - Viewport sin recortes) */}
      {/* ======================================================== */}
      {activeTooltip && (
        <div
          className="fixed z-[9999] pointer-events-none w-72 sm:w-80 p-3.5 bg-stone-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-stone-700/80 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: Math.max(16, Math.min(activeTooltip.left, window.innerWidth - 340)),
            top: activeTooltip.top > 230 ? activeTooltip.top - 8 : activeTooltip.bottom + 8,
            transform: activeTooltip.top > 230 ? 'translateY(-100%)' : 'translateY(0)',
          }}
        >
          {/* Cabecera del Tooltip */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-700/70 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-[#AD2E01] text-white">
                <Coffee className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Perfil de Catación
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400">
              {activeTooltip.item.codigoLote}
            </span>
          </div>

          {/* Título y Puntaje */}
          <div className="text-xs font-bold text-white mb-1.5 flex items-center justify-between">
            <span>{activeTooltip.item.tituloPerfil || 'Notas Sensoriales'}</span>
            <span className="text-amber-400 font-mono text-[11px] font-extrabold">
              {activeTooltip.item.puntajeSca} SCA
            </span>
          </div>

          {/* Descripción Sensorial Completa */}
          <p className="text-[11px] text-stone-200 leading-relaxed italic bg-black/40 p-2.5 rounded-lg border border-stone-800">
            "{activeTooltip.item.perfilSensorial || 'Sin notas descriptivas registradas.'}"
          </p>

          {/* Pie con Catador Responsable */}
          <div className="mt-2 pt-1.5 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
            <span>Catador evaluador:</span>
            <span className="font-semibold text-stone-200 uppercase">
              {activeTooltip.item.catador}
            </span>
          </div>

          {/* Flecha indicadora (Caret) */}
          {activeTooltip.top > 230 ? (
            <div className="absolute left-6 top-full w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-stone-900/95" />
          ) : (
            <div className="absolute left-6 bottom-full w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-stone-900/95" />
          )}
        </div>
      )}

      {/* Modal Ver Muestra */}
      <VerMuestraModal
        isOpen={!!muestraVer}
        onClose={() => setMuestraVer(null)}
        muestra={muestraVer}
      />
    </div>
  );
}
