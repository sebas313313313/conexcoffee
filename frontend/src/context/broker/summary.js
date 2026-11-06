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
