import { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { TURNSTILE_SITE_KEY, IS_DEMO_MODE } from '@/lib/env';

// ============================================
// Captcha — Componente reutilizable de verificación
// ============================================
// Utiliza Cloudflare Turnstile vía @marsidev/react-turnstile.
// Si no se define VITE_TURNSTILE_SITE_KEY en el .env y se está en modo demo,
// entra en modo interactivo de desarrollo (checkbox simulado seguro).
// Fuera de demo, bloquea el formulario si no hay llave Turnstile configurada.
// ============================================

export default function Captcha({ onVerify, onExpire, onError, className = '' }) {
  const siteKey = TURNSTILE_SITE_KEY;
  const [devChecked, setDevChecked] = useState(false);

  const isDev = import.meta.env.DEV || IS_DEMO_MODE;

  useEffect(() => {
    // Si no hay llave real y estamos en dev, avisar que está en modo mock
    if (!siteKey && isDev) {
      console.info('[Captcha] Modo desarrollo activo (sin VITE_TURNSTILE_SITE_KEY).');
    }
  }, [siteKey, isDev]);

  // Modo Cloudflare Turnstile real cuando hay SITE KEY configurada
  if (siteKey) {
    return (
      <div className={`flex justify-center my-3 ${className}`}>
        <Turnstile
          siteKey={siteKey}
          onSuccess={(token) => onVerify && onVerify(token)}
          onExpire={() => onExpire && onExpire()}
          onError={(error) => onError && onError(error)}
          options={{
            theme: 'light',
            language: 'es',
          }}
        />
      </div>
    );
  }

  // Fuera del modo desarrollo o demo, prohibir bypass silencioso en producción
  if (!isDev) {
    return (
      <div className={`p-3 rounded-xl border border-danger-200 bg-danger-50 text-danger-700 text-xs flex items-center gap-2 ${className}`}>
        <AlertTriangle className="h-4 w-4 shrink-0 text-danger-500" />
        <span>Error de configuración: VITE_TURNSTILE_SITE_KEY no está configurada en producción.</span>
      </div>
    );
  }


  // Fallback solo permitido en desarrollo / testing local (IS_DEMO_MODE = true)
  const handleDevCheck = (e) => {
    const checked = e.target.checked;
    setDevChecked(checked);
    if (checked) {
      const mockToken = 'mock_turnstile_token_' + Date.now();
      if (onVerify) onVerify(mockToken);
    } else {
      if (onExpire) onExpire();
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border border-surface-200 bg-surface-50 text-surface-700 text-sm ${className}`}
    >
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={devChecked}
          onChange={handleDevCheck}
          className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
        <span>No soy un robot</span>
      </label>
      <div className="flex items-center gap-1.5 text-xs text-surface-400">
        <ShieldCheck className="h-4 w-4 text-primary-600" />
        <span className="font-semibold text-surface-500">Turnstile</span>
      </div>
    </div>
  );
}
