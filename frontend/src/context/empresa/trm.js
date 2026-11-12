import api from '@/lib/axios';

const fechaColombia = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Bogota',
});

export async function cargarTrmVigente(signal) {
  const hoy = fechaColombia.format(new Date());
  const { data } = await api.get('https://www.datos.gov.co/resource/32sa-8pi3.json', {
    signal,
    withCredentials: false,
    strictResponse: true,
    headers: { 'Content-Type': null, 'X-Requested-With': null },
    params: {
      $where: `vigenciadesde <= '${hoy}T23:59:59' AND vigenciahasta >= '${hoy}T00:00:00'`,
      $order: 'vigenciadesde DESC',
      $limit: 1,
    },
  });
  const registro = Array.isArray(data) ? data[0] : null;
  const tasa = Number(registro?.valor);
  if (!Number.isFinite(tasa) || tasa <= 0
    || !(registro.vigenciadesde?.slice(0, 10) <= hoy && hoy <= registro.vigenciahasta?.slice(0, 10))) {
    throw new Error('La TRM vigente aún no está disponible.');
  }
  return { tasa, fecha: hoy };
}
