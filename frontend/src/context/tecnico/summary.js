

export function selectTecnicoSummary(state) {
  const { visitas, fincas } = state;
  const stats = [
    {
      label: 'Visitas Técnicas Realizadas',
      value: String(visitas.length),
      change: `${fincas.length} fincas monitoreadas`,
      iconName: 'ClipboardCheck',
    },
    {
      label: 'Lotes Certificados en Campo',
      value: String(visitas.filter((v) => v.estado === 'Aprobado').length),
      change: '100% cumplimiento fitosanitario',
      iconName: 'Sprout',
    },
    {
      label: 'Altitud Promedio Verificada',
      value: '1,780 msnm',
      change: 'Zona Cafetera de Alta Montaña',
      iconName: 'Compass',
    },
    {
      label: 'Alertas de Broca / Roya',
      value: '0 Críticas',
      change: 'Incidencia < 1.2% controlada',
      iconName: 'Bug',
    },
  ];
  return { stats };
}
