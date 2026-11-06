

export function selectEmpresaSummary(state) {
  const { brokers, caficultores, contenedores, muestras, preofertas, ofertas, fincas } = state;
  const totalVolumenKg = preofertas.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);
  const kpis = [
    {
      id: 'kpi-caficultores',
      titulo: 'Caficultores Vinculados',
      valor: String(caficultores.length),
      iconoNombre: 'Leaf',
      label: 'Caficultores Vinculados',
      value: String(caficultores.length),
      change: `${fincas.length} fincas activas`,
      iconName: 'Users',
    },
    {
      id: 'kpi-ofertas',
      titulo: 'Ofertas Publicadas',
      valor: String(ofertas.length),
      iconoNombre: 'Gift',
      label: 'Ofertas Publicadas',
      value: String(ofertas.length),
      change: `${brokers.length} brokers aliados`,
      iconName: 'TrendingUp',
    },
    {
      id: 'kpi-contenedores',
      titulo: 'Contenedores en Despacho',
      valor: String(contenedores.length),
      iconoNombre: 'Package',
      label: 'Contenedores en Despacho',
      value: String(contenedores.length),
      change: `${muestras.length} muestras certificadas`,
      iconName: 'Truck',
    },
    {
      id: 'kpi-muestras',
      titulo: 'Muestras Registradas',
      valor: String(muestras.length),
      iconoNombre: 'Archive',
      label: 'Volumen Acopiado',
      value: `${(totalVolumenKg / 1000).toFixed(1)} Ton`,
      change: `${preofertas.length} lotes registrados`,
      iconName: 'Boxes',
    },
  ];

  const actividad = [
    ...preofertas.slice(0, 3).map((p, idx) => ({
      id: p.id || `act-pre-${idx}`,
      titulo: `Preoferta ${p.codigo} registrada por ${p.caficultor} (${p.variedad} - ${p.cantidad} Kg)`,
      tiempo: p.fechaRegistro || 'Reciente',
      estado: 'completado',
      lote: p.codigo,
      productor: p.caficultor,
      variedad: p.variedad,
      peso: `${p.cantidad} Kg`,
      fecha: p.fechaRegistro,
    })),
    ...muestras.slice(0, 2).map((m, idx) => ({
      id: m.id || `act-mue-${idx}`,
      titulo: `Muestra física ${m.codigo} asignada a laboratorio (${m.variedad})`,
      tiempo: m.fecha || 'Reciente',
      estado: 'pendiente',
      lote: m.codigo,
      productor: m.caficultor,
      variedad: m.variedad,
      peso: m.peso,
      fecha: m.fecha,
    })),
  ];
  return { totalVolumenKg, kpis, actividad };
}
