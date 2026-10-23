import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getSesionesCatacion,
  getHojasCatacion,
  getSesionDetalles,
  exportarHojaJson,
  ingestarEvaluacionCva,
} from '../api/cvaApi';
import { EVALUACIONES_PENDIENTES } from '../data/evaluacionData';

// ============================================
// CvaContext — Contexto Oficial de Catación CVA
// ============================================
// Centraliza el flujo completo de evaluación sensorial CVA (Coffee Value Assessment)
// conectado directamente a la API REST y transacciones ACID en PostgreSQL.
// ============================================

const CvaContext = createContext(null);

const DEFAULT_FORM_STATE = {
  // Fase 1 — Descriptiva
  nivelTueste: 3,
  intensidadFragancia: 8,
  intensidadAroma: 8,
  descriptoresFragancia: [],
  notaFragancia: '',

  // Fase 2 — Afectiva (Fragancia/Aroma)
  afectivaFragancia: 7,
  afectivaAroma: 7,
  notaAfectivaFragancia: '',

  // Fase 3 — Sabor y Sabor Residual (Descriptiva)
  intensidadSabor: 8,
  intensidadSaborResidual: 8,
  descriptoresSabor: [],
  gustos: [],
  notaSabor: '',

  // Fase 4 — Sabor (Afectiva)
  afectivoSabor: 7,
  afectivoSaborResidual: 7,
  notaAfectivoSabor: '',

  // Fase 5 — Acidez
  intensidadAcidez: 8,
  notaAcidez: '',
  afectivoAcidez: 7,

  // Fase 6 — Dulzor
  intensidadDulzor: 8,
  notaDulzor: '',
  afectivoDulzor: 7,

  // Fase 7 — Sensación en Boca
  intensidadBoca: 8,
  texturas: [],
  notaBoca: '',
  afectivoBoca: 7,

  // Fase 8 — Impresión Global
  afectivoGlobal: 7,
  notaGlobal: '',

  // Uniformidad y Defectos
  tazasNoUniformes: [],
  tazasDefectuosas: [],
  tipoDefecto: 'ninguno',
  notaFinal: '',
};

const ROAST_NAMES = {
  1: 'Muy Claro',
  2: 'Claro',
  3: 'Medio-Claro',
  4: 'Medio',
  5: 'Medio-Oscuro',
  6: 'Oscuro',
};

const ROAST_TERMS_EN = {
  1: 'Cinnamon',
  2: 'Light',
  3: 'American',
  4: 'City',
  5: 'Full City',
  6: 'Dark',
};

function getIntensityCategory(val) {
  if (val >= 12) return 'Intenso';
  if (val >= 8) return 'Medio';
  return 'Bajo';
}

export function CvaProvider({ children }) {
  const [sesiones, setSesiones] = useState(EVALUACIONES_PENDIENTES);
  const [hojasCatacion, setHojasCatacion] = useState([]);
  const [sesionActiva, setSesionActiva] = useState(null);
  const [evaluacionForm, setEvaluacionForm] = useState(DEFAULT_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar sesiones de catación desde el backend ConexCoffee
   */
  const cargarSesiones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSesionesCatacion();
      if (Array.isArray(data) && data.length > 0) {
        // Adaptar las sesiones del backend al formato visual del panel de catador
        const sesionesAdaptadas = data.map((sesion) => ({
          id: sesion.id,
          codigo: sesion.codigo_sesion || sesion.codigo || sesion.id,
          nombre: sesion.nombre_sesion || sesion.nombre || `Sesión ${sesion.codigo_sesion || ''}`,
          objetivo: sesion.objetivo || sesion.descripcion || 'Evaluación sensorial protocolizada CVA',
          fechaCreacion: sesion.fecha_sesion || sesion.created_at || new Date().toISOString().split('T')[0],
          cantidadMuestras: sesion.total_muestras || 1,
          cantidadParticipantes: sesion.total_catadores || 1,
          cupoMaximo: 6,
          estado: sesion.estado_estandar || sesion.estado || 'Pendiente',
          puntuacionTotal: sesion.puntuacion_sca_global || null,
          unido: false,
          evaluacionFisicaId: sesion.evaluacion_fisica_id || null,
          laboratorio: sesion.laboratorio_nombre || 'Laboratorio Central de Calidad',
        }));
        setSesiones(sesionesAdaptadas);
      }
    } catch {
      // Si la API aún no tiene sesiones registradas o está sin conexión,
      // se mantienen las sesiones locales de muestra (EVALUACIONES_PENDIENTES)
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar histórico de hojas de catación CVA emitidas
   */
  const cargarHojasCatacion = useCallback(async () => {
    try {
      const hojas = await getHojasCatacion();
      if (Array.isArray(hojas)) {
        setHojasCatacion(hojas);
      }
    } catch {
      // Ignorar fallo de histórico si backend está offline
    }
  }, []);

  useEffect(() => {
    cargarSesiones();
    cargarHojasCatacion();
  }, [cargarSesiones, cargarHojasCatacion]);

  /**
   * Actualiza de forma granular un campo del formulario CVA
   */
  const actualizarCampo = useCallback((campo, valor) => {
    setEvaluacionForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }, []);

  /**
   * Reinicia el formulario al estado inicial
   */
  const resetFormulario = useCallback(() => {
    setEvaluacionForm(DEFAULT_FORM_STATE);
  }, []);

  /**
   * Selecciona una sesión para iniciar o continuar la evaluación sensorial
   */
  const seleccionarSesion = useCallback(
    async (sesion) => {
      setSesionActiva(sesion);
      resetFormulario();

      if (sesion?.id) {
        try {
          const detalles = await getSesionDetalles(sesion.id);
          if (detalles) {
            setSesionActiva((prev) => ({ ...prev, ...detalles }));
          }
        } catch {
          // Mantener datos de la sesión seleccionada
        }
      }
    },
    [resetFormulario]
  );

  /**
   * Cálculo oficial en tiempo real de puntuación SCA (0 a 100) y categoría CVA
   */
  const { puntuacionTotal, categoria } = useMemo(() => {
    const {
      afectivaFragancia,
      afectivaAroma,
      afectivoSabor,
      afectivoSaborResidual,
      afectivoAcidez,
      afectivoDulzor,
      afectivoBoca,
      afectivoGlobal,
      tazasNoUniformes,
      tazasDefectuosas,
      tipoDefecto,
    } = evaluacionForm;

    const sumaAfectiva =
      Number(afectivaFragancia) +
      Number(afectivaAroma) +
      Number(afectivoSabor) +
      Number(afectivoSaborResidual) +
      Number(afectivoAcidez) +
      Number(afectivoDulzor) +
      Number(afectivoBoca) +
      Number(afectivoGlobal);

    // Escala base SCA: (suma / 72) * 100
    const base = (sumaAfectiva / 72) * 100;

    // Penalización por falta de uniformidad: 2 puntos por cada taza no uniforme
    const penUnif = (tazasNoUniformes?.length || 0) * 2;

    // Penalización por defectos de taza según severidad
    let factorDefecto = 2;
    if (tipoDefecto === 'fenolico' || tipoDefecto === 'papa') {
      factorDefecto = 4;
    } else if (tipoDefecto === 'mohoso') {
      factorDefecto = 3;
    }
    const penDef =
      tipoDefecto !== 'ninguno' ? (tazasDefectuosas?.length || 0) * factorDefecto : 0;

    const scoreFinal = Math.max(0, Math.min(100, base - penUnif - penDef));
    const rounded = Math.round(scoreFinal * 100) / 100;

    let cat = {
      label: 'Bajo Estándar SCA',
      color: 'text-red-700 bg-red-50 border-red-200',
    };
    if (rounded >= 90) {
      cat = {
        label: 'Especial Excepcional',
        color: 'text-amber-800 bg-amber-100 border-amber-300',
      };
    } else if (rounded >= 85) {
      cat = {
        label: 'Especial Excelente',
        color: 'text-primary-800 bg-primary-100 border-primary-300',
      };
    } else if (rounded >= 80) {
      cat = {
        label: 'Especial Muy Bueno',
        color: 'text-teal-700 bg-teal-50 border-teal-300',
      };
    }

    return {
      puntuacionTotal: rounded.toFixed(2),
      categoria: cat,
    };
  }, [evaluacionForm]);

  /**
   * Construye el documento estructurado JSON exacto para el backend CVA
   */
  const construirPayloadCva = useCallback(
    (overrides = {}) => {
      const data = { ...evaluacionForm, ...overrides };
      const codigoSesion =
        sesionActiva?.codigo || sesionActiva?.codigo_sesion || sesionActiva?.id || 'EVAL-01';
      const totalMuestras = sesionActiva?.cantidadMuestras || sesionActiva?.total_muestras || 1;

      return {
        evaluacion: {
          codigo: codigoSesion,
          total_muestras: Number(totalMuestras),
          conclusion_catador: data.notaFinal || '',
          puntuacion_catador: parseFloat(puntuacionTotal),
          fases: {
            fase_1_descriptiva: {
              nivel_tueste: {
                valor: data.nivelTueste * 16.6,
                nombre: ROAST_NAMES[data.nivelTueste] || 'Medio',
                termino_ingles: ROAST_TERMS_EN[data.nivelTueste] || 'Medium',
              },
              fragancia: {
                intensidad: Number(data.intensidadFragancia),
                categoria_intensidad: getIntensityCategory(data.intensidadFragancia),
                escala_maxima: 15,
              },
              aroma: {
                intensidad: Number(data.intensidadAroma),
                categoria_intensidad: getIntensityCategory(data.intensidadAroma),
                escala_maxima: 15,
              },
              descriptores: data.descriptoresFragancia,
              nota: data.notaFragancia,
            },
            fase_2_afectiva: {
              fragancia: {
                calidad_agrado: Number(data.afectivaFragancia),
                escala_maxima: 9,
              },
              aroma: {
                calidad_agrado: Number(data.afectivaAroma),
                escala_maxima: 9,
              },
              nota: data.notaAfectivaFragancia,
            },
            fase_3_sabor_descriptiva: {
              sabor: {
                intensidad: Number(data.intensidadSabor),
                categoria_intensidad: getIntensityCategory(data.intensidadSabor),
                escala_maxima: 15,
              },
              sabor_residual_aftertaste: {
                intensidad: Number(data.intensidadSaborResidual),
                categoria_intensidad: getIntensityCategory(data.intensidadSaborResidual),
                escala_maxima: 15,
              },
              gustos_predominantes: data.gustos,
              descriptores_sabor: data.descriptoresSabor,
              nota: data.notaSabor,
            },
            fase_4_sabor_afectiva: {
              sabor: {
                calidad_agrado: Number(data.afectivoSabor),
                escala_maxima: 9,
              },
              sabor_residual: {
                calidad_agrado: Number(data.afectivoSaborResidual),
                escala_maxima: 9,
              },
              nota: data.notaAfectivoSabor,
            },
            fase_5_acidez: {
              intensidad: {
                valor: Number(data.intensidadAcidez),
                categoria_intensidad: getIntensityCategory(data.intensidadAcidez),
                escala_maxima: 15,
              },
              calidad_agrado: {
                valor: Number(data.afectivoAcidez),
                escala_maxima: 9,
              },
              tipo_acidez_nota: data.notaAcidez,
            },
            fase_6_dulzor: {
              intensidad: {
                valor: Number(data.intensidadDulzor),
                categoria_intensidad: getIntensityCategory(data.intensidadDulzor),
                escala_maxima: 15,
              },
              calidad_agrado: {
                valor: Number(data.afectivoDulzor),
                escala_maxima: 9,
              },
              tipo_dulzor_nota: data.notaDulzor,
            },
            fase_7_sensacion_boca: {
              intensidad: {
                valor: Number(data.intensidadBoca),
                categoria_intensidad: getIntensityCategory(data.intensidadBoca),
                escala_maxima: 15,
              },
              textura_cualidad: data.texturas,
              calidad_agrado: {
                valor: Number(data.afectivoBoca),
                escala_maxima: 9,
              },
              nota: data.notaBoca,
            },
            fase_8_impresion_global: {
              calidad_agrado_global: {
                valor: Number(data.afectivoGlobal),
                escala_maxima: 9,
              },
              nota_balance: data.notaGlobal,
            },
            defectos_y_uniformidad: {
              tazas_no_uniformes: {
                cantidad: data.tazasNoUniformes.length,
                total_tazas: 5,
                tazas_seleccionadas: data.tazasNoUniformes,
              },
              tazas_defectuosas: {
                cantidad: data.tazasDefectuosas.length,
                total_tazas: 5,
                tazas_seleccionadas: data.tazasDefectuosas,
              },
              tipo_defecto: String(data.tipoDefecto || 'ninguno').toUpperCase(),
            },
          },
        },
      };
    },
    [evaluacionForm, sesionActiva, puntuacionTotal]
  );

  /**
   * Enviar la evaluación CVA al backend con transacción ACID
   */
  const enviarEvaluacion = useCallback(
    async (datos = {}) => {
      setIsSaving(true);
      setError(null);

      const payload = construirPayloadCva(datos);
      const sesionId = sesionActiva?.id || datos.evaluacionId;

      try {
        const respuesta = await ingestarEvaluacionCva({
          payload,
          evaluacion_fisica_id: sesionActiva?.evaluacionFisicaId || null,
          puntuacion_catador: parseFloat(puntuacionTotal),
        });

        // Actualizar la lista local de sesiones
        setSesiones((prev) =>
          prev.map((item) =>
            item.id === sesionId
              ? {
                  ...item,
                  estado: 'Completada',
                  puntuacionTotal,
                  categoria: categoria.label,
                  unido: true,
                }
              : item
          )
        );

        toast.success(
          `¡Evaluación guardada exitosamente! Puntaje SCA: ${puntuacionTotal} pts (${categoria.label})`
        );

        cargarHojasCatacion();
        return respuesta;
      } catch (err) {
        // Fallback optimista si el backend está en modo demo / offline
        const isNetworkError =
          !err.response || err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED';

        if (isNetworkError) {
          setSesiones((prev) =>
            prev.map((item) =>
              item.id === sesionId
                ? {
                    ...item,
                    estado: 'Completada',
                    puntuacionTotal,
                    categoria: categoria.label,
                    unido: true,
                  }
                : item
            )
          );

          toast.success(
            `Evaluación registrada en modo local. Puntaje SCA: ${puntuacionTotal} pts (${categoria.label})`
          );

          return { success: true, offline: true };
        }

        const msg = err?.response?.data?.error?.message || 'Error al guardar la evaluación CVA';
        setError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [construirPayloadCva, sesionActiva, puntuacionTotal, categoria, cargarHojasCatacion]
  );

  /**
   * Exporta y descarga el JSON oficial CVA de una evaluación
   */
  const exportarJson = useCallback(async (hojaId) => {
    try {
      const data = await exportarHojaJson(hojaId);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluacion-cva-${hojaId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Documento CVA exportado correctamente');
      return data;
    } catch {
      toast.error('No se pudo exportar el documento CVA');
    }
  }, []);

  const value = useMemo(
    () => ({
      sesiones,
      setSesiones,
      hojasCatacion,
      sesionActiva,
      setSesionActiva,
      evaluacionForm,
      setEvaluacionForm,
      actualizarCampo,
      resetFormulario,
      seleccionarSesion,
      puntuacionTotal,
      categoria,
      isLoading,
      isSaving,
      error,
      cargarSesiones,
      cargarHojasCatacion,
      construirPayloadCva,
      enviarEvaluacion,
      exportarJson,
    }),
    [
      sesiones,
      hojasCatacion,
      sesionActiva,
      evaluacionForm,
      actualizarCampo,
      resetFormulario,
      seleccionarSesion,
      puntuacionTotal,
      categoria,
      isLoading,
      isSaving,
      error,
      cargarSesiones,
      cargarHojasCatacion,
      construirPayloadCva,
      enviarEvaluacion,
      exportarJson,
    ]
  );

  return <CvaContext.Provider value={value}>{children}</CvaContext.Provider>;
}

/**
 * Hook para consumir CvaContext
 */
export function useCva() {
  const context = useContext(CvaContext);
  if (!context) {
    throw new Error('useCva debe ser utilizado dentro de un <CvaProvider />');
  }
  return context;
}

export default CvaContext;
