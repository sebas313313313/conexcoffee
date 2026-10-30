import { create } from 'zustand';

// ============================================
// Store de Autenticación — ConexCoffee
// ============================================
// ⚠️ REGLA DE SEGURIDAD CRÍTICA:
// Este store NO usa persistencia (localStorage/sessionStorage).
// La sesión se mantiene con cookies HttpOnly del backend.
// ============================================

const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (userData) =>
    set({
      user: userData,
      role: userData?.role || null,
      isAuthenticated: Boolean(userData),
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));

export { useAuthStore };
export default useAuthStore;
