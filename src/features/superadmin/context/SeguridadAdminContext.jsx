import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getAlertasSeguridad,
  resolverAlertaSeguridad as apiResolverAlerta,
  getCatalogoErrores,
  getUsuariosSistema,
  createUsuarioSistema as apiCreateUsuario,
  updateUsuarioSistema as apiUpdateUsuario,
  deleteUsuarioSistema as apiDeleteUsuario,
} from '../api/seguridadAdminApi';

// ============================================
// SeguridadAdminContext — Contexto para Alertas, Catálogo de Errores y Usuarios
// ============================================

const SeguridadAdminContext = createContext(null);

export function SeguridadAdminProvider({ children }) {
  const [alertas, setAlertas] = useState([]);
  const [catalogoErrores, setCatalogoErrores] = useState([]);
  const [usuariosSistema, setUsuariosSistema] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarAlertas = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAlertasSeguridad(params);
      setAlertas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Error al cargar alertas de seguridad');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarCatalogoErrores = useCallback(async (params = {}) => {
    try {
      const data = await getCatalogoErrores(params);
      setCatalogoErrores(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  const cargarUsuariosSistema = useCallback(async (params = {}) => {
    try {
      const data = await getUsuariosSistema(params);
      setUsuariosSistema(Array.isArray(data) ? data : []);
      return data;
    } catch {
      // Ignorar fallback
    }
  }, []);

  useEffect(() => {
    cargarAlertas();
    cargarCatalogoErrores();
    cargarUsuariosSistema();
  }, [cargarAlertas, cargarCatalogoErrores, cargarUsuariosSistema]);

  const resolverAlerta = useCallback(async (id, payload = {}) => {
    try {
      const res = await apiResolverAlerta(id, payload);
      setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, resuelta: true, resuelto_en: new Date().toISOString() } : a)));
      toast.success('Alerta de seguridad resuelta');
      return res;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al resolver alerta';
      toast.error(msg);
      throw err;
    }
  }, []);

  const crearUsuario = useCallback(async (payload) => {
    try {
      const nuevo = await apiCreateUsuario(payload);
      setUsuariosSistema((prev) => [nuevo, ...prev]);
      toast.success('Usuario del sistema creado');
      return nuevo;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al crear usuario';
      toast.error(msg);
      throw err;
    }
  }, []);

  const actualizarUsuario = useCallback(async (id, payload) => {
    try {
      const actualizado = await apiUpdateUsuario(id, payload);
      setUsuariosSistema((prev) => prev.map((u) => (u.id === id ? { ...u, ...actualizado } : u)));
      toast.success('Usuario actualizado');
      return actualizado;
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al actualizar usuario';
      toast.error(msg);
      throw err;
    }
  }, []);

  const eliminarUsuario = useCallback(async (id) => {
    try {
      await apiDeleteUsuario(id);
      setUsuariosSistema((prev) => prev.filter((u) => u.id !== id));
      toast.success('Usuario eliminado');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Error al eliminar usuario';
      toast.error(msg);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      alertas,
      catalogoErrores,
      usuariosSistema,
      isLoading,
      error,
      cargarAlertas,
      resolverAlerta,
      cargarCatalogoErrores,
      cargarUsuariosSistema,
      crearUsuario,
      actualizarUsuario,
      eliminarUsuario,
    }),
    [
      alertas,
      catalogoErrores,
      usuariosSistema,
      isLoading,
      error,
      cargarAlertas,
      resolverAlerta,
      cargarCatalogoErrores,
      cargarUsuariosSistema,
      crearUsuario,
      actualizarUsuario,
      eliminarUsuario,
    ]
  );

  return (
    <SeguridadAdminContext.Provider value={value}>
      {children}
    </SeguridadAdminContext.Provider>
  );
}

export function useSeguridadAdmin() {
  const context = useContext(SeguridadAdminContext);
  if (!context) {
    throw new Error('useSeguridadAdmin debe ser utilizado dentro de un <SeguridadAdminProvider />');
  }
  return context;
}

export default SeguridadAdminContext;
