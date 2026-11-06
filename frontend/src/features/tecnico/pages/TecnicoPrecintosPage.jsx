import { useEffect, useRef, useState } from 'react';
import { Camera, PackageCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ModalBase } from '@/components/modals';
import { useTecnico } from '@/hooks/useTecnico';
import useAuth from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/axios';

export default function TecnicoPrecintosPage() {
  const { user } = useAuth();
  const { precintos, precintosMeta, preofertas, cargarMisPrecintos, vincularSaco, cargarFlujoPrecinto, corregirVinculo } = useTecnico();
  const [searchParams] = useSearchParams();
  const tokenQr = searchParams.get('token');
  const [page, setPage] = useState(1);
  const [token, setToken] = useState('');
  const [preofertaId, setPreofertaId] = useState('');
  const [peso, setPeso] = useState('70.00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [edicion, setEdicion] = useState(null);
  const [edicionPreofertaId, setEdicionPreofertaId] = useState('');
  const [edicionPeso, setEdicionPeso] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    cargarMisPrecintos(page).catch((err) => setError(getErrorMessage(err)));
  }, [page, cargarMisPrecintos]);
  useEffect(() => {
    if (!tokenQr) return;
    let active = true;
    cargarFlujoPrecinto(tokenQr).then((flujo) => {
      if (!active) return;
      if (flujo.estado === 'EN_CUSTODIA_TECNICO') setToken(tokenQr);
      if (flujo.estado === 'VINCULADO_A_SACO') {
        if (flujo.estado_saco !== 'SELLADO_EN_FINCA') {
          setError('El saco ya salió de finca y no se puede corregir su vinculación.');
          return;
        }
        setEdicion(flujo);
        setEdicionPreofertaId(flujo.preoferta_id || '');
        setEdicionPeso(String(flujo.peso_neto_kg || ''));
      }
    }).catch((err) => { if (active) setError(getErrorMessage(err)); });
    return () => { active = false; };
  }, [tokenQr, cargarFlujoPrecinto]);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);

  const detenerCamara = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };
  const iniciarCamara = async () => {
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no permite escanear desde la cámara. Puedes pegar el token o usar un lector QR.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      while (streamRef.current === stream) {
        const codes = await detector.detect(video);
        if (codes.length) {
          setToken(codes[0].rawValue);
          detenerCamara();
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (err) { detenerCamara(); setError(getErrorMessage(err)); }
  };
  const registrar = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await vincularSaco({ token_qr_externo: token.trim(), preoferta_id: preofertaId, peso_neto_kg: Number(peso) });
      setToken(''); setPage(1); setError('');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const guardarEdicion = async (event) => {
    event.preventDefault();
    if (busy || !tokenQr) return;
    setBusy(true);
    try {
      await corregirVinculo(tokenQr, { preoferta_id: edicionPreofertaId, peso_neto_kg: Number(edicionPeso) });
      setEdicion(null); setError('');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const propias = (preofertas || []).filter((p) => p.empresa_aliada_asignada_id === user?.empresa_id);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900">Precintos bajo mi custodia</h1>
        <p className="text-sm text-surface-600">Escanea el QR externo del precinto para vincularlo con un saco de una preoferta asignada a tu empresa.</p></div>
      {error && <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm text-danger-700">{error}</p>}
      <form onSubmit={registrar} className="space-y-4 rounded-2xl border border-surface-200 bg-white p-5">
        <div className="flex items-center gap-2 font-bold"><PackageCheck className="h-5 w-5 text-brand-terracota" />Vincular saco</div>
        <label className="block text-sm font-semibold">QR externo o URL escaneada *
          <input required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Pega el token o escanéalo"
            className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2 font-mono text-sm" />
        </label>
        <div className="flex gap-2"><button type="button" onClick={scanning ? detenerCamara : iniciarCamara}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm"><Camera className="h-4 w-4" />{scanning ? 'Detener cámara' : 'Escanear con cámara'}</button></div>
        <video ref={videoRef} muted playsInline className={scanning ? 'max-h-64 w-full rounded-xl bg-surface-900' : 'hidden'} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Preoferta *
            <select required value={preofertaId} onChange={(e) => setPreofertaId(e.target.value)} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2">
              <option value="">Selecciona una preoferta</option>
              {propias.map((p) => <option key={p.id} value={p.id}>{p.codigo_preoferta || p.id}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Peso neto del saco (kg) *
            <input required type="number" min="0.01" max="999.99" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2" />
          </label>
        </div>
        <button type="submit" disabled={busy || !propias.length} className="rounded-xl bg-brand-terracota px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Vinculando...' : 'Vincular saco'}</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-surface-200 bg-white">
        <table className="w-full text-left text-sm"><thead className="bg-surface-50"><tr><th className="p-3">Serial</th><th className="p-3">Oferta vinculada</th><th className="p-3">Estado</th></tr></thead>
          <tbody className="divide-y divide-surface-100">{precintos.map((p) => <tr key={p.id}><td className="p-3 font-mono text-xs">{p.codigo_suncho_precinto}</td><td className="p-3">{p.codigo_oferta || '—'}</td><td className="p-3">{p.estado}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="flex gap-3 text-sm"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {precintosMeta?.totalPages || 1}</span><button disabled={page >= (precintosMeta?.totalPages || 1)} onClick={() => setPage(page + 1)}>Siguiente</button></div>
      <ModalBase isOpen={Boolean(edicion)} onClose={() => { if (!busy) setEdicion(null); }} title="Corregir vinculación del saco">
        <form onSubmit={guardarEdicion} className="space-y-4">
          <p className="text-sm text-surface-600">Oferta actual: {edicion?.codigo_preoferta}. Solo puedes corregir el saco mientras permanece sellado en finca.</p>
          <label className="block text-sm font-semibold">Oferta vinculada
            <select required value={edicionPreofertaId} onChange={(e) => setEdicionPreofertaId(e.target.value)} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2">
              <option value="">Selecciona una oferta</option>
              {propias.map((p) => <option key={p.id} value={p.id}>{p.codigo_preoferta || p.id}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Peso neto del saco (kg)
            <input required type="number" min="0.01" max="999.99" step="0.01" value={edicionPeso} onChange={(e) => setEdicionPeso(e.target.value)} className="mt-1 block w-full rounded-xl border border-surface-200 px-3 py-2" />
          </label>
          <div className="flex justify-end gap-3 border-t border-surface-200 pt-4">
            <button type="button" disabled={busy} onClick={() => setEdicion(null)} className="rounded-xl border border-surface-200 px-4 py-2 font-semibold">Cancelar</button>
            <button type="submit" disabled={busy || !edicionPreofertaId} className="rounded-xl bg-brand-terracota px-4 py-2 font-semibold text-white disabled:opacity-50">Guardar cambios</button>
          </div>
        </form>
      </ModalBase>
    </div>
  );
}
