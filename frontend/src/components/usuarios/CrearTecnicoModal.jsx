import { useState, useEffect } from 'react';
import { X, UserCheck, Briefcase, Phone, Mail, Lock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PA', label: 'Pasaporte (PA)' },
  { value: 'PEP', label: 'PEP' },
  { value: 'PPT', label: 'PPT' },
];

const INITIAL_FORM_STATE = {
  empresa_id: '',
  tipo_documento: 'CC',
  numero_documento: '',
  nombres: '',
  apellidos: '',
  tarjeta_profesional: '',
  profesion: 'Ingeniero Agrónomo / Técnico Agropecuario',
  telefono_movil: '',
  correo: '',
  password: '',
  confirmarPassword: '',
  activo: true,
};

export default function CrearTecnicoModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
  empresasDisponibles = [],
  empresaFija = false,
  titulo = 'Registrar Técnico',
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (initialData) {
      // Compatibilidad con nombres divididos o completos si vienen del backend / mapper
      const nombresComp =
        initialData.nombres ||
        [initialData.primerNombre || initialData.primer_nombre, initialData.segundoNombre || initialData.segundo_nombre]
          .filter(Boolean)
          .join(' ');
      const apellidosComp =
        initialData.apellidos ||
        [initialData.primerApellido || initialData.primer_apellido, initialData.segundoApellido || initialData.segundo_apellido]
          .filter(Boolean)
          .join(' ');

      setFormData({
        empresa_id: initialData.empresa_id || initialData.empresaId || '',
        tipo_documento: initialData.tipo_documento || 'CC',
        numero_documento:
          initialData.numero_documento ||
          initialData.numeroIdentificacion ||
          initialData.numero_identificacion ||
          '',
        nombres: nombresComp,
        apellidos: apellidosComp,
        tarjeta_profesional: initialData.tarjeta_profesional || '',
        profesion:
          initialData.profesion ||
          initialData.especialidad ||
          'Ingeniero Agrónomo / Técnico Agropecuario',
        telefono_movil:
          initialData.telefono_movil ||
          initialData.telefono ||
          '',
        correo: initialData.correo || '',
        password: '',
        confirmarPassword: '',
        activo: initialData.activo !== false,
      });
    } else {
      setFormData({
        ...INITIAL_FORM_STATE,
        empresa_id: empresasDisponibles.length === 1 ? empresasDisponibles[0].id : '',
      });
    }
  }, [initialData, isOpen, empresasDisponibles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tipo_documento) {
      toast.error('Selecciona el tipo de documento');
      return;
    }
    if (!formData.numero_documento.trim()) {
      toast.error('El número de documento es obligatorio');
      return;
    }
    if (!formData.nombres.trim()) {
      toast.error('Los nombres son obligatorios');
      return;
    }
    if (!formData.apellidos.trim()) {
      toast.error('Los apellidos son obligatorios');
      return;
    }
    if (!formData.telefono_movil.trim()) {
      toast.error('El teléfono móvil es obligatorio');
      return;
    }
    if (empresasDisponibles.length > 0 && !formData.empresa_id && !empresaFija) {
      toast.error('Debes seleccionar una empresa exportadora');
      return;
    }

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
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">{titulo}</h3>
              <p className="text-xs text-surface-500">
                Personal agronómico y técnico calificado en campo
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
          {/* Empresa Exportadora asignada */}
          {empresasDisponibles.length > 0 && !empresaFija && (
            <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200">
              <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-brand-terracota" />
                Empresa Exportadora Asignada *
              </label>
              <select
                required
                value={formData.empresa_id}
                onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
              >
                <option value="">-- Seleccione una empresa --</option>
                {empresasDisponibles.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre_comercial || emp.razon_social || emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Identificación y Nombres */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Tipo Doc. *
                </label>
                <select
                  required
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
                >
                  {TIPOS_DOCUMENTO.map((td) => (
                    <option key={td.value} value={td.value}>
                      {td.value} - {td.label.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Número de Documento *
                </label>
                <input
                  required
                  type="text"
                  maxLength={25}
                  placeholder="Ej. 1061789456"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Nombres *</label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  placeholder="Ej. Carlos Alberto"
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Apellidos *</label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  placeholder="Ej. Gómez Pérez"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white"
                />
              </div>
            </div>
          </div>

          {/* Contacto y Cuenta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-brand-terracota" />
                Teléfono Móvil *
              </label>
              <input
                required
                type="tel"
                maxLength={20}
                placeholder="Ej. +57 320 9876543"
                value={formData.telefono_movil}
                onChange={(e) => setFormData({ ...formData, telefono_movil: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-brand-terracota" />
                Correo Electrónico *
              </label>
              <input
                required
                type="email"
                placeholder="tecnico@ejemplo.com"
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

          {/* Perfil Profesional */}
          <div className="bg-surface-50/70 p-4 rounded-xl border border-surface-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-surface-700 uppercase tracking-wider">
              <Briefcase className="h-4 w-4 text-brand-terracota" />
              <span>Perfil Profesional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Profesión
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Ej. Ingeniero Agrónomo"
                  value={formData.profesion}
                  onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Tarjeta Profesional
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Ej. TP-123456-AGR"
                  value={formData.tarjeta_profesional}
                  onChange={(e) => setFormData({ ...formData, tarjeta_profesional: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 bg-white"
                />
              </div>
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
              {loading ? 'Guardando...' : 'Guardar Técnico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
