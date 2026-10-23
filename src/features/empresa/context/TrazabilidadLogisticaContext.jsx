import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getSacosCafe,
  createSacoCafe as apiCreateSaco,
  updateSacoCafe as apiUpdateSaco,
  deleteSacoCafe as apiDeleteSaco,
  canjearQrInterno as apiCanjearQr,
  getPrecintosQr,
  createPrecintoQr as apiCreatePrecinto,
  getContenedoresVirtuales,
  createContenedorVirtual as apiCreateContenedor,
  updateContenedorVirtual as apiUpdateContenedor,
  deleteContenedorVirtual as apiDeleteContenedor,
  getTrazabilidadEscaneos,
  registrarEscaneoTrazabilidad as apiRegistrarEscaneo,
} from '../api/logisticaApi';

// ============================================
// TrazabilidadLogisticaContext — Contexto para Sacos, QR, Contenedores y Trazabilidad
// ============================================

const TrazabilidadLogisticaContext = createContext(null);

export function TrazabilidadLogisticaProvider({ children }) {
  const [sacos, setSacos] = useState([]);
  const [precintos, setPrecintos] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [escaneos, setEscaneos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarSacos = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSacosCafe(params);
      setSacos(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar sacos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarPrecintos = useCallback(async (params = {}) => {
    try {
      const data = await getPrecintosQr(params);
      setPrecintos(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  const cargarContenedores = useCallback(async (params = {}) => {
    try {
      const data = await getContenedoresVirtuales(params);
      setContenedores(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  const cargarEscaneos = useCallback(async (params = {}) => {
    try {
      const data = await getTrazabilidadEscaneos(params);
      setEscaneos(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  useEffect(() => {
    cargarSacos();
    cargarPrecintos();
    cargarContenedores();
    cargarEscaneos();
  }, [cargarSacos, cargarPrecintos, cargarContenedores, cargarEscaneos]);

  const crearSaco = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreateSaco(payload);
      setSacos((prev) => [nuevo, ...prev]);
      toast.success('Saco de café registrado con QR');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al registrar saco';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarSaco = useCallback(async (id, payload) => {
    try {
      const actualizado = await apiUpdateSaco(id, payload);
      setSacos((prev) => prev.map((s) => (s.id === id ? { ...s, ...actualizado } : s)));
      toast.success('Saco actualizado');
      return actualizado;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar saco';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarSaco = useCallback(async (id) => {
    try {
      await apiDeleteSaco(id);
      setSacos((prev) => prev.filter((s) => s.id !== id));
      toast.success('Saco eliminado');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar saco';
      toast.error(msg);
      throw err;
    }
  }, []);

  const canjearQr = useCallback(async (payload) => {
    try {
      const res = await apiCanjearQr(payload);
      toast.success('QR interno canjeado en destino');
      cargarSacos();
      return res;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al canjear QR';
      toast.error(msg);
      throw err;
    }
  }, [cargarSacos]);

  const crearPrecinto = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreatePrecinto(payload);
      setPrecintos((prev) => [nuevo, ...prev]);
      toast.success('Precinto QR asignado al inventario');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al crear precinto';
      toast.error(msg);
      throw err;
    }
  }, []);

  const crearContenedor = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreateContenedor(payload);
      setContenedores((prev) => [nuevo, ...prev]);
      toast.success('Contenedor virtual creado');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al crear contenedor';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarContenedor = useCallback(async (id, payload) => {
    try {
      const actualizado = await apiUpdateContenedor(id, payload);
      setContenedores((prev) => prev.map((c) => (c.id === id ? { ...c, ...actualizado } : c)));
      toast.success('Contenedor actualizado');
      return actualizado;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar contenedor';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarContenedor = useCallback(async (id) => {
    try {
      await apiDeleteContenedor(id);
      setContenedores((prev) => prev.filter((c) => c.id !== id));
      toast.success('Contenedor eliminado');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar contenedor';
      toast.error(msg);
      throw err;
    }
  }, []);

  const registrarEscaneo = useCallback(async (payload) => {
    try {
      const nuevo = await apiRegistrarEscaneo(payload);
      setEscaneos((prev) => [nuevo, ...prev]);
      toast.success('Escaneo de trazabilidad registrado');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al registrar escaneo';
      toast.error(msg);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      sacos,
      precintos,
      contenedores,
      escaneos,
      isLoading,
      error,
      cargarSacos,
      crearSaco,
      actualizarSaco,
      eliminarSaco,
      canjearQr,
      cargarPrecintos,
      crearPrecinto,
      cargarContenedores,
      crearContenedor,
      actualizarContenedor,
      eliminarContenedor,
      cargarEscaneos,
      registrarEscaneo,
    }),
    [
      sacos,
      precintos,
      contenedores,
      escaneos,
      isLoading,
      error,
      cargarSacos,
      crearSaco,
      actualizarSaco,
      eliminarSaco,
      canjearQr,
      cargarPrecintos,
      crearPrecinto,
      cargarContenedores,
      crearContenedor,
      actualizarContenedor,
      eliminarContenedor,
      cargarEscaneos,
      registrarEscaneo,
    ]
  );

  return (
    <TrazabilidadLogisticaContext.Provider value={value}>
      {children}
    </TrazabilidadLogisticaContext.Provider>
  );
}

export function useLogistica() {
  const context = useContext(TrazabilidadLogisticaContext);
  if (!context) {
    throw new Error('useLogistica debe ser utilizado dentro de un <TrazabilidadLogisticaProvider />');
  }
  return context;
}

export default TrazabilidadLogisticaContext;
