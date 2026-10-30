import { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES_DISPONIBLES = [
  'SuperAdmin',
  'Empresa',
  'Broker',
  'Productor',
  'Comprador',
  'Laboratorio',
  'Tecnico',
  'Catador',
];

const INITIAL_FORM_STATE = {
  nombre: '',
  email: '',
  rol: 'Productor',
  password: '',
  confirmarPassword: '',
};

export default function CrearUsuarioModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
  titulo = 'Registrar Usuario del Sistema',
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        email: initialData.email || '',
        rol: initialData.rol || 'Productor',
        password: '',
        confirmarPassword: '',
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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-terracota/10 text-brand-terracota flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">{titulo}</h3>
              <p className="text-xs text-surface-500">Credenciales de acceso a la plataforma</p>
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
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand-terracota" />
              Nombre Completo *
            </label>
            <input
              required
              type="text"
              placeholder="Ej. Carlos Mendoza"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-brand-terracota" />
              Correo Electrónico *
            </label>
            <input
              required
              type="email"
              placeholder="usuario@conexcoffee.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-brand-terracota" />
              Rol en el Sistema *
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white cursor-pointer"
            >
              {ROLES_DISPONIBLES.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>

          {!initialData && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-brand-terracota" />
                  Contraseña Temporal *
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
                <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1.5">
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

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
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
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
