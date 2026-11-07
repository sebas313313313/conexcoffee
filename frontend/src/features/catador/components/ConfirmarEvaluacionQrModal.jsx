import { Building2, Coffee, QrCode } from 'lucide-react';
import { Button } from '@/components/ui';
import { ModalBase } from '@/components/modals';

export default function ConfirmarEvaluacionQrModal({ isOpen, evaluacion, loading, onConfirm, onClose }) {
  if (!evaluacion) return null;
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Confirmar evaluación" size="md">
      <div className="space-y-5">
        <p className="text-sm text-surface-600">Revisa los datos antes de asignarte esta evaluación.</p>
        <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 space-y-3">
          <div><p className="text-xs text-surface-500">Evaluación</p><p className="font-semibold text-surface-900">{evaluacion.nombre}</p></div>
          <div className="flex items-center gap-2 text-sm text-surface-700"><Building2 className="h-4 w-4 text-primary-600" /><span>{evaluacion.empresaCreadora || 'Empresa no especificada'}</span></div>
          <div className="flex items-center gap-2 text-sm text-surface-700"><Coffee className="h-4 w-4 text-primary-600" />{evaluacion.cantidadMuestras} muestra(s)</div>
          <div className="flex items-center gap-2 text-xs font-mono text-surface-600"><QrCode className="h-4 w-4" />{evaluacion.codigo}</div>
        </div>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button><Button type="button" onClick={onConfirm} loading={loading}>Realizar evaluación</Button></div>
      </div>
    </ModalBase>
  );
}
