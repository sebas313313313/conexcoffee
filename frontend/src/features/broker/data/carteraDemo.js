import { selectCarteraBroker } from '../../../context/broker/summary.js';

export function crearCarteraDemo(pais) {
  return selectCarteraBroker({
    compradoresRegistrados: [
      { id: 'demo-1', nombre_empresa: 'Tostaduría Horizonte', pais_destino: pais },
      { id: 'demo-2', nombre_empresa: 'Café Estación', pais_destino: pais },
    ],
    pedidosPagados: [
      {
        id: 'demo-pedido-1', comprador_id: 'demo-1', codigo_pedido: 'DEMO-001',
        fecha_pedido: '2026-10-22T12:00:00Z', total_kilos: 350,
        estado: 'PAGADO_TOTAL_AUTORIZADO', monto_total_usd: 5250,
      },
      {
        id: 'demo-pedido-2', comprador_id: 'demo-2', codigo_pedido: 'DEMO-002',
        fecha_pedido: '2026-10-18T12:00:00Z', total_kilos: 210,
        estado: 'ANTICIPO_PAGADO_RESERVADO', monto_total_usd: 3150, monto_anticipo_usd: 945,
      },
    ],
  }, pais).clientes;
}
