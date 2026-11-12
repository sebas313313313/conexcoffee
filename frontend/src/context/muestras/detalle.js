const tiposFoto = [
  ['muestra', 'Muestra', 'laboratorio'],
  ['finca', 'Finca', 'finca'],
  ['cultivo', 'Cultivo', 'caficultor'],
  ['almacenamiento', 'Condiciones de almacenamiento', 'contenedor'],
  ['loteOfertado', 'Lote ofertado', 'oferta'],
];
const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 });
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });
const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
const medida = (valor, unidad = '') => valor == null || valor === '' || !Number.isFinite(Number(valor))
  ? null : [numero.format(Number(valor)), unidad].filter(Boolean).join(' ');
const fechaRegistrada = (valor) => Number.isFinite(Date.parse(valor)) ? fecha.format(new Date(valor)) : null;
const normalizarTipo = (tipo) => String(tipo ?? '').toLowerCase().replace(/[^a-z]/g, '');

const mallasRegistradas = [18, 17, 16, 15, 14];
const objetivoGranulometrico = 95;

export function resumirGranulometria(muestra) {
  const seleccion = muestra.malla_seleccionada ?? muestra.detalleAnalisisFisico?.malla_seleccionada;
  const numeroMalla = Number(String(seleccion ?? '').trim().replace(/^malla\s*/i, ''));
  const porcentajes = new Map();
  let acumulado = 0;
  for (const malla of mallasRegistradas) {
    const valor = muestra[`malla_${malla}_porcentaje`];
    if (valor == null || valor === '' || !Number.isFinite(Number(valor)) || Number(valor) < 0) break;
    acumulado += Number(valor);
    if (acumulado > 100.03) break;
    porcentajes.set(malla, Math.min(100, Math.round(acumulado * 100) / 100));
  }

  if (numeroMalla > 0 && Number.isInteger(numeroMalla)) {
    return {
      malla: numeroMalla,
      porcentaje: medida(muestra.porcentaje_encima_malla ?? porcentajes.get(numeroMalla), '%'),
      origen: 'Seleccionada por el laboratorio',
    };
  }

  const resultado = [...porcentajes].find(([, porcentaje]) => porcentaje >= objetivoGranulometrico);
  return resultado ? {
    malla: resultado[0],
    porcentaje: medida(resultado[1], '%'),
    origen: 'Referencia calculada con un mínimo del 95 % acumulado',
  } : null;
}

export function vincularFichaMuestra(muestra, { preofertas, fincas, caficultores, variedades, laboratorios, inspecciones }) {
  const preoferta = preofertas.find((item) => item.id === muestra.preoferta_id);
  const inspeccion = preoferta && inspecciones
    .filter((item) => item.preoferta_id === preoferta.id
      && (!muestra.fecha_analisis || Date.parse(item.fecha_visita) <= Date.parse(muestra.fecha_analisis)))
    .sort((a, b) => Date.parse(b.fecha_visita) - Date.parse(a.fecha_visita))[0];
  return crearFichaMuestra(muestra, {
    preoferta, inspeccion,
    finca: fincas.find((item) => item.id === preoferta?.finca_id),
    caficultor: caficultores.find((item) => item.id === preoferta?.caficultor_id),
    variedad: variedades.find((item) => String(item.id) === String(preoferta?.variedad_id)),
    laboratorio: laboratorios.find((item) => item.id === muestra.laboratorio_id),
  });
}

export function crearDetalleSensorial(muestraId, sesiones, hojas) {
  const sesion = sesiones.filter((item) => item.evaluacion_fisica_id === muestraId)
    .sort((a, b) => Date.parse(b.fecha_sesion) - Date.parse(a.fecha_sesion))[0];
  const conclusiones = sesion ? hojas.filter((item) => item.sesion_id === sesion.id)
    .map((item) => item.conclusion_catador?.trim()).filter(Boolean) : [];
  return [
    ['Promedio de puntaje SCA', medida(sesion?.puntuacion_sca_global, 'pts')],
    ['Perfil sensorial', [...new Set(conclusiones)].join('\n\n') || null],
  ];
}

export function crearFichaMuestra(muestra, { preoferta, finca, caficultor, variedad, laboratorio, inspeccion } = {}) {
  const detalle = muestra.detalleAnalisisFisico ?? {};
  const evidencias = Array.isArray(inspeccion?.fotos_evidencia) ? inspeccion.fotos_evidencia : [];
  const fotos = tiposFoto.map(([id, nombre, archivo]) => {
    const url = evidencias.find((foto) => normalizarTipo(foto?.tipo) === normalizarTipo(id))?.url;
    return {
      id, nombre, referencia: `/images/portadas/${archivo}.jpg`,
      url: typeof url === 'string' && /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : null,
    };
  });

  return {
    codigo: muestra.codigo_analisis,
    codigoLote: preoferta?.codigo_preoferta,
    estado: muestra.estado,
    fotos,
    granulometria: resumirGranulometria(muestra),
    informacion: [
      ['Fecha de visita técnica', fechaRegistrada(inspeccion?.fecha_visita)],
      ['Peso de muestra extraída', medida(inspeccion?.muestra_lab_extraida_gramos, 'g')],
      ['Humedad medida por el técnico', medida(inspeccion?.humedad_pergamino_porcentaje, '%')],
      ['Laboratorio', laboratorio?.nombre_laboratorio],
      ['Caficultor', [caficultor?.nombres, caficultor?.apellidos].filter(Boolean).join(' ') || null],
      ['Finca', finca?.nombre_finca],
      ['Variedad', variedad?.nombre],
      ['Observaciones del técnico', inspeccion?.observaciones_tecnicas || null],
    ],
    resultados: [
      { titulo: 'Registro del laboratorio', datos: [
        ['Fecha de análisis', fechaRegistrada(muestra.fecha_analisis)],
        ['Analista', muestra.analista_nombre],
      ] },
      { titulo: 'Mediciones de la muestra', datos: [
        ['Peso analizado', medida(muestra.peso_muestra_analizada_gramos, 'g')],
        ['Humedad en laboratorio', medida(muestra.humedad_porcentaje, '%')],
        ['Densidad', medida(muestra.densidad_g_l, 'g/L')],
        ['Actividad de agua', medida(muestra.actividad_agua_aw, 'aw')],
      ] },
      { titulo: 'Almendra y rendimiento', datos: [
        ['Peso de almendra', medida(detalle.almendra, 'g')],
        ['Peso de almendra sana', medida(detalle.almendra_sana, 'g')],
        ['Merma', medida(detalle.porcentaje_merma, '%')],
        ['Factor de rendimiento', medida(muestra.factor_rendimiento, 'kg')],
        ['Precio esperado de la preoferta', preoferta?.precio_esperado_cop != null
          ? moneda.format(Number(preoferta.precio_esperado_cop)) : null],
      ] },
      { titulo: 'Defectos', datos: [
        ['Defectos del primer grupo', medida(muestra.defectos_primer_grupo)],
        ['Defectos del segundo grupo', medida(muestra.defectos_segundo_grupo)],
        ['Porcentaje de defectos', medida(detalle.porcentaje_defectos, '%')],
      ] },
    ],
  };
}
