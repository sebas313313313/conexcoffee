import { useState, useEffect } from 'react';
import { X, Briefcase, Phone, Mail, MapPin, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FORM_STATE = {
  numeroIdentificacion: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  telefono: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  fechaNacimiento: '',
  genero: 'M',
  direccion: '',
  municipio: '',
  departamento: '',
};

export default function CrearBrokerModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
  titulo = 'Registrar Broker',
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        numeroIdentificacion: initialData.numeroIdentificacion || initialData.numero_identificacion || '',
        primerNombre: initialData.primerNombre || initialData.primer_nombre || '',
        segundoNombre: initialData.segundoNombre || initialData.segundo_nombre || '',
        primerApellido: initialData.primerApellido || initialData.primer_apellido || '',
        segundoApellido: initialData.segundoApellido || initialData.segundo_apellido || '',
        telefono: initialData.telefono || '',
        correo: initialData.correo || '',
        password: '',
        confirmarPassword: '',
        fechaNacimiento: initialData.fechaNacimiento || initialData.fecha_nacimiento || '',
        genero: initialData.genero || 'M',
        direccion: initialData.direccion || '',
        municipio: initialData.municipio || '',
        departamento: initialData.departamento || '',
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
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">{titulo}</h3>
              <p className="text-xs text-surface-500">
                Intermediario comercial para negociación de lotes y contratos
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
          {/* Datos Personales */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Número de Identificación *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. 12053621"
                  value={formData.numeroIdentificacion}
                  onChange={(e) => setFormData({ ...formData, numeroIdentificacion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Primer Nombre *</label>
                <input
                  required
                  type="text"
                  placeholder="Primer nombre"
                  value={formData.primerNombre}
                  onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Segundo Nombre</label>
                <input
                  type="text"
                  placeholder="Segundo nombre (opcional)"
                  value={formData.segundoNombre}
                  onChange={(e) => setFormData({ ...formData, segundoNombre: e.target.value.toUpperCase() })}
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
                  value={formData.primerApellido}
                  onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Segundo Apellido</label>
                <input
                  type="text"
                  placeholder="Segundo apellido (opcional)"
                  value={formData.segundoApellido}
                  onChange={(e) => setFormData({ ...formData, segundoApellido: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
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
                  placeholder="Ej. +57 310 4256987"
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
                  placeholder="broker@conexcoffee.com"
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

          {/* Ubicación y Oficina */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-surface-700 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-brand-terracota" />
              <span>Ubicación y Oficina</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Ciudad / Municipio</label>
                <input
                  type="text"
                  placeholder="Ej. Medellín"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Departamento</label>
                <input
                  type="text"
                  placeholder="Ej. Antioquia"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">Dirección de Oficina</label>
              <input
                type="text"
                placeholder="Dirección comercial o de correspondencia"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
              />
            </div>
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
              {loading ? 'Guardando...' : 'Guardar Broker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
