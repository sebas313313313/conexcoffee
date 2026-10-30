import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  Server,
  Lock,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import { useSuperadminConfiguracion } from '../hooks/useSuperadminData';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

export default function ConfiguracionPage() {
  const query = useSuperadminConfiguracion();
  const { configuracion, updateConfiguracion } = useSuperAdmin();
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [config, setConfig] = useState({
    nombrePlataforma: configuracion?.nombrePlataforma || 'ConexCoffee — Plataforma de Café Especial',
    emailSoporte: configuracion?.correoSoporte || 'soporte@conexcoffee.com',
    telefonoContacto: configuracion?.telefonoSoporte || '+57 311 234 4546',
    registroPublicoHabilitado: true,
    captchaHabilitado: true,
    notificacionesEmail: configuracion?.notificacionesEmail ?? true,
    monedaPrincipal: 'USD / COP',
    unidadPesoDefecto: 'Kilogramos (kg)',
    umbralHumedadMax: configuracion?.humedadMaximaPermitida || 12.5,
    puntajeMinimoSca: configuracion?.puntajeScaMinimo || 84.0,
  });

  useEffect(() => {
    if (query.data?.[0]) {
      setConfig((prev) => ({ ...prev, ...query.data[0] }));
    } else if (configuracion) {
      setConfig((prev) => ({ ...prev, ...configuracion }));
    }
  }, [query.data, configuracion]);

  const guardarConfiguracion = async (e) => {
    e.preventDefault();
    if (updateConfiguracion) {
      await updateConfiguracion(config);
    }
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3000);
  };


  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo */}
      <ModuloCabecera
        titulo="Configuración del Sistema"
        subtitulo="Parámetros globales, políticas de calidad SCA, seguridad y pasarelas de comunicación"
        imagenPortada="/images/portadas/empresa.jpg"
        mensaje="En este módulo podrás configurar las variables globales de la plataforma y parámetros operativos."
        icono={Settings}
      />

      <QueryState query={query} />

      {guardadoExitoso && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>¡Configuración guardada exitosamente en el sistema!</span>
        </div>
      )}

      <form onSubmit={guardarConfiguracion} className="space-y-6">
        {/* Sección: Parámetros Generales */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-surface-200 mb-5">
            <Server className="h-5 w-5 text-brand-terracota" />
            <div>
              <h3 className="text-base font-bold text-surface-900">Parámetros de la Plataforma</h3>
              <p className="text-xs text-surface-500">Datos públicos y de contacto mostrados en el sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Nombre del Sistema</label>
              <input
                type="text"
                value={config.nombrePlataforma}
                onChange={(e) => setConfig({ ...config, nombrePlataforma: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Correo Electrónico de Soporte</label>
              <input
                type="email"
                value={config.emailSoporte}
                onChange={(e) => setConfig({ ...config, emailSoporte: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Teléfono PBX / Atención</label>
              <input
                type="text"
                value={config.telefonoContacto}
                onChange={(e) => setConfig({ ...config, telefonoContacto: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Unidad de Medida por Defecto</label>
              <input
                type="text"
                value={config.unidadPesoDefecto}
                onChange={(e) => setConfig({ ...config, unidadPesoDefecto: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
          </div>
        </div>

        {/* Sección: Parámetros de Calidad Cafetera (Norma SCA) */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-surface-200 mb-5">
            <Shield className="h-5 w-5 text-brand-terracota" />
            <div>
              <h3 className="text-base font-bold text-surface-900">Estándares y Filtros de Calidad SCA</h3>
              <p className="text-xs text-surface-500">Límites para aprobación automática de muestras y ofertas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">
                Puntaje Mínimo SCA para Oferta Pública (puntos)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.puntajeMinimoSca}
                onChange={(e) => setConfig({ ...config, puntajeMinimoSca: e.target.value === '' ? 0 : Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">
                Humedad Máxima Permitida en Grano (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.umbralHumedadMax}
                onChange={(e) => setConfig({ ...config, umbralHumedadMax: e.target.value === '' ? 0 : Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-surface-200 focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
              />
            </div>
          </div>
        </div>

        {/* Sección: Seguridad y Notificaciones */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-surface-200 mb-5">
            <Lock className="h-5 w-5 text-brand-terracota" />
            <div>
              <h3 className="text-base font-bold text-surface-900">Seguridad y Políticas de Acceso</h3>
              <p className="text-xs text-surface-500">Reglas de autenticación y Cloudflare Turnstile</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-surface-200 hover:bg-surface-50 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-surface-800 block">Cloudflare Turnstile Antibot</span>
                <span className="text-xs text-surface-500">Exigir verificación de captcha invisible en login y registros</span>
              </div>
              <input
                type="checkbox"
                checked={config.captchaHabilitado}
                onChange={(e) => setConfig({ ...config, captchaHabilitado: e.target.checked })}
                className="h-5 w-5 rounded text-brand-terracota focus:ring-brand-terracota cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-surface-200 hover:bg-surface-50 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-surface-800 block">Notificaciones Automáticas por Correo</span>
                <span className="text-xs text-surface-500">Alertar a caficultores y empresas sobre cambios de estado en ofertas</span>
              </div>
              <input
                type="checkbox"
                checked={config.notificacionesEmail}
                onChange={(e) => setConfig({ ...config, notificacionesEmail: e.target.checked })}
                className="h-5 w-5 rounded text-brand-terracota focus:ring-brand-terracota cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-terracota hover:bg-brand-terracota-dark text-white text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
