import { create } from 'zustand';

const CART_STORAGE_KEY = 'conexcoffee_cart_v1';

function readStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignorar errores de cuota
  }
}

export function formatCOP(value) {
  const num = Math.round(Number(value) || 0);
  return `$${num.toLocaleString('es-CO')} COP`;
}

const useCartStore = create((set, get) => ({
  items: readStoredCart(),
  isCartOpen: false,
  isCheckoutOpen: false,

  syncFromStorage: () => {
    set({ items: readStoredCart() });
  },

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  openCheckout: () => set({ isCartOpen: false, isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),

  addItem: (newItem) => {
    const current = get().items;
    const id = newItem.id || `${newItem.loteId}-${newItem.tipo}`;
    const cantidadToAdd = Math.max(1, Number(newItem.cantidad) || 1);
    const maxCantidad = Number(newItem.maxCantidad) || 99;
    const precioUnitarioCOP = Math.round(Number(newItem.precioUnitarioCOP) || 0);

    const existingIdx = current.findIndex((i) => i.id === id);
    let updated;

    if (existingIdx >= 0) {
      updated = current.map((item, idx) => {
        if (idx !== existingIdx) return item;
        const nextQty = Math.min(maxCantidad, item.cantidad + cantidadToAdd);
        return {
          ...item,
          cantidad: nextQty,
          precioUnitarioCOP,
        };
      });
    } else {
      updated = [
        ...current,
        {
          id,
          loteId: newItem.loteId,
          tipo: newItem.tipo, // 'caja' | 'muestra'
          nombre: newItem.nombre,
          variedad: newItem.variedad || newItem.nombre,
          destinoId: newItem.destinoId || '',
          destinoNombre: newItem.destinoNombre || 'Exportación',
          imagen: newItem.imagen || '/images/portadas/lote.jpg',
          presentacion:
            newItem.presentacion ||
            (newItem.tipo === 'caja' ? 'Caja de 24 kg' : 'Muestra de 120 g'),
          detallePrecio: newItem.detallePrecio || '',
          cantidad: Math.min(maxCantidad, cantidadToAdd),
          maxCantidad,
          precioUnitarioCOP,
        },
      ];
    }

    writeStoredCart(updated);
    set({ items: updated });
  },

  updateQuantity: (itemId, nextQuantity) => {
    const qty = Number(nextQuantity);
    if (qty <= 0) {
      get().removeItem(itemId);
      return;
    }

    const updated = get().items.map((item) => {
      if (item.id !== itemId) return item;
      const clamped = Math.min(item.maxCantidad || 99, Math.max(1, qty));
      return { ...item, cantidad: clamped };
    });

    writeStoredCart(updated);
    set({ items: updated });
  },

  incrementItem: (itemId) => {
    const target = get().items.find((i) => i.id === itemId);
    if (!target) return;
    get().updateQuantity(itemId, target.cantidad + 1);
  },

  decrementItem: (itemId) => {
    const target = get().items.find((i) => i.id === itemId);
    if (!target) return;
    if (target.cantidad <= 1) {
      get().removeItem(itemId);
    } else {
      get().updateQuantity(itemId, target.cantidad - 1);
    }
  },

  removeItem: (itemId) => {
    const updated = get().items.filter((i) => i.id !== itemId);
    writeStoredCart(updated);
    set({ items: updated });
  },

  clearCart: () => {
    writeStoredCart([]);
    set({ items: [] });
  },
}));

// Sincronizar entre pestañas abiertas (ej. cuando "Ver todos" abre una nueva pestaña)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) {
      useCartStore.getState().syncFromStorage();
    }
  });
}

export { useCartStore };
export default useCartStore;
