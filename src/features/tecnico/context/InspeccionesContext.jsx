import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getInspeccionesFinca,
  createInspeccionFinca as apiCreateInspeccion,
  updateInspeccionFinca as apiUpdateInspeccion,
  deleteInspeccionFinca as apiDeleteInspeccion,
} from '../api/inspeccionesApi';

// ============================================
// InspeccionesContext — Contexto para Asistencia Técnica
// ============================================

const InspeccionesContext = createContext(null);

export function InspeccionesProvider({ children }) {
  const [inspecciones, setInspecciones] = useState([]);
  const [inspeccionActiva, setInspeccionActiva] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarInspecciones = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInspeccionesFinca(params);
      setInspecciones(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar inspecciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarInspecciones();
  }, [cargarInspecciones]);

  const crearInspeccion = useCallback(async (payload) => {
    try {
      const nueva = await apiCreateInspeccion(payload);
      setInspecciones((prev) => [nueva, ...prev]);
      toast.success('Inspección de finca registrada');
      return nueva;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al registrar inspección';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarInspeccion = useCallback(async (id, payload) => {
    try {
      const actualizada = await apiUpdateInspeccion(id, payload);
      setInspecciones((prev) => prev.map((item) => (item.id === id ? { ...item, ...actualizada } : item)));
      toast.success('Inspección actualizada');
      return actualizada;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar inspección';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarInspeccion = useCallback(async (id) => {
    try {
      await apiDeleteInspeccion(id);
      setInspecciones((prev) => prev.filter((item) => item.id !== id));
      toast.success('Inspección eliminada');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar inspección';
      toast.error(msg);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      inspecciones,
      inspeccionActiva,
      setInspeccionActiva,
      isLoading,
      error,
      cargarInspecciones,
      crearInspeccion,
      actualizarInspeccion,
      eliminarInspeccion,
    }),
    [
      inspecciones,
      inspeccionActiva,
      isLoading,
      error,
      cargarInspecciones,
      crearInspeccion,
      actualizarInspeccion,
      eliminarInspeccion,
    ]
  );

  return <InspeccionesContext.Provider value={value}>{children}</InspeccionesContext.Provider>;
}

export function useInspecciones() {
  const context = useContext(InspeccionesContext);
  if (!context) {
    throw new Error('useInspecciones debe ser utilizado dentro de un <InspeccionesProvider />');
  }
  return context;
}

export default InspeccionesContext;
