import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Eye, PackageCheck, Printer, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';
import { ModalBase } from '@/components/modals';
import { useEmpresa } from '@/hooks/useEmpresa';
import useAuth from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/axios';

export default function EmpresaPrecintosPage() {
  const { precintos, precintosMeta, cargarPrecintos, crearLotePrecintos, entregarPrecintos, anularPrecinto, generarQrPrecintos, tecnicos } = useEmpresa();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [cantidad, setCantidad] = useState(100);
  const [tecnicoId, setTecnicoId] = useState('');
  const [seleccion, setSeleccion] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [precintoAnulacion, setPrecintoAnulacion] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [errorAnulacion, setErrorAnulacion] = useState('');
  const [precintoVistaPrevia, setPrecintoVistaPrevia] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [impresion, setImpresion] = useState(null);
  const hojaImpresion = useRef(null);

  useEffect(() => {
    cargarPrecintos(page).catch((err) => setError(getErrorMessage(err)));
  }, [page, cargarPrecintos]);

  useEffect(() => {
    if (!precintoVistaPrevia) return undefined;
    const controller = new AbortController();
    generarQrPrecintos([precintoVistaPrevia], controller.signal).then(([qr]) => {
      if (!controller.signal.aborted) setVistaPrevia({ imagen: qr.dataUrl });
    }).catch((err) => {
      if (!controller.signal.aborted) setVistaPrevia({ error: getErrorMessage(err) });
    });
    return () => controller.abort();
  }, [generarQrPrecintos, precintoVistaPrevia]);

  const imprimibles = precintos.filter((p) => p.token_qr_externo);
  const imprimir = async () => {
    setImprimiendo(true);
    try {
      const codigos = await generarQrPrecintos(imprimibles);
      flushSync(() => setImpresion({ page, codigos }));
      const hoja = hojaImpresion.current;
      if (!hoja) return;
      const imagenes = hoja.querySelectorAll('img');
      await Promise.all(Array.from(imagenes, (imagen) => imagen.decode()));
      if (hoja.isConnected) window.print();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron preparar los códigos QR para imprimir.'));
    } finally {
      setImprimiendo(false);
    }
  };

  const disponibles = precintos.filter((p) => p.estado === 'EN_BODEGA_EMPRESA');
  const filtrados = precintos.filter((p) =>
    [p.codigo_suncho_precinto, p.codigo_oferta, p.estado]
      .some((value) => String(value || '').toLowerCase().includes(busqueda.toLowerCase()))
  );
  const tecnicosEmpresa = (tecnicos || []).filter((t) => t.empresa_id === user?.empresa_id && t.activo !== false);
  const ejecutar = async (operation) => {
    if (busy) return;
    setBusy(true);
    try { await operation(); setError(''); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const crear = (event) => {
    event.preventDefault();
    ejecutar(async () => {
      await crearLotePrecintos({ cantidad: Number(cantidad) });
      setSeleccion([]); setPage(1);
    });
  };
  const entregar = () => ejecutar(async () => {
    if (!tecnicoId || seleccion.length === 0) { toast.error('Selecciona un técnico y al menos un precinto'); return; }
    await entregarPrecintos({ asistente_tecnico_id: tecnicoId, precinto_ids: seleccion });
    setSeleccion([]); setTecnicoId(''); setPage(1);
  });
  const cerrarAnulacion = () => {
    if (busy) return;
    setPrecintoAnulacion(null);
    setMotivoAnulacion('');
    setErrorAnulacion('');
  };
  const confirmarAnulacion = async (event) => {
    event.preventDefault();
    if (busy || !precintoAnulacion) return;
    const motivo = motivoAnulacion.trim();
    if (!motivo) { setErrorAnulacion('Indica el motivo de anulación.'); return; }
    setBusy(true);
    setErrorAnulacion('');
    try {
      await anularPrecinto(precintoAnulacion.id, motivo);
      setPrecintoAnulacion(null);
      setMotivoAnulacion('');
      setError('');
    } catch (err) { setErrorAnulacion(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const seleccionar = (id) => setSeleccion((actual) => actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]);

  return (
    <div className="space-y-6">
      <div className="print:hidden space-y-6">
        <ModuloCabecera titulo="Precintos QR" subtitulo="Inventario físico y custodia de técnicos"
          imagenPortada="/images/portadas/contenedor.jpg" icono={PackageCheck}
          mensaje="Genera precintos sin oferta asignada y entrégalos a los técnicos. El AT vincula cada QR al saco en campo."
          totalRegistros={precintosMeta?.totalRecords ?? precintos.length} />
        {error && <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm text-danger-700">{error}</p>}
        <form onSubmit={crear} className="flex flex-wrap items-end gap-3 rounded-2xl border border-surface-200 bg-white p-4">
          <label className="text-sm font-semibold">Cantidad (1 a 500)
            <input required type="number" min={1} max={500} value={cantidad} onChange={(e) => setCantidad(e.target.value)}
              className="mt-1 block w-32 rounded-xl border border-surface-200 px-3 py-2" />
          </label>
          <button disabled={busy} type="submit" className="rounded-xl bg-brand-terracota px-4 py-2 font-semibold text-white disabled:opacity-50">Crear precintos</button>
        </form>
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-surface-200 bg-white p-4">
          <label className="text-sm font-semibold">Técnico que recibe
            <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className="mt-1 block rounded-xl border border-surface-200 px-3 py-2">
              <option value="">Selecciona un técnico</option>
              {tecnicosEmpresa.map((t) => <option key={t.id} value={t.id}>{t.nombres || t.nombre || t.id} {t.apellidos || ''}</option>)}
            </select>
          </label>
          <button type="button" onClick={entregar} disabled={busy || !seleccion.length || !tecnicoId}
            className="rounded-xl bg-brand-terracota px-4 py-2 font-semibold text-white disabled:opacity-50">Entregar {seleccion.length} precintos</button>
          <button type="button" onClick={imprimir} disabled={imprimiendo || !imprimibles.length}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 px-4 py-2 text-sm font-semibold disabled:opacity-50">
            <Printer className="h-4 w-4" />{imprimiendo ? 'Preparando QR…' : 'Imprimir QR de esta página'}
          </button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input type="search" aria-label="Buscar precintos" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar serial, oferta o estado" className="w-full rounded-xl border border-surface-200 bg-white py-2 pl-10 pr-3" />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-surface-200 bg-white">
          <table className="w-full text-left text-sm"><thead className="bg-surface-50"><tr>
            <th className="px-3 py-3"><input type="checkbox" aria-label="Seleccionar disponibles" checked={disponibles.length > 0 && disponibles.every((p) => seleccion.includes(p.id))}
              onChange={(e) => setSeleccion(e.target.checked ? [...new Set([...seleccion, ...disponibles.map((p) => p.id)])] : seleccion.filter((id) => !disponibles.some((p) => p.id === id)))} /></th>
            <th className="px-3 py-3">Serial</th><th className="px-3 py-3">Oferta vinculada</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3">Técnico</th><th className="px-3 py-3">Acciones</th>
          </tr></thead><tbody className="divide-y divide-surface-100">{filtrados.map((p) => (
            <tr key={p.id}>
              <td className="px-3 py-2"><input type="checkbox" aria-label={`Seleccionar ${p.codigo_suncho_precinto}`} disabled={p.estado !== 'EN_BODEGA_EMPRESA'} checked={seleccion.includes(p.id)} onChange={() => seleccionar(p.id)} /></td>
              <td className="px-3 py-2 font-mono text-xs">{p.codigo_suncho_precinto}</td><td className="px-3 py-2">{p.codigo_oferta || '—'}</td>
              <td className="px-3 py-2">{p.estado}</td><td className="px-3 py-2 text-xs">{p.asistente_tecnico_id || '—'}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <button type="button" aria-label={`Ver QR de ${p.codigo_suncho_precinto}`} disabled={!p.token_qr_externo}
                    onClick={() => { setVistaPrevia(null); setPrecintoVistaPrevia(p); }}
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-terracota hover:underline disabled:opacity-40">
                    <Eye className="h-4 w-4" aria-hidden="true" />Ver QR
                  </button>
                  <button type="button" disabled={busy || p.estado === 'VINCULADO_A_SACO' || p.estado === 'DANADO_ANULADO'} onClick={() => { setPrecintoAnulacion(p); setMotivoAnulacion(''); setErrorAnulacion(''); }} className="text-danger-700 disabled:opacity-40">Anular</button>
                </div>
              </td>
            </tr>
          ))}</tbody></table>
          {filtrados.length === 0 && <p className="p-6 text-center text-surface-500">No hay precintos para mostrar.</p>}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button type="button" disabled={imprimiendo || page <= 1} onClick={() => { setImpresion(null); setSeleccion([]); setPage(page - 1); }} className="disabled:opacity-40">Anterior</button>
          <span>Página {page} de {precintosMeta?.totalPages || 1}</span>
          <button type="button" disabled={imprimiendo || page >= (precintosMeta?.totalPages || 1)} onClick={() => { setImpresion(null); setSeleccion([]); setPage(page + 1); }} className="disabled:opacity-40">Siguiente</button>
        </div>
      </div>
      <ModalBase isOpen={Boolean(precintoVistaPrevia)} onClose={() => setPrecintoVistaPrevia(null)} title="Vista previa del QR" size="sm">
        <div className="space-y-3 py-2 text-center">
          <p className="break-all font-mono text-sm font-semibold text-surface-900">{precintoVistaPrevia?.codigo_suncho_precinto}</p>
          <div className="mx-auto grid aspect-square w-full max-w-64 place-items-center rounded-xl border border-surface-200 bg-white p-3">
            {vistaPrevia?.imagen ? (
              <img src={vistaPrevia.imagen} alt={`QR externo del precinto ${precintoVistaPrevia?.codigo_suncho_precinto}`}
                onError={() => setVistaPrevia({ error: 'No se pudo mostrar el código QR.' })} className="aspect-square w-full" />
            ) : vistaPrevia?.error ? (
              <p role="alert" className="text-sm text-danger-700">{vistaPrevia.error}</p>
            ) : <p role="status" className="text-sm text-surface-500">Cargando código QR…</p>}
          </div>
        </div>
      </ModalBase>
      <ModalBase isOpen={Boolean(precintoAnulacion)} onClose={cerrarAnulacion} title="Anular precinto" size="md">
        <form onSubmit={confirmarAnulacion} className="space-y-4">
          <p className="text-sm text-surface-600">Se anulará el precinto <span className="font-mono font-semibold text-surface-900">{precintoAnulacion?.codigo_suncho_precinto}</span>. Indica por qué ya no puede utilizarse.</p>
          <label className="block text-sm font-semibold text-surface-900" htmlFor="motivo-anulacion">Motivo de anulación *</label>
          <textarea id="motivo-anulacion" autoFocus required rows={4} value={motivoAnulacion}
            onChange={(event) => { setMotivoAnulacion(event.target.value); setErrorAnulacion(''); }}
            placeholder="Ej. El QR está dañado o se perdió el precinto"
            className="w-full resize-y rounded-xl border border-surface-200 px-3 py-2 text-sm text-surface-900 focus:border-brand-terracota focus:outline-none" />
          {errorAnulacion && <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm text-danger-700">{errorAnulacion}</p>}
          <div className="flex justify-end gap-3 border-t border-surface-200 pt-4">
            <button type="button" onClick={cerrarAnulacion} disabled={busy} className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-semibold text-surface-700 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={busy || !motivoAnulacion.trim()} className="rounded-xl bg-brand-terracota px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Anulando...' : 'Confirmar anulación'}</button>
          </div>
        </form>
      </ModalBase>
      {impresion && <div ref={hojaImpresion} className="hidden print:block">
        <h1 className="mb-4 text-xl font-bold">Precintos QR externos · página {impresion.page}</h1>
        <div className="grid grid-cols-4 gap-3">
          {impresion.codigos.map((qr) => <div key={qr.id} className="break-inside-avoid border border-surface-300 p-2 text-center">
            <img alt="" src={qr.dataUrl} className="mx-auto h-32 w-32" />
            <p className="break-all text-[10px] font-bold">{qr.label}</p>
          </div>)}
        </div>
      </div>}
    </div>
  );
}
