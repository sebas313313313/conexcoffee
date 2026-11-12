import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import ModalBase from './ModalBase';
import { APP_NAME } from '@/lib/constants';

// ============================================
// AddProductModal — Modal reusable para publicar café
// ============================================

export default function AddProductModal({ isOpen, onClose }) {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Publicar oferta de café"
      size="md"
    >
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 text-primary-700">
          <Package className="h-7 w-7" />
        </div>
        <h4 className="text-lg font-bold text-surface-900 mb-2">
          Publica tu café en {APP_NAME}
        </h4>
        <p className="text-sm text-surface-600 mb-6 leading-relaxed">
          Presenta el café que tienes disponible a las empresas exportadoras. Puedes publicar sin crear una cuenta.
        </p>

        <Link to="/agregar-producto" onClick={onClose} className="block rounded-lg bg-brand-terracota px-4 py-2.5 font-semibold text-white hover:bg-brand-terracota-dark">
          Publicar sin cuenta
        </Link>
      </div>
    </ModalBase>
  );
}
