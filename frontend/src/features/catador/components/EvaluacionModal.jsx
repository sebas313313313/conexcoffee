import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import ModalBase from '@/components/modals/ModalBase';
import { Button } from '@/components/ui';
import { Award, Send, AlertTriangle, FileText, Coffee, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import IntensityBar from './IntensityBar';
import RatingScale1to9 from './RatingScale1to9';
import TazasSelector from './TazasSelector';
import DescriptoresSelector from './DescriptoresSelector';
import RoastLevelBar from './RoastLevelBar';
import { SegmentedProgress } from '@/components/ui';

// ─── Constantes ───────────────────────────────────────────────────────────────

const GUSTOS = [
  { id: 'salado', label: 'Salado' },
  { id: 'acido',  label: 'Ácido'  },
  { id: 'dulce',  label: 'Dulce'  },
  { id: 'amargo', label: 'Amargo' },
  { id: 'umami',  label: 'Umami'  },
];

const TEXTURAS = [
  { id: 'aspero',    label: 'Áspero'            },
  { id: 'suave',     label: 'Suave'             },
  { id: 'aceitoso',  label: 'Aceitoso'          },
  { id: 'seca_boca', label: 'Deja seca la boca' },
  { id: 'metalico',  label: 'Metálico'          },
];

const DEFECTOS = [
  { id: 'ninguno',  label: 'Sin defecto' },
  { id: 'mohoso',   label: 'Mohoso'      },
  { id: 'fenolico', label: 'Fenólico'    },
  { id: 'papa',     label: 'Papa'        },
];

// ─── Componentes auxiliares ───────────────────────────────────────────────────

/** Sub-sección dentro de una fase */
function SubSection({ label, children }) {
  return (
    <div className="space-y-2 py-3 border-b border-surface-100 last:border-b-0">
      {label && (
        <p className="text-xs font-semibold text-surface-700 mb-1">{label}</p>
      )}
      {children}
    </div>
  );
}

/** Pills de selección múltiple */
function Chips({ items, selected, onToggle }) {
  const selectedSet = new Set(selected);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = selectedSet.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer',
              isSelected
                ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                : 'bg-white text-surface-600 border-surface-200 hover:border-primary-400 hover:text-primary-600'
            )}
          >
            {isSelected && <span className="mr-1 text-[10px]">✓</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** Campo de nota */
function NoteField({ value, onChange, placeholder = 'Añadir nota...' }) {
  return (
    <div className="pt-2">
      <label className="block text-[10px] uppercase tracking-widest font-semibold text-surface-400 mb-1.5">
        NOTE
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs rounded-lg border border-surface-200 px-3 py-2 bg-surface-50 text-surface-800 placeholder-surface-300 focus:ring-2 focus:ring-primary-500 focus:outline-none focus:bg-white transition-colors"
      />
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
const FASES = ["Evaluación descriptiva","Evaluación afectiva","Sabor y Sabor Residual (descriptiva)","Sabor y Sabor Residual (afectiva)","Acidez","Dulzor","Sensación en Boca","Impresión Global","Uniformidad y defectos","Resultado final"];
const RESPUESTAS_INICIALES = {
  nivelTueste: 3,
  intensidadFragancia: 8,
  intensidadAroma: 8,
  descriptoresFragancia: [],
  notaFragancia: '',
  afectivaFragancia: 7,
  afectivaAroma: 7,
  notaAfectivaFragancia: '',
  intensidadSabor: 8,
  intensidadSaborResidual: 8,
  descriptoresSabor: [],
  gustos: [],
  notaSabor: '',
  afectivoSabor: 7,
  afectivoSaborResidual: 7,
  notaAfectivoSabor: '',
  intensidadAcidez: 8,
  notaAcidez: '',
  afectivoAcidez: 7,
  intensidadDulzor: 8,
  notaDulzor: '',
  afectivoDulzor: 7,
  intensidadBoca: 8,
  texturas: [],
  notaBoca: '',
  afectivoBoca: 7,
  afectivoGlobal: 7,
  notaGlobal: '',
};

function leerBorrador(clave) {
  if (!clave) return null;
  try {
    const borrador = JSON.parse(sessionStorage.getItem(clave));
    return borrador?.tazas?.length === 5 ? borrador : null;
  } catch {
    return null;
  }
}

export default function EvaluacionModal({ isOpen, onClose, evaluacion, onFinalizar }) {
  const usuarioId = useAuthStore((state) => state.user?.id);
  const clave = usuarioId && evaluacion?.id ? `catacion:borrador:v1:${usuarioId}:${evaluacion.id}` : null;
  const [borrador] = useState(() => leerBorrador(clave));
  const [enviando, setEnviando] = useState(false);
  const [fase, setFase] = useState(borrador?.fase ?? 0);
  const [indiceTaza, setIndiceTaza] = useState(borrador?.indiceTaza ?? 0);
  const [tazas, setTazas] = useState(() => borrador?.tazas ?? Array.from({ length: 5 }, () => ({
    respuestas: { ...RESPUESTAS_INICIALES },
    confirmadas: [],
  })));
  const taza = tazas[indiceTaza].respuestas;
  const completas = tazas.every((item) => item.confirmadas.length === 8);

  const actualizar = (campo) => (valor) => {
    setTazas((prev) => prev.map((item, indice) => indice === indiceTaza ? {
      respuestas: {
        ...item.respuestas,
        [campo]: typeof valor === 'function' ? valor(item.respuestas[campo]) : valor,
      },
      confirmadas: item.confirmadas.filter((numero) => numero !== fase),
    } : item));
  };

  const confirmarTaza = () => {
    setTazas((prev) => prev.map((item, indice) => indice === indiceTaza ? {
      ...item,
      confirmadas: [...new Set([...item.confirmadas, fase])],
    } : item));
    const siguiente = tazas.findIndex((item, indice) =>
      indice !== indiceTaza && !item.confirmadas.includes(fase)
    );
    setIndiceTaza(siguiente < 0 ? 0 : siguiente);
    if (siguiente < 0) setFase(fase + 1);
  };

  const [tazasNoUniformes, setTazasNoUniformes] = useState(borrador?.tazasNoUniformes ?? []);
  const [tazasDefectuosas, setTazasDefectuosas] = useState(borrador?.tazasDefectuosas ?? []);
  const [tipoDefecto, setTipoDefecto] = useState(borrador?.tipoDefecto ?? 'ninguno');
  const [notaFinal, setNotaFinal] = useState(borrador?.notaFinal ?? '');

  useEffect(() => {
    if (!isOpen || !clave) return;
    try {
      sessionStorage.setItem(clave, JSON.stringify({
        fase, indiceTaza, tazas, tazasNoUniformes, tazasDefectuosas, tipoDefecto, notaFinal,
      }));
    } catch {
      // El formulario sigue disponible si el navegador bloquea el almacenamiento.
    }
  }, [isOpen, clave, fase, indiceTaza, tazas, tazasNoUniformes, tazasDefectuosas, tipoDefecto, notaFinal]);

  // ── Puntuación ───────────────────────────────────────────────────────────────
  const { puntuacionTotal, categoria } = (() => {
    const suma = tazas.reduce((total, { respuestas: r }) => total + r.afectivaFragancia +
      r.afectivaAroma + r.afectivoSabor + r.afectivoSaborResidual + r.afectivoAcidez +
      r.afectivoDulzor + r.afectivoBoca + r.afectivoGlobal, 0) / tazas.length;
    const base = (suma / 72) * 100;
    const penUnif = tazasNoUniformes.length * 2;
    let fd = 2;
    if (tipoDefecto === 'fenolico' || tipoDefecto === 'papa') fd = 4;
    else if (tipoDefecto === 'mohoso') fd = 3;
    const penDef = tipoDefecto !== 'ninguno' ? tazasDefectuosas.length * fd : 0;
    const total = Math.max(0, Math.min(100, base - penUnif - penDef));
    const score = Math.round(total * 100) / 100;
    let cat = { label: 'Bajo Estándar SCA',    color: 'text-red-700 bg-red-50 border-red-200'             };
    if      (score >= 90) cat = { label: 'Especial Excepcional', color: 'text-accent-800 bg-accent-100 border-accent-300' };
    else if (score >= 85) cat = { label: 'Especial Excelente',   color: 'text-primary-800 bg-primary-100 border-primary-300' };
    else if (score >= 80) cat = { label: 'Especial Muy Bueno',   color: 'text-secondary-700 bg-secondary-50 border-secondary-300' };
    return { puntuacionTotal: score.toFixed(2), categoria: cat };
  })();

  const toggleMulti = (setter) => (id) =>
    setter((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fase !== 9 || !completas || enviando) return;
    setEnviando(true);
    try {
      await onFinalizar({
        evaluacionId: evaluacion?.id,
        evaluacionNombre: evaluacion?.nombre,
        puntuacionTotal,
        categoria: categoria.label,
        nivelTueste: tazas[0].respuestas.nivelTueste,
      });
      if (clave) {
        try { sessionStorage.removeItem(clave); } catch { /* Almacenamiento bloqueado. */ }
      }
    } catch {
      // El Provider muestra el error y el borrador queda disponible para reintentar.
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={() => { if (!enviando) onClose(); }}
      title={evaluacion?.nombre || 'Hoja de Evaluación Sensorial SCA'}
      size="full"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-50 px-3 py-2">
            <p className="break-words font-mono text-xs font-bold text-surface-700">
              {evaluacion?.codigo || evaluacion?.id || 'Sesión activa'}
            </p>
            {evaluacion?.objetivo && <p className="mt-1 text-xs text-surface-600">{evaluacion.objetivo}</p>}
          </div>

          <div role="group" aria-label="Ir a una fase">
            <p className="mb-2 text-xs font-semibold text-surface-700">Ir a una fase</p>
            <div className="flex flex-wrap gap-2">
              {FASES.map((nombre, indice) => (
                <Button key={nombre} type="button" size="sm" variant={fase === indice ? 'primary' : 'outline'}
                  aria-current={fase === indice ? 'step' : undefined}
                  aria-label={indice < 8 ? `Fase ${indice + 1}: ${nombre}` : nombre}
                  title={nombre} onClick={() => setFase(indice)}>
                  {indice < 8 ? `Fase ${indice + 1}` : indice === 8 ? 'Defectos' : 'Resultado'}
                </Button>
              ))}
            </div>
          </div>

          {fase < 8 && (
            <section className="rounded-xl border border-surface-200 bg-surface-50 p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-1">
                <h3 className="text-sm font-semibold text-surface-900">{FASES[fase]}</h3>
                <p className="text-xs text-surface-600" aria-live="polite">
                  {tazas.filter((item) => item.confirmadas.includes(fase)).length} de {tazas.length} confirmadas
                </p>
              </div>
              <div role="group" aria-label="Seleccionar taza" className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {tazas.map((item, indice) => {
                  const confirmada = item.confirmadas.includes(fase);
                  const activa = indice === indiceTaza;
                  return (
                    <button key={indice} type="button" aria-pressed={activa}
                      aria-label={`Taza ${indice + 1}${confirmada ? ', confirmada' : ''}`}
                      title={`Taza ${indice + 1}${confirmada ? ' · Confirmada' : ''}`}
                      onClick={() => setIndiceTaza(indice)}
                      className={cn('relative flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-brand-terracota',
                        activa ? 'border-brand-terracota bg-brand-tint text-brand-terracota'
                          : 'border-surface-200 bg-white text-surface-700 hover:border-brand-terracota/40')}>
                      <Coffee className="h-5 w-5" aria-hidden="true" />
                      <span>Taza {indice + 1}</span>
                      {confirmada && <Check className="absolute right-1 top-1 h-3 w-3 text-emerald-700" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div key={`${fase}-${indiceTaza}`} className="mt-4 max-h-[40dvh] overflow-y-auto pr-1">

          {/* ════════════════════════════════════════════════════
              FASE 1 — EVALUACIÓN DESCRIPTIVA
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 0}>

            {/* Nivel de tueste */}
            <SubSection label="Nivel de tueste">
              <RoastLevelBar value={taza.nivelTueste} onChange={actualizar('nivelTueste')} />
            </SubSection>

            {/* Fragancia */}
            <SubSection label="Fragancia">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={taza.intensidadFragancia} onChange={actualizar('intensidadFragancia')} />
            </SubSection>

            {/* Aroma */}
            <SubSection label="Aroma">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={taza.intensidadAroma} onChange={actualizar('intensidadAroma')} />
            </SubSection>

            {/* Descriptores de fragancia */}
            <SubSection>
              <DescriptoresSelector
                titulo="Selecciona al menos una opción:"
                selected={taza.descriptoresFragancia}
                onChange={actualizar('descriptoresFragancia')}
              />
            </SubSection>

            <NoteField value={taza.notaFragancia} onChange={actualizar('notaFragancia')} />
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 2 — EVALUACIÓN AFECTIVA (FRAGANCIA/AROMA)
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 1}>

            <SubSection label="Fragancia">
              <RatingScale1to9 value={taza.afectivaFragancia} onChange={actualizar('afectivaFragancia')} />
            </SubSection>

            <SubSection label="Aroma">
              <RatingScale1to9 value={taza.afectivaAroma} onChange={actualizar('afectivaAroma')} />
            </SubSection>

            <NoteField value={taza.notaAfectivaFragancia} onChange={actualizar('notaAfectivaFragancia')} />
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 3 — SABOR Y SABOR RESIDUAL (DESCRIPTIVA)
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 2}>

            <SubSection label="Sabor">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={taza.intensidadSabor} onChange={actualizar('intensidadSabor')} />
            </SubSection>

            <SubSection label="Sabor Residual (Aftertaste)">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={taza.intensidadSaborResidual} onChange={actualizar('intensidadSaborResidual')} />
            </SubSection>

            <SubSection>
              <DescriptoresSelector
                titulo="Descriptores de sabor:"
                selected={taza.descriptoresSabor}
                onChange={actualizar('descriptoresSabor')}
              />
            </SubSection>

            <SubSection label="Gustos Predominantes">
              <Chips items={GUSTOS} selected={taza.gustos} onToggle={toggleMulti(actualizar('gustos'))} />
            </SubSection>

            <NoteField value={taza.notaSabor} onChange={actualizar('notaSabor')} />
            <details className="mt-4 rounded-lg border border-surface-200 p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Comparar sabor entre tazas</summary>
              <ul className="mt-2 divide-y divide-surface-100">
                {tazas.map((item, indice) => (
                  <li key={indice} className="py-2">
                    <strong>Taza {indice + 1}</strong>{' · '}
                    {item.confirmadas.includes(2)
                      ? `Sabor ${item.respuestas.intensidadSabor} · Residual ${item.respuestas.intensidadSaborResidual}${item.respuestas.notaSabor ? ` · ${item.respuestas.notaSabor}` : ''}`
                      : 'Pendiente de confirmar'}
                  </li>
                ))}
              </ul>
            </details>
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 4 — SABOR (AFECTIVA)
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 3}>

            <SubSection label="Sabor">
              <RatingScale1to9 value={taza.afectivoSabor} onChange={actualizar('afectivoSabor')} />
            </SubSection>

            <SubSection label="Sabor Residual">
              <RatingScale1to9 value={taza.afectivoSaborResidual} onChange={actualizar('afectivoSaborResidual')} />
            </SubSection>

            <NoteField value={taza.notaAfectivoSabor} onChange={actualizar('notaAfectivoSabor')} />
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 5 — ACIDEZ
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 4}>

            <SubSection label="Intensidad">
              <IntensityBar value={taza.intensidadAcidez} onChange={actualizar('intensidadAcidez')} />
            </SubSection>

            <SubSection label="Calidad / Agrado">
              <RatingScale1to9 value={taza.afectivoAcidez} onChange={actualizar('afectivoAcidez')} />
            </SubSection>

            <NoteField value={taza.notaAcidez} onChange={actualizar('notaAcidez')} placeholder="Tipo: málica, cítrica, fosfórica..." />
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 6 — DULZOR
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 5}>

            <SubSection label="Intensidad">
              <IntensityBar value={taza.intensidadDulzor} onChange={actualizar('intensidadDulzor')} />
            </SubSection>

            <SubSection label="Calidad / Agrado">
              <RatingScale1to9 value={taza.afectivoDulzor} onChange={actualizar('afectivoDulzor')} />
            </SubSection>

            <NoteField value={taza.notaDulzor} onChange={actualizar('notaDulzor')} placeholder="Caña, panela, melaza, caramelo..." />
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 7 — SENSACIÓN EN BOCA
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 6}>

            <SubSection label="Intensidad">
              <IntensityBar value={taza.intensidadBoca} onChange={actualizar('intensidadBoca')} />
            </SubSection>

            <SubSection label="Textura / Cualidad">
              <Chips items={TEXTURAS} selected={taza.texturas} onToggle={toggleMulti(actualizar('texturas'))} />
            </SubSection>

            <SubSection label="Calidad / Agrado">
              <RatingScale1to9 value={taza.afectivoBoca} onChange={actualizar('afectivoBoca')} />
            </SubSection>

            <NoteField value={taza.notaBoca} onChange={actualizar('notaBoca')} placeholder="Sensación táctil, peso, textura..." />
          </div>


          {/* ════════════════════════════════════════════════════
              FASE 8 — IMPRESIÓN GLOBAL
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 7}>

            <SubSection label="Calidad / Agrado Global">
              <RatingScale1to9 value={taza.afectivoGlobal} onChange={actualizar('afectivoGlobal')} />
            </SubSection>

            <NoteField value={taza.notaGlobal} onChange={actualizar('notaGlobal')} placeholder="Balance general, armonía, estructura..." />
          </div>


          {/* ════════════════════════════════════════════════════
              UNIFORMIDAD Y DEFECTOS
          ════════════════════════════════════════════════════ */}
          <div className="py-4" hidden={fase !== 8}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full select-none">
                <AlertTriangle className="w-3 h-3" />
                Defectos
              </span>
              <span className="text-sm font-semibold text-surface-800">Uniformidad y Defectos en Taza</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TazasSelector
                label="Tazas No Uniformes"
                sublabel="Selecciona las tazas con inconsistencia"
                selectedCups={tazasNoUniformes}
                onToggleCup={(n) => setTazasNoUniformes((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n])}
                colorScheme="amber"
              />
              <TazasSelector
                label="Tazas Defectuosas"
                sublabel="Selecciona las tazas con defecto"
                selectedCups={tazasDefectuosas}
                onToggleCup={(n) => setTazasDefectuosas((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n])}
                colorScheme="red"
              />
            </div>

            <SubSection label="Tipo de Defecto">
              <div className="flex flex-wrap gap-2">
                {DEFECTOS.map((def) => {
                  const isSelected = tipoDefecto === def.id;
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => setTipoDefecto(def.id)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer',
                        isSelected
                          ? def.id === 'ninguno'
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-accent-600 text-white border-accent-600'
                          : 'bg-white text-surface-600 border-surface-200 hover:border-surface-400'
                      )}
                    >
                      {isSelected && <span className="mr-1">✓</span>}
                      {def.label}
                    </button>
                  );
                })}
              </div>
            </SubSection>
          </div>


          {/* ════════════════════════════════════════════════════
              RESULTADO FINAL
          ════════════════════════════════════════════════════ */}
          <div className="py-4 space-y-4" hidden={fase !== 9}>
            {!completas && <p className="text-sm text-surface-600">Confirma las cinco tazas en cada fase para enviar la evaluación.</p>}
            {/* Tarjeta de score */}
            <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-end gap-2">
                <Award className="w-6 h-6 text-primary-600 mb-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-surface-400 font-bold block">
                    Puntuación SCA de la sesión
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-surface-900 font-mono leading-none">
                      {puntuacionTotal}
                    </span>
                    <span className="text-sm text-surface-400">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <SegmentedProgress
                  value={Math.round(Number(puntuacionTotal))}
                  segments={20}
                  showPercentage={false}
                  className="gap-[3px]"
                />
                <span className={cn('inline-block text-[11px] font-bold px-3 py-0.5 rounded-full border', categoria.color)}>
                  {categoria.label}
                </span>
              </div>
            </div>

            {/* Nota final */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-surface-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Conclusión del Catador
              </label>
              <textarea
                rows={3}
                value={notaFinal}
                onChange={(e) => setNotaFinal(e.target.value)}
                placeholder="Dictamen final: viabilidad comercial, destino, recomendaciones de tostado..."
                className="w-full text-xs rounded-xl border border-surface-200 p-3 bg-surface-50 text-surface-800 placeholder-surface-300 focus:ring-2 focus:ring-primary-500 focus:outline-none focus:bg-white transition-colors"
              />
            </div>
          </div>

        </div>

        {/* Botones */}
        <div className="mt-2 flex flex-wrap items-center justify-end gap-3 border-t border-surface-200 pt-3">
          <Button type="button" variant="outline" disabled={enviando} onClick={onClose}>Cerrar hoja</Button>
          {fase < 8 ? (
            <Button type="button" onClick={confirmarTaza}>Confirmar taza y continuar</Button>
          ) : fase === 8 ? (
            <Button type="button" onClick={() => setFase(9)}>Revisar resultado</Button>
          ) : (
            <Button type="submit" disabled={!completas} loading={enviando}>
              <Send className="h-4 w-4" /> Enviar evaluación
            </Button>
          )}
        </div>
      </form>
    </ModalBase>
  );
}
