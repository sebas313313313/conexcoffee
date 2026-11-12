import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui';
import { ModalBase } from '@/components/modals';
import { useLaboratorio } from '@/hooks/useLaboratorio';
import { getErrorMessage } from '@/lib/axios';
import { FlaskConical, Eye, UserPlus, Calendar } from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useAnalisisFisicos,
  useActualizarAnalisisFisico,
  useCatadores,
} from '../hooks/useLaboratorioData';
import {
  ActualizarAnalisisModal,
  VerAnalisisModal,
  AsignarCatadorModal,
} from '../components';

export default function LaboratorioAnalisisFisicoPage() {
  const [searchParams] = useSearchParams();
  const tokenQr = searchParams.get('token');
  const { cargarFlujoPrecinto, registrarAnalisisQr } = useLaboratorio();
  const query = useAnalisisFisicos();
  const analisisList = query.data ?? [];
  const actualizar = useActualizarAnalisisFisico();
  const catadoresQuery = useCatadores();
  const catadores = catadoresQuery.data ?? [];

  const [analisisEditar, setAnalisisEditar] = useState(null);
  const [analisisVer, setAnalisisVer] = useState(null);
  const [analisisAsignar, setAnalisisAsignar] = useState(null);
  const [flujoQr, setFlujoQr] = useState(null);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [guardandoQr, setGuardandoQr] = useState(false);
  const [errorQr, setErrorQr] = useState('');
  const [nuevo, setNuevo] = useState({ analista_nombre: '', peso_muestra_analizada_gramos: '',
    humedad_porcentaje: '', densidad_g_l: '', actividad_agua_aw: '', factor_rendimiento: '',
    defectos_primer_grupo: '0', defectos_segundo_grupo: '0', es_conforme: true });

  useEffect(() => {
    if (!tokenQr) return;
    let active = true;
    cargarFlujoPrecinto(tokenQr).then((flujo) => {
      if (!active) return;
      setFlujoQr(flujo);
      if (!flujo.analisis) setModalNuevo(true);
    }).catch((err) => { if (active) setErrorQr(getErrorMessage(err)); });
    return () => { active = false; };
  }, [tokenQr, cargarFlujoPrecinto]);

  const guardarNuevoQr = async (event) => {
    event.preventDefault();
    if (guardandoQr || !tokenQr) return;
    setGuardandoQr(true);
    setErrorQr('');
    try {
      await registrarAnalisisQr(tokenQr, nuevo);
      const flujo = await cargarFlujoPrecinto(tokenQr);
      setFlujoQr(flujo);
      setModalNuevo(false);
    } catch (err) { setErrorQr(getErrorMessage(err)); }
    finally { setGuardandoQr(false); }
  };

  const handleUpdate = (actualizado) => actualizar.mutateAsync(actualizado);

  const handleAsignar = (item, catadorNombre) => {
    actualizar.mutate({
      ...item,
      catadorAsignado: catadorNombre,
      estado: 'Catador Asignado',
    });
  };

  if (query.isLoading || query.isError) return <QueryState query={query} />;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Evaluación de Calidad — Análisis Físico</h1>
        <p className="text-surface-500 mt-1">
          Control gravimétrico, porcentaje de humedad, factor de rendimiento y recuento de defectos
        </p>
      </div>

      {tokenQr && (
        <div className="rounded-2xl border border-brand-terracota bg-brand-tint p-5">
          <p className="font-bold text-surface-900">Precinto escaneado · {flujoQr?.codigo_preoferta || 'Consultando oferta...'}</p>
          {errorQr && <p role="alert" className="mt-2 text-sm text-danger-700">{errorQr}</p>}
          {flujoQr?.analisis ? (
            <div className="mt-2 space-y-2 text-sm text-surface-700">
              <p>Análisis {flujoQr.analisis.codigo_analisis} registrado el {String(flujoQr.analisis.fecha_analisis).slice(0, 10)}. Resultado: {flujoQr.analisis.es_conforme ? 'Conforme' : 'No conforme'}.</p>
              {analisisList.some((item) => item.id === flujoQr.analisis.id) && (
                <button type="button" onClick={() => setAnalisisVer(analisisList.find((item) => item.id === flujoQr.analisis.id))}
                  className="font-semibold text-brand-terracota underline">Ver detalle del análisis</button>
              )}
            </div>
          ) : flujoQr && <button type="button" onClick={() => setModalNuevo(true)} className="mt-3 rounded-xl bg-brand-terracota px-4 py-2 text-sm font-semibold text-white">Iniciar análisis físico</button>}
          <div className="mt-3"><Link to={`/trazabilidad/${tokenQr}`} className="text-sm text-brand-terracota underline">Volver a la trazabilidad</Link></div>
        </div>
      )}

      {/* Tabla Principal */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface-50 text-surface-600 border-b border-surface-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Fecha de Registro</th>
                <th className="py-3 px-4">Peso Muestra Analizada</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {analisisList.map((item, index) => (
                <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-surface-500 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-surface-900 bg-surface-100 px-2 py-0.5 rounded">
                      {item.codigo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-surface-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-surface-400" />
                      {item.fechaRegistro}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-surface-900">
                    {item.pesoMuestra}
                  </td>
                  <td className="py-3.5 px-4 text-surface-800 font-medium">
                    {item.responsable}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Botón 1: Realizar análisis físico */}
                      <button
                        type="button"
                        onClick={() => setAnalisisEditar(item)}
                        title={item.estado === 'Completado' ? 'Editar análisis físico' : 'Realizar análisis físico'}
                        aria-label={item.estado === 'Completado' ? 'Editar análisis físico' : 'Realizar análisis físico'}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-surface-200 bg-white text-surface-600 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FlaskConical className="w-5 h-5 text-primary-600" />
                      </button>

                      {/* Botón 2: Ver análisis físico */}
                      <button
                        type="button"
                        onClick={() => setAnalisisVer(item)}
                        title="Ver análisis físico"
                        aria-label="Ver análisis físico"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-surface-200 bg-white text-surface-600 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-5 h-5 text-surface-600" />
                      </button>

                      {/* Botón 3: Asignar un catador */}
                      <button
                        type="button"
                        onClick={() => setAnalisisAsignar(item)}
                        title="Asignar un catador"
                        aria-label="Asignar un catador"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 hover:border-primary-400 transition-colors shadow-2xs cursor-pointer"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modales */}
      <ActualizarAnalisisModal
        isOpen={!!analisisEditar}
        onClose={() => setAnalisisEditar(null)}
        analisis={analisisEditar}
        nuevo={analisisEditar?.estado !== 'Completado'}
        onSave={handleUpdate}
      />

      <VerAnalisisModal
        isOpen={!!analisisVer}
        onClose={() => setAnalisisVer(null)}
        analisis={analisisVer}
      />

      <AsignarCatadorModal
        isOpen={!!analisisAsignar}
        onClose={() => setAnalisisAsignar(null)}
        analisis={analisisAsignar}
        catadores={catadores}
        onAsignar={handleAsignar}
      />
      <ModalBase isOpen={modalNuevo} onClose={() => { if (!guardandoQr) setModalNuevo(false); }} title="Análisis físico de la oferta" size="lg">
        <form onSubmit={guardarNuevoQr} className="space-y-4">
          <p className="text-sm text-surface-600">Oferta {flujoQr?.codigo_preoferta}. Registra los valores medidos de la muestra.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Analista responsable *<input required maxLength={100} value={nuevo.analista_nombre} onChange={(e) => setNuevo({ ...nuevo, analista_nombre: e.target.value })} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2" /></label>
            {[
              ['peso_muestra_analizada_gramos', 'Peso de la muestra (g)', '0.01', '9999.99'],
              ['humedad_porcentaje', 'Humedad (%)', '0.01', '100'],
              ['densidad_g_l', 'Densidad (g/l)', '0.01', '9999.99'],
              ['actividad_agua_aw', 'Actividad de agua (aW)', '0.001', '1'],
              ['factor_rendimiento', 'Factor de rendimiento', '0.01', '999.99'],
            ].map(([campo, etiqueta, paso, maximo]) => (
              <label key={campo} className="text-sm font-semibold">{etiqueta} *
                <input required type="number" min={paso} max={maximo} step={paso} value={nuevo[campo]}
                  onChange={(e) => setNuevo({ ...nuevo, [campo]: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2" />
              </label>
            ))}
            <label className="text-sm font-semibold">Defectos grupo 1
              <input type="number" min="0" step="1" value={nuevo.defectos_primer_grupo} onChange={(e) => setNuevo({ ...nuevo, defectos_primer_grupo: e.target.value })} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2" />
            </label>
            <label className="text-sm font-semibold">Defectos grupo 2
              <input type="number" min="0" step="1" value={nuevo.defectos_segundo_grupo} onChange={(e) => setNuevo({ ...nuevo, defectos_segundo_grupo: e.target.value })} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={nuevo.es_conforme} onChange={(e) => setNuevo({ ...nuevo, es_conforme: e.target.checked })} />La muestra es conforme</label>
          {errorQr && <p role="alert" className="text-sm text-danger-700">{errorQr}</p>}
          <div className="flex justify-end gap-3 border-t border-surface-200 pt-4">
            <button type="button" disabled={guardandoQr} onClick={() => setModalNuevo(false)} className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-semibold">Cancelar</button>
            <button type="submit" disabled={guardandoQr} className="rounded-xl bg-brand-terracota px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{guardandoQr ? 'Guardando...' : 'Registrar análisis'}</button>
          </div>
        </form>
      </ModalBase>
    </div>
  );
}
