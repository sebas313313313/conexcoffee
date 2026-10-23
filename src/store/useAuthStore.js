import { create } from 'zustand';

// ============================================
// Store de Autenticación — ConexCoffee
// ============================================
// ⚠️ REGLA DE SEGURIDAD CRÍTICA:
// Este store NO usa persistencia (localStorage/sessionStorage).
// La sesión se mantiene con cookies HttpOnly del backend.
// Al recargar la página, se llama a getMe() para recuperar el usuario.
//
// NUNCA guardar tokens, contraseñas, o datos sensibles aquí.
// Solo se almacena la información del usuario que devuelve el backend.
// ============================================

const ROLE_MAP = {
  ADMINISTRADOR: 'superadmin',
  EMPRESA_EXPORTADORA: 'empresa',
  EMPRESA: 'empresa',
  BROKER: 'broker',
  PRODUCTOR: 'caficultor',
  CAFICULTOR: 'caficultor',
  COMPRADOR: 'comprador',
  LABORATORIO: 'laboratorio',
  ASISTENTE_TECNICO: 'tecnico',
  TECNICO: 'tecnico',
  CATADOR: 'catador',
  SUPERADMIN: 'superadmin',
};

export const normalizeRole = (role) => {
  if (!role) return null;
  const upper = String(role).toUpperCase().trim();
  return ROLE_MAP[upper] || String(role).toLowerCase().trim();
};

const useAuthStore = create((set) => ({
  // Estado en memoria volátil de ejecución
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true hasta que se verifique la sesión inicial

  // ============================================
  // Actions
  // ============================================

  /**
   * Establece el usuario autenticado y token opcional en el store.
   *
   * @param {object} userData - Datos del usuario desde el backend
   * @param {string} [token] - Token JWT en memoria volátil
   */
  setUser: (userData, token = null) =>
    set((state) => ({
      user: userData,
      role: normalizeRole(userData?.rol_principal || userData?.role),
      token: token !== null ? token : state.token,
      isAuthenticated: true,
      isLoading: false,
    })),

  /**
   * Actualiza el token en memoria volátil
   */
  setToken: (token) =>
    set({ token }),

  /**
   * Limpia completamente el estado de autenticación.
   * Llamado al hacer logout o cuando el backend responde 401.
   */
  clearAuth: () =>
    set({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  /**
   * Establece el estado de carga.
   */
  setLoading: (loading) =>
    set({ isLoading: loading }),
}));

export default useAuthStore;
