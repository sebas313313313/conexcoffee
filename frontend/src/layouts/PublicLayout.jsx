import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';
import { AddProductModal, CartDrawerModal } from '@/components/modals';
import { PaymentsWayCheckoutModal } from '@/features/payments';

// ============================================
// PublicLayout — Layout para todas las páginas públicas
// ============================================
// Mantiene de forma persistente:
// - La barra de navegación (PublicNavbar)
// - El pie de página oficial (PublicFooter)
// - Los modales globales (AddProductModal)
// Solo cambia el contenido interior renderizado en <Outlet />
// ============================================

export default function PublicLayout() {
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col justify-between">
      {/* Barra de navegación pública compartida */}
      <PublicNavbar
        onOpenAddProduct={() => setAddProductModalOpen(true)}
      />

      {/* Contenido dinámico de la página */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Pie de página compartido */}
      <PublicFooter />

      {/* Modales compartidos */}
      <AddProductModal
        isOpen={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
      />
      <CartDrawerModal />
      <PaymentsWayCheckoutModal />
    </div>
  );
}
