import { useState } from 'react';
import { Leaf, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { VARIEDADES_POR_ESPECIE } from '../../../lib/constants';

export default function RegistrarLoteModal({ isOpen, onClose, fincas, onGuardar }) {
  const [formData, setFormData] = useState({
    fincaId: '',
    nombreLote: '',
    especie: 'Arábica',
    variedad: 'Castillo',
    numeroArboles: '',
    distanciaArboles: '',
    distanciaSurcos: '',
    fertilizacionesAno: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fincaId || !formData.nombreLote) {
      toast.error('Complete la finca y el nombre del lote');
      return;
    }

    const fincaObj = fincas.find((f) => String(f.id) === String(formData.fincaId));

    const nuevoLote = {
      id: Date.now(),
      fincaId: formData.fincaId,
      fincaNombre: fincaObj ? fincaObj.nombre : 'Finca Desconocida',
      nombreLote: formData.nombreLote,
      especie: formData.especie,
      variedad: formData.variedad,
      numeroArboles: parseInt(formData.numeroArboles, 10) || 0,
      distanciaArboles: parseFloat(formData.distanciaArboles) || 0,
      distanciaSurcos: parseFloat(formData.distanciaSurcos) || 0,
      fertilizacionesAno: parseInt(formData.fertilizacionesAno, 10) || 0,
    };

    onGuardar(nuevoLote);
    toast.success('Lote registrado con éxito');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <Leaf className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Registrar Lote</h3>
              <p className="text-xs text-stone-500">Parámetros agronómicos de la siembra</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Finca a la que pertenece *
            </label>
            <select
              required
              value={formData.fincaId}
              onChange={(e) =>
                setFormData({ ...formData, fincaId: e.target.value })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium"
            >
              <option value="">Seleccione una finca...</option>
              {fincas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre} ({f.municipio}, {f.departamento})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nombre del Lote *</label>
            <input
              type="text"
              required
              value={formData.nombreLote}
              onChange={(e) =>
                setFormData({ ...formData, nombreLote: e.target.value })
              }
              placeholder="Ej. Lote El Roble"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Especie *</label>
              <select
                value={formData.especie}
                onChange={(e) => {
                  const esp = e.target.value;
                  setFormData({
                    ...formData,
                    especie: esp,
                    variedad: VARIEDADES_POR_ESPECIE[esp][0],
                  });
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
              >
                <option value="Arábica">Arábica</option>
                <option value="Robusta">Robusta</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Variedad de Café *</label>
              <select
                value={formData.variedad}
                onChange={(e) =>
                  setFormData({ ...formData, variedad: e.target.value })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
              >
                {VARIEDADES_POR_ESPECIE[formData.especie].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">N° Árboles</label>
              <input
                type="number"
                min="0"
                value={formData.numeroArboles}
                onChange={(e) =>
                  setFormData({ ...formData, numeroArboles: e.target.value })
                }
                placeholder="3500"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Distancia Árboles (m)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.distanciaArboles}
                onChange={(e) =>
                  setFormData({ ...formData, distanciaArboles: e.target.value })
                }
                placeholder="1.2"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Distancia Surcos (m)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.distanciaSurcos}
                onChange={(e) =>
                  setFormData({ ...formData, distanciaSurcos: e.target.value })
                }
                placeholder="1.8"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Fertilizaciones al Año
            </label>
            <input
              type="number"
              min="0"
              max="12"
              value={formData.fertilizacionesAno}
              onChange={(e) =>
                setFormData({ ...formData, fertilizacionesAno: e.target.value })
              }
              placeholder="Ej. 3"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
            />
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
              Guardar Lote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
