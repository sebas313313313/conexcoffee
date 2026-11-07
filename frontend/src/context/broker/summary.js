export function selectBrokerSummary(state) {
  const { contenedores, ventas, muestras, compradores } = state;
  const totalUsd = ventas.reduce((acc, v) => acc + Number(v.total_venta_usd || 0), 0);
  const totalComisionesUsd = ventas.reduce((acc, v) => acc + Number(v.comision_broker_usd || 0), 0);
  const stats = [
    {
      label: 'Contenedores en Tracker',
      value: String(contenedores.length),
      change: 'Monitoreo satelital y temperatura activa',
      iconName: 'PackageCheck',
    },
    {
      label: 'Volumen Transado (USD)',
      value: `$${totalUsd.toLocaleString()} USD`,
      change: `Comisiones: $${totalComisionesUsd.toLocaleString()} USD`,
      iconName: 'DollarSign',
    },
    {
      label: 'Muestras Pre-Compra',
      value: String(muestras.length),
      change: `${muestras.filter((m) => m.estado.includes('Aprobada')).length} aprobadas para contenedor`,
      iconName: 'FlaskConical',
    },
    {
      label: 'Compradores Internacionales',
      value: String(compradores.length),
      change: 'Cartera activa de importadores & tostadurías',
      iconName: 'Users',
    },
  ];


  return { stats };
}
const normalizeCountry = (country) => String(country ?? '').trim().toLowerCase();

export function selectCarteraBroker(state, pais) {
  if (!normalizeCountry(pais)) return { pais: null, clientes: [] };

  const porComprador = Map.groupBy(state.pedidosPagados, (pedido) => pedido.comprador_id);
  const clientes = state.compradoresRegistrados.flatMap((cliente) => {
    const compras = porComprador.get(cliente.id);
    if (normalizeCountry(cliente.pais_destino) !== normalizeCountry(pais) || !compras?.length) return [];
    const historial = compras.map((compra) => {
      const pagoCompleto = compra.estado === 'PAGADO_TOTAL_AUTORIZADO';
      return {
        ...compra,
        pagoCompleto,
        montoPagado: Number((pagoCompleto ? compra.monto_total_usd : compra.monto_anticipo_usd) ?? 0),
      };
    }).sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido));
    return [{
      ...cliente,
      historial,
      totalUsd: historial.reduce((sum, compra) => sum + compra.montoPagado, 0),
    }];
  });
  clientes.sort((a, b) => new Date(b.historial[0].fecha_pedido) - new Date(a.historial[0].fecha_pedido));
  return { pais, clientes };
}
