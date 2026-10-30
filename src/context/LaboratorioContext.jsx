import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../lib/axios';
import {
  mapCatador,
  mapMuestraYAnalisisFisico,
  mapSesionYAnalisisSensorial,
} from './mappers';

export const LaboratorioContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const LaboratorioProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [catadores, setCatadores] = useState([]);
  const [analisisFisicos, setAnalisisFisicos] = useState([]);
  const [analisisSensoriales, setAnalisisSensoriales] = useState([]);
  const [hojasCatacion, setHojasCatacion] = useState([]);
  const [muestras, setMuestras] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [preofertas, setPreofertas] = useState([]);
  const [caficultores, setCaficultores] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [variedades, setVariedades] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawUsuarios,
        rawCatadores,
        rawLaboratorios,
        rawCaficultores,
        rawFincas,
        rawLotes,
        rawVariedades,
        rawPreofertas,
        rawEvaluacionesFisicas,
        rawSesionesCatacion,
      ] = await Promise.all([
        safeGet('/usuarios-sistema'),
        safeGet('/catadores'),
        safeGet('/laboratorios'),
        safeGet('/caficultores'),
        safeGet('/fincas'),
        safeGet('/lotes-cultivo'),
        safeGet('/variedades-cafe'),
        safeGet('/preofertas'),
        safeGet('/evaluaciones-fisicas'),
        safeGet('/sesiones-catacion'),
      ]);

      const mappedCatadores = rawCatadores.map((c) =>
        mapCatador(c, {
          laboratorios: rawLaboratorios,
          sesionesCatacion: rawSesionesCatacion,
          usuarios: rawUsuarios,
        })
      );

      const mappedFisicos = rawEvaluacionesFisicas.map((ev) =>
        mapMuestraYAnalisisFisico(ev, {
          preofertas: rawPreofertas,
          caficultores: rawCaficultores,
          fincas: rawFincas,
          lotes: rawLotes,
          variedades: rawVariedades,
          laboratorios: rawLaboratorios,
          sesiones: rawSesionesCatacion,
        })
      );

      const mappedSensoriales = rawSesionesCatacion.map((ses) =>
        mapSesionYAnalisisSensorial(ses, {
          preofertas: rawPreofertas,
          caficultores: rawCaficultores,
          fincas: rawFincas,
          lotes: rawLotes,
          variedades: rawVariedades,
          catadores: rawCatadores,
          evaluacionesFisicas: rawEvaluacionesFisicas,
        })
      );

      const mappedMuestras = mappedFisicos.map((m) => ({
        ...m,
        estado: m.estadoMuestraLab || 'Calificada',
      }));

      const mappedResultados = mappedFisicos.map((m) => ({
        ...m,
        estado: m.estadoResultado || 'Aprobada',
      }));

      setLaboratorios(rawLaboratorios);
      setPreofertas(rawPreofertas);
      setCaficultores(rawCaficultores);
      setFincas(rawFincas);
      setLotes(rawLotes);
      setVariedades(rawVariedades);
      setCatadores(mappedCatadores);
      setAnalisisFisicos(mappedFisicos);
      setAnalisisSensoriales(mappedSensoriales);
      setHojasCatacion(mappedSensoriales);
      setMuestras(mappedMuestras);
      setResultados(mappedResultados);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── CATADORES CRUD ─────────────────────────────────────────────────────────
  const createCatador = async (payload) => {
    try {
      const { data } = await axiosClient.post('/catadores', payload);
      const mapped = mapCatador({ ...payload, ...data }, { laboratorios });
      setCatadores((prev) => [mapped, ...prev]);
      toast.success('Catador registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateCatador = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/catadores/${id}`, payload);
      setCatadores((prev) =>
        prev.map((c) => (c.id === id ? mapCatador({ ...c, ...payload, ...data }, { laboratorios }) : c))
      );
      toast.success('Catador actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const removeCatador = async (id) => {
    try {
      await axiosClient.delete(`/catadores/${id}`);
      setCatadores((prev) => prev.filter((c) => c.id !== id));
      toast.success('Catador eliminado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // ── ANALISIS FISICOS / MUESTRAS / RESULTADOS ───────────────────────────────
  const createAnalisisFisico = async (payload) => {
    try {
      const { data } = await axiosClient.post('/evaluaciones-fisicas', payload);
      const mapped = mapMuestraYAnalisisFisico(
        { ...payload, ...data },
        { preofertas, caficultores, fincas, lotes, variedades, laboratorios }
      );
      setAnalisisFisicos((prev) => [mapped, ...prev]);
      setMuestras((prev) => [{ ...mapped, estado: mapped.estadoMuestraLab }, ...prev]);
      setResultados((prev) => [{ ...mapped, estado: mapped.estadoResultado }, ...prev]);
      toast.success('Análisis físico registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateAnalisisFisico = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/evaluaciones-fisicas/${id}`, payload);
      setAnalisisFisicos((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...mapMuestraYAnalisisFisico(
                  { ...a, ...payload, ...data },
                  { preofertas, caficultores, fincas, lotes, variedades, laboratorios }
                ),
                ...payload,
              }
            : a
        )
      );
      toast.success('Análisis físico actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createMuestra = async (payload) => createAnalisisFisico(payload);
  const updateMuestra = async (id, payload) => {
    await updateAnalisisFisico(id, payload);
    setMuestras((prev) => prev.map((m) => (m.id === id ? { ...m, ...payload } : m)));
  };

  const updateResultado = async (id, payload) => {
    await updateAnalisisFisico(id, {
      ...payload,
      es_conforme: (payload.estado === 'Aprobada' || payload.es_conforme) ?? true,
    });
    setResultados((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)));
  };

  // ── ANALISIS SENSORIALES & HOJAS CATACION ──────────────────────────────────
  const createAnalisisSensorial = async (payload) => {
    try {
      const { data } = await axiosClient.post('/sesiones-catacion', payload);
      const mapped = mapSesionYAnalisisSensorial(
        { ...payload, ...data },
        { preofertas, caficultores, fincas, lotes, variedades, catadores }
      );
      setAnalisisSensoriales((prev) => [mapped, ...prev]);
      setHojasCatacion((prev) => [mapped, ...prev]);
      toast.success('Análisis sensorial registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateAnalisisSensorial = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/sesiones-catacion/${id}`, payload);
      setAnalisisSensoriales((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...mapSesionYAnalisisSensorial(
                  { ...s, ...payload, ...data },
                  { preofertas, caficultores, fincas, lotes, variedades, catadores }
                ),
                ...payload,
              }
            : s
        )
      );
      setHojasCatacion((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...payload } : h))
      );
      toast.success('Evaluación sensorial actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createHojaCatacion = async (payload) => createAnalisisSensorial(payload);
  const updateHojaCatacion = async (id, payload) => updateAnalisisSensorial(id, payload);

  // ── DASHBOARD COMPUTED DATA ────────────────────────────────────────────────
  const avgHumedad =
    analisisFisicos.length > 0
      ? (
          analisisFisicos.reduce((acc, a) => acc + Number(a.humedadNum || 11.2), 0) /
          analisisFisicos.length
        ).toFixed(1)
      : '11.2';

  const stats = [
    {
      label: 'Muestras en Custodia',
      value: String(muestras.length),
      change: `${analisisFisicos.filter((a) => a.estado === 'Completado').length} completadas`,
      iconName: 'FlaskConical',
    },
    {
      label: 'Sesiones de Catación',
      value: String(analisisSensoriales.length),
      change: `${catadores.length} Q-Graders activos`,
      iconName: 'FileCheck2',
    },
    {
      label: 'Humedad Promedio',
      value: `${avgHumedad}%`,
      change: 'Rango óptimo FNC (10-12%)',
      iconName: 'Droplets',
    },
    {
      label: 'Alertas de Merma',
      value: String(analisisFisicos.filter((a) => !a.es_conforme).length),
      change: 'Control de calidad activo',
      iconName: 'AlertTriangle',
    },
  ];

  const muestrasResumen = analisisFisicos.slice(0, 6).map((a) => ({
    codigo: a.codigo,
    lote_origen: a.codigoLote,
    humedad: a.humedad,
    factor_rendimiento: a.factor_rendimiento,
    merma: a.merma,
    puntaje_sca: a.puntaje_sca,
    estado: a.estado,
  }));

  return (
    <LaboratorioContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        stats,
        muestrasResumen,
        catadores,
        analisisFisicos,
        analisisSensoriales,
        hojasCatacion,
        muestras,
        resultados,
        createCatador,
        updateCatador,
        removeCatador,
        createAnalisisFisico,
        updateAnalisisFisico,
        createAnalisisSensorial,
        updateAnalisisSensorial,
        createHojaCatacion,
        updateHojaCatacion,
        createMuestra,
        updateMuestra,
        updateResultado,
      }}
    >
      {children}
    </LaboratorioContext.Provider>
  );
};
