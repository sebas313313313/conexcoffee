import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Keyboard, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { ModalBase } from '@/components/modals';
import { extractEvaluationCode } from '../lib/qrEvaluation';

export default function QrEvaluationScannerModal({ isOpen, onClose, onCodeScanned }) {
  const scannerRef = useRef(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner?.isScanning) await scanner.stop().catch(() => undefined);
    await scanner?.clear().catch(() => undefined);
    setCameraActive(false);
  }, []);

  const submitValue = useCallback((value) => {
    const codigo = extractEvaluationCode(value);
    if (!codigo) {
      toast.error('El código QR no contiene una evaluación válida.');
      return;
    }
    void stopCamera();
    onCodeScanned(codigo);
  }, [onCodeScanned, stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      await stopCamera();
      setCameraActive(true);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const scanner = new Html5Qrcode('qr-evaluation-reader', { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => submitValue(decodedText),
        () => undefined
      );
    } catch {
      await stopCamera();
      setCameraUnavailable(true);
      toast.error('No fue posible acceder a la cámara. Puedes ingresar el código manualmente.');
    }
  }, [submitValue]);

  useEffect(() => () => { void stopCamera(); }, [stopCamera]);
  useEffect(() => { if (!isOpen) void stopCamera(); }, [isOpen, stopCamera]);

  const close = () => { void stopCamera(); onClose(); };

  return (
    <ModalBase isOpen={isOpen} onClose={close} title="Escanear evaluación" size="md">
      <div className="space-y-4">
        <p className="text-sm text-surface-600">Escanea el QR entregado por la empresa o pega el código de la evaluación.</p>
        <div id="qr-evaluation-reader" className={cameraActive ? 'overflow-hidden rounded-xl bg-surface-900' : 'hidden'} />
        {!cameraActive && (
          <Button type="button" variant="outline" className="w-full" onClick={startCamera}>
            <Camera className="h-4 w-4" /> Abrir cámara
          </Button>
        )}
        {cameraUnavailable && <p className="text-xs text-amber-700">Tu navegador no permite lectura automática; usa el código escrito debajo.</p>}
        <form onSubmit={(event) => { event.preventDefault(); submitValue(manualCode); }} className="space-y-2">
          <label htmlFor="codigo-evaluacion-qr" className="text-sm font-medium text-surface-800">Código o enlace QR</label>
          <div className="flex gap-2">
            <input id="codigo-evaluacion-qr" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Ej. EVAL-P01" className="min-w-0 flex-1 rounded-lg border border-surface-300 px-3 py-2 text-sm" />
            <Button type="submit"><Keyboard className="h-4 w-4" /> Validar</Button>
          </div>
        </form>
        <div className="flex items-center gap-2 rounded-lg bg-primary-50 p-3 text-xs text-primary-800"><QrCode className="h-4 w-4 shrink-0" />La evaluación solo se te asignará después de confirmarla.</div>
      </div>
    </ModalBase>
  );
}
