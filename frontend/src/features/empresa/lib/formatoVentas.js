export const usdVentas = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', currencyDisplay: 'code' });
export const numeroVentas = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });

export function fechaVenta(valor) {
  return Number.isFinite(Date.parse(valor)) ? fecha.format(new Date(valor)) : 'Fecha sin registrar';
}
