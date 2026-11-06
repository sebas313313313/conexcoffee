import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, FlaskConical, PackageCheck } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useTrazabilidad from '@/hooks/useTrazabilidad';
import { getErrorMessage } from '@/lib/axios';
import FichaPublica from '../components/FichaPublica';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function AccionTecnico({ token, flujo }) {
  const pendiente = flujo.estado === 'EN_CUSTODIA_TECNICO';
  const puedeCorregir = flujo.estado === 'VINCULADO_A_SACO' && flujo.estado_saco === 'SELLADO_EN_FINCA';
  return (
    <div className="rounded-2xl border border-brand-terracota bg-brand-tint p-5">
      <div className="flex items-center gap-2 font-bold text-surface-900"><PackageCheck className="h-5 w-5 text-brand-terracota" />Trabajo del asistente técnico</div>
      <p className="mt-2 text-sm text-surface-600">{pendiente ? 'Este precinto está bajo tu custodia. Vincúlalo al saco y a la oferta en la finca.' : puedeCorregir ? `Vinculado a la oferta ${flujo.codigo_preoferta}. Puedes corregir la oferta asociada o el peso del saco.` : `Vinculado a la oferta ${flujo.codigo_preoferta}. El saco ya salió de finca y su vinculación no puede corregirse aquí.`}</p>
      {(pendiente || puedeCorregir) && <Link to={`/tecnico/precintos?token=${encodeURIComponent(token)}${pendiente ? '' : '&editar=1'}`}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-terracota px-4 py-2 font-semibold text-white">
        {pendiente ? 'Vincular saco' : 'Revisar vinculación'}<ArrowRight className="h-4 w-4" />
      </Link>}
    </div>
  );
}

function AccionLaboratorio({ flujo, token }) {
  const analisis = flujo.analisis;
  return (
    <div className="rounded-2xl border border-brand-terracota bg-brand-tint p-5">
      <div className="flex items-center gap-2 font-bold text-surface-900"><FlaskConical className="h-5 w-5 text-brand-terracota" />Trabajo de laboratorio</div>
      <p className="mt-2 text-sm text-surface-600">{analisis ? `El análisis ${analisis.codigo_analisis} ya fue registrado. Puedes revisar su resultado.` : 'Esta oferta aún no tiene un análisis físico registrado por tu laboratorio.'}</p>
      <Link to={`/laboratorio/analisis-fisico?token=${encodeURIComponent(token)}&preoferta=${encodeURIComponent(flujo.preoferta_id)}`}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-terracota px-4 py-2 font-semibold text-white">
        {analisis ? 'Ver análisis' : 'Iniciar análisis físico'}<ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function TrazabilidadPage() {
  const { token } = useParams();
  const { role, isLoading: authLoading } = useAuth();
  const { ficha, flujo, loading, error, cargar } = useTrazabilidad();
  useEffect(() => {
    if (!authLoading && UUID.test(token || '')) cargar(token, role);
  }, [authLoading, token, role, cargar]);

  if (!UUID.test(token || '')) return <Navigate to="/" replace />;
  if (authLoading || loading) return <div className="mx-auto max-w-5xl p-8 text-center text-surface-600">Consultando trazabilidad...</div>;
  if (error?.response?.status === 404) return <Navigate to="/" replace />;
  if (error) return <div role="alert" className="mx-auto max-w-5xl rounded-xl bg-danger-50 p-6 text-danger-700">{getErrorMessage(error)}</div>;
  if (!ficha && !flujo) return <Navigate to="/" replace />;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      {flujo && role === 'tecnico' && <AccionTecnico token={token} flujo={flujo} />}
      {flujo && role === 'laboratorio' && <AccionLaboratorio flujo={flujo} token={token} />}
      {ficha && <FichaPublica ficha={ficha} />}
    </main>
  );
}
