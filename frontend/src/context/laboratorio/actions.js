import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapCatador, mapMuestraYAnalisisFisico, mapSesionYAnalisisSensorial } from '../mappers';

export function createLaboratorioActions(state, setters) {
  const { catadores, laboratorios, preofertas, caficultores, fincas, lotes, variedades } = state;
  const { setCatadores, setAnalisisFisicos, setAnalisisSensoriales, setHojasCatacion, setMuestras, setResultados } = setters;

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
      const { data } = await axiosClient.put(`/evaluaciones-fisicas/${id}`, payload, { strictResponse: true });
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

  return { createCatador, updateCatador, createAnalisisFisico, updateAnalisisFisico, createMuestra, updateMuestra, updateResultado, createAnalisisSensorial, updateAnalisisSensorial, createHojaCatacion, updateHojaCatacion };
}
