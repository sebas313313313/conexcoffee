import { useRef, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Captcha from '@/components/ui/Captcha';

const CAMPOS = [
  { name: 'numero_documento', label: 'Número de documento', maxLength: 25, required: true },
  { name: 'nombres', label: 'Nombres', maxLength: 100, required: true },
  { name: 'apellidos', label: 'Apellidos', maxLength: 100, required: true },
  { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
  { name: 'telefono_movil', label: 'Teléfono móvil', type: 'tel', maxLength: 20, required: true },
  { name: 'departamento', label: 'Departamento', maxLength: 50, required: true },
  { name: 'municipio', label: 'Municipio', maxLength: 50, required: true },
  { name: 'direccion', label: 'Dirección / Vereda', maxLength: 80 },
  { name: 'url_documento_identidad', label: 'URL del documento de identidad', type: 'url' },
  { name: 'url_rut', label: 'URL del RUT', type: 'url' },
];
const inputClass = 'w-full px-3 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota bg-white';

export default function CrearCaficultorModal({
  isOpen, onClose, onSubmit, loading = false, empresasDisponibles = [],
  initialData = null, titulo = 'Registrar Caficultor', empresaFija = false,
}) {
  const [formData, setFormData] = useState(() => ({
    tipo_documento: initialData?.tipo_documento || 'CC',
    numero_documento: initialData?.numero_documento || '',
    nombres: initialData?.nombres || '',
    apellidos: initialData?.apellidos || '',
    fecha_nacimiento: initialData?.fecha_nacimiento || '',
    genero: initialData?.genero ?? 'Masculino',
    telefono_movil: initialData?.telefono_movil || '',
    departamento: initialData?.departamento || 'Cauca',
    municipio: initialData?.municipio || '',
    direccion: initialData?.direccion || '',
    historia: initialData?.historia || '',
    url_documento_identidad: initialData?.url_documento_identidad || '',
    url_rut: initialData?.url_rut || '',
    empresa_exportadora_id: initialData?.empresa_exportadora_id || '',
    correo: '', password: '', confirmarPassword: '',
  }));
  const [guardando, setGuardando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const envioEnCurso = useRef(false);
  const ocupado = loading || guardando;
  const cambiar = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (ocupado || envioEnCurso.current) return;
    if (!empresaFija && !formData.empresa_exportadora_id) {
      toast.error('Selecciona una empresa vinculada');
      return;
    }
    if (!initialData && (formData.password.length < 6 || formData.password !== formData.confirmarPassword)) {
      toast.error('La contraseña debe tener al menos 6 caracteres y coincidir con la confirmación');
      return;
    }
    if (!initialData && !captchaToken) {
      toast.error('Completa la verificación de seguridad');
      return;
    }
    const payload = {
      tipo_documento: formData.tipo_documento,
      genero: formData.genero,
      ...(!empresaFija ? { empresa_exportadora_id: formData.empresa_exportadora_id } : {}),
      historia: formData.historia.trim() || null,
    };
    for (const campo of CAMPOS) {
      const value = formData[campo.name].trim();
      if (campo.required && !value) {
        toast.error('Completa el campo ' + campo.label);
        return;
      }
      payload[campo.name] = value || null;
    }
    if (!initialData) {
      payload.correo = formData.correo.trim();
      payload.password = formData.password;
      payload.captchaToken = captchaToken;
    }
    envioEnCurso.current = true;
    setGuardando(true);
    try {
      await onSubmit(payload);
    } catch {
      // El Provider muestra el error; conservar los datos para corregir o reintentar.
    } finally {
      envioEnCurso.current = false;
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="caficultor-titulo" className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-surface-200 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-surface-200 shrink-0">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-brand-terracota" />
            <h3 id="caficultor-titulo" className="text-lg font-bold text-surface-900">{titulo}</h3>
          </div>
          <button type="button" aria-label="Cerrar" disabled={ocupado} onClick={onClose} className="p-1.5 text-surface-400 hover:text-surface-700 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-5 pr-1">
          <fieldset disabled={ocupado} className="grid grid-cols-1 sm:grid-cols-2 gap-4 disabled:opacity-60">
            <label className="block text-xs font-semibold text-surface-700">
              Tipo de documento *
              <select name="tipo_documento" required value={formData.tipo_documento} onChange={cambiar} className={inputClass}>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="NIT">NIT</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </label>
            {CAMPOS.map(({ name, label, type = 'text', maxLength, required }) => (
              <label key={name} className="block text-xs font-semibold text-surface-700">
                {label}{required ? ' *' : ''}
                <input name={name} type={type} maxLength={maxLength} required={required} value={formData[name]} onChange={cambiar} className={inputClass} />
              </label>
            ))}
            <label className="block text-xs font-semibold text-surface-700">
              Género *
              <select name="genero" required value={formData.genero} onChange={cambiar} className={inputClass}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                {formData.genero && !['Masculino', 'Femenino', 'Otro'].includes(formData.genero) && (
                  <option value={formData.genero}>{formData.genero}</option>
                )}
              </select>
            </label>
            {!empresaFija && <label className="block text-xs font-semibold text-surface-700">
              Empresa vinculada *
              <select name="empresa_exportadora_id" required value={formData.empresa_exportadora_id} onChange={cambiar} className={inputClass}>
                <option value="" disabled>Selecciona una empresa</option>
                {empresasDisponibles.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                ))}
              </select>
            </label>}
            {!empresaFija && empresasDisponibles.length === 0 && (
              <p className="text-sm text-surface-600 sm:col-span-2">No hay empresas disponibles. Registra una empresa o vuelve a cargar el catálogo antes de crear el caficultor.</p>
            )}
            {!initialData && (
              <>
                <label className="block text-xs font-semibold text-surface-700">
                  Correo de acceso *
                  <input name="correo" type="email" required autoComplete="email" value={formData.correo} onChange={cambiar} className={inputClass} />
                </label>
                <label className="block text-xs font-semibold text-surface-700">
                  Contraseña *
                  <input name="password" type="password" required minLength={6} autoComplete="new-password" value={formData.password} onChange={cambiar} className={inputClass} />
                </label>
                <label className="block text-xs font-semibold text-surface-700">
                  Confirmar contraseña *
                  <input name="confirmarPassword" type="password" required minLength={6} autoComplete="new-password" value={formData.confirmarPassword} onChange={cambiar} className={inputClass} />
                </label>
              </>
            )}
            <label className="block text-xs font-semibold text-surface-700 sm:col-span-2">
              Historia del caficultor
              <textarea name="historia" rows={3} maxLength={800} value={formData.historia} onChange={cambiar} className={inputClass} />
            </label>
          </fieldset>
          {!initialData && <Captcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} onError={() => setCaptchaToken('')} />}
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
            <button type="button" onClick={onClose} disabled={ocupado} className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-semibold text-surface-600 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={ocupado || (!empresaFija && empresasDisponibles.length === 0) || (!initialData && !captchaToken)} className="px-5 py-2 rounded-xl bg-brand-terracota hover:bg-brand-terracota-dark text-white text-sm font-semibold disabled:opacity-50">
              {ocupado ? 'Guardando...' : 'Guardar Caficultor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
