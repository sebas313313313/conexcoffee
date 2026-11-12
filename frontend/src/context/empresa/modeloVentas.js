const estadosEnvio = {
  ABIERTO_RECOLECCION: 'Pendiente de envío',
  LLENO_CERRADO: 'Pendiente de envío',
  EN_PREPARACION_PUERTO: 'Pendiente de envío',
  ZARPADO_EN_TRANSITO: 'En tránsito',
  EN_PUERTO_DESTINO: 'En destino',
  EN_BODEGA_BROKER: 'En destino',
  LIQUIDADO_FINALIZADO: 'Contenedor finalizado',
};
const estadosAnticipo = new Set(['ANTICIPO_PAGADO_RESERVADO', 'PENDIENTE_SALDO_70']);
const estadosExcluidos = new Set(['CANCELADO', 'REEMBOLSADO']);
const redondear = (monto) => Math.round(monto * 100) / 100;

export function agruparVentas(empresaId, contenedores, pedidos, compradores, pagos, preofertas = [], variedades = []) {
  const clientes = new Map(compradores.map((cliente) => [cliente.id, cliente]));
  const pagosPorPedido = Map.groupBy(pagos.filter((pago) => pago.estado_pago === 'EXITOSO' && Number(pago.monto_usd) > 0), (pago) => pago.pedido_id);
  const pedidosPorContenedor = Map.groupBy(pedidos.filter((pedido) => !estadosExcluidos.has(pedido.estado)), (pedido) => pedido.contenedor_id);
  const variedadPorPreoferta = new Map(preofertas.map((item) => [item.id, String(item.variedad_id)]));
  const nombresVariedad = new Map(variedades.map((item) => [String(item.id), item.nombre]));

  return contenedores.filter((contenedor) => contenedor.empresa_exportadora_id === empresaId).map((contenedor) => {
    const ventas = (pedidosPorContenedor.get(contenedor.id) ?? []).flatMap((pedido) => {
      const total = Number(pedido.monto_total_usd);
      const transacciones = pagosPorPedido.get(pedido.id) ?? [];
      const importeConfirmado = transacciones.reduce((suma, pago) => suma + Number(pago.monto_usd), 0);
      const anticipo = estadosAnticipo.has(pedido.estado);
      const pagado = redondear(pedido.estado === 'PAGADO_TOTAL_AUTORIZADO' ? Math.max(total, importeConfirmado)
        : Math.max(anticipo ? Number(pedido.monto_anticipo_usd ?? 0) : 0, importeConfirmado));
      if (!(pagado > 0 && total > 0)) return [];
      const cliente = clientes.get(pedido.comprador_id);
      return [{
        id: pedido.id,
        codigo: pedido.codigo_pedido,
        fecha: pedido.fecha_pedido,
        comprador: cliente?.nombre_empresa || 'Comprador sin nombre registrado',
        identificacion: cliente?.identificacion_tributaria,
        pais: cliente?.pais_destino,
        variedad: nombresVariedad.get(variedadPorPreoferta.get(pedido.preoferta_id)),
        kilos: Number(pedido.total_kilos) || 0,
        total,
        pagado,
        pendiente: redondear(Math.max(total - pagado, 0)),
        porcentaje: redondear(100 * pagado / total),
        anticipo,
        transacciones,
      }];
    }).sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
    return {
      id: contenedor.id,
      codigo: contenedor.codigo_contenedor,
      destino: contenedor.pais_destino,
      estado: estadosEnvio[contenedor.estado] || 'Estado sin registrar',
      ventas,
    };
  });
}
