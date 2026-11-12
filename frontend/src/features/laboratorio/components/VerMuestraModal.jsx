import { DetalleMuestraModal } from '@/components/modals';

export default function VerMuestraModal({ isOpen, onClose, muestra }) {
  return <DetalleMuestraModal key={muestra?.id} isOpen={isOpen} onClose={onClose} ficha={muestra?.fichaDetalle} />;
}
