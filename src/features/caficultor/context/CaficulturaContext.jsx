import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getFincas,
  createFinca as apiCreateFinca,
  updateFinca as apiUpdateFinca,
  deleteFinca as apiDeleteFinca,
  getLotesCultivo,
  createLoteCultivo as apiCreateLote,
  updateLoteCultivo as apiUpdateLote,
  deleteLoteCultivo as apiDeleteLote,
  getCaficultores,
  getVariedadesCafe,
} from '../api/caficulturaApi';

// ============================================
// CaficulturaContext — Contexto para Caficultores, Fincas y Lotes
// ============================================

const CaficulturaContext = createContext(null);

export function CaficulturaProvider({ children }) {
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [caficultores, setCaficultores] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [fincaActiva, setFincaActiva] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarFincas = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFincas(params);
      setFincas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar fincas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarLotes = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLotesCultivo(params);
      setLotes(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar lotes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarCaficultores = useCallback(async (params = {}) => {
    try {
      const data = await getCaficultores(params);
      setCaficultores(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar en fallback
    }
  }, []);

  const cargarVariedades = useCallback(async () => {
    try {
      const data = await getVariedadesCafe();
      setVariedades(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar en fallback
    }
  }, []);

  useEffect(() => {
    cargarFincas();
    cargarLotes();
    cargarVariedades();
  }, [cargarFincas, cargarLotes, cargarVariedades]);

  const crearFinca = useCallback(async (payload) => {
    try {
      const nueva = await apiCreateFinca(payload);
      setFincas((prev) => [nueva, ...prev]);
      toast.success('Finca registrada correctamente');
      return nueva;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al registrar finca';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarFinca = useCallback(async (id, payload) => {
    try {
      const actualizada = await apiUpdateFinca(id, payload);
      setFincas((prev) => prev.map((f) => (f.id === id ? { ...f, ...actualizada } : f)));
      toast.success('Finca actualizada');
      return actualizada;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar finca';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarFinca = useCallback(async (id) => {
    try {
      await apiDeleteFinca(id);
      setFincas((prev) => prev.filter((f) => f.id !== id));
      toast.success('Finca eliminada');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar finca';
      toast.error(msg);
      throw err;
    }
  }, []);

  const crearLote = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreateLote(payload);
      setLotes((prev) => [nuevo, ...prev]);
      toast.success('Lote de cultivo registrado');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al crear lote';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarLote = useCallback(async (id, payload) => {
    try {
      const actualizado = await apiUpdateLote(id, payload);
      setLotes((prev) => prev.map((l) => (l.id === id ? { ...l, ...actualizado } : l)));
      toast.success('Lote actualizado');
      return actualizado;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar lote';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarLote = useCallback(async (id) => {
    try {
      await apiDeleteLote(id);
      setLotes((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lote eliminado');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar lote';
      toast.error(msg);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      fincas,
      lotes,
      caficultores,
      variedades,
      fincaActiva,
      setFincaActiva,
      isLoading,
      error,
      cargarFincas,
      cargarLotes,
      cargarCaficultores,
      cargarVariedades,
      crearFinca,
      actualizarFinca,
      eliminarFinca,
      crearLote,
      actualizarLote,
      eliminarLote,
    }),
    [
      fincas,
      lotes,
      caficultores,
      variedades,
      fincaActiva,
      isLoading,
      error,
      cargarFincas,
      cargarLotes,
      cargarCaficultores,
      cargarVariedades,
      crearFinca,
      actualizarFinca,
      eliminarFinca,
      crearLote,
      actualizarLote,
      eliminarLote,
    ]
  );

  return <CaficulturaContext.Provider value={value}>{children}</CaficulturaContext.Provider>;
}

export function useCaficultura() {
  const context = useContext(CaficulturaContext);
  if (!context) {
    throw new Error('useCaficultura debe ser utilizado dentro de un <CaficulturaProvider />');
  }
  return context;
}

export default CaficulturaContext;
