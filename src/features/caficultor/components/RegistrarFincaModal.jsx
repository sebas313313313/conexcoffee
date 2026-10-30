import { useState } from 'react';
import { Coffee, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { COLOMBIA_GEOGRAFIA } from '../../../lib/constants';

export default function RegistrarFincaModal({ isOpen, onClose, onGuardar }) {
  const [formData, setFormData] = useState({
    pais: 'Colombia',
    departamento: 'Huila',
    municipio: 'Pitalito',
    vereda: 'El Mirador',
    latitud: '',
    longitud: '',
    nombre: '',
    asociacion: '',
    logoUrl: '',
    unidadArea: 'Hectáreas (ha)',
    areaCafe: '',
    areaOtrosCultivos: '',
    areaConservacion: '',
    altura: '',
  });

  if (!isOpen) return null;

  const departamentos = Object.keys(COLOMBIA_GEOGRAFIA);
  const municipiosDisponibles =
    COLOMBIA_GEOGRAFIA[formData.departamento]?.municipios || [];
  const veredasDisponibles =
    COLOMBIA_GEOGRAFIA[formData.departamento]?.veredas || [];

  const handleDepartamentoChange = (dep) => {
    const primerMuni = COLOMBIA_GEOGRAFIA[dep]?.municipios[0] || '';
    const primeraVereda = COLOMBIA_GEOGRAFIA[dep]?.veredas[0] || '';
    setFormData({
      ...formData,
      departamento: dep,
      municipio: primerMuni,
      vereda: primeraVereda,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.areaCafe || !formData.altura) {
      toast.error('Complete los campos requeridos (*)');
      return;
    }

    const nuevaFinca = {
      id: Date.now(),
      nombre: formData.nombre,
      pais: formData.pais,
      departamento: formData.departamento,
      municipio: formData.municipio,
      vereda: formData.vereda,
      latitud: formData.latitud || '0',
      longitud: formData.longitud || '0',
      asociacion: formData.asociacion || 'Independiente',
      logoUrl: formData.logoUrl || '',
      unidadArea: formData.unidadArea,
      areaCafe: parseFloat(formData.areaCafe) || 0,
      areaOtrosCultivos: parseFloat(formData.areaOtrosCultivos) || 0,
      areaConservacion: parseFloat(formData.areaConservacion) || 0,
      altura: parseInt(formData.altura, 10) || 0,
    };

    onGuardar(nuevaFinca);
    toast.success('Finca registrada con éxito');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-brand-terracota">
              <Coffee className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Registrar Finca</h3>
              <p className="text-xs text-stone-500">Parámetros geográficos y agronómicos del predio</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Sección Geografía */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">País *</label>
              <input
                type="text"
                disabled
                value={formData.pais}
                className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Departamento *</label>
              <select
                value={formData.departamento}
                onChange={(e) => handleDepartamentoChange(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              >
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Municipio *</label>
              <select
                value={formData.municipio}
                onChange={(e) =>
                  setFormData({ ...formData, municipio: e.target.value })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              >
                {municipiosDisponibles.map((muni) => (
                  <option key={muni} value={muni}>
                    {muni}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Vereda *</label>
              <input
                type="text"
                required
                list="veredas-list"
                value={formData.vereda}
                onChange={(e) =>
                  setFormData({ ...formData, vereda: e.target.value })
                }
                placeholder="Ej. El Mirador"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              />
              <datalist id="veredas-list">
                {veredasDisponibles.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Latitud</label>
              <input
                type="number"
                step="any"
                value={formData.latitud}
                onChange={(e) =>
                  setFormData({ ...formData, latitud: e.target.value })
                }
                placeholder="Ej. 1.8554"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Longitud</label>
              <input
                type="number"
                step="any"
                value={formData.longitud}
                onChange={(e) =>
                  setFormData({ ...formData, longitud: e.target.value })
                }
                placeholder="Ej. -76.0356"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              />
            </div>
          </div>

          {/* Nombre de la Finca y Asociación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nombre de la Finca *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej. Finca La Esperanza"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Asociación o Empresa a la que pertenece
              </label>
              <input
                type="text"
                value={formData.asociacion}
                onChange={(e) =>
                  setFormData({ ...formData, asociacion: e.target.value })
                }
                placeholder="Ej. ASOPROCAFE Huila / Cooperativa"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              />
            </div>
          </div>

          {/* Logotipo de la Finca */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Elegir imagen de logotipo para su finca
            </label>
            <div className="border border-dashed border-stone-300 rounded-xl p-3 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-stone-400" />
                <span className="text-xs text-stone-600">
                  {formData.logoUrl ? 'Imagen seleccionada' : 'Seleccionar archivo JPG o PNG...'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({
                      ...formData,
                      logoUrl: URL.createObjectURL(e.target.files[0]),
                    });
                  }
                }}
                className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Unidades y Áreas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Unidad en Áreas *</label>
              <select
                value={formData.unidadArea}
                onChange={(e) =>
                  setFormData({ ...formData, unidadArea: e.target.value })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
              >
                <option value="Hectáreas (ha)">Hectáreas (ha)</option>
                <option value="Metros cuadrados (m²)">Metros cuadrados (m²)</option>
                <option value="Ninguno">Ninguno</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Área Café Sembrado (numérico) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.areaCafe}
                onChange={(e) =>
                  setFormData({ ...formData, areaCafe: e.target.value })
                }
                placeholder="Ej. 4.5"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Área Otros Cultivos (numérico)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.areaOtrosCultivos}
                onChange={(e) =>
                  setFormData({ ...formData, areaOtrosCultivos: e.target.value })
                }
                placeholder="Ej. 1.2"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Conservación Ambiental (numérico)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.areaConservacion}
                onChange={(e) =>
                  setFormData({ ...formData, areaConservacion: e.target.value })
                }
                placeholder="Ej. 1.8"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
              />
            </div>
          </div>

          {/* Altura */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Altura en msnm (numérico) *
            </label>
            <input
              type="number"
              min="0"
              max="3500"
              required
              value={formData.altura}
              onChange={(e) =>
                setFormData({ ...formData, altura: e.target.value })
              }
              placeholder="Ej. 1820"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
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
              Guardar Finca
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
