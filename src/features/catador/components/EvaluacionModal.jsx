import { useState, useMemo } from 'react';
import ModalBase from '@/components/modals/ModalBase';
import { Button } from '@/components/ui';
import { Award, Send, AlertTriangle, FileText } from 'lucide-react';
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

/** Pill de número de fase + título de sección */
function FaseHeader({ num, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-[11px] font-bold px-3 py-1 rounded-full select-none">
        Fase {num}
      </span>
      <span className="text-sm font-semibold text-surface-800">{title}</span>
    </div>
  );
}

/** Divisor entre fases */
function FaseDivider() {
  return <div className="my-1 border-t border-surface-200" />;
}

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
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
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
export default function EvaluacionModal({ isOpen, onClose, evaluacion, onFinalizar }) {

  const [nivelTueste,             setNivelTueste]             = useState(3);
  const [intensidadFragancia,     setIntensidadFragancia]     = useState(8);
  const [intensidadAroma,         setIntensidadAroma]         = useState(8);
  const [descriptoresFragancia,   setDescriptoresFragancia]   = useState([]);
  const [notaFragancia,           setNotaFragancia]           = useState('');

  const [afectivaFragancia,       setAfectivaFragancia]       = useState(7);
  const [afectivaAroma,           setAfectivaAroma]           = useState(7);
  const [notaAfectivaFragancia,   setNotaAfectivaFragancia]   = useState('');

  const [intensidadSabor,         setIntensidadSabor]         = useState(8);
  const [intensidadSaborResidual, setIntensidadSaborResidual] = useState(8);
  const [descriptoresSabor,       setDescriptoresSabor]       = useState([]);
  const [gustos,                  setGustos]                  = useState([]);
  const [notaSabor,               setNotaSabor]               = useState('');

  const [afectivoSabor,           setAfectivoSabor]           = useState(7);
  const [afectivoSaborResidual,   setAfectivoSaborResidual]   = useState(7);
  const [notaAfectivoSabor,       setNotaAfectivoSabor]       = useState('');

  const [intensidadAcidez,        setIntensidadAcidez]        = useState(8);
  const [notaAcidez,              setNotaAcidez]              = useState('');
  const [afectivoAcidez,          setAfectivoAcidez]          = useState(7);

  const [intensidadDulzor,        setIntensidadDulzor]        = useState(8);
  const [notaDulzor,              setNotaDulzor]              = useState('');
  const [afectivoDulzor,          setAfectivoDulzor]          = useState(7);

  const [intensidadBoca,          setIntensidadBoca]          = useState(8);
  const [texturas,                setTexturas]                = useState([]);
  const [notaBoca,                setNotaBoca]                = useState('');
  const [afectivoBoca,            setAfectivoBoca]            = useState(7);

  const [afectivoGlobal,          setAfectivoGlobal]          = useState(7);
  const [notaGlobal,              setNotaGlobal]              = useState('');

  const [tazasNoUniformes,        setTazasNoUniformes]        = useState([]);
  const [tazasDefectuosas,        setTazasDefectuosas]        = useState([]);
  const [tipoDefecto,             setTipoDefecto]             = useState('ninguno');
  const [notaFinal,               setNotaFinal]               = useState('');

  // ── Puntuación ───────────────────────────────────────────────────────────────
  const { puntuacionTotal, categoria } = useMemo(() => {
    const suma = afectivaFragancia + afectivaAroma + afectivoSabor + afectivoSaborResidual +
      afectivoAcidez + afectivoDulzor + afectivoBoca + afectivoGlobal;
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
  }, [afectivaFragancia, afectivaAroma, afectivoSabor, afectivoSaborResidual, afectivoAcidez, afectivoDulzor, afectivoBoca, afectivoGlobal, tazasNoUniformes, tazasDefectuosas, tipoDefecto]);

  const toggleMulti = (setter) => (id) =>
    setter((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFinalizar({
      evaluacionId: evaluacion?.id,
      evaluacionNombre: evaluacion?.nombre,
      puntuacionTotal,
      categoria: categoria.label,
      nivelTueste,
      intensidadFragancia,
      intensidadAroma,
      descriptoresFragancia,
      notaFragancia,
      afectivaFragancia,
      afectivaAroma,
      notaAfectivaFragancia,
      intensidadSabor,
      intensidadSaborResidual,
      descriptoresSabor,
      gustos,
      notaSabor,
      afectivoSabor,
      afectivoSaborResidual,
      notaAfectivoSabor,
      intensidadAcidez,
      notaAcidez,
      afectivoAcidez,
      intensidadDulzor,
      notaDulzor,
      afectivoDulzor,
      intensidadBoca,
      texturas,
      notaBoca,
      afectivoBoca,
      afectivoGlobal,
      notaGlobal,
      tazasNoUniformes,
      tazasDefectuosas,
      tipoDefecto,
      notaFinal,
    });
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={evaluacion?.nombre || 'Hoja de Evaluación Sensorial SCA'}
      size="full"
    >
      <form onSubmit={handleSubmit}>
        <div className="max-h-[80vh] overflow-y-auto pr-1 space-y-0">

          {/* Banner de sesión */}
          <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-surface-400 uppercase tracking-widest">
                {evaluacion?.id || 'SESION-ACTIVA'}
              </span>
              <p className="text-xs text-surface-600 mt-0.5 leading-snug max-w-lg">
                {evaluacion?.objetivo}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[10px] text-surface-400 block">Muestras</span>
              <span className="text-lg font-bold text-surface-800">{evaluacion?.cantidadMuestras || 8}</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              FASE 1 — EVALUACIÓN DESCRIPTIVA
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={1} title="Evaluación descriptiva" />

            {/* Nivel de tueste */}
            <SubSection label="Nivel de tueste">
              <RoastLevelBar value={nivelTueste} onChange={setNivelTueste} />
            </SubSection>

            {/* Fragancia */}
            <SubSection label="Fragancia">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={intensidadFragancia} onChange={setIntensidadFragancia} />
            </SubSection>

            {/* Aroma */}
            <SubSection label="Aroma">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={intensidadAroma} onChange={setIntensidadAroma} />
            </SubSection>

            {/* Descriptores de fragancia */}
            <SubSection>
              <DescriptoresSelector
                titulo="Selecciona al menos una opción:"
                selected={descriptoresFragancia}
                onChange={setDescriptoresFragancia}
              />
            </SubSection>

            <NoteField value={notaFragancia} onChange={setNotaFragancia} />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 2 — EVALUACIÓN AFECTIVA (FRAGANCIA/AROMA)
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={2} title="Evaluación afectiva" />

            <SubSection label="Fragancia">
              <RatingScale1to9 value={afectivaFragancia} onChange={setAfectivaFragancia} />
            </SubSection>

            <SubSection label="Aroma">
              <RatingScale1to9 value={afectivaAroma} onChange={setAfectivaAroma} />
            </SubSection>

            <NoteField value={notaAfectivaFragancia} onChange={setNotaAfectivaFragancia} />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 3 — SABOR Y SABOR RESIDUAL (DESCRIPTIVA)
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={3} title="Sabor y Sabor Residual (descriptiva)" />

            <SubSection label="Sabor">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={intensidadSabor} onChange={setIntensidadSabor} />
            </SubSection>

            <SubSection label="Sabor Residual (Aftertaste)">
              <p className="text-[11px] text-surface-500 -mt-1">Intensidad</p>
              <IntensityBar value={intensidadSaborResidual} onChange={setIntensidadSaborResidual} />
            </SubSection>

            <SubSection>
              <DescriptoresSelector
                titulo="Descriptores de sabor:"
                selected={descriptoresSabor}
                onChange={setDescriptoresSabor}
              />
            </SubSection>

            <SubSection label="Gustos Predominantes">
              <Chips items={GUSTOS} selected={gustos} onToggle={toggleMulti(setGustos)} />
            </SubSection>

            <NoteField value={notaSabor} onChange={setNotaSabor} />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 4 — SABOR (AFECTIVA)
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={4} title="Sabor y Sabor Residual (afectiva)" />

            <SubSection label="Sabor">
              <RatingScale1to9 value={afectivoSabor} onChange={setAfectivoSabor} />
            </SubSection>

            <SubSection label="Sabor Residual">
              <RatingScale1to9 value={afectivoSaborResidual} onChange={setAfectivoSaborResidual} />
            </SubSection>

            <NoteField value={notaAfectivoSabor} onChange={setNotaAfectivoSabor} />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 5 — ACIDEZ
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={5} title="Acidez" />

            <SubSection label="Intensidad">
              <IntensityBar value={intensidadAcidez} onChange={setIntensidadAcidez} />
            </SubSection>

            <SubSection label="Calidad / Agrado">
              <RatingScale1to9 value={afectivoAcidez} onChange={setAfectivoAcidez} />
            </SubSection>

            <NoteField value={notaAcidez} onChange={setNotaAcidez} placeholder="Tipo: málica, cítrica, fosfórica..." />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 6 — DULZOR
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={6} title="Dulzor" />

            <SubSection label="Intensidad">
              <IntensityBar value={intensidadDulzor} onChange={setIntensidadDulzor} />
            </SubSection>

            <SubSection label="Calidad / Agrado">
              <RatingScale1to9 value={afectivoDulzor} onChange={setAfectivoDulzor} />
            </SubSection>

            <NoteField value={notaDulzor} onChange={setNotaDulzor} placeholder="Caña, panela, melaza, caramelo..." />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 7 — SENSACIÓN EN BOCA
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={7} title="Sensación en Boca" />

            <SubSection label="Intensidad">
              <IntensityBar value={intensidadBoca} onChange={setIntensidadBoca} />
            </SubSection>

            <SubSection label="Textura / Cualidad">
              <Chips items={TEXTURAS} selected={texturas} onToggle={toggleMulti(setTexturas)} />
            </SubSection>

            <SubSection label="Calidad / Agrado">
              <RatingScale1to9 value={afectivoBoca} onChange={setAfectivoBoca} />
            </SubSection>

            <NoteField value={notaBoca} onChange={setNotaBoca} placeholder="Sensación táctil, peso, textura..." />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              FASE 8 — IMPRESIÓN GLOBAL
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
            <FaseHeader num={8} title="Impresión Global" />

            <SubSection label="Calidad / Agrado Global">
              <RatingScale1to9 value={afectivoGlobal} onChange={setAfectivoGlobal} />
            </SubSection>

            <NoteField value={notaGlobal} onChange={setNotaGlobal} placeholder="Balance general, armonía, estructura..." />
          </div>

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              UNIFORMIDAD Y DEFECTOS
          ════════════════════════════════════════════════════ */}
          <div className="py-4">
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

          <FaseDivider />

          {/* ════════════════════════════════════════════════════
              RESULTADO FINAL
          ════════════════════════════════════════════════════ */}
          <div className="py-4 space-y-4">
            {/* Tarjeta de score */}
            <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-end gap-2">
                <Award className="w-6 h-6 text-primary-600 mb-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-surface-400 font-bold block">
                    Puntuación SCA
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
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-200 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="primary"
            className="flex items-center gap-2 px-6 font-bold shadow-sm"
          >
            <Send className="w-4 h-4" />
            Enviar Evaluación
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}
