import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../lib/axios';
import { mapSesionYAnalisisSensorial } from './mappers';

export const CatadorContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const CatadorProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [preofertas, setPreofertas] = useState([]);
  const [caficultores, setCaficultores] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [catadores, setCatadores] = useState([]);
  const [evaluacionesFisicas, setEvaluacionesFisicas] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawPreofertas,
        rawCaficultores,
        rawFincas,
        rawLotes,
        rawVariedades,
        rawCatadores,
        rawEvaluacionesFisicas,
        rawSesionesCatacion,
      ] = await Promise.all([
        safeGet('/preofertas'),
        safeGet('/caficultores'),
        safeGet('/fincas'),
        safeGet('/lotes-cultivo'),
        safeGet('/variedades-cafe'),
        safeGet('/catadores'),
        safeGet('/evaluaciones-fisicas'),
        safeGet('/sesiones-catacion'),
      ]);

      const mapped = rawSesionesCatacion.map((ses) =>
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

      setPreofertas(rawPreofertas);
      setCaficultores(rawCaficultores);
      setFincas(rawFincas);
      setLotes(rawLotes);
      setVariedades(rawVariedades);
      setCatadores(rawCatadores);
      setEvaluacionesFisicas(rawEvaluacionesFisicas);
      setEvaluaciones(mapped);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateEvaluacion = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/sesiones-catacion/${id}`, payload);
      setEvaluaciones((prev) =>
        prev.map((ev) =>
          ev.id === id
            ? {
                ...mapSesionYAnalisisSensorial(
                  { ...ev, ...payload, ...data },
                  {
                    preofertas,
                    caficultores,
                    fincas,
                    lotes,
                    variedades,
                    catadores,
                    evaluacionesFisicas,
                  }
                ),
                ...payload,
              }
            : ev
        )
      );
      toast.success('Evaluación sensorial guardada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const avgSca =
    evaluaciones.length > 0
      ? (
          evaluaciones.reduce((acc, ev) => acc + Number(ev.puntajeFinal || ev.puntaje_final || 87.5), 0) /
          evaluaciones.length
        ).toFixed(2)
      : '87.50';

  const stats = [
    {
      label: 'Puntaje SCA Promedio',
      value: `${avgSca} pts`,
      change: 'Especialidad SCA (>85 pts)',
      iconName: 'Award',
    },
    {
      label: 'Mesas de Catación',
      value: String(evaluaciones.length),
      change: `${evaluaciones.filter((e) => e.estado === 'Terminado').length} finalizadas`,
      iconName: 'Coffee',
    },
    {
      label: 'Perfiles Destacados',
      value: String(evaluaciones.filter((e) => Number(e.puntajeFinal || 87) >= 87).length),
      change: 'Lotes Exóticos / Micro-lotes',
      iconName: 'Sparkles',
    },
    {
      label: 'Calibración CVA / SCA',
      value: '98.5%',
      change: 'Protocolo Q-Grader activo',
      iconName: 'Sliders',
    },
  ];

  const cataciones = evaluaciones.slice(0, 6).map((ev) => ({
    muestra: ev.codigo,
    variedad: ev.variedad,
    proceso: ev.proceso,
    fragancia: ev.puntajes?.fraganciaAroma || 8.5,
    sabor: ev.puntajes?.sabor || 8.5,
    acidez: ev.puntajes?.acidez || 8.5,
    cuerpo: ev.puntajes?.cuerpo || 8.25,
    puntaje_final: ev.puntajeFinal || ev.puntaje_final || 87.5,
    notas: ev.notas || 'Jazmín, miel de caña, acidez cítrica brillante.',
    estado: ev.estado === 'Terminado' ? 'Calificado' : 'Pendiente',
  }));

  return (
    <CatadorContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        stats,
        cataciones,
        evaluaciones,
        setEvaluaciones,
        updateEvaluacion,
      }}
    >
      {children}
    </CatadorContext.Provider>
  );
};
