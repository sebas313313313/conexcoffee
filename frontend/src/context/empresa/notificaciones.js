import api from '@/lib/axios';
import { readRoleCollection } from '../shared/readRoleCollection';
import { cargarVentasEmpresa } from './ventas';

const porcentajeVenta = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

export async function cargarNotificacionesVentas(empresaId, signal) {
  const contenedores = await cargarVentasEmpresa(empresaId, signal);
  return contenedores.flatMap((contenedor) => contenedor.ventas.flatMap((venta) => {
    const ruta = `/empresa/ventas?${new URLSearchParams({ contenedor: contenedor.id, pedido: venta.id })}`;
    const notificacion = (id, porcentaje, fecha) => ({
      id: `venta-${id}`, categoria: 'ventas', codigo: venta.codigo,
      titulo: `Se confirmó un pago del ${porcentajeVenta.format(porcentaje)} %`,
      detalle: contenedor.esDePrueba ? 'Datos de prueba' : undefined,
      autor: venta.comprador, fecha, ruta,
    });
    return venta.transacciones.length
      ? venta.transacciones.map((pago) => notificacion(pago.id, 100 * pago.monto_usd / venta.total, pago.fecha_transaccion))
      : [notificacion(venta.id, venta.porcentaje, venta.fecha)];
  }));
}

export async function cargarNotificacionesEmpresa(empresaId, signal) {
  if (!empresaId) return [];
  const leer = (url) => readRoleCollection(api, { url, allPages: true, strictResponse: true }, signal);
  const [preofertas, muestras, sesiones, hojas] = await Promise.all([
    leer('/preofertas'),
    leer('/evaluaciones-fisicas'),
    leer('/sesiones-catacion'),
    leer('/hojas-catacion-cva'),
  ]);
  const propias = preofertas.filter((item) => item.empresa_aliada_asignada_id === empresaId);
  const preofertaIds = new Set(propias.map((item) => item.id));
  const muestrasPropias = muestras.filter((item) => preofertaIds.has(item.preoferta_id));
  const muestraIds = new Set(muestrasPropias.map((item) => item.id));
  const sesionesPropias = new Map(sesiones
    .filter((item) => item.empresa_creadora_id === empresaId || (!item.empresa_creadora_id && muestraIds.has(item.evaluacion_fisica_id)))
    .map((item) => [item.id, item]));

  return [
    ...propias.map((item) => ({
      id: `preoferta-${item.id}`, categoria: 'preofertas',
      codigo: item.codigo_preoferta, titulo: 'Actividad de preoferta',
      detalle: item.estado?.replaceAll('_', ' ').toLowerCase(),
      fecha: item.fecha_actualizacion || item.fecha_creacion, ruta: '/empresa/pre-ofertas',
    })),
    ...muestrasPropias.map((item) => ({
      id: `muestra-${item.id}`, categoria: 'muestras',
      codigo: item.codigo_analisis, titulo: 'Se registró un análisis de muestra',
      autor: item.analista_nombre,
      fecha: item.fecha_analisis || item.fecha_creacion, ruta: '/empresa/muestras',
    })),
    ...hojas.filter((item) => sesionesPropias.has(item.sesion_id)).map((item) => ({
      id: `hoja-${item.id}`, categoria: 'hojas',
      codigo: sesionesPropias.get(item.sesion_id).codigo_sesion, titulo: 'Se registró una hoja de catación',
      detalle: item.puntuacion_catador_individual == null ? 'Hoja registrada' : `${item.puntuacion_catador_individual} puntos SCA`,
      fecha: item.fecha_catacion,
    })),
  ].sort((a, b) => (Date.parse(b.fecha) || 0) - (Date.parse(a.fecha) || 0));
}
