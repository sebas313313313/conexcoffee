import { Link } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import { useEvaluaciones } from '../hooks/useCatadorData';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });

export default function CatadorDashboardPage() {
  const { data: evaluaciones, isLoading, error, refetch } = useEvaluaciones();
  const sesiones = error ? evaluaciones.filter((sesion) => sesion.esDePrueba) : evaluaciones;
  const muestras = sesiones.reduce((totales, sesion) => {
    const grupo = sesion.estado === 'Completada' ? 'completadas' : 'pendientes';
    totales[grupo] += Number(sesion.cantidadMuestras) || 0;
    return totales;
  }, { pendientes: 0, completadas: 0 });
  const recientes = [...sesiones]
    .sort((a, b) => (Date.parse(b.fecha_sesion) || 0) - (Date.parse(a.fecha_sesion) || 0))
    .filter((sesion, indice) => indice < 5 || sesion.esDePrueba);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Panel del catador</h1>
          <p className="mt-1 text-sm text-surface-600">Consulta tus sesiones y continúa desde el módulo de evaluación.</p>
        </div>
        <Link to="/catador/evaluacion"
          className="rounded-lg bg-brand-terracota px-4 py-2 text-sm font-semibold text-white hover:bg-brand-terracota-dark">
          Ir a evaluaciones
        </Link>
      </header>

      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-surface-200 bg-white px-4 py-3">
          <p role="status" className="text-sm text-surface-600">
            No se pudieron cargar tus sesiones registradas.{sesiones.length > 0 && ' Se muestran datos de prueba.'}
          </p>
          <Button variant="outline" size="sm" onClick={refetch}>Reintentar</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-surface-600">Muestras pendientes</h2>
          <p className="mt-2 text-3xl font-bold text-surface-900">
            {isLoading || (error && !sesiones.length) ? '—' : muestras.pendientes}
          </p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-surface-600">Muestras completadas</h2>
          <p className="mt-2 text-3xl font-bold text-surface-900">
            {isLoading || (error && !sesiones.length) ? '—' : muestras.completadas}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-200 pb-4">
          <h2 className="text-lg font-semibold text-surface-900">Mis sesiones de catación</h2>
          {!isLoading && !error && (
            <span className="text-sm text-surface-600">
              {evaluaciones.filter((sesion) => !sesion.esDePrueba).length} sesiones registradas
            </span>
          )}
        </div>

        {isLoading ? <p role="status" className="py-5 text-sm text-surface-600">Cargando sesiones…</p>
          : recientes.length ? (
            <ul className="divide-y divide-surface-100">
              {recientes.map((sesion) => (
                <li key={sesion.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
                  <div className="min-w-0 flex-1 basis-52">
                    <p className="text-xs font-medium text-surface-500">{sesion.codigo}</p>
                    <p className="break-words font-semibold text-surface-900">{sesion.nombre}</p>
                  </div>
                  <div className="text-sm text-surface-600">
                    {sesion.cantidadMuestras} {sesion.cantidadMuestras === 1 ? 'muestra' : 'muestras'}
                    {sesion.esDePrueba && <p className="text-xs text-brand-terracota">Datos de prueba</p>}
                    {Number.isFinite(Date.parse(sesion.fecha_sesion)) && (
                      <p className="text-xs text-surface-500">{formatoFecha.format(new Date(sesion.fecha_sesion))}</p>
                    )}
                  </div>
                  <Link to={`/catador/evaluacion?buscar=${encodeURIComponent(sesion.codigo ?? sesion.nombre)}`}
                    aria-label={`Ver evaluación ${sesion.nombre}`}
                    className="text-sm font-semibold text-brand-terracota hover:underline">Ver evaluación</Link>
                </li>
              ))}
            </ul>
          ) : !error && (
            <p className="py-5 text-sm text-surface-600">
              Aún no tienes sesiones asignadas. Si recibiste un QR, escanéalo desde Evaluaciones.
            </p>
          )}
      </Card>
    </div>
  );
}
