import { useState, useEffect } from 'react';
import { X, Building2, MapPin, Mail, Phone, FileText, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FORM_STATE = {
  nit: '',
  nombre: '',
  telefono: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  direccion: '',
  municipio: '',
  departamento: '',
  descripcion: '',
};

export default function CrearEmpresaModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
  titulo = 'Registrar Empresa',
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nit: initialData.nit || '',
        nombre: initialData.nombre || '',
        telefono: initialData.telefono || '',
        correo: initialData.correo || '',
        password: '',
        confirmarPassword: '',
        direccion: initialData.direccion || '',
        municipio: initialData.municipio || '',
        departamento: initialData.departamento || '',
        descripcion: initialData.descripcion || '',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!initialData) {
      if (!formData.password || formData.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (formData.password !== formData.confirmarPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
    }

    const { confirmarPassword, ...datosLimpios } = formData;
    onSubmit(datosLimpios);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8 max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-terracota/10 text-brand-terracota flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">{titulo}</h3>
              <p className="text-xs text-surface-500">
                Información de la empresa tostadora o exportadora
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Identificación y Razón Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                NIT / Identificación Fiscal *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. 900.123.456-7"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Nombre o Razón Social *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. Café Andino S.A.S"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-surface-700 uppercase tracking-wider">
              <Phone className="h-4 w-4 text-brand-terracota" />
              <span>Contacto Corporativo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Teléfono *</label>
                <input
                  required
                  type="tel"
                  placeholder="Ej. +57 601 2345678"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Correo Electrónico *</label>
                <input
                  required
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>

            {!initialData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-surface-200">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-brand-terracota" />
                    Contraseña del Portal *
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-brand-terracota" />
                    Confirmar Contraseña *
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="Repita la contraseña"
                    value={formData.confirmarPassword}
                    onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Ubicación */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-surface-700 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-brand-terracota" />
              <span>Sede Principal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Municipio / Ciudad</label>
                <input
                  type="text"
                  placeholder="Ej. Popayán"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Departamento</label>
                <input
                  type="text"
                  placeholder="Ej. Cauca"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">Dirección</label>
              <input
                type="text"
                placeholder="Carrera o Calle con número"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-surface-700 mb-1">
              Descripción del Perfil Comercial
            </label>
            <textarea
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
              placeholder="Enfoque de exportación, certificaciones (Fair Trade, Rainforest) o perfil comercial..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-terracota hover:bg-brand-terracota-dark text-white text-sm font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Guardando...' : 'Guardar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
