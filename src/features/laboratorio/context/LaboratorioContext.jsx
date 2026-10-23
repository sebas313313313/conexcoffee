import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getEvaluacionesFisicas,
  createEvaluacionFisica as apiCreateFisica,
  updateEvaluacionFisica as apiUpdateFisica,
  deleteEvaluacionFisica as apiDeleteFisica,
  getCatadores,
  createCatador as apiCreateCatador,
  updateCatador as apiUpdateCatador,
  deleteCatador as apiDeleteCatador,
} from '../api/laboratorioApi';

// ============================================
// LaboratorioContext — Contexto para Análisis Físico y Gestión de Catadores
// ============================================

const LaboratorioContext = createContext(null);

export function LaboratorioProvider({ children }) {
  const [evaluacionesFisicas, setEvaluacionesFisicas] = useState([]);
  const [catadores, setCatadores] = useState([]);
  const [evaluacionActiva, setEvaluacionActiva] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarEvaluacionesFisicas = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvaluacionesFisicas(params);
      setEvaluacionesFisicas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar evaluaciones físicas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarCatadores = useCallback(async (params = {}) => {
    try {
      const data = await getCatadores(params);
      setCatadores(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  useEffect(() => {
    cargarEvaluacionesFisicas();
    cargarCatadores();
  }, [cargarEvaluacionesFisicas, cargarCatadores]);

  const crearEvaluacionFisica = useCallback(async (payload) => {
    try {
      const nueva = await apiCreateFisica(payload);
      setEvaluacionesFisicas((prev) => [nueva, ...prev]);
      toast.success('Evaluación física registrada');
      return nueva;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al crear evaluación física';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarEvaluacionFisica = useCallback(async (id, payload) => {
    try {
      const actualizada = await apiUpdateFisica(id, payload);
      setEvaluacionesFisicas((prev) => prev.map((item) => (item.id === id ? { ...item, ...actualizada } : item)));
      toast.success('Evaluación física actualizada');
      return actualizada;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar evaluación física';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarEvaluacionFisica = useCallback(async (id) => {
    try {
      await apiDeleteFisica(id);
      setEvaluacionesFisicas((prev) => prev.filter((item) => item.id !== id));
      toast.success('Evaluación física eliminada');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar evaluación física';
      toast.error(msg);
      throw err;
    }
  }, []);

  const crearCatador = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreateCatador(payload);
      setCatadores((prev) => [nuevo, ...prev]);
      toast.success('Catador registrado');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al registrar catador';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarCatador = useCallback(async (id, payload) => {
    try {
      const actualizado = await apiUpdateCatador(id, payload);
      setCatadores((prev) => prev.map((item) => (item.id === id ? { ...item, ...actualizado } : item)));
      toast.success('Catador actualizado');
      return actualizado;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar catador';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarCatador = useCallback(async (id) => {
    try {
      await apiDeleteCatador(id);
      setCatadores((prev) => prev.filter((item) => item.id !== id));
      toast.success('Catador eliminado');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar catador';
      toast.error(msg);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      evaluacionesFisicas,
      catadores,
      evaluacionActiva,
      setEvaluacionActiva,
      isLoading,
      error,
      cargarEvaluacionesFisicas,
      crearEvaluacionFisica,
      actualizarEvaluacionFisica,
      eliminarEvaluacionFisica,
      cargarCatadores,
      crearCatador,
      actualizarCatador,
      eliminarCatador,
    }),
    [
      evaluacionesFisicas,
      catadores,
      evaluacionActiva,
      isLoading,
      error,
      cargarEvaluacionesFisicas,
      crearEvaluacionFisica,
      actualizarEvaluacionFisica,
      eliminarEvaluacionFisica,
      cargarCatadores,
      crearCatador,
      actualizarCatador,
      eliminarCatador,
    ]
  );

  return <LaboratorioContext.Provider value={value}>{children}</LaboratorioContext.Provider>;
}

export function useLaboratorio() {
  const context = useContext(LaboratorioContext);
  if (!context) {
    throw new Error('useLaboratorio debe ser utilizado dentro de un <LaboratorioProvider />');
  }
  return context;
}

export default LaboratorioContext;
