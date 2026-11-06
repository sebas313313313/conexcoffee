

export function selectCatadorSummary(state) {
  const { evaluaciones } = state;
  const avgSca =
    evaluaciones.length > 0
      ? (
          evaluaciones.reduce((acc, ev) => acc + Number(ev.puntajeFinal || ev.puntaje_final || 87.5), 0) /
          evaluaciones.length
        ).toFixed(2)
      : '87.50';

  const stats = [
    {
      label: 'Puntaje SCA Promedio',
      value: `${avgSca} pts`,
      change: 'Especialidad SCA (>85 pts)',
      iconName: 'Award',
    },
    {
      label: 'Mesas de Catación',
      value: String(evaluaciones.length),
      change: `${evaluaciones.filter((e) => e.estado === 'Terminado').length} finalizadas`,
      iconName: 'Coffee',
    },
    {
      label: 'Perfiles Destacados',
      value: String(evaluaciones.filter((e) => Number(e.puntajeFinal || 87) >= 87).length),
      change: 'Lotes Exóticos / Micro-lotes',
      iconName: 'Sparkles',
    },
    {
      label: 'Calibración CVA / SCA',
      value: '98.5%',
      change: 'Protocolo Q-Grader activo',
      iconName: 'Sliders',
    },
  ];

  const cataciones = evaluaciones.slice(0, 6).map((ev) => ({
    muestra: ev.codigo,
    variedad: ev.variedad,
    proceso: ev.proceso,
    fragancia: ev.puntajes?.fraganciaAroma || 8.5,
    sabor: ev.puntajes?.sabor || 8.5,
    acidez: ev.puntajes?.acidez || 8.5,
    cuerpo: ev.puntajes?.cuerpo || 8.25,
    puntaje_final: ev.puntajeFinal || ev.puntaje_final || 87.5,
    notas: ev.notas || 'Jazmín, miel de caña, acidez cítrica brillante.',
    estado: ev.estado === 'Terminado' ? 'Calificado' : 'Pendiente',
  }));
  return { avgSca, stats, cataciones };
}
