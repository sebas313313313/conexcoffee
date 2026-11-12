import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { getErrorMessage } from '@/lib/axios';

const number = new Intl.NumberFormat('es-CO');
const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });
const processes = { LAVADO: 'Lavado', NATURAL: 'Natural', HONEY: 'Honey', ANAEROBICO: 'Anaeróbico', DOBLE_FERMENTACION: 'Doble fermentación', OTRO: 'Otro' };

export default function OfertasProductoresExternos() {
  const { listarOfertasExternas, invitarProductorExterno } = useEmpresa();
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ ofertas: [], hayMas: false });
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    listarOfertasExternas(page, controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setResult(data);
        setListError('');
        setLoading(false);
      }
    }).catch((error) => {
      if (!controller.signal.aborted) {
        setListError(getErrorMessage(error));
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [listarOfertasExternas, page, refresh]);

  function reload() {
    setLoading(true);
    setRefresh((value) => value + 1);
  }

  function changePage(next) {
    setLoading(true);
    setSelected(null);
    setPage(next);
  }

  async function invite() {
    setSending(true);
    setNotice(null);
    try {
      await invitarProductorExterno(selected);
      setNotice({ text: 'Invitación enviada. La oferta queda reservada mientras el productor decide.' });
    } catch (error) {
      setNotice({ text: getErrorMessage(error), error: true });
    } finally {
      setSelected(null);
      setSending(false);
      reload();
    }
  }

  return (
    <section aria-labelledby="ofertas-externas" className="space-y-4 rounded-2xl border border-surface-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="ofertas-externas" className="text-lg font-bold text-surface-900">Ofertas de productores sin cuenta</h2>
          <p className="mt-1 text-sm text-surface-600">Invita a un productor para iniciar su vinculación. La reserva dura hasta tres días, según la vigencia de la oferta.</p>
        </div>
        <Button size="sm" variant="outline" onClick={reload} disabled={loading || sending}>Actualizar</Button>
      </div>
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`text-sm ${notice.error ? 'text-danger-700' : 'text-surface-700'}`}>{notice.text}</p>}
      {loading ? <p role="status" className="text-sm">Cargando ofertas…</p> : listError ? <p role="alert" className="text-sm text-danger-700">{listError}</p> : (
        <>
          {!result.ofertas.length && <p className="text-sm text-surface-600">Por ahora no hay ofertas en esta página.</p>}
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {result.ofertas.map((offer) => (
              <li key={offer.id} className="flex flex-col gap-3 rounded-xl border border-surface-200 p-4">
                <div>
                  <h3 className="font-bold text-surface-900">{offer.variedad} · {processes[offer.proceso]}</h3>
                  <p className="text-sm text-surface-600">{offer.municipio}, {offer.departamento}</p>
                </div>
                <p className="text-sm">{number.format(offer.cantidad_sacos)} sacos · {number.format(offer.peso_total_kg)} kg<br />{currency.format(offer.precio_kg_cop)} por kg</p>
                {offer.estado === 'VINCULADA' ? <p className="text-sm font-semibold text-surface-700">{offer.productor_vinculado} · Productor vinculado</p>
                  : offer.estado === 'INVITADA' ? <p className="text-sm font-semibold text-surface-700">Invitación pendiente</p> : (
                    <>
                      <p className="text-xs text-surface-600">Vence el {date.format(new Date(offer.vence_en))}</p>
                      {selected === offer.id ? (
                        <div className="space-y-2">
                          <p className="text-sm">Le enviaremos una invitación en nombre de tu empresa.</p>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" loading={sending} onClick={invite}>Enviar invitación</Button>
                            <Button size="sm" variant="ghost" disabled={sending} onClick={() => setSelected(null)}>Cancelar</Button>
                          </div>
                        </div>
                      ) : <Button size="sm" variant="outline" className="self-start" disabled={sending} onClick={() => setSelected(offer.id)}>Invitar productor</Button>}
                    </>
                  )}
              </li>
            ))}
          </ul>
          {(page > 1 || result.hayMas) && <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1 || sending} onClick={() => changePage(page - 1)}>Anterior</Button>
            <span className="text-sm">Página {page}</span>
            <Button size="sm" variant="outline" disabled={!result.hayMas || sending} onClick={() => changePage(page + 1)}>Siguiente</Button>
          </div>}
        </>
      )}
    </section>
  );
}
