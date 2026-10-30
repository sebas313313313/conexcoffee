import { useState, useEffect } from 'react';
import { X, Award, Phone, Mail, MapPin, Lock, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FORM_STATE = {
  tipo_documento: 'CC',
  numero_identificacion: '',
  primer_nombre: '',
  segundo_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  telefono: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  certificacion: 'Q-Grader Arábica (CQI)',
  laboratorio: '',
  experiencia: '',
};

export default function CrearCatadorModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  laboratoriosDisponibles = [],
  initialData = null,
  titulo = 'Registrar Catador',
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        tipo_documento: initialData.tipo_documento || 'CC',
        numero_identificacion: initialData.numero_identificacion || initialData.numeroIdentificacion || '',
        primer_nombre: initialData.primer_nombre || initialData.primerNombre || '',
        segundo_nombre: initialData.segundo_nombre || initialData.segundoNombre || '',
        primer_apellido: initialData.primer_apellido || initialData.primerApellido || '',
        segundo_apellido: initialData.segundo_apellido || initialData.segundoApellido || '',
        telefono: initialData.telefono || '',
        correo: initialData.correo || '',
        password: '',
        confirmarPassword: '',
        certificacion: initialData.certificacion || 'Q-Grader Arábica (CQI)',
        laboratorio: initialData.laboratorio || '',
        experiencia: initialData.experiencia || '',
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
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-surface-200 my-8 max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-terracota/10 text-brand-terracota flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">{titulo}</h3>
              <p className="text-xs text-surface-500">
                Profesional catador y acreditaciones sensoriales
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
          {/* Identificación y Nombres */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Tipo Doc.</label>
                <select
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Número de Identificación *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. 1088324567"
                  value={formData.numero_identificacion}
                  onChange={(e) => setFormData({ ...formData, numero_identificacion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Primer Nombre *</label>
                <input
                  required
                  type="text"
                  placeholder="Primer nombre"
                  value={formData.primer_nombre}
                  onChange={(e) => setFormData({ ...formData, primer_nombre: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Segundo Nombre</label>
                <input
                  type="text"
                  placeholder="Segundo nombre (opcional)"
                  value={formData.segundo_nombre}
                  onChange={(e) => setFormData({ ...formData, segundo_nombre: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Primer Apellido *</label>
                <input
                  required
                  type="text"
                  placeholder="Primer apellido"
                  value={formData.primer_apellido}
                  onChange={(e) => setFormData({ ...formData, primer_apellido: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Segundo Apellido</label>
                <input
                  type="text"
                  placeholder="Segundo apellido (opcional)"
                  value={formData.segundo_apellido}
                  onChange={(e) => setFormData({ ...formData, segundo_apellido: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Contacto y Credenciales */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Teléfono *</label>
                <input
                  required
                  type="tel"
                  placeholder="Ej. +57 312 8904561"
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
                  placeholder="catador@ejemplo.com"
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
                    Contraseña *
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

          {/* Certificación y Laboratorio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Certificación CQI / Q-Grader *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. Q-Grader Arábica (CQI #4892)"
                value={formData.certificacion}
                onChange={(e) => setFormData({ ...formData, certificacion: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">Laboratorio Vinculado</label>
              {laboratoriosDisponibles.length > 0 ? (
                <select
                  value={formData.laboratorio}
                  onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                >
                  <option value="">Sin Asignar</option>
                  {laboratoriosDisponibles.map((lab) => (
                    <option key={lab} value={lab}>
                      {lab}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ej. Laboratorio Central"
                  value={formData.laboratorio}
                  onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">Experiencia / Perfil</label>
            <textarea
              rows={2}
              placeholder="Años de experiencia, especialidad en tueste, protocolos de catación..."
              value={formData.experiencia}
              onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
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
              {loading ? 'Guardando...' : 'Guardar Catador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
