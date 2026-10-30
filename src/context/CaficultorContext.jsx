import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../lib/axios';
import { mapFinca, mapLote, mapPreoferta } from './mappers';

export const CaficultorContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const CaficultorProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [preofertas, setPreofertas] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [caficultores, setCaficultores] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawCaficultores,
        rawFincas,
        rawVariedades,
        rawLotes,
        rawPreofertas,
        rawSesionesCatacion,
      ] = await Promise.all([
        safeGet('/caficultores'),
        safeGet('/fincas'),
        safeGet('/variedades-cafe'),
        safeGet('/lotes-cultivo'),
        safeGet('/preofertas'),
        safeGet('/sesiones-catacion'),
      ]);

      const mappedFincas = rawFincas.map((f) =>
        mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
      );
      const mappedLotes = rawLotes.map((l) =>
        mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
      );
      const mappedPreofertas = rawPreofertas.map((p) => {
        const mapped = mapPreoferta(p, {
          caficultores: rawCaficultores,
          fincas: rawFincas,
          lotes: rawLotes,
          variedades: rawVariedades,
          sesiones: rawSesionesCatacion,
        });
        return {
          ...mapped,
          estado: mapped.estadoCaficultor,
        };
      });
      const mappedOfertas = mappedPreofertas.map((p) => ({
        ...p,
        estado: p.estadoOferta,
      }));

      setCaficultores(rawCaficultores);
      setVariedades(rawVariedades);
      setFincas(mappedFincas);
      setLotes(mappedLotes);
      setPreofertas(mappedPreofertas);
      setOfertas(mappedOfertas);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createFinca = async (payload) => {
    try {
      const { data } = await axiosClient.post('/fincas', payload);
      const mapped = mapFinca({ ...payload, ...data }, { caficultores, lotes });
      setFincas((prev) => [mapped, ...prev]);
      toast.success('Finca registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateFinca = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/fincas/${id}`, payload);
      setFincas((prev) =>
        prev.map((f) => (f.id === id ? mapFinca({ ...f, ...payload, ...data }, { caficultores, lotes }) : f))
      );
      toast.success('Finca actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createLote = async (payload) => {
    try {
      const { data } = await axiosClient.post('/lotes-cultivo', payload);
      const mapped = mapLote({ ...payload, ...data }, { fincas, variedades });
      setLotes((prev) => [mapped, ...prev]);
      toast.success('Lote de cultivo registrado correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updateLote = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/lotes-cultivo/${id}`, payload);
      setLotes((prev) =>
        prev.map((l) => (l.id === id ? mapLote({ ...l, ...payload, ...data }, { fincas, variedades }) : l))
      );
      toast.success('Lote de cultivo actualizado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createPreoferta = async (payload) => {
    try {
      const { data } = await axiosClient.post('/preofertas', payload);
      const mapped = mapPreoferta({ ...payload, ...data }, { caficultores, fincas, lotes, variedades });
      setPreofertas((prev) => [{ ...mapped, estado: mapped.estadoCaficultor }, ...prev]);
      setOfertas((prev) => [{ ...mapped, estado: mapped.estadoOferta }, ...prev]);
      toast.success('Preoferta creada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const updatePreoferta = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/preofertas/${id}`, payload);
      setPreofertas((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...mapPreoferta({ ...p, ...payload, ...data }, { caficultores, fincas, lotes, variedades }),
                ...payload,
              }
            : p
        )
      );
      toast.success('Preoferta actualizada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const createOferta = async (payload) => createPreoferta(payload);
  const updateOferta = async (id, payload) => updatePreoferta(id, payload);

  return (
    <CaficultorContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        fincas,
        lotes,
        preofertas,
        ofertas,
        variedades,
        createFinca,
        updateFinca,
        createLote,
        updateLote,
        createPreoferta,
        updatePreoferta,
        createOferta,
        updateOferta,
      }}
    >
      {children}
    </CaficultorContext.Provider>
  );
};
