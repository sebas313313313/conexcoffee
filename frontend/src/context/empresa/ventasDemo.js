import { agruparVentas } from './modeloVentas.js';

export function crearVentasDemo(empresaId, actividadNoDisponible = false) {
  const contenedores = [
    { id: 'demo-contenedor-1', codigo_contenedor: 'DEMO-001', pais_destino: 'Estados Unidos', estado: 'ABIERTO_RECOLECCION' },
    { id: 'demo-contenedor-2', codigo_contenedor: 'DEMO-002', pais_destino: 'Alemania', estado: 'EN_PUERTO_DESTINO' },
  ].map((item) => ({ ...item, empresa_exportadora_id: empresaId }));
  const compradores = [
    { id: 'demo-a', nombre_empresa: 'Tostaduría Horizonte', identificacion_tributaria: 'DEMO-A', pais_destino: 'Estados Unidos' },
    { id: 'demo-b', nombre_empresa: 'Café Estación', identificacion_tributaria: 'DEMO-B', pais_destino: 'Alemania' },
  ];
  const variedades = ['Castillo', 'Borbón Rosado', 'Geisha'].map((nombre, id) => ({ id, nombre }));
  const ejemplos = [
    [0, 0, 0, '2026-11-10', 600, 7200, 30],
    [0, 0, 1, '2026-11-07', 300, 6000, 40],
    [1, 1, 2, '2026-11-04', 150, 4500, 100],
    [1, 1, 1, '2026-10-23', 480, 9600, 100],
    [0, 0, 0, '2026-10-19', 240, 2880, 30],
  ];
  const pedidos = ejemplos.map(([contenedor, comprador, variedad, fecha, kilos, total, porcentaje], indice) => ({
    id: `demo-pedido-${indice + 1}`,
    codigo_pedido: `DEMO-PED-00${indice + 1}`,
    contenedor_id: contenedores[contenedor].id,
    comprador_id: compradores[comprador].id,
    preoferta_id: `demo-lote-${variedad}`,
    fecha_pedido: `${fecha}T15:00:00Z`,
    total_kilos: kilos,
    monto_total_usd: total,
    monto_anticipo_usd: total * 0.3,
    estado: porcentaje === 100 ? 'PAGADO_TOTAL_AUTORIZADO' : 'ANTICIPO_PAGADO_RESERVADO',
  }));
  const pagos = pedidos.map((pedido, indice) => ({
    id: `demo-pago-${indice + 1}`,
    pedido_id: pedido.id,
    estado_pago: 'EXITOSO',
    fecha_transaccion: pedido.fecha_pedido,
    monto_usd: pedido.monto_total_usd * ejemplos[indice][6] / 100,
  }));
  const preofertas = variedades.map(({ id }) => ({ id: `demo-lote-${id}`, variedad_id: id }));
  return agruparVentas(empresaId, contenedores, pedidos, compradores, pagos, preofertas, variedades)
    .map((item) => ({ ...item, esDePrueba: true, actividadNoDisponible }));
}
