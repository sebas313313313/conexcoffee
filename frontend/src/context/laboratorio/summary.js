

export function selectLaboratorioSummary(state) {
  const { catadores, analisisFisicos, analisisSensoriales, muestras } = state;
  // ── DASHBOARD COMPUTED DATA ────────────────────────────────────────────────
  const avgHumedad =
    analisisFisicos.length > 0
      ? (
          analisisFisicos.reduce((acc, a) => acc + Number(a.humedadNum || 11.2), 0) /
          analisisFisicos.length
        ).toFixed(1)
      : '11.2';

  const stats = [
    {
      label: 'Muestras en Custodia',
      value: String(muestras.length),
      change: `${analisisFisicos.filter((a) => a.estado === 'Completado').length} completadas`,
      iconName: 'FlaskConical',
    },
    {
      label: 'Sesiones de Catación',
      value: String(analisisSensoriales.length),
      change: `${catadores.length} Q-Graders activos`,
      iconName: 'FileCheck2',
    },
    {
      label: 'Humedad Promedio',
      value: `${avgHumedad}%`,
      change: 'Rango óptimo FNC (10-12%)',
      iconName: 'Droplets',
    },
    {
      label: 'Alertas de Merma',
      value: String(analisisFisicos.filter((a) => !a.es_conforme).length),
      change: 'Control de calidad activo',
      iconName: 'AlertTriangle',
    },
  ];

  const muestrasResumen = analisisFisicos.slice(0, 6).map((a) => ({
    codigo: a.codigo,
    lote_origen: a.codigoLote,
    humedad: a.humedad,
    factor_rendimiento: a.factor_rendimiento,
    merma: a.merma,
    puntaje_sca: a.puntaje_sca,
    estado: a.estado,
  }));
  return { stats, muestrasResumen };
}
