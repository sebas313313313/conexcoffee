import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { PROCESOS_COSECHA } from '../../../lib/constants';

export default function EditarPreOfertaModal({ isOpen, onClose, preoferta, onGuardar }) {
  const [preofertaEdicion, setPreofertaEdicion] = useState(preoferta);

  if (!isOpen || !preofertaEdicion) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preofertaEdicion.cantidadKg || !preofertaEdicion.precioEstimadoCop) {
      toast.error('Complete los campos requeridos (*)');
      return;
    }

    onGuardar(preofertaEdicion);
    toast.success('Pre-oferta actualizada con éxito');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-base">
            Editar Pre-Oferta ({preofertaEdicion.codigo})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Cantidad de Café (Kg) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={preofertaEdicion.cantidadKg}
                onChange={(e) =>
                  setPreofertaEdicion({
                    ...preofertaEdicion,
                    cantidadKg: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Precio Estimado por Carga ($ COP) *
              </label>
              <input
                type="number"
                min="100000"
                step="10000"
                required
                value={preofertaEdicion.precioEstimadoCop}
                onChange={(e) =>
                  setPreofertaEdicion({
                    ...preofertaEdicion,
                    precioEstimadoCop: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Proceso de Cosecha
            </label>
            <select
              value={preofertaEdicion.procesoCosecha}
              onChange={(e) =>
                setPreofertaEdicion({
                  ...preofertaEdicion,
                  procesoCosecha: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
            >
              {PROCESOS_COSECHA.map((proc) => (
                <option key={proc} value={proc}>
                  {proc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Descripción del Proceso (máx 500 caracteres)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={preofertaEdicion.descripcion || ''}
              onChange={(e) =>
                setPreofertaEdicion({
                  ...preofertaEdicion,
                  descripcion: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-xl resize-none"
            />
          </div>

          {/* Certificación (Opcional - PDF o Imagen) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Certificación de Café (Opcional - PDF o Imagen)
            </label>
            <div className="border border-dashed border-stone-300 rounded-xl p-3 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <Upload className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="text-xs text-stone-600 truncate">
                  {preofertaEdicion.certificadoNombre || 'Seleccionar archivo PDF o Imagen...'}
                </span>
              </div>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setPreofertaEdicion({
                      ...preofertaEdicion,
                      certificadoNombre: file.name,
                      certificadoArchivo: URL.createObjectURL(file),
                    });
                  }
                }}
                className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Formatos permitidos: PDF, JPG, PNG (no obligatorio)
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-terracota hover:bg-brand-terracota-dark text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
