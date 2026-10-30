import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  VARIEDADES_POR_ESPECIE,
  TIPOS_SECADO,
  PROCESOS_COSECHA,
} from '../../../lib/constants';

export default function RegistrarPreOfertaModal({ isOpen, onClose, lotes, onGuardar }) {
  const [formData, setFormData] = useState({
    loteId: lotes[0] ? String(lotes[0].id) : '',
    especie: 'Arábica',
    variedad: 'Geisha',
    cantidadKg: '',
    fechaProduccion: new Date().toISOString().split('T')[0],
    tipoSecado: 'Solar',
    sombrio: 'Sí',
    tipoFermentacion: '',
    procesoCosecha: 'Lavado con fermentación',
    precioEstimadoCop: '',
    descripcionProceso: '',
    certificadoNombre: '',
    certificadoArchivo: null,
  });

  if (!isOpen) return null;

  const handleLoteChange = (loteId) => {
    const loteSel = lotes.find((l) => String(l.id) === String(loteId));
    if (loteSel) {
      setFormData({
        ...formData,
        loteId,
        especie: loteSel.especie,
        variedad: loteSel.variedad,
      });
    } else {
      setFormData({ ...formData, loteId });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.loteId || !formData.cantidadKg || !formData.precioEstimadoCop) {
      toast.error('Complete los campos requeridos (*)');
      return;
    }

    const loteSel = lotes.find((l) => String(l.id) === String(formData.loteId));
    const randomCodeNum = Math.floor(100 + Math.random() * 900);
    const codigoGenerado = `PRE-${randomCodeNum}`;

    const nueva = {
      id: Date.now(),
      codigo: codigoGenerado,
      loteId: formData.loteId,
      loteNombre: loteSel ? loteSel.nombreLote : 'Lote Personalizado',
      especie: formData.especie,
      variedad: formData.variedad,
      cantidadKg: parseFloat(formData.cantidadKg) || 0,
      fechaProduccion: formData.fechaProduccion,
      tipoSecado: formData.tipoSecado,
      sombrio: formData.sombrio,
      tipoFermentacion: formData.tipoFermentacion || 'Estándar',
      procesoCosecha: formData.procesoCosecha,
      precioEstimadoCop: parseFloat(formData.precioEstimadoCop) || 0,
      descripcion: formData.descripcionProceso,
      certificadoNombre: formData.certificadoNombre || '',
      certificadoArchivo: formData.certificadoArchivo || '',
      estado: 'En Evaluación',
    };

    onGuardar(nueva);
    toast.success('Pre-oferta registrada con éxito');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-base">Registrar Pre-Oferta</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Lote, Especie y Variedad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Seleccionar Lote *
              </label>
              <select
                required
                value={formData.loteId}
                onChange={(e) => handleLoteChange(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium"
              >
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombreLote} ({l.variedad})
                  </option>
                ))}
              </select>
            </div>

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
                onChange={(e) => setFormData({ ...formData, variedad: e.target.value })}
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

          {/* Cantidad y Fecha de Producción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Cantidad de Café Ofertado (Kg) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.cantidadKg}
                onChange={(e) => setFormData({ ...formData, cantidadKg: e.target.value })}
                placeholder="Ej. 1200"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Fecha de Producción *
              </label>
              <input
                type="date"
                required
                value={formData.fechaProduccion}
                onChange={(e) =>
                  setFormData({ ...formData, fechaProduccion: e.target.value })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Tipo de Secado y Sombrío */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tipo de Secado *
              </label>
              <select
                value={formData.tipoSecado}
                onChange={(e) => setFormData({ ...formData, tipoSecado: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
              >
                {TIPOS_SECADO.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Sombrío *
              </label>
              <select
                value={formData.sombrio}
                onChange={(e) => setFormData({ ...formData, sombrio: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
              >
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Procesos de Cosecha */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Procesos de Cosecha *
            </label>
            <select
              value={formData.procesoCosecha}
              onChange={(e) => setFormData({ ...formData, procesoCosecha: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
            >
              {PROCESOS_COSECHA.map((proc) => (
                <option key={proc} value={proc}>
                  {proc}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción del tipo de fermentación */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Descripción del tipo de fermentación que se le dio al café
            </label>
            <input
              type="text"
              value={formData.tipoFermentacion}
              onChange={(e) =>
                setFormData({ ...formData, tipoFermentacion: e.target.value })
              }
              placeholder="Ej. Fermentación anaeróbica en cereza 48h en tanques sellados"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          {/* Precio Estimado por Carga */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Precio Estimado por Carga ($ COP) *
            </label>
            <input
              type="number"
              min="100000"
              step="10000"
              required
              value={formData.precioEstimadoCop}
              onChange={(e) =>
                setFormData({ ...formData, precioEstimadoCop: e.target.value })
              }
              placeholder="Ej. 2450000"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-mono font-bold text-stone-900"
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
                  {formData.certificadoNombre
                    ? formData.certificadoNombre
                    : 'Subir certificado (Fairtrade, Rainforest, Orgánico, etc.)...'}
                </span>
              </div>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFormData({
                      ...formData,
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

          {/* Descripción breve (máx 500 caracteres) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-stone-700">
                Descripción del Proceso (Máximo 500 caracteres)
              </label>
              <span
                className={`text-[11px] font-mono ${
                  formData.descripcionProceso.length > 500
                    ? 'text-rose-600 font-bold'
                    : 'text-stone-400'
                }`}
              >
                {formData.descripcionProceso.length} / 500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={formData.descripcionProceso}
              onChange={(e) =>
                setFormData({ ...formData, descripcionProceso: e.target.value })
              }
              placeholder="Detalla notas de cata preliminares, cuidados de recolección y métodos empleados..."
              className="w-full px-3 py-2 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-700/20"
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
              Guardar Pre-Oferta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
