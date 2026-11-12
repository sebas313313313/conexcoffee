import { resumirGranulometria } from '@/context/muestras/detalle';

export const empaquesOferta = [25, 35, 70];

export function calcularEmpaque(peso, empaque) {
  if (!(peso > 0) || !empaquesOferta.includes(empaque)) return { sacos: 0, restante: 0 };
  const sacos = Math.floor(peso / empaque);
  return { sacos, restante: Math.round((peso - sacos * empaque) * 100) / 100 };
}

export function esOfertaAceptada(oferta) {
  return ['CONTRATADA', 'Aceptada', 'Aprobada'].includes(oferta.rawEstado ?? oferta.estado);
}

export function obtenerMallaOferta(oferta = {}) {
  const directa =
    oferta.malla ??
    oferta.malla_ofertada ??
    oferta.mallaOfertada ??
    oferta.malla_seleccionada ??
    oferta.granulometria?.malla ??
    resumirGranulometria(oferta)?.malla;

  const limpia = String(directa ?? '').trim().replace(/^malla\s*/i, '');
  return limpia || '16';
}
