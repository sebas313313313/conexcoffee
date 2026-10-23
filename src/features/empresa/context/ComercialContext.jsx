import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getPreofertas,
  createPreoferta as apiCreatePreoferta,
  updatePreoferta as apiUpdatePreoferta,
  cambiarEstadoPreoferta as apiCambiarEstado,
  deletePreoferta as apiDeletePreoferta,
  getPedidosInternacionales,
  createPedidoInternacional as apiCreatePedido,
  updatePedidoInternacional as apiUpdatePedido,
  deletePedidoInternacional as apiDeletePedido,
} from '../api/comercialApi';

// ============================================
// ComercialContext — Contexto de Preofertas y Pedidos Internacionales
// ============================================

const ComercialContext = createContext(null);

export function ComercialProvider({ children }) {
  const [preofertas, setPreofertas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [preofertaActiva, setPreofertaActiva] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarPreofertas = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPreofertas(params);
      setPreofertas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar preofertas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarPedidos = useCallback(async (params = {}) => {
    try {
      const data = await getPedidosInternacionales(params);
      setPedidos(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  useEffect(() => {
    cargarPreofertas();
    cargarPedidos();
  }, [cargarPreofertas, cargarPedidos]);

  const crearPreoferta = useCallback(async (payload) => {
    try {
      const nueva = await apiCreatePreoferta(payload);
      setPreofertas((prev) => [nueva, ...prev]);
      toast.success('Preoferta creada exitosamente');
      return nueva;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al crear preoferta';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarPreoferta = useCallback(async (id, payload) => {
    try {
      const actualizada = await apiUpdatePreoferta(id, payload);
      setPreofertas((prev) => prev.map((item) => (item.id === id ? { ...item, ...actualizada } : item)));
      toast.success('Preoferta actualizada');
      return actualizada;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar preoferta';
      toast.error(msg);
      throw err;
    }
  }, []);

  const cambiarEstado = useCallback(async (id, nuevoEstado) => {
    try {
      const res = await apiCambiarEstado(id, nuevoEstado);
      setPreofertas((prev) => prev.map((item) => (item.id === id ? { ...item, estado: nuevoEstado } : item)));
      toast.success(`Estado cambiado a: ${nuevoEstado}`);
      return res;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al cambiar estado';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarPreoferta = useCallback(async (id) => {
    try {
      await apiDeletePreoferta(id);
      setPreofertas((prev) => prev.filter((item) => item.id !== id));
      toast.success('Preoferta eliminada');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar preoferta';
      toast.error(msg);
      throw err;
    }
  }, []);

  const crearPedido = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreatePedido(payload);
      setPedidos((prev) => [nuevo, ...prev]);
      toast.success('Pedido internacional generado');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al generar pedido';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarPedido = useCallback(async (id, payload) => {
    try {
      const actualizado = await apiUpdatePedido(id, payload);
      setPedidos((prev) => prev.map((item) => (item.id === id ? { ...item, ...actualizado } : item)));
      toast.success('Pedido internacional actualizado');
      return actualizado;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar pedido';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarPedido = useCallback(async (id) => {
    try {
      await apiDeletePedido(id);
      setPedidos((prev) => prev.filter((item) => item.id !== id));
      toast.success('Pedido eliminado');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar pedido';
      toast.error(msg);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      preofertas,
      pedidos,
      preofertaActiva,
      setPreofertaActiva,
      isLoading,
      error,
      cargarPreofertas,
      crearPreoferta,
      actualizarPreoferta,
      cambiarEstado,
      eliminarPreoferta,
      cargarPedidos,
      crearPedido,
      actualizarPedido,
      eliminarPedido,
    }),
    [
      preofertas,
      pedidos,
      preofertaActiva,
      isLoading,
      error,
      cargarPreofertas,
      crearPreoferta,
      actualizarPreoferta,
      cambiarEstado,
      eliminarPreoferta,
      cargarPedidos,
      crearPedido,
      actualizarPedido,
      eliminarPedido,
    ]
  );

  return <ComercialContext.Provider value={value}>{children}</ComercialContext.Provider>;
}

export function useComercial() {
  const context = useContext(ComercialContext);
  if (!context) {
    throw new Error('useComercial debe ser utilizado dentro de un <ComercialProvider />');
  }
  return context;
}

export default ComercialContext;
