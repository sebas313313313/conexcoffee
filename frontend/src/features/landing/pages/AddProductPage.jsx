import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Captcha, Input } from '@/components/ui';
import { useOfertasExternas } from '@/hooks/useOfertasExternas';
import { getErrorMessage } from '@/lib/axios';

const CONDITIONS_VERSION = '2026-11-11';
const processes = {
  LAVADO: 'Lavado', NATURAL: 'Natural', HONEY: 'Honey', ANAEROBICO: 'Anaeróbico',
  DOBLE_FERMENTACION: 'Doble fermentación', OTRO: 'Otro',
};
const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' });
const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

function SelectField({ name, label, options }) {
  return (
    <label className="block text-sm font-medium text-surface-700">
      {label}
      <select name={name} required defaultValue="" className="mt-1.5 w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-surface-900">
        <option value="" disabled>Selecciona una opción</option>
        {Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  );
}

function OfferFields() {
  return (
    <>
      <fieldset>
        <legend className="mb-3 font-semibold">Datos de contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="nombres" label="Nombres" autoComplete="given-name" maxLength={100} required />
          <Input name="apellidos" label="Apellidos" autoComplete="family-name" maxLength={100} required />
          <Input name="correo_electronico" label="Correo electrónico" type="email" autoComplete="email" maxLength={150} required />
          <Input name="telefono_movil" label="Celular" type="tel" autoComplete="tel" minLength={7} maxLength={20} required />
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-semibold">Café disponible</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="departamento" label="Departamento de origen" maxLength={50} required />
          <Input name="municipio" label="Municipio de origen" maxLength={50} required />
          <Input name="variedad" label="Variedad" maxLength={100} required />
          <SelectField name="proceso" label="Proceso" options={processes} />
          <Input name="cantidad_sacos" label="Número de sacos" type="number" min="1" max="2147483647" step="1" required />
          <Input name="peso_total_kg" label="Peso total (kg)" type="number" min="0.01" max="99999999.99" step="0.01" required />
          <Input name="precio_kg_cop" label="Precio esperado por kg (COP)" type="number" min="0.01" max="999999999999.99" step="0.01" required />
        </div>
      </fieldset>
      <label className="flex items-start gap-3 rounded-lg bg-surface-50 p-4 text-sm text-surface-700">
        <input name="acepta_condiciones" className="mt-1" type="checkbox" required />
        <span>Entiendo que mi oferta estará visible para las empresas exportadoras durante 15 días desde que confirme mi correo. Publicar mi café no garantiza que una empresa me contacte, me vincule ni compre el café.</span>
      </label>
      <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-terracota underline">Política de privacidad</Link>
    </>
  );
}

function AccountFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField name="tipo_documento" label="Tipo de documento" options={{ CC: 'Cédula de ciudadanía', CE: 'Cédula de extranjería', NIT: 'NIT', PASAPORTE: 'Pasaporte' }} />
      <Input name="numero_documento" label="Número de documento" maxLength={25} required />
      <SelectField name="genero" label="Género" options={{ Masculino: 'Masculino', Femenino: 'Femenino', Otro: 'Otro', 'Prefiero no responder': 'Prefiero no responder' }} />
      <Input name="contrasena" label="Contraseña (mínimo 12 caracteres)" type="password" minLength={12} maxLength={72} autoComplete="new-password" required />
      <Input name="confirmar_contrasena" label="Repite tu contraseña" type="password" minLength={12} maxLength={72} autoComplete="new-password" required />
    </div>
  );
}

export default function AddProductPage({ mode = 'publicar' }) {
  const { hash } = useLocation();
  const token = hash.slice(1);
  const validToken = /^[a-f0-9]{64}$/.test(token);
  const { enviarOferta, confirmarOferta, consultarInvitacion, aceptarInvitacion } = useOfertasExternas();
  const [invitation, setInvitation] = useState(null);
  const [invitationError, setInvitationError] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const accepting = mode === 'invitacion';
  const confirming = mode === 'confirmar';

  useEffect(() => {
    if (!accepting || !validToken) return undefined;
    const controller = new AbortController();
    consultarInvitacion(token, controller.signal).then(setInvitation).catch((failure) => {
      if (!controller.signal.aborted) setInvitationError(getErrorMessage(failure));
    });
    return () => controller.abort();
  }, [accepting, validToken, token, consultarInvitacion]);

  async function submit(event) {
    event.preventDefault();
    const { confirmar_contrasena, ...fields } = Object.fromEntries(new FormData(event.currentTarget));
    if (accepting && fields.contrasena !== confirmar_contrasena) {
      setError('Las contraseñas deben coincidir.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (confirming) {
        const offer = await confirmarOferta(token);
        setSuccess(`Tu café ya está publicado. La oferta estará disponible hasta el ${date.format(new Date(offer.vence_en))}.`);
      } else if (accepting) {
        await aceptarInvitacion({ ...fields, token, captcha });
        setSuccess(`Tu cuenta de caficultor está activa y quedó vinculada a ${invitation.razon_social}.`);
      } else {
        await enviarOferta({ ...fields, acepta_condiciones: fields.acepta_condiciones === 'on', condiciones_version: CONDITIONS_VERSION, captcha });
        setSuccess('Revisa tu correo. Abre el enlace de confirmación en las próximas 24 horas para publicar tu oferta.');
      }
    } catch (failure) {
      setError(getErrorMessage(failure));
      setCaptcha('');
      setCaptchaKey((key) => key + 1);
    } finally {
      setBusy(false);
    }
  }

  const linkError = (accepting || confirming) && !validToken ? 'El enlace está incompleto. Abre el enlace que recibiste por correo.' : invitationError;
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6">
      <div className="space-y-6 rounded-2xl border border-surface-200 bg-white p-5 shadow-sm sm:p-8">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">{accepting ? 'Invitación de una empresa' : confirming ? 'Confirma tu oferta de café' : 'Publica tu oferta de café'}</h1>
          {!accepting && !confirming && <p className="mt-2 text-surface-600">Presenta tu café a las empresas exportadoras de ConexCoffee. Puedes publicar sin crear una cuenta.</p>}
        </div>
        {success ? (
          <div className="space-y-3">
            <p role="status" className="rounded-lg bg-surface-50 p-4">{success}</p>
            {accepting && <Link to="/login" className="font-semibold text-brand-terracota underline">Iniciar sesión</Link>}
          </div>
        ) : linkError ? <p role="alert" className="text-danger-700">{linkError}</p>
          : accepting && !invitation ? <p role="status">Cargando invitación…</p> : (
            <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
              {accepting ? (
                <>
                  <div className="rounded-lg bg-surface-50 p-4 text-sm text-surface-700">
                    <p><strong>{invitation.razon_social}</strong> quiere vincularte a su empresa por tu oferta de café {invitation.variedad}.</p>
                    <p className="mt-1">{invitation.cantidad_sacos} sacos · {Number(invitation.peso_total_kg)} kg · {currency.format(invitation.precio_kg_cop)} por kg</p>
                    <p className="mt-1">La invitación vence el {date.format(new Date(invitation.invitacion_vence_en))}.</p>
                  </div>
                  <AccountFields />
                </>
              ) : confirming ? <p>Confirma que quieres mostrar tu oferta a las empresas exportadoras durante 15 días.</p> : <OfferFields />}
              {!confirming && <Captcha key={captchaKey} onVerify={setCaptcha} onExpire={() => setCaptcha('')} onError={() => setCaptcha('')} />}
              {error && <p role="alert" className="text-sm text-danger-700">{error}</p>}
              <Button type="submit" loading={busy} disabled={!confirming && !captcha}>
                {accepting ? 'Aceptar invitación y crear mi cuenta' : confirming ? 'Confirmar y publicar' : 'Enviar oferta para confirmar'}
              </Button>
            </form>
          )}
      </div>
    </section>
  );
}
