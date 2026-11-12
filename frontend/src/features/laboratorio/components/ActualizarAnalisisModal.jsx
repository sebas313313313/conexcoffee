import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FlaskConical, Grid3X3, ScanSearch } from 'lucide-react';
import ModalBase from '@/components/modals/ModalBase';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/lib/axios';

const fases = [
  { nombre: 'Análisis de la muestra', corto: 'Muestra', icono: FlaskConical },
  { nombre: 'Análisis de defectos', corto: 'Defectos', icono: ScanSearch },
  { nombre: 'Análisis granulométrico', corto: 'Granulometría', icono: Grid3X3 },
];
const mallas = [0, 12, 13, 14, 15, 16, 17, 18];
const primerGrupo = [
  ['negro', 'Negro parcial o total'],
  ['cardenillo', 'Cardenillo'],
  ['vinagre', 'Vinagre o parcialmente vinagre'],
  ['reposado', 'Decolorado reposado'],
  ['ambar', 'Decolorado, ámbar o mantequilla'],
];
const formato = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function FormularioAnalisis({ analisis, onClose, onSave, nuevo }) {
  const [fase, setFase] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const tituloFase = useRef(null);
  useEffect(() => {
    tituloFase.current?.focus({ preventScroll: true });
  }, [fase]);
  const [datos, setDatos] = useState(() => ({
    ...analisis?.detalleAnalisisFisico,
    peso_muestra_analizada_gramos: analisis?.peso_muestra_analizada_gramos ?? analisis?.pesoNum ?? '',
    humedad_porcentaje: analisis?.humedad_porcentaje ?? analisis?.humedadNum ?? '',
    densidad_g_l: analisis?.densidad_g_l ?? '',
    actividad_agua_aw: analisis?.actividad_agua_aw ?? '',
    factor_rendimiento: analisis?.factor_rendimiento ?? '',
    analista_nombre: analisis?.analista_nombre ?? '',
    defectos_primer_grupo: analisis?.defectos_primer_grupo ?? 0,
    defectos_segundo_grupo: analisis?.defectos_segundo_grupo ?? 0,
    es_conforme: analisis?.es_conforme ?? true,
  }));
  const peso = Number(datos.peso_muestra_analizada_gramos);
  const pesoOriginal = Number(analisis?.peso_muestra_analizada_gramos ?? analisis?.pesoNum ?? peso);
  const pesoMalla = (malla) => {
    const registrado = analisis?.[`malla_${malla}_porcentaje`];
    return datos[`malla_${malla}_g`] ?? (registrado == null ? '' : Number((Number(registrado) * pesoOriginal / 100).toFixed(2)));
  };
  const tieneDetalleMenor = [0, 12, 13].some((malla) => datos[`malla_${malla}_g`] != null);
  const pesoMenorSinDesglose = tieneDetalleMenor ? 0 : Number(analisis?.menor_malla_14_porcentaje ?? 0) * pesoOriginal / 100;
  const porcentaje = (gramos) => peso > 0 ? Number(gramos) * 100 / peso : 0;
  const pesoRegistrado = mallas.reduce((total, malla) => total + Number(pesoMalla(malla)), pesoMenorSinDesglose);
  const exceso = pesoRegistrado > peso + 0.04;
  const totalDefectosPrimerGrupo = primerGrupo.reduce((total, [campo]) => total + Number(datos[campo] || 0), 0);
  const pesoDisponible = datos.peso_total ? formato.format(Math.max(0, Number(datos.peso_total) - peso)) : '—';
  const cambiar = (campo, valor) => setDatos((prev) => ({ ...prev, [campo]: valor }));
  const numero = (campo, etiqueta, opciones = {}) => (
    <Input id={`fisico-${campo}`} label={etiqueta} type="number" step="0.01" min="0"
      value={datos[campo] ?? ''} onChange={(e) => cambiar(campo, e.target.value)} {...opciones} />
  );

  const avanzar = async (event) => {
    event.preventDefault();
    setError('');
    if (fase === 0 && datos.peso_total && Number(datos.peso_total) < peso) {
      setError('El peso para analizar no puede superar el peso total.');
      return;
    }
    if (fase === 0 && datos.almendra_sana !== '' && Number(datos.almendra_sana) > Number(datos.almendra)) {
      setError('El peso de la almendra sana no puede superar el peso de la almendra.');
      return;
    }
    if (fase < 2) {
      setFase(fase + 1);
      return;
    }
    if (guardando) return;
    const pesos = Object.fromEntries(mallas.map((malla) => [`malla_${malla}_g`, pesoMalla(malla)]));
    if (exceso) {
      setError('La suma de los pesos de las mallas no puede superar el peso analizado.');
      return;
    }
    setGuardando(true);
    try {
      await onSave({
        ...analisis,
        ...datos,
        ...Object.fromEntries(mallas.filter((malla) => malla >= 14).map((malla) =>
          [`malla_${malla}_porcentaje`, Number(porcentaje(pesoMalla(malla)).toFixed(2))]
        )),
        menor_malla_14_porcentaje: Number(porcentaje(pesoMenorSinDesglose + Number(pesoMalla(0)) + Number(pesoMalla(12)) + Number(pesoMalla(13))).toFixed(2)),
        detalleAnalisisFisico: { ...datos, ...Object.fromEntries(Object.entries(pesos).filter(([, valor]) => valor !== '')) },
        estado: 'Completado',
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el análisis físico.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase isOpen onClose={() => { if (!guardando) onClose(); }} size="full"
      title={`${nuevo ? 'Realizar' : 'Editar'} análisis físico${analisis?.codigo ? ` · ${analisis.codigo}` : ''}`}>
      <form onSubmit={avanzar} className="space-y-4">
        <ol className="grid grid-cols-3 gap-2" aria-label="Fases del análisis físico">
          {fases.map(({ nombre, corto, icono: Icono }, indice) => (
            <li key={nombre} aria-current={fase === indice ? 'step' : undefined}>
              <button type="button" disabled={guardando || indice >= fase}
                onClick={() => { setError(''); setFase(indice); }}
                aria-label={`Fase ${indice + 1}: ${nombre}`}
                className={`flex w-full flex-col items-center gap-1.5 rounded-xl border p-2 text-xs font-semibold sm:flex-row sm:p-3 sm:text-left
                  ${fase === indice ? 'border-brand-terracota bg-brand-tint text-brand-terracota'
                    : 'border-surface-200 text-surface-600 enabled:cursor-pointer enabled:hover:bg-surface-50'}`}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white">
                  {indice < fase ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Icono className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span><span className="block text-[10px]">Fase {indice + 1}</span>{corto}</span>
              </button>
            </li>
          ))}
        </ol>
        <fieldset key={fase} disabled={guardando} className="max-h-[48dvh] min-w-0 space-y-4 overflow-y-auto p-1">
          <h2 ref={tituloFase} tabIndex={-1} className="text-lg font-bold text-surface-900">{fases[fase].nombre}</h2>
          {fase === 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {numero('peso_muestra_analizada_gramos', 'Peso para analizar (g)', { min: '0.01', max: '9999.99', required: true })}
              {numero('peso_total', 'Peso total de la muestra (g)')}
              <div className="rounded-xl bg-brand-tint px-3 py-2">
                <p className="text-xs font-semibold text-brand-terracota">Muestra disponible</p>
                <output aria-label="Muestra disponible" className="text-lg font-bold tabular-nums text-surface-900">
                  {pesoDisponible}{datos.peso_total && ' g'}
                </output>
              </div>
              {numero('humedad_porcentaje', 'Humedad (%)', { max: '99.99', required: true })}
              {numero('densidad_g_l', 'Densidad (g/L)', { min: '0.01', max: '9999.99', required: true })}
              {numero('actividad_agua_aw', 'Actividad de agua (aw)', { max: 1, step: '0.001', required: true })}
              {numero('almendra', 'Peso almendra (g)', { required: true })}
              {numero('almendra_sana', 'Peso almendra sana (g)', { required: true })}
              {numero('factor_rendimiento', 'Factor de rendimiento (kg)', { max: '999.99', required: true })}
              <Input label="Analista responsable" required maxLength={100} value={datos.analista_nombre}
                onChange={(e) => cambiar('analista_nombre', e.target.value)} />
            </div>
          )}
          {fase === 1 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-surface-900">Defectos de primer grupo (g)</h3>
                <output aria-label="Peso de defectos del primer grupo" className="rounded-lg bg-brand-tint px-3 py-1 text-sm font-semibold text-brand-terracota">
                  {formato.format(totalDefectosPrimerGrupo)} g
                </output>
              </div>
              <div className="grid gap-3 rounded-xl border border-surface-200 p-3 sm:grid-cols-3">
                {primerGrupo.map(([campo, etiqueta]) => <div key={campo}>{numero(campo, etiqueta)}</div>)}
              </div>
              <h3 className="font-semibold text-surface-900">Defectos de segundo grupo</h3>
              <div className="grid gap-3 rounded-xl border border-surface-200 p-3 sm:grid-cols-3">
                {numero('segundo_grupo_g', 'Peso del segundo grupo (g)')}
                {numero('defectos_primer_grupo', 'Cantidad de defectos del primer grupo', { step: 1 })}
                {numero('defectos_segundo_grupo', 'Cantidad de defectos del segundo grupo', { step: 1 })}
              </div>
            </>
          )}
          {fase === 2 && (
            <>
              <h3 className="font-semibold text-surface-900">Mallas (g)</h3>
              <div className={`rounded-xl border px-3 py-2 ${exceso ? 'border-danger-500 bg-danger-50' : 'border-surface-200 bg-surface-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">Peso distribuido</span>
                  <output aria-label="Peso distribuido" className="font-semibold tabular-nums">
                    {formato.format(pesoRegistrado)} / {formato.format(peso)} g
                  </output>
                </div>
                <progress aria-label="Proporción del peso distribuido" max={peso || 1} value={Math.min(pesoRegistrado, peso)}
                  className="mt-1 h-2 w-full accent-brand-terracota" />
                {exceso && <p className="text-xs text-danger-700">El peso distribuido supera el peso analizado.</p>}
              </div>
              {pesoMenorSinDesglose > 0 && (
                <p className="text-xs text-surface-600">
                  Registro anterior menor a malla 14 sin desglose ({formato.format(porcentaje(pesoMenorSinDesglose))} %).
                  Si ingresas pesos en las mallas 0, 12 o 13, reemplazarán ese valor agrupado.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mallas.map((malla) => (
                  <div key={malla} className="flex items-end gap-2 rounded-xl border border-surface-200 bg-white p-2.5">
                    {numero(`malla_${malla}_g`, `Malla ${malla}`, { value: pesoMalla(malla), max: peso })}
                    <output aria-label={`Porcentaje de malla ${malla}`}
                      className="shrink-0 rounded-lg bg-brand-tint px-2 py-2.5 text-sm font-semibold tabular-nums text-brand-terracota">
                      {formato.format(porcentaje(pesoMalla(malla)))} %
                    </output>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={datos.es_conforme} onChange={(e) => cambiar('es_conforme', e.target.checked)} />
                La muestra es conforme
              </label>
            </>
          )}
        </fieldset>
        {error && <p role="alert" className="text-sm text-danger-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-surface-200 pt-3">
          <Button type="button" variant="outline" disabled={guardando} onClick={fase === 0 ? onClose : () => { setError(''); setFase(fase - 1); }}>
            {fase > 0 && <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            {fase === 0 ? 'Cancelar' : 'Anterior'}
          </Button>
          <Button type="submit" loading={guardando}>
            {fase === 2 ? 'Guardar análisis' : 'Siguiente'}
            {!guardando && (fase === 2 ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />)}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}

export default function ActualizarAnalisisModal({ isOpen, ...props }) {
  return isOpen ? <FormularioAnalisis key={props.analisis?.id} {...props} /> : null;
}
