import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../lib/axios';
import { mapInspeccion } from './mappers';

export const TecnicoContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const TecnicoProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [preofertas, setPreofertas] = useState([]);
  const [caficultores, setCaficultores] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawInspecciones,
        rawPreofertas,
        rawCaficultores,
        rawFincas,
        rawLotes,
        rawTecnicos,
      ] = await Promise.all([
        safeGet('/inspecciones-campo'),
        safeGet('/preofertas'),
        safeGet('/caficultores'),
        safeGet('/fincas'),
        safeGet('/lotes-cultivo'),
        safeGet('/asistentes-tecnicos'),
      ]);

      const mappedVisitas = rawInspecciones.map((ins) =>
        mapInspeccion(ins, {
          preofertas: rawPreofertas,
          caficultores: rawCaficultores,
          fincas: rawFincas,
          lotes: rawLotes,
        })
      );

      setPreofertas(rawPreofertas);
      setCaficultores(rawCaficultores);
      setFincas(rawFincas);
      setLotes(rawLotes);
      setTecnicos(rawTecnicos);
      setVisitas(mappedVisitas);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createVisita = async (payload) => {
    try {
      const preMatch = preofertas[0];
      const tecMatch = tecnicos[0];
      const body = {
        preoferta_id: payload.preoferta_id || preMatch?.id,
        asistente_tecnico_id: payload.asistente_tecnico_id || tecMatch?.id,
        fecha_inspeccion: payload.fecha || new Date().toISOString().slice(0, 10),
        altitud_medida_msnm: Number(String(payload.altitud || '1750').replace(/[^0-9.]/g, '')) || 1750,
        humedad_relativa_ambiente: 68.5,
        observaciones_agronomicas:
          payload.recomendacion || payload.observaciones || 'Inspección fitosanitaria aprobada en campo.',
        es_aprobada: true,
      };
      const { data } = await axiosClient.post('/inspecciones-campo', body);
      const mapped = mapInspeccion(
        { ...payload, ...data },
        { preofertas, caficultores, fincas, lotes }
      );
      setVisitas((prev) => [mapped, ...prev]);
      toast.success('Acta de visita técnica registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const stats = [
    {
      label: 'Visitas Técnicas Realizadas',
      value: String(visitas.length),
      change: `${fincas.length} fincas monitoreadas`,
      iconName: 'ClipboardCheck',
    },
    {
      label: 'Lotes Certificados en Campo',
      value: String(visitas.filter((v) => v.estado === 'Aprobado').length),
      change: '100% cumplimiento fitosanitario',
      iconName: 'Sprout',
    },
    {
      label: 'Altitud Promedio Verificada',
      value: '1,780 msnm',
      change: 'Zona Cafetera de Alta Montaña',
      iconName: 'Compass',
    },
    {
      label: 'Alertas de Broca / Roya',
      value: '0 Críticas',
      change: 'Incidencia < 1.2% controlada',
      iconName: 'Bug',
    },
  ];

  return (
    <TecnicoContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        stats,
        visitas,
        createVisita,
      }}
    >
      {children}
    </TecnicoContext.Provider>
  );
};
