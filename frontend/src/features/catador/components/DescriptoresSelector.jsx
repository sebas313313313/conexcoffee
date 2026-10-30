import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// DescriptoresSelector — Lista vertical limpia
// Estilo referencia: categoría como radio + pills de sub-opciones
// ============================================

const CATEGORIAS_DESCRIPTORES = [
  { categoria: 'Floral',            opciones: ['Jazmín', 'Rosa', 'Manzanilla'] },
  { categoria: 'Afrutado',          opciones: ['Bayas', 'Frutas deshidratadas', 'Cítricos'] },
  { categoria: 'Ácido / Fermentado',opciones: ['Ácido', 'Fermentado'] },
  { categoria: 'Verde / Vegetal',   opciones: ['Verde / Vegetal', 'Hierba fresca'] },
  { categoria: 'Otra',              opciones: ['Químico', 'Humedad / Tierra', 'Madera'] },
  { categoria: 'Tostado',           opciones: ['Cereal', 'Quemado', 'Tabaco'] },
  { categoria: 'Nueces / Cacao',    opciones: ['Nueces', 'Cacao'] },
  { categoria: 'Especias',          opciones: ['Canela', 'Clavo', 'Pimienta'] },
  { categoria: 'Dulce',             opciones: ['Vainilla', 'Azúcar morena', 'Miel / Caramelo'] },
];

const DEFAULT_SELECTED = [];
export { CATEGORIAS_DESCRIPTORES };

export default function DescriptoresSelector({
  selected = DEFAULT_SELECTED,
  onChange,
  titulo = 'Selecciona al menos una opción:',
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleOption = (opcion) => {
    if (selectedSet.has(opcion)) {
      onChange(selected.filter((x) => x !== opcion));
    } else {
      onChange([...selected, opcion]);
    }
  };

  // Categorías cuyas sub-opciones tienen alguna selección
  const catHasSelection = (cat) => cat.opciones.some((op) => selectedSet.has(op));

  return (
    <div className="space-y-1">
      {titulo && (
        <p className="text-xs text-surface-500 mb-2">{titulo}</p>
      )}

      {CATEGORIAS_DESCRIPTORES.map((cat) => {
        const catSelected = catHasSelection(cat);

        return (
          <div
            key={cat.categoria}
            className={cn(
              'flex items-start gap-3 py-2 px-3 rounded-lg transition-colors',
              catSelected ? 'bg-primary-50' : 'hover:bg-surface-50'
            )}
          >
            {/* Indicador de categoría (círculo radio-like) */}
            <div className={cn(
              'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
              catSelected
                ? 'border-primary-600 bg-primary-600'
                : 'border-surface-300'
            )}>
              {catSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>

            {/* Nombre de categoría + pills de sub-opciones */}
            <div className="flex-1 min-w-0">
              <span className={cn(
                'text-xs font-semibold block leading-tight mb-1.5',
                catSelected ? 'text-primary-700' : 'text-surface-700'
              )}>
                {cat.categoria}
              </span>

              {cat.opciones.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cat.opciones.map((op) => {
                    const isSelected = selectedSet.has(op);
                    return (
                      <button
                        key={op}
                        type="button"
                        onClick={() => toggleOption(op)}
                        className={cn(
                          'text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all cursor-pointer',
                          isSelected
                            ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                            : 'bg-white text-surface-600 border-surface-200 hover:border-primary-400 hover:text-primary-600'
                        )}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Resumen de seleccionados */}
      {selected.length > 0 && (
        <div className="pt-2 mt-1 border-t border-surface-100">
          <span className="text-[10px] text-surface-400 uppercase tracking-wide font-semibold">
            Seleccionados ({selected.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {selected.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleOption(s)}
                className="text-[11px] font-medium bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full hover:bg-primary-200 transition-colors cursor-pointer"
                title="Clic para quitar"
              >
                {s} ×
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
