import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/axios';
import { Input, Button, Captcha } from '@/components/ui';
import { UserPlus, Camera, XCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// Datos estáticos de localización
// ============================================

const GENEROS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];

const PAISES_RESIDENCIA = [
  'Colombia', 'México', 'Argentina', 'Brasil', 'Chile', 'Perú', 'Ecuador',
  'Venezuela', 'Bolivia', 'Paraguay', 'Uruguay', 'Guatemala', 'Honduras',
  'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá', 'Cuba', 'República Dominicana',
  'Estados Unidos', 'Canadá', 'España', 'Francia', 'Alemania', 'Italia',
  'Reino Unido', 'Portugal', 'Países Bajos', 'Bélgica', 'Suiza',
  'Australia', 'Japón', 'China', 'Corea del Sur', 'Otro',
];

const PAISES_COMPRA = [
  'Colombia', 'México', 'Argentina', 'Brasil', 'Chile', 'Perú', 'Ecuador',
  'Venezuela', 'Bolivia', 'Paraguay', 'Uruguay', 'Guatemala', 'Honduras',
  'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá', 'Cuba', 'República Dominicana',
  'Estados Unidos', 'Canadá', 'España', 'Francia', 'Alemania', 'Italia',
  'Reino Unido', 'Portugal', 'Países Bajos', 'Bélgica', 'Suiza',
  'Australia', 'Japón', 'China', 'Corea del Sur', 'Otro',
];

// Indicativos telefónicos por país
const PHONE_PREFIXES = [
  { code: '+57',  label: '+57 — Colombia' },
  { code: '+52',  label: '+52 — México' },
  { code: '+54',  label: '+54 — Argentina' },
  { code: '+55',  label: '+55 — Brasil' },
  { code: '+56',  label: '+56 — Chile' },
  { code: '+51',  label: '+51 — Perú' },
  { code: '+593', label: '+593 — Ecuador' },
  { code: '+58',  label: '+58 — Venezuela' },
  { code: '+591', label: '+591 — Bolivia' },
  { code: '+595', label: '+595 — Paraguay' },
  { code: '+598', label: '+598 — Uruguay' },
  { code: '+502', label: '+502 — Guatemala' },
  { code: '+504', label: '+504 — Honduras' },
  { code: '+503', label: '+503 — El Salvador' },
  { code: '+505', label: '+505 — Nicaragua' },
  { code: '+506', label: '+506 — Costa Rica' },
  { code: '+507', label: '+507 — Panamá' },
  { code: '+53',  label: '+53 — Cuba' },
  { code: '+1809',label: '+1809 — República Dominicana' },
  { code: '+1',   label: '+1 — EE.UU. / Canadá' },
  { code: '+34',  label: '+34 — España' },
  { code: '+33',  label: '+33 — Francia' },
  { code: '+49',  label: '+49 — Alemania' },
  { code: '+39',  label: '+39 — Italia' },
  { code: '+44',  label: '+44 — Reino Unido' },
  { code: '+351', label: '+351 — Portugal' },
  { code: '+31',  label: '+31 — Países Bajos' },
  { code: '+32',  label: '+32 — Bélgica' },
  { code: '+41',  label: '+41 — Suiza' },
  { code: '+61',  label: '+61 — Australia' },
  { code: '+81',  label: '+81 — Japón' },
  { code: '+86',  label: '+86 — China' },
  { code: '+82',  label: '+82 — Corea del Sur' },
];


const DEPARTAMENTOS_COL = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
];

const MUNICIPIOS_BOGOTA = ['Bogotá D.C.'];
const MUNICIPIOS_ANTIOQUIA = ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta', 'Rionegro'];
const MUNICIPIOS_VALLE = ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago'];
const MUNICIPIOS_DEFAULT = ['Municipio principal', 'Otro municipio'];

const getMunicipios = (departamento) => {
  if (!departamento) return [];
  if (departamento === 'Cundinamarca') return MUNICIPIOS_BOGOTA;
  if (departamento === 'Antioquia') return MUNICIPIOS_ANTIOQUIA;
  if (departamento === 'Valle del Cauca') return MUNICIPIOS_VALLE;
  return MUNICIPIOS_DEFAULT;
};

// ============================================
// PhoneField — Input de teléfono con selector de indicativo
// ============================================
function PhoneField({ indicativo, numero, onIndicativoChange, onNumeroChange, error, required }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-surface-700 mb-1.5">
        Teléfono
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <div className={`flex rounded-lg border overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-0 ${
        error
          ? 'border-danger-500 focus-within:ring-danger-500/30'
          : 'border-surface-300 focus-within:ring-primary-500/30 focus-within:border-primary-500'
      }`}>
        {/* Selector de indicativo */}
        <select
          id="telefonoIndicativo"
          name="telefonoIndicativo"
          value={indicativo}
          onChange={onIndicativoChange}
          className="bg-surface-50 border-r border-surface-200 text-surface-700 text-sm px-2 py-2.5 focus:outline-none cursor-pointer shrink-0"
          aria-label="Indicativo telefónico"
        >
          <option value="">+00</option>
          {PHONE_PREFIXES.map((p) => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </select>
        {/* Número sin indicativo */}
        <input
          id="telefono"
          name="telefono"
          type="tel"
          placeholder="300 000 0000"
          value={numero}
          onChange={onNumeroChange}
          className="flex-1 px-3 py-2.5 bg-white text-surface-900 text-sm placeholder:text-surface-400 focus:outline-none"
          aria-label="Número de teléfono"
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, error, required, disabled, placeholder }) {
  const selectId = name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-3.5 py-2.5
          bg-white border rounded-lg
          text-surface-900 text-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-surface-100 disabled:cursor-not-allowed
          ${error
            ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500'
            : 'border-surface-300 focus:ring-primary-500/30 focus:border-primary-500'
          }
        `}
      >
        <option value="">{placeholder || 'Seleccione...'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
    </div>
  );
}

// ============================================
// RegisterForm — Formulario de registro de comprador
// ============================================

const INITIAL_STATE = {
  photo: null,
  photoPreview: null,
  identificacion: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  direccion: '',
  telefonoIndicativo: '',
  telefono: '',
  genero: '',
  paisResidencia: '',
  departamento: '',
  municipio: '',
  paisCompra: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};


export default function RegisterForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const captchaTokenRef = useRef('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ---- Handlers ----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Resetear municipio si cambia departamento
      if (name === 'departamento') updated.municipio = '';
      // Resetear departamento y municipio si cambia país de residencia
      if (name === 'paisResidencia') {
        updated.departamento = '';
        updated.municipio = '';
      }
      return updated;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photo: file, photoPreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null, photoPreview: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---- Validación ----
  // Calcula la fecha máxima permitida: hoy - 18 años
  const getMaxBirthDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0]; // formato YYYY-MM-DD
  };

  const validate = () => {
    const e = {};
    if (!formData.identificacion) e.identificacion = 'Requerido';
    if (!formData.nombres) e.nombres = 'Requerido';
    if (!formData.apellidos) e.apellidos = 'Requerido';
    if (!formData.fechaNacimiento) {
      e.fechaNacimiento = 'Requerido';
    } else {
      const birthDate = new Date(formData.fechaNacimiento);
      const minDate = new Date(getMaxBirthDate());
      if (birthDate > minDate) {
        e.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte';
      }
    }
    if (!formData.direccion) e.direccion = 'Requerida';
    if (!formData.telefonoIndicativo) e.telefono = 'Selecciona el indicativo del país';
    else if (!formData.telefono) e.telefono = 'Ingresa el número de teléfono';
    else if (!/^[0-9\s\-]{5,15}$/.test(formData.telefono)) e.telefono = 'Número inválido';
    if (!formData.genero) e.genero = 'Requerido';
    if (!formData.paisResidencia) e.paisResidencia = 'Requerido';
    if (!formData.paisCompra) e.paisCompra = 'Requerido';
    if (!formData.email) e.email = 'Requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido';
    if (!formData.password) e.password = 'Requerida';
    if (formData.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.acceptTerms) e.acceptTerms = 'Debes aceptar los términos y condiciones';
    if (!captchaTokenRef.current) e.captcha = 'Por favor completa la verificación de seguridad';
    return e;
  };

  // ---- Submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Por favor corrige los errores antes de continuar');
      return;
    }

    setLoading(true);
    try {
      await register({
        identificacion: formData.identificacion,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fechaNacimiento: formData.fechaNacimiento,
        direccion: formData.direccion,
        telefono: formData.telefono,
        genero: formData.genero,
        paisResidencia: formData.paisResidencia,
        departamento: formData.departamento,
        municipio: formData.municipio,
        paisCompra: formData.paisCompra,
        email: formData.email,
        password: formData.password,
        captchaToken: captchaTokenRef.current,
        role: 'comprador',
      });
      toast.success('¡Registro enviado! Revisa tu correo para verificar tu cuenta.');
      if (onSuccess) onSuccess(formData.email);
      else navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => { if (onCancel) onCancel(); else navigate('/login'); };

  const municipios = getMunicipios(formData.departamento);
  const showDepartamento = formData.paisResidencia === 'Colombia';

  return (
    <div>
      {/* Encabezado */}
      <h2 className="text-xl font-bold text-primary-600 mb-5">
        Registrar comprador
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Avatar / Foto de perfil */}
        <div className="flex justify-center mb-2">
          <div className="relative">
            <button
              type="button"
              aria-label="Cambiar foto de perfil"
              className="w-20 h-20 rounded-full border-2 border-surface-200 bg-surface-100 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto de perfil"
            >
              {formData.photoPreview ? (
                <img
                  src={formData.photoPreview}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-surface-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </button>
            {/* Botón cámara */}
            <button
              type="button"
              aria-label="Subir foto"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 bg-surface-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              title="Subir foto"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
            {/* Botón eliminar foto */}
            {formData.photoPreview && (
              <button
                type="button"
                aria-label="Eliminar foto"
                onClick={removePhoto}
                className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
                title="Eliminar foto"
              >
                <XCircle className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* Fila 1: Identificación + Nombres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de identificación"
            type="text"
            name="identificacion"
            placeholder="123456789"
            value={formData.identificacion}
            onChange={handleChange}
            error={errors.identificacion}
            required
          />
          <Input
            label="Nombres"
            type="text"
            name="nombres"
            placeholder="Juan"
            value={formData.nombres}
            onChange={handleChange}
            error={errors.nombres}
            required
          />
        </div>

        {/* Fila 2: Apellidos + Fecha de nacimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Apellidos"
            type="text"
            name="apellidos"
            placeholder="Pérez García"
            value={formData.apellidos}
            onChange={handleChange}
            error={errors.apellidos}
            required
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            error={errors.fechaNacimiento}
            max={getMaxBirthDate()}
            required
          />
        </div>

        {/* Fila 3: Dirección + Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Dirección"
            type="text"
            name="direccion"
            placeholder="Calle 10 # 5-23"
            value={formData.direccion}
            onChange={handleChange}
            error={errors.direccion}
            required
          />
          <PhoneField
            indicativo={formData.telefonoIndicativo}
            numero={formData.telefono}
            onIndicativoChange={handleChange}
            onNumeroChange={handleChange}
            error={errors.telefono}
            required
          />
        </div>

        {/* Fila 4: Género + País de residencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Género"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            options={GENEROS}
            error={errors.genero}
            required
          />
          <SelectField
            label="País de residencia"
            name="paisResidencia"
            value={formData.paisResidencia}
            onChange={handleChange}
            options={PAISES_RESIDENCIA}
            error={errors.paisResidencia}
            required
          />
        </div>

        {/* Fila 5: Departamento + Municipio (solo si es Colombia) */}
        {showDepartamento && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Departamento de residencia"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              options={DEPARTAMENTOS_COL}
              error={errors.departamento}
            />
            <SelectField
              label="Municipio de residencia"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              options={municipios}
              error={errors.municipio}
              disabled={!formData.departamento}
              placeholder={formData.departamento ? 'Seleccione...' : 'Primero elige el departamento'}
            />
          </div>
        )}

        {/* País de compra */}
        <SelectField
          label="Selecciona el país en el que vas a comprar"
          name="paisCompra"
          value={formData.paisCompra}
          onChange={handleChange}
          options={PAISES_COMPRA}
          error={errors.paisCompra}
          required
          placeholder="Selecciona el país de compra..."
        />

        {/* Fila 6: Correo + Contraseña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
        </div>

        {/* Confirmar contraseña */}
        <Input
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        {/* Términos y condiciones */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 text-xs text-surface-600 cursor-pointer select-none">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span>
              He leído y acepto los{' '}
              <Link to="/terms" target="_blank" className="text-primary-600 hover:underline font-medium">
                Términos y Condiciones
              </Link>
              , la{' '}
              <Link to="/privacy" target="_blank" className="text-primary-600 hover:underline font-medium">
                Política de Privacidad
              </Link>{' '}
              y el{' '}
              <Link to="/legal" target="_blank" className="text-primary-600 hover:underline font-medium">
                Aviso Legal
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-danger-500">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Captcha */}
        <div>
          <Captcha
            onVerify={(token) => {
              captchaTokenRef.current = token;
              if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
            }}
            onExpire={() => {
              captchaTokenRef.current = '';
            }}
          />
          {errors.captcha && (
            <p className="text-xs text-danger-500 text-center mt-1">{errors.captcha}</p>
          )}
        </div>

        {/* Botones Cancelar / Guardar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            id="btn-register-cancel"
            type="button"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handleCancel}
          >
            <XCircle className="h-4 w-4" />
            Cancelar
          </Button>

          <Button
            id="btn-register-save"
            type="submit"
            variant="primary"
            className="flex items-center gap-2"
            loading={loading}
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-surface-500 mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
