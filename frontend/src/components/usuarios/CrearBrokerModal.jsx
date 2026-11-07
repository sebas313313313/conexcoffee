import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Handshake, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Captcha from '@/components/ui/Captcha';
import { PAISES } from '@/lib/paises';

const EMPTY = {
  nombre_empresa: '', identificacion_fiscal_pais: '', pais_operacion: '', ciudad: '',
  direccion_bodega: '', telefono_contacto: '', porcentaje_comision_split: '5.00',
  datos_bancarios_internacionales: '', activo: true, correo: '', password: '', confirmarPassword: '',
};
const FIELDS = [
  ['nombre_empresa', 'Nombre de la empresa', 150],
  ['identificacion_fiscal_pais', 'Identificación fiscal en el país', 50],
  ['pais_operacion', 'País de operación', 60],
  ['ciudad', 'Ciudad', 60],
  ['telefono_contacto', 'Teléfono de contacto', 30, 'tel'],
];
const inputClass = 'w-full px-3 py-2 text-sm rounded-xl border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota';

function BrokerForm({ onClose, onSubmit, loading, initialData, seleccionarPais }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY, ...initialData,
    datos_bancarios_internacionales: initialData?.datos_bancarios_internacionales == null ? '' : JSON.stringify(initialData.datos_bancarios_internacionales, null, 2),
    password: '', confirmarPassword: '',
  }));
  const [captchaToken, setCaptchaToken] = useState('');
  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const payload = Object.fromEntries([...FIELDS.map(([name]) => name), 'direccion_bodega'].map((name) => [name, form[name].trim()]));
    if (Object.values(payload).some((value) => !value)) {
      toast.error('Completa los campos obligatorios sin usar solo espacios');
      return;
    }
    const comision = Number(form.porcentaje_comision_split);
    if (form.porcentaje_comision_split === '' || !Number.isFinite(comision) || comision < 0 || comision > 100 || Math.abs(comision * 100 - Math.round(comision * 100)) > 0.000001) {
      toast.error('La comisión debe estar entre 0 y 100, con máximo dos decimales');
      return;
    }
    let datosBancarios = null;
    if (form.datos_bancarios_internacionales.trim()) {
      try { datosBancarios = JSON.parse(form.datos_bancarios_internacionales); }
      catch { toast.error('Los datos bancarios deben tener un formato JSON válido'); return; }
    }
    if (!initialData) {
      if (!form.correo.trim() || form.password.length < 6 || form.password !== form.confirmarPassword) {
        toast.error('Ingresa un correo y contraseñas iguales de al menos 6 caracteres');
        return;
      }
      if (!captchaToken) { toast.error('Completa la verificación de seguridad'); return; }
    }
    try {
      await onSubmit({
        ...payload, porcentaje_comision_split: comision,
        datos_bancarios_internacionales: datosBancarios, activo: form.activo,
        ...(!initialData ? { correo: form.correo.trim(), password: form.password, captchaToken } : {}),
      });
    } catch {
      // El Provider informa el error; conservar los datos permite reintentar.
    }
  };
  return (
    <form onSubmit={submit} className="mt-4 space-y-4" aria-busy={loading}>
      <fieldset disabled={loading} className="space-y-4">
        <legend className="text-sm font-bold text-surface-700 mb-3">Información del broker</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(([name, label, maxLength, type = 'text']) => (
            <label key={name} className="block text-xs font-semibold text-surface-700 space-y-1">
              <span>{label} *</span>
              {seleccionarPais && name === 'pais_operacion' ? (
                <select required name={name} value={form[name]} onChange={change} className={inputClass}>
                  <option value="">Selecciona un país</option>
                  {PAISES.map((pais) => <option key={pais} value={pais}>{pais}</option>)}
                </select>
              ) : (
                <input required name={name} type={type} maxLength={maxLength} value={form[name]} onChange={change} className={inputClass} />
              )}
            </label>
          ))}
          <label className="block text-xs font-semibold text-surface-700 space-y-1">
            <span>Comisión split (%) *</span>
            <input required name="porcentaje_comision_split" type="number" min="0" max="100" step="0.01" value={form.porcentaje_comision_split} onChange={change} className={inputClass} />
          </label>
        </div>
        <label className="block text-xs font-semibold text-surface-700 space-y-1">
          <span>Dirección de la bodega *</span>
          <textarea required name="direccion_bodega" rows={2} value={form.direccion_bodega} onChange={change} className={inputClass} />
        </label>
        <label className="block text-xs font-semibold text-surface-700 space-y-1">
          <span>Datos bancarios internacionales (JSON, opcional)</span>
          <textarea name="datos_bancarios_internacionales" rows={3} value={form.datos_bancarios_internacionales} onChange={change} placeholder='{"banco": "", "swift": "", "iban": ""}' className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm text-surface-700">
          <input type="checkbox" name="activo" checked={form.activo} onChange={change} />Broker activo
        </label>
        {!initialData && (
          <div className="space-y-3 border-t border-surface-200 pt-4">
            <p className="text-sm font-bold text-surface-700">Usuario de acceso</p>
            <p className="text-xs text-surface-500">Se creará el usuario asociado al broker con estas credenciales.</p>
            <label className="block text-xs font-semibold text-surface-700 space-y-1">
              <span>Correo electrónico *</span>
              <input required name="correo" type="email" autoComplete="off" value={form.correo} onChange={change} className={inputClass} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['password', 'Contraseña'], ['confirmarPassword', 'Confirmar contraseña']].map(([name, label]) => (
                <label key={name} className="block text-xs font-semibold text-surface-700 space-y-1">
                  <span>{label} *</span>
                  <input required type="password" name={name} minLength={6} autoComplete="new-password" value={form[name]} onChange={change} className={inputClass} />
                </label>
              ))}
            </div>
            <Captcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} onError={() => setCaptchaToken('')} />
          </div>
        )}
      </fieldset>
      <div className="flex justify-end gap-3 border-t border-surface-200 pt-4">
        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-semibold disabled:opacity-50">Cancelar</button>
        <button type="submit" disabled={loading || (!initialData && !captchaToken)} className="px-5 py-2 rounded-xl bg-brand-terracota hover:bg-brand-terracota-dark text-white text-sm font-semibold disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar Broker'}</button>
      </div>
    </form>
  );
}

export default function CrearBrokerModal({ isOpen, onClose, onSubmit, loading = false, initialData = null, titulo = 'Registrar Broker', seleccionarPais = false }) {
  return (
    <Dialog open={isOpen} onClose={() => { if (!loading) onClose(); }} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between gap-3 border-b border-surface-200 pb-4">
              <div className="flex items-center gap-3">
                <Handshake className="h-6 w-6 text-brand-terracota" />
                <div>
                  <DialogTitle className="text-lg font-bold text-surface-900">{titulo}</DialogTitle>
                  <p className="text-xs text-surface-500">Los campos con * son obligatorios.</p>
                </div>
              </div>
              <button type="button" disabled={loading} onClick={onClose} aria-label="Cerrar formulario de broker" className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
            </div>
            {isOpen && <BrokerForm onClose={onClose} onSubmit={onSubmit} loading={loading} initialData={initialData} seleccionarPais={seleccionarPais} />}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
