// ============================================
// Mappers de Dominio — ConexCoffee
// ============================================
// Normaliza los registros de PostgreSQL (Backend REST) hacia las estructuras
// camelCase y snake_case consumidas por todas las vistas del Frontend.
// ============================================

export function splitFullName(full = '') {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || '',
    second: parts.slice(1).join(' ') || '',
  };
}

export function mapCaficultor(raw = {}, { empresas = [], fincas = [], lotes = [], usuarios = [] } = {}) {
  const n = splitFullName(raw.nombres || `${raw.primerNombre || raw.primer_nombre || ''} ${raw.segundoNombre || raw.segundo_nombre || ''}`);
  const a = splitFullName(raw.apellidos || `${raw.primerApellido || raw.primer_apellido || ''} ${raw.segundoApellido || raw.segundo_apellido || ''}`);
  const userMatch = usuarios.find((u) => u.id === raw.usuario_id);
  const misFincas = fincas.filter((f) => f.caficultor_id === raw.id);
  const misFincaIds = new Set(misFincas.map((f) => f.id));
  const misLotes = lotes.filter((l) => misFincaIds.has(l.finca_id));

  const doc = raw.numero_documento || raw.numeroIdentificacion || raw.numero_identificacion || '';
  const tel = raw.telefono_movil || raw.telefono || '';
  const email =
    raw.correo ||
    raw.email ||
    userMatch?.correo_electronico ||
    `${(n.first || 'productor').toLowerCase()}@conexcoffee.com`;
  const municipio = raw.municipio || 'Popayán';
  const departamento = raw.departamento || 'Cauca';
  const empresaNombre =
    raw.empresa !== undefined
      ? raw.empresa
      : raw.observaciones_verificacion || empresas[0]?.nombre_comercial || empresas[0]?.razon_social || null;

  return {
    ...raw,
    id: raw.id,
    numero_documento: doc,
    numeroIdentificacion: doc,
    numero_identificacion: doc,
    nombres: `${n.first} ${n.second}`.trim(),
    apellidos: `${a.first} ${a.second}`.trim(),
    primerNombre: n.first.toUpperCase(),
    segundoNombre: n.second.toUpperCase(),
    primerApellido: a.first.toUpperCase(),
    segundoApellido: a.second.toUpperCase(),
    primer_nombre: n.first.toUpperCase(),
    segundo_nombre: n.second.toUpperCase(),
    primer_apellido: a.first.toUpperCase(),
    segundo_apellido: a.second.toUpperCase(),
    telefono: tel,
    telefono_movil: tel,
    correo: email,
    email,
    fechaNacimiento: raw.fechaNacimiento || raw.fecha_nacimiento || '1985-06-15',
    fecha_nacimiento: raw.fecha_nacimiento || raw.fechaNacimiento || '1985-06-15',
    genero: raw.genero || 'M',
    direccion: raw.direccion || `Vereda Central, ${municipio}`,
    municipio,
    departamento,
    pais: raw.pais || 'Colombia',
    numeroHijos: Number(raw.numeroHijos ?? raw.numero_hijos ?? 2),
    numero_hijos: Number(raw.numero_hijos ?? raw.numeroHijos ?? 2),
    estado_civil: raw.estado_civil || 'Casado(a)',
    historia:
      raw.historia ||
      misFincas[0]?.historia_familiar ||
      'Productor de café especial de alta montaña con trazabilidad certificada.',
    empresa: empresaNombre,
    fincasCount: misFincas.length || Number(raw.fincasCount ?? 1),
    fincas_asociadas: misFincas.length || Number(raw.fincas_asociadas ?? 1),
    lotesCount: misLotes.length || Number(raw.lotesCount ?? 1),
    finca_nombre: misFincas[0]?.nombre_finca || raw.finca_principal || 'Finca La Esperanza',
    finca_principal: misFincas[0]?.nombre_finca || raw.finca_principal || 'Finca La Esperanza',
    variedad_principal: raw.variedad_predominante || 'Castillo / Geisha',
    variedad_predominante: raw.variedad_predominante || 'Castillo / Geisha',
    hectareas: Number(misFincas[0]?.area_total_hectareas ?? 4.5),
    estado: raw.estado_verificacion === 'RECHAZADO' ? 'Inactivo' : 'Activo',
    avatar: raw.avatar || '/images/users/user-dummy-img.jpg',
  };
}

export function mapFinca(raw = {}, { caficultores = [], lotes = [] } = {}) {
  const caf = caficultores.find((c) => c.id === raw.caficultor_id);
  const cafNombre = caf
    ? `${caf.nombres || caf.primerNombre || ''} ${caf.apellidos || caf.primerApellido || ''}`.trim()
    : raw.caficultor || 'Pedro Nel García';
  const misLotes = lotes.filter((l) => (l.finca_id || l.fincaId) === raw.id);
  const nombre = raw.nombre_finca || raw.nombre || 'Finca Cafetera';
  const altura = Number(raw.altitud_msnm ?? raw.altura ?? 1800);
  const areaTotal = Number(raw.area_total_hectareas ?? raw.areaTotal ?? raw.areaCafe ?? 4.5);
  const areaConservacion = Number(raw.area_protegida_hectareas ?? raw.areaConservacion ?? 0.5);
  const areaCafe = Number(raw.areaCafe ?? Math.max(0.5, areaTotal - areaConservacion));

  return {
    ...raw,
    id: raw.id,
    nombre,
    nombre_finca: nombre,
    altura,
    altitud_msnm: altura,
    areaCafe,
    areaTotal,
    area_total_hectareas: areaTotal,
    areaConservacion,
    area_protegida_hectareas: areaConservacion,
    areaOtrosCultivos: Number(raw.areaOtrosCultivos ?? 0.5),
    pais: raw.pais || 'Colombia',
    departamento: raw.departamento || 'Cauca',
    municipio: raw.municipio || 'Piendamó',
    vereda: raw.vereda || 'El Carmen',
    latitud: String(raw.latitud ?? '2.641250'),
    longitud: String(raw.longitud ?? '-76.531240'),
    asociacion: raw.historia_familiar || raw.asociacion || 'Asociación de Cafés Especiales del Cauca',
    historia_familiar: raw.historia_familiar || raw.asociacion || '',
    unidadArea: raw.unidadArea || 'Hectáreas (ha)',
    logoUrl: raw.foto_portada_url || raw.logoUrl || '',
    caficultor: cafNombre,
    variedades: Array.isArray(raw.variedades) && raw.variedades.length > 0 ? raw.variedades : ['Geisha', 'Castillo'],
    lotesCount: misLotes.length,
  };
}

export function mapLote(raw = {}, { fincas = [], variedades = [] } = {}) {
  const finca = fincas.find((f) => f.id === (raw.finca_id || raw.fincaId));
  const variedadObj = variedades.find((v) => Number(v.id) === Number(raw.variedad_id));
  const nombreLote = raw.nombre_identificador || raw.nombreLote || 'Lote Principal';
  const variedadNombre = variedadObj?.nombre || raw.variedad || raw.variedadCafe || 'Geisha';
  const fincaNombre = finca?.nombre_finca || finca?.nombre || raw.fincaNombre || raw.finca || 'Finca La Esperanza';
  const numeroArboles = Number(raw.numero_arboles ?? raw.numeroArboles ?? 2500);

  return {
    ...raw,
    id: raw.id,
    nombreLote,
    nombre_identificador: nombreLote,
    fincaId: raw.finca_id || raw.fincaId || finca?.id || '',
    finca_id: raw.finca_id || raw.fincaId || finca?.id || '',
    fincaNombre,
    finca: fincaNombre,
    especie: variedadObj?.especie || raw.especie || 'Arábica',
    variedad: variedadNombre,
    variedadCafe: variedadNombre,
    numeroArboles,
    numero_arboles: numeroArboles,
    distanciaArboles: Number(raw.distanciaArboles ?? 1.5),
    distanciaSurcos: Number(raw.distanciaSurcos ?? 2.0),
    fertilizacionesAno: Number(raw.fertilizacionesAno ?? 3),
    area: Number(raw.area ?? (numeroArboles / 1000).toFixed(1)),
    proceso: raw.proceso || 'Lavado',
    altura: Number(finca?.altitud_msnm ?? finca?.altura ?? raw.altura ?? 1850),
    estado: raw.estado || 'En Producción',
  };
}

export function mapPreoferta(
  raw = {},
  { fincas = [], caficultores = [], variedades = [], lotes = [], sesiones = [], evalFisicas = [] } = {}
) {
  const finca = fincas.find((f) => f.id === raw.finca_id) || fincas[0] || {};
  const caf = caficultores.find((c) => c.id === (raw.caficultor_id || finca.caficultor_id)) || caficultores[0] || {};
  const variedadObj = variedades.find((v) => Number(v.id) === Number(raw.variedad_id));
  const loteMatch = lotes.find((l) => (l.finca_id || l.fincaId) === finca.id) || lotes[0] || {};
  const efMatch = evalFisicas.find((ef) => ef.preoferta_id === raw.id);
  const sesionMatch = efMatch ? sesiones.find((s) => s.evaluacion_fisica_id === efMatch.id) : sesiones[0];

  const codigo = raw.codigo_preoferta || raw.codigo || 'PRE-2026-0001';
  const variedad = variedadObj?.nombre || raw.variedad || raw.variedadCafe || 'Geisha';
  const especie = variedadObj?.especie || raw.especie || 'Arábica';
  const cantidadKg = Number(raw.cantidad_kg ?? raw.cantidadKg ?? raw.cantidad ?? 1500);
  const sacos = Math.max(1, Math.round(cantidadKg / 70));
  const precioCop = Number(raw.precio_esperado_cop ?? raw.precioEstimadoCop ?? raw.precio_estimado_cop ?? 3200000);
  const precioKgUsd = Number(raw.precio_kg_usd ?? raw.precioKg ?? (precioCop / 125 / 4200).toFixed(2));
  const puntajeSca = Number(sesionMatch?.puntuacion_sca_global ?? raw.puntaje_sca ?? raw.puntajeSca ?? 86.5);

  const procesoMap = {
    LAVADO: 'Lavado',
    NATURAL: 'Natural',
    HONEY: 'Honey',
    ANAEROBICO: 'Anaeróbico',
    DOBLE_FERMENTACION: 'Doble Fermentación',
  };
  const secadoMap = {
    SOL_MARQUESINA: 'Secado al Sol (Marquesina)',
    SOL_PATIO: 'Secado en Patio',
    SILO_MECANICO: 'Secado Mecánico (Silo)',
    CAMA_AFRICANA: 'Camas Africanas',
  };

  const procesoLabel = procesoMap[raw.proceso] || raw.procesoCosecha || raw.proceso || 'Lavado';
  const secadoLabel = secadoMap[raw.secado] || raw.tipoSecado || raw.secado || 'Secado al Sol';

  const cafNombre =
    `${caf.nombres || caf.primerNombre || ''} ${caf.apellidos || caf.primerApellido || ''}`.trim() ||
    'Pedro Nel García';
  const fincaNombre = finca.nombre_finca || finca.nombre || 'Finca La Esperanza';

  let estadoCaficultor = 'En Evaluación';
  let estadoEmpresa = 'Pendiente';
  let estadoOferta = 'Publicada';
  let estadoLibre = 'Disponible';

  if (raw.estado === 'CONTRATADA' || raw.estado === 'Aprobada' || raw.estado === 'Aceptada') {
    estadoCaficultor = 'Aprobada';
    estadoEmpresa = 'Aprobada';
    estadoOferta = 'Publicada';
    estadoLibre = 'Aceptada';
  } else if (raw.estado === 'EN_INSPECCION_CAMPO' || raw.estado === 'Asignada') {
    estadoEmpresa = 'Asignada';
  } else if (raw.estado === 'RECHAZADA_CALIDAD' || raw.estado === 'Rechazada') {
    estadoEmpresa = 'Rechazada';
  } else if (raw.estado === 'EN_NEGOCIACION' || raw.estado === 'Reservada') {
    estadoLibre = 'Reservada';
    estadoOferta = 'En Negociación';
  }

  const fechaProd = raw.fecha_recoleccion || raw.fechaProduccion || raw.fecha_produccion || '2026-09-15';

  return {
    ...raw,
    id: raw.id,
    codigo,
    codigo_preoferta: codigo,
    loteId: loteMatch.id || '',
    loteNombre: loteMatch.nombre_identificador || loteMatch.nombreLote || 'Lote Principal',
    especie,
    variedad,
    variedadCafe: variedad,
    cantidadKg,
    cantidad_kg: cantidadKg,
    cantidad: cantidadKg,
    cantidadEstimada: cantidadKg,
    sacos,
    fechaProduccion: fechaProd,
    fecha_produccion: fechaProd,
    fecha_creacion: raw.fecha_creacion ? String(raw.fecha_creacion).slice(0, 10) : fechaProd,
    fechaPublicacion: raw.fecha_creacion ? String(raw.fecha_creacion).slice(0, 10) : fechaProd,
    tipoSecado: secadoLabel,
    secado: secadoLabel,
    sombrio: 'Sí',
    tipo_sombrio: 'Sombrío Parcial Nativo',
    tipoFermentacion: procesoLabel,
    descripcion_fermentacion: `Fermentación controlada en proceso ${procesoLabel}`,
    procesoCosecha: procesoLabel,
    proceso_postcosecha: procesoLabel,
    descripcion_proceso: `Beneficio ecológico con ${secadoLabel}`,
    proceso: procesoLabel,
    precioEstimadoCop: precioCop,
    precio_estimado_cop: precioCop,
    precio_estimado_carga: precioCop,
    precioSacoCop: precioCop,
    precio_kg_usd: precioKgUsd,
    precioKg: precioKgUsd,
    precio_total_usd: Number((cantidadKg * precioKgUsd).toFixed(2)),
    puntaje_sca: puntajeSca,
    puntajeSca,
    descripcion:
      raw.descripcion ||
      `Microlote ${variedad} (${procesoLabel}) cultivado en ${fincaNombre} a ${finca.altitud_msnm || 1850} msnm.`,
    notas_cata:
      raw.notas_cata ||
      raw.notasCata ||
      'Notas florales intensas, miel de caña, frutos amarillos y acidez málica brillante.',
    notasCata:
      raw.notasCata ||
      raw.notas_cata ||
      'Notas florales intensas, miel de caña, frutos amarillos y acidez málica brillante.',
    certificadoNombre: raw.certificadoNombre || 'Certificado_Organico_BPA.pdf',
    certificadoArchivo: raw.certificadoArchivo || null,
    fincaNombre,
    finca_nombre: fincaNombre,
    finca_imagen: '/images/portadas/finca.jpg',
    municipio: finca.municipio || 'Piendamó',
    departamento: finca.departamento || 'Cauca',
    vereda: finca.vereda || 'El Carmen',
    ubicacion: `${finca.municipio || 'Piendamó'}, ${finca.departamento || 'Cauca'}`,
    altura_msnm: Number(finca.altitud_msnm ?? 1850),
    caficultor_nombre: cafNombre,
    caficultor_telefono: caf.telefono_movil || caf.telefono || '+573117654321',
    caficultor_correo: caf.correo || 'productor@conexcoffee.com',
    empresa_cedente: 'Improcafé Colombia S.A.S.',
    empresa: 'Improcafé Colombia S.A.S.',
    tecnico_asignado: raw.tecnico_asignado || null,
    contenedor_asignado: raw.contenedor_asignado || null,
    dias_reserva: raw.dias_reserva ?? 0,
    estado: estadoCaficultor,
    estadoEmpresa,
    estadoOferta,
    estadoLibre,
    rawEstado: raw.estado,
    atributos_sca: raw.atributos_sca || {
      fragancia_aroma: 8.75,
      sabor: 8.75,
      sabor_residual: 8.5,
      acidez: 8.75,
      cuerpo: 8.5,
      uniformidad: 10,
      balance: 8.5,
      taza_limpia: 10,
      dulzor: 10,
      puntaje_catador: 8.75,
      total: puntajeSca,
    },
    caficultor: {
      nombre: cafNombre,
      telefono: caf.telefono_movil || caf.telefono || '+573117654321',
      correo: caf.correo || 'productor@conexcoffee.com',
      direccion: `Vereda ${finca.vereda || 'El Carmen'}`,
      pais: 'Colombia',
      municipio: finca.municipio || 'Piendamó',
      finca: fincaNombre,
      vereda: finca.vereda || 'El Carmen',
      altura_msnm: Number(finca.altitud_msnm ?? 1850),
      asociacion: finca.historia_familiar || 'Asociación de Cafés Especiales',
    },
    finca: {
      nombre: fincaNombre,
      vereda: finca.vereda || 'El Carmen',
      altura_msnm: Number(finca.altitud_msnm ?? 1850),
      asociacion: finca.historia_familiar || 'Asociación de Cafés Especiales',
      area_cafe_ha: Number(finca.area_total_hectareas ?? 4.5),
      area_otros_cultivos_ha: 0.5,
      area_conservacion_ha: Number(finca.area_protegida_hectareas ?? 0.5),
      cedula_numero: caf.numero_documento || '1061987654',
    },
  };
}

export function mapCatador(raw = {}, { laboratorios = [], usuarios = [], hojas = [] } = {}) {
  const n = splitFullName(raw.nombres || `${raw.primer_nombre || ''} ${raw.segundo_nombre || ''}`);
  const a = splitFullName(raw.apellidos || `${raw.primer_apellido || ''} ${raw.segundo_apellido || ''}`);
  const lab = laboratorios.find((l) => l.id === raw.laboratorio_id) || laboratorios[0];
  const user = usuarios.find((u) => u.id === raw.usuario_id);
  const misHojas = hojas.filter((h) => h.catador_id === raw.id);
  const doc = raw.numero_documento || raw.identificacion || raw.numero_identificacion || '';
  const tel = raw.telefono_movil || raw.telefono || '+573147894561';
  const email = raw.email || raw.correo || user?.correo_electronico || 'catador@qgrader.com';
  const cert = raw.codigo_certificado_q_grader || raw.certificadoQ || raw.certificacion || 'Q-GRADER-COL-2025';

  return {
    ...raw,
    id: raw.id,
    identificacion: doc,
    numero_identificacion: doc,
    numero_documento: doc,
    tipo_documento: raw.tipo_documento || 'CC',
    nombres: `${n.first} ${n.second}`.trim(),
    apellidos: `${a.first} ${a.second}`.trim(),
    primer_nombre: n.first.toUpperCase(),
    segundo_nombre: n.second.toUpperCase(),
    primer_apellido: a.first.toUpperCase(),
    segundo_apellido: a.second.toUpperCase(),
    telefono: tel,
    telefono_movil: tel,
    email,
    correo: email,
    certificadoQ: cert,
    certificacion: cert,
    codigo_certificado_q_grader: cert,
    laboratorio: lab?.nombre_laboratorio || lab?.nombre || raw.laboratorio || 'Laboratorio Tecnicafé',
    experiencia: raw.experiencia || '6 años',
    muestras_evaluadas: misHojas.length || Number(raw.muestras_evaluadas ?? 12),
    estado: raw.activo === false ? 'Inactivo' : 'Activo',
  };
}

export function mapEmpresa(raw = {}, { caficultores = [], preofertas = [], usuarios = [] } = {}) {
  const user = usuarios.find((u) => u.id === raw.usuario_id);
  const nombre = raw.nombre_comercial || raw.razon_social || raw.nombre || 'Empresa Exportadora';
  return {
    ...raw,
    id: raw.id,
    nit: raw.nit || '900876543-1',
    nombre,
    nombre_comercial: nombre,
    razon_social: raw.razon_social || nombre,
    telefono: raw.telefono_contacto || raw.telefono || '+573101234567',
    telefono_contacto: raw.telefono_contacto || raw.telefono || '+573101234567',
    correo: raw.correo || user?.correo_electronico || 'contacto@exportadora.com',
    direccion: raw.direccion || 'Calle 10 # 4-50, Popayán',
    municipio: raw.municipio || 'Popayán',
    departamento: raw.departamento || 'Cauca',
    caficultoresCount: caficultores.length || 3,
    ofertasActivas: preofertas.length || 3,
    descripcion:
      raw.descripcion ||
      `Representante Legal: ${raw.representante_legal || 'Mauricio Gómez'} — Exportador DIAN ${raw.codigo_exportador_dian || 'Autorizado'}`,
  };
}

export function mapTecnico(raw = {}, { inspecciones = [], usuarios = [] } = {}) {
  const n = splitFullName(raw.nombres || `${raw.primerNombre || raw.primer_nombre || ''} ${raw.segundoNombre || raw.segundo_nombre || ''}`);
  const a = splitFullName(raw.apellidos || `${raw.primerApellido || raw.primer_apellido || ''} ${raw.segundoApellido || raw.segundo_apellido || ''}`);
  const user = usuarios.find((u) => u.id === raw.usuario_id);
  const misInspecciones = inspecciones.filter((i) => i.asistente_tecnico_id === raw.id);
  const doc = raw.numero_documento || raw.numeroIdentificacion || raw.numero_identificacion || '';
  const tel = raw.telefono_movil || raw.telefono || '+573159876543';
  const email = raw.correo || user?.correo_electronico || 'tecnico@conexcoffee.com';

  return {
    ...raw,
    id: raw.id,
    numeroIdentificacion: doc,
    numero_identificacion: doc,
    numero_documento: doc,
    nombres: `${n.first} ${n.second}`.trim(),
    apellidos: `${a.first} ${a.second}`.trim(),
    primerNombre: n.first.toUpperCase(),
    segundoNombre: n.second.toUpperCase(),
    primerApellido: a.first.toUpperCase(),
    segundoApellido: a.second.toUpperCase(),
    primer_nombre: n.first.toUpperCase(),
    segundo_nombre: n.second.toUpperCase(),
    primer_apellido: a.first.toUpperCase(),
    segundo_apellido: a.second.toUpperCase(),
    telefono: tel,
    telefono_movil: tel,
    correo: email,
    especialidad: raw.profesion || raw.especialidad || 'Ingeniero Agrónomo',
    zonaAsignada: raw.zonaAsignada || raw.zona_asignada || 'Centro / Piendamó - Morales',
    zona_asignada: raw.zona_asignada || raw.zonaAsignada || 'Centro / Piendamó - Morales',
    visitasRealizadas: misInspecciones.length || Number(raw.visitasRealizadas ?? 12),
    fincas_a_cargo: Number(raw.fincas_a_cargo ?? 8),
    activo: raw.activo !== false,
    estado: raw.activo === false ? 'Inactivo' : 'Activo',
    avatar: `${(n.first[0] || 'T').toUpperCase()}${(a.first[0] || 'A').toUpperCase()}`,
  };
}

export function mapLaboratorio(raw = {}, { evalFisicas = [], catadores = [], usuarios = [] } = {}) {
  const user = usuarios.find((u) => u.id === raw.usuario_id);
  const misMuestras = evalFisicas.filter((ef) => ef.laboratorio_id === raw.id);
  const misCatadores = catadores.filter((c) => c.laboratorio_id === raw.id);
  let certStr = 'ISO 17025 / Federación Nacional de Cafeteros';
  if (typeof raw.certificaciones === 'string') {
    certStr = raw.certificaciones;
  } else if (raw.certificaciones && typeof raw.certificaciones === 'object') {
    certStr = Object.entries(raw.certificaciones)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(' · ');
  }

  const nombre = raw.nombre_laboratorio || raw.nombre || 'Laboratorio de Calidad';
  return {
    ...raw,
    id: raw.id,
    nit: raw.nit || '800987654-2',
    nombre,
    nombre_laboratorio: nombre,
    telefono: raw.telefono_contacto || raw.telefono || '+573123456789',
    telefono_contacto: raw.telefono_contacto || raw.telefono || '+573123456789',
    correo: raw.correo || user?.correo_electronico || 'calidad@laboratorio.com',
    direccion: raw.direccion || 'Parque Tecnológico del Café',
    municipio: raw.municipio || 'Cajibío',
    departamento: raw.departamento || 'Cauca',
    certificaciones: certStr,
    muestrasAnalizadas: misMuestras.length || Number(raw.muestrasAnalizadas ?? 3),
    muestras_procesadas: misMuestras.length || Number(raw.muestras_procesadas ?? 3),
    q_graders_activos: misCatadores.length || Number(raw.q_graders_activos ?? 3),
    activo: raw.activo !== false,
  };
}

export function mapBroker(raw = {}, { contenedores = [], usuarios = [] } = {}) {
  const user = usuarios.find((u) => u.id === raw.usuario_id);
  const n = splitFullName(raw.nombre_empresa || `${raw.primerNombre || raw.primer_nombre || 'John'} ${raw.segundoNombre || ''}`);
  const doc = raw.identificacion_fiscal_pais || raw.numeroIdentificacion || raw.numero_identificacion || 'EIN-88-9923145';
  const tel = raw.telefono_contacto || raw.telefono || '+13055550199';
  const email = raw.correo || user?.correo_electronico || 'broker@greenhorizoncoffee.com';
  const misContenedores = contenedores.filter((c) => c.broker_destino_id === raw.id);

  return {
    ...raw,
    id: raw.id,
    numeroIdentificacion: doc,
    numero_identificacion: doc,
    primerNombre: (raw.primerNombre || raw.primer_nombre || n.first || 'JOHN').toUpperCase(),
    segundoNombre: (raw.segundoNombre || raw.segundo_nombre || '').toUpperCase(),
    primerApellido: (raw.primerApellido || raw.primer_apellido || n.second || 'BROKER').toUpperCase(),
    segundoApellido: (raw.segundoApellido || raw.segundo_apellido || '').toUpperCase(),
    primer_nombre: (raw.primer_nombre || raw.primerNombre || n.first || 'JOHN').toUpperCase(),
    segundo_nombre: (raw.segundo_nombre || raw.segundoNombre || '').toUpperCase(),
    primer_apellido: (raw.primer_apellido || raw.primerApellido || n.second || 'BROKER').toUpperCase(),
    segundo_apellido: (raw.segundo_apellido || raw.segundoApellido || '').toUpperCase(),
    telefono: tel,
    correo: email,
    fechaNacimiento: raw.fechaNacimiento || raw.fecha_nacimiento || '1982-05-14',
    fecha_nacimiento: raw.fecha_nacimiento || raw.fechaNacimiento || '1982-05-14',
    genero: raw.genero || 'M',
    direccion: raw.direccion_bodega || raw.direccion || 'Port of Miami Free Trade Zone',
    municipio: raw.ciudad || raw.municipio || 'Miami',
    departamento: raw.pais_operacion || raw.departamento || 'Estados Unidos',
    pais: raw.pais_operacion || raw.pais || 'Estados Unidos',
    zona_comercial: `${raw.ciudad || 'Miami'}, ${raw.pais_operacion || 'Estados Unidos'}`,
    empresasVinculadas: Array.isArray(raw.empresasVinculadas)
      ? raw.empresasVinculadas
      : ['Improcafé Colombia S.A.S.'],
    totalNegociaciones: misContenedores.length || Number(raw.totalNegociaciones ?? 1),
    contratos_activos: misContenedores.length || Number(raw.contratos_activos ?? 1),
    activo: raw.activo !== false,
    estado: raw.activo === false ? 'Inactivo' : 'Activo',
    avatar: 'JB',
  };
}

export function mapComprador(raw = {}, { pedidos = [], usuarios = [] } = {}) {
  const user = usuarios.find((u) => u.id === raw.usuario_id);
  const n = splitFullName(raw.sitio_web && !raw.sitio_web.startsWith('http') ? raw.sitio_web : raw.nombre_empresa || 'Hans Mueller');
  const misPedidos = pedidos.filter((p) => p.comprador_id === raw.id);
  const totalKg = misPedidos.reduce((acc, p) => acc + Number(p.total_kilos || 0), 0);
  const doc = raw.identificacion_tributaria || raw.numeroIdentificacion || raw.numero_identificacion || 'DE-VAT-987654';
  const tel = raw.telefono_contacto || raw.telefono || '+493012345678';
  const email = raw.correo || user?.correo_electronico || 'comprador@roasters.de';

  return {
    ...raw,
    id: raw.id,
    numeroIdentificacion: doc,
    numero_identificacion: doc,
    tipo_documento: raw.tipo_documento || 'TAX_ID',
    primerNombre: (raw.primerNombre || raw.primer_nombre || n.first || 'HANS').toUpperCase(),
    segundoNombre: (raw.segundoNombre || raw.segundo_nombre || '').toUpperCase(),
    primerApellido: (raw.primerApellido || raw.primer_apellido || n.second || 'ROASTERS').toUpperCase(),
    segundoApellido: (raw.segundoApellido || raw.segundo_apellido || '').toUpperCase(),
    primer_nombre: (raw.primer_nombre || raw.primerNombre || n.first || 'HANS').toUpperCase(),
    segundo_nombre: (raw.segundo_nombre || raw.segundoNombre || '').toUpperCase(),
    primer_apellido: (raw.primer_apellido || raw.primerApellido || n.second || 'ROASTERS').toUpperCase(),
    segundo_apellido: (raw.segundo_apellido || raw.segundoApellido || '').toUpperCase(),
    telefono: tel,
    correo: email,
    empresaCompradora: raw.nombre_empresa || raw.empresaCompradora || raw.empresa || 'The Barn Berlin Roastery',
    empresa: raw.nombre_empresa || raw.empresa || raw.empresaCompradora || 'The Barn Berlin Roastery',
    pais: raw.pais_destino || raw.pais || 'Alemania',
    ciudad: raw.ciudad || 'Berlín',
    pedidosCount: misPedidos.length,
    pedidos_totales: misPedidos.length,
    volumenSacos: Math.round(totalKg / 70),
    volumen_kg: totalKg,
    activo: raw.activo !== false,
    estado: raw.activo === false ? 'Inactivo' : 'Activo',
    avatar: 'HR',
  };
}

export function mapMuestraFisica(
  raw = {},
  { preofertas = [], fincas = [], caficultores = [], variedades = [], laboratorios = [], sesiones = [] } = {}
) {
  const pre = preofertas.find((p) => p.id === raw.preoferta_id) || preofertas[0] || {};
  const finca = fincas.find((f) => f.id === pre.finca_id) || fincas[0] || {};
  const caf = caficultores.find((c) => c.id === pre.caficultor_id) || caficultores[0] || {};
  const variedadObj = variedades.find((v) => Number(v.id) === Number(pre.variedad_id));
  const lab = laboratorios.find((l) => l.id === raw.laboratorio_id) || laboratorios[0];
  const sesion = sesiones.find((s) => s.evaluacion_fisica_id === raw.id);

  const codigo = raw.codigo_analisis || raw.codigo || 'ANALISIS-FIS-001';
  const codigoPreoferta = pre.codigo_preoferta || pre.codigo || 'PRE-2026-0001';
  const humedadNum = Number(raw.humedad_porcentaje ?? raw.humedad ?? 10.8);
  const pesoNum = Number(raw.peso_muestra_analizada_gramos ?? raw.peso ?? raw.peso_g ?? 350);
  const factorNum = Number(raw.factor_rendimiento ?? raw.factorRendimiento ?? 88.5);
  const cafNombre =
    `${caf.nombres || caf.primerNombre || ''} ${caf.apellidos || caf.primerApellido || ''}`.trim() ||
    'Pedro Nel García';
  const fincaNombre = finca.nombre_finca || finca.nombre || 'Finca La Esperanza';
  const variedadNombre = variedadObj?.nombre || pre.variedad || 'Geisha';
  const labNombre = lab?.nombre_laboratorio || lab?.nombre || raw.laboratorio || 'Laboratorio de Calidad Tecnicafé';
  const fechaStr = raw.fecha_analisis ? String(raw.fecha_analisis).slice(0, 10) : '2026-10-20';
  const puntajeSca = sesion ? Number(sesion.puntuacion_sca_global || 88.5) : null;

  return {
    ...raw,
    id: raw.id,
    codigo,
    codigoLote: codigoPreoferta,
    codigoPreoferta,
    lote_origen: codigoPreoferta,
    fecha: fechaStr,
    fechaRegistro: fechaStr,
    peso: `${pesoNum} g`,
    pesoNum,
    peso_g: pesoNum,
    pesoMuestra: `${pesoNum} g`,
    humedad: `${humedadNum}%`,
    humedadNum,
    merma: `${(100 - factorNum).toFixed(1)}%`,
    factorRendimiento: `${factorNum} kg`,
    factor_rendimiento: factorNum,
    defectosPrimerGrupo: Number(raw.defectos_primer_grupo ?? 0),
    defectosSegundoGrupo: Number(raw.defectos_segundo_grupo ?? 2),
    responsable: raw.analista_nombre || 'Dra. Claudia Benítez',
    catadorAsignado: raw.catadorAsignado || raw.analista_nombre || 'Ana María López Q-Grader',
    caficultor: cafNombre,
    finca: fincaNombre,
    departamento: finca.departamento || 'Cauca',
    municipio: finca.municipio || 'Piendamó',
    variedad: variedadNombre,
    proceso: pre.proceso || 'Natural',
    laboratorio: labNombre,
    puntaje_sca: puntajeSca,
    puntajeSca: puntajeSca || 88.5,
    tituloPerfil: sesion?.titulo || `Perfil Sensorial ${variedadNombre}`,
    perfilSensorial: 'Notas florales de jazmín, miel de azahar y acidez málica brillante.',
    catador: 'Ana María López Q-Grader',
    estado: raw.es_conforme ? 'Completado' : 'En Proceso',
    estadoResultado: raw.es_conforme ? 'Aprobada' : 'Pendiente',
    estadoMuestraLab: raw.es_conforme ? 'Calificada' : 'En Análisis',
    imagenes: {
      muestra: '/images/portadas/laboratorio.jpg',
      finca: '/images/portadas/finca.jpg',
      cultivo: '/images/portadas/caficultor.jpg',
      almacenamiento: '/images/portadas/contenedor.jpg',
      loteOfertado: '/images/portadas/oferta.jpg',
    },
    informacionTecnico: {
      fechaTomaMuestra: fechaStr,
      peso: `${pesoNum} g`,
      humedadTecnico: `${humedadNum}%`,
      laboratorio: labNombre,
      observacionesTecnico: 'Muestra extraída en empaque GrainPro bajo protocolo de custodia.',
    },
    analisisFisico: {
      fechaAnalisisLaboratorio: fechaStr,
      densidad: `${raw.densidad_g_l || 710} g/L`,
      actividadAgua: `${raw.actividad_agua_aw || 0.618} aw`,
      pesoAlmendra: '250 g',
      pesoAlmendraSana: '246 g',
      porcentajeMerma: `${(100 - factorNum).toFixed(1)}%`,
      factorRendimiento: `${factorNum} kg`,
      porcentajeDefectos: '0.8%',
      mallaSeleccionada: 'Malla 18',
      porcentajeEncimaMalla: `${raw.malla_18_porcentaje || 52}%`,
      precioAproximadoCarga: '$3.500.000 COP',
    },
  };
}

export function mapSesionSensorial(
  raw = {},
  { evalFisicas = [], preofertas = [], fincas = [], caficultores = [], variedades = [], hojas = [], catadores = [] } = {}
) {
  const ef = evalFisicas.find((e) => e.id === raw.evaluacion_fisica_id) || evalFisicas[0] || {};
  const pre = preofertas.find((p) => p.id === ef.preoferta_id) || preofertas[0] || {};
  const finca = fincas.find((f) => f.id === pre.finca_id) || fincas[0] || {};
  const caf = caficultores.find((c) => c.id === pre.caficultor_id) || caficultores[0] || {};
  const variedadObj = variedades.find((v) => Number(v.id) === Number(pre.variedad_id));
  const misHojas = hojas.filter((h) => h.sesion_id === raw.id);
  const catadorObj =
    catadores.find((c) => c.id === misHojas[0]?.catador_id) || catadores[0] || {};

  const codigoLote = pre.codigo_preoferta || raw.codigo_sesion || 'PRE-2026-0001';
  const variedad = variedadObj?.nombre || 'Geisha';
  const fincaNombre = finca.nombre_finca || finca.nombre || 'Finca La Esperanza';
  const cafNombre =
    `${caf.nombres || caf.primerNombre || ''} ${caf.apellidos || caf.primerApellido || ''}`.trim() ||
    'Pedro Nel García';
  const catadorNombre =
    `${catadorObj.nombres || 'Ana María'} ${catadorObj.apellidos || 'López Q-Grader'}`.trim();
  const puntaje = Number(raw.puntuacion_sca_global ?? 87.5);
  const conclusion =
    misHojas[0]?.conclusion_catador ||
    raw.objetivo ||
    'Taza limpia y compleja con notas florales, miel de caña y acidez brillante.';
  const fechaStr = raw.fecha_sesion ? String(raw.fecha_sesion).slice(0, 10) : '2026-10-22';

  return {
    ...raw,
    id: raw.id,
    codigo: raw.codigo_sesion || codigoLote,
    codigoLote,
    lote: codigoLote,
    nombre: raw.titulo || `Sesión CVA ${codigoLote}`,
    tituloPerfil: raw.titulo || `Evaluación CVA ${variedad}`,
    objetivo: raw.objetivo || 'Certificación de perfil sensorial CVA / SCA >= 80',
    variedad,
    proceso: pre.proceso || 'Natural',
    finca: fincaNombre,
    caficultor: cafNombre,
    productor: cafNombre,
    catador: catadorNombre,
    puntajeSca: puntaje,
    puntajeTotal: puntaje,
    puntajeFinal: puntaje,
    puntuacionTotal: puntaje.toFixed(2),
    puntaje: `${puntaje.toFixed(2)} pts`,
    perfilSensorialCatador: conclusion,
    perfilSensorial: conclusion,
    notas: conclusion,
    fragancia: 8.8,
    sabor: 8.8,
    balance: 8.7,
    acidez: 8.8,
    cuerpo: 8.6,
    dulzor: 10,
    limpiezaTaza: 10,
    fecha: fechaStr,
    fechaCreacion: fechaStr,
    cantidadMuestras: Number(raw.total_muestras || 1),
    cantidadParticipantes: Math.max(1, misHojas.length),
    cupoMaximo: 5,
    unido: true,
    laboratorio: 'Laboratorio de Calidad Tecnicafé',
    categoria: puntaje >= 85 ? 'Especial Excelente' : puntaje >= 80 ? 'Especial Muy Bueno' : 'Estándar',
    estado: raw.aprobado_para_exportacion ? 'Certificado SCA' : 'En Revisión',
    estadoHoja: raw.aprobado_para_exportacion ? 'Completada' : 'En Proceso',
    estadoEvaluacion: misHojas.length > 0 ? 'Completada' : 'Pendiente',
  };
}

export function mapContenedor(
  raw = {},
  { preofertas = [], fincas = [], caficultores = [], variedades = [], empresas = [], brokers = [] } = {}
) {
  const emp = empresas.find((e) => e.id === raw.empresa_exportadora_id) || empresas[0] || {};
  const brk = brokers.find((b) => b.id === raw.broker_destino_id) || brokers[0] || {};
  const totalKg = Number(raw.capacidad_total_kg ?? 20000);
  const reservadosKg = Number(raw.kilos_reservados ?? 2500);
  const codigo = raw.codigo_contenedor || raw.codigo || 'CONT-USA-2026-01';
  const fechaApertura = raw.fecha_apertura ? String(raw.fecha_apertura).slice(0, 10) : '2026-10-01';
  const fechaCierre = raw.fecha_cierre_reservas ? String(raw.fecha_cierre_reservas).slice(0, 10) : '2026-11-30';
  const fechaZarpe = raw.fecha_estimada_zarpe ? String(raw.fecha_estimada_zarpe).slice(0, 10) : '2026-12-15';

  // Construir variedades disponibles dentro del contenedor a partir de las preofertas reales
  const variedadesCatalogo = preofertas.map((pre, idx) => {
    const finca = fincas.find((f) => f.id === pre.finca_id) || fincas[0] || {};
    const caf = caficultores.find((c) => c.id === pre.caficultor_id) || caficultores[0] || {};
    const varObj = variedades.find((v) => Number(v.id) === Number(pre.variedad_id)) || {};
    const varNombre = varObj.nombre || pre.variedad || 'Geisha';
    const kg = Number(pre.cantidad_kg || 1500);
    const precioCop = Number(pre.precio_esperado_cop || 3500000);
    const precioUsd = Number((precioCop / 125 / 4000 + 8).toFixed(2));
    const cafNombre =
      `${caf.nombres || 'Pedro Nel'} ${caf.apellidos || 'García'}`.trim();

    return {
      id: pre.id || `var-${idx + 1}`,
      codigo: pre.codigo_preoferta || `PRE-2026-00${idx + 1}`,
      nombre: `${varNombre} — ${finca.nombre_finca || 'Finca La Esperanza'}`,
      variedad: varNombre,
      sacos: Math.max(1, Math.round(kg / 70)),
      peso_kg: kg,
      tipoSecado: pre.secado || 'SOL_MARQUESINA',
      puntajeSCA: Number(pre.puntajeSca || 88.5),
      precioCOP: precioCop,
      precioUSD: precioUsd,
      unidadesDisponibles: Math.max(1, Math.round(kg / 24)),
      pedidoMinKg: 24,
      imagen: '/images/portadas/oferta.jpg',
      imagenesFinca: ['/images/portadas/finca.jpg', '/images/portadas/caficultor.jpg'],
      analisisSensorial: {
        Fragancia: 8.8,
        Sabor: 8.9,
        'Sabor residual': 8.7,
        Acidez: 8.8,
        Cuerpo: 8.6,
        Uniformidad: 10,
        Balance: 8.8,
        'Taza limpia': 10,
        Dulzor: 10,
        'Puntaje catador': 8.9,
      },
      historia: {
        caficultor: cafNombre,
        finca: finca.nombre_finca || 'Finca La Esperanza',
        municipio: `${finca.municipio || 'Piendamó'}, ${finca.departamento || 'Cauca'}`,
        altitud: `${finca.altitud_msnm || 1850} msnm`,
        descripcion:
          finca.historia_familiar ||
          'Cultivo familiar de alta montaña enfocado en microlotes de especialidad.',
        certificaciones: ['Orgánico', 'Comercio Justo', 'Trazabilidad QR'],
        foto: '/images/users/user-dummy-img.jpg',
      },
      detalles: {
        proceso: pre.proceso || 'Natural',
        variedad: varNombre,
        altitud: `${finca.altitud_msnm || 1850} msnm`,
        cosecha: '2026',
        beneficio: 'Ecológico Secado Lento',
        notasCata: varObj.perfil_esperado_taza || 'Jazmín, melocotón, miel de azahar y acidez brillante.',
        humedad: '10.8%',
        tamanoGrano: 'Malla 17/18 Supremo',
      },
      ubicacionFinca: {
        lat: Number(finca.latitud || 2.64125),
        lng: Number(finca.longitud || -76.53124),
        nombre: finca.nombre_finca || 'Finca La Esperanza',
      },
    };
  });

  const ofertasAsignadas =
    Array.isArray(raw.ofertas_asignadas) && raw.ofertas_asignadas.length > 0
      ? raw.ofertas_asignadas
      : variedadesCatalogo.map((v) => ({
          codigo: v.codigo,
          variedad: v.variedad,
          sacos: v.sacos,
          peso_kg: v.peso_kg,
        }));

  return {
    ...raw,
    id: raw.id,
    codigo,
    codigo_contenedor: codigo,
    origen: `${raw.puerto_embarque_colombia || 'Buenaventura'}, Colombia`,
    pais_origen: 'Colombia',
    paisDestino: raw.pais_destino || 'Estados Unidos',
    pais_destino: raw.pais_destino || 'Estados Unidos',
    empresa: emp.nombre_comercial || emp.razon_social || 'Improcafé Colombia S.A.S.',
    fechaDisponible: fechaZarpe,
    fecha_apertura: fechaApertura,
    fecha_cierre_estimada: fechaCierre,
    fecha_envio: fechaZarpe,
    fecha_entrega_estimada: fechaZarpe,
    totalKg,
    capacidad_total_kg: totalKg,
    cantidad_cafe_kg: reservadosKg,
    kgDisponibles: Math.max(0, totalKg - reservadosKg),
    temperatura_controlada: raw.temperatura_controlada || '18°C / 60% HR',
    estado: raw.estado === 'LLENO_CERRADO' ? 'Creado' : 'Publicado',
    estadoComprador: 'Disponible',
    ofertas_asignadas: ofertasAsignadas,
    brokers_asignados: [brk.nombre_empresa || 'Green Horizon Specialty Coffee LLC'],
    variedades: variedadesCatalogo,
  };
}

export function mapPedido(
  raw = {},
  { compradores = [], preofertas = [], variedades = [], caficultores = [] } = {}
) {
  const comp = compradores.find((c) => c.id === raw.comprador_id) || compradores[0] || {};
  const pre = preofertas.find((p) => p.id === raw.preoferta_id) || preofertas[0] || {};
  const varObj = variedades.find((v) => Number(v.id) === Number(pre.variedad_id)) || {};
  const caf = caficultores.find((c) => c.id === pre.caficultor_id) || caficultores[0] || {};

  const totalKilos = Number(raw.total_kilos || 2100);
  const precioKg = Number(raw.precio_por_kilo_usd || 14.5);
  const subtotal = Number(raw.monto_total_usd || totalKilos * precioKg);
  const flete = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + flete).toFixed(2));
  const cafNombre = `${caf.nombres || 'Pedro Nel'} ${caf.apellidos || 'García'}`.trim();

  const estadoMap = {
    PENDIENTE_ANTICIPO_30: 'Pago pendiente',
    ANTICIPO_PAGADO_RESERVADO: 'Pago aceptado',
    PENDIENTE_SALDO_70: 'Compra en camino',
    PAGADO_TOTAL_AUTORIZADO: 'Entregado',
    CANCELADO: 'Pago rechazado',
  };

  return {
    ...raw,
    id: raw.id,
    codigo_pedido: raw.codigo_pedido || 'PED-2026-0089',
    fecha: raw.fecha_pedido ? String(raw.fecha_pedido).slice(0, 10) : '2026-10-20',
    comprador_nombre: comp.nombre_empresa || 'The Barn Berlin Roastery',
    comprador_empresa: comp.nombre_empresa || 'The Barn Berlin Roastery',
    comprador: comp.nombre_empresa || 'The Barn Berlin Roastery',
    caficultor: cafNombre,
    lote: pre.codigo_preoferta || 'PRE-2026-0001',
    pais_destino: comp.pais_destino || 'Alemania',
    lotes: [
      {
        codigo: pre.codigo_preoferta || 'PRE-2026-0001',
        variedad: varObj.nombre || 'Geisha',
        cantidad_sacos: Number(raw.cantidad_unidades || 30),
        peso_kg: totalKilos,
        precio_kg: precioKg,
      },
    ],
    subtotal,
    flete,
    total,
    monto: `$${subtotal.toLocaleString('en-US')} USD`,
    comision: `$${(subtotal * 0.05).toLocaleString('en-US')} USD`,
    estado: estadoMap[raw.estado] || 'Pago aceptado',
    estadoBroker: raw.estado === 'PAGADO_TOTAL_AUTORIZADO' ? 'Firmado' : 'En Negociación',
    metodo_pago: 'Transferencia Internacional / Stripe (30% Anticipo / 70% Embarque)',
    referencia_pago: raw.codigo_pedido || 'PED-2026-0089',
    naviera: 'Maersk Line — Contenedor Refrigerado',
  };
}

export function mapUsuario(raw = {}) {
  const rolMap = {
    ADMINISTRADOR: 'SuperAdmin',
    SUPERADMIN: 'SuperAdmin',
    EMPRESA_EXPORTADORA: 'Empresa',
    EMPRESA: 'Empresa',
    CAFICULTOR: 'Caficultor',
    ASISTENTE_TECNICO: 'Técnico',
    TECNICO: 'Técnico',
    LABORATORIO: 'Laboratorio',
    CATADOR: 'Catador',
    BROKER: 'Broker',
    COMPRADOR_INTERNACIONAL: 'Comprador',
    COMPRADOR: 'Comprador',
  };
  const email = raw.correo_electronico || raw.correo || raw.email || 'usuario@conexcoffee.com';
  const nombre = raw.nombre || raw.nombres || email.split('@')[0];

  return {
    ...raw,
    id: raw.id,
    nombre,
    correo: email,
    email,
    correo_electronico: email,
    rol: rolMap[String(raw.rol || '').toUpperCase()] || raw.rol || 'Caficultor',
    estado: raw.activo === false ? 'Inactivo' : 'Activo',
    activo: raw.activo !== false,
    ultimoAcceso: raw.ultimo_acceso
      ? String(raw.ultimo_acceso).slice(0, 10)
      : raw.fecha_registro
      ? String(raw.fecha_registro).slice(0, 10)
      : '2026-10-25',
  };
}

export function mapInspeccion(
  raw = {},
  { preofertas = [], fincas = [], caficultores = [], variedades = [] } = {}
) {
  const pre = preofertas.find((p) => p.id === raw.preoferta_id) || preofertas[0] || {};
  const finca = fincas.find((f) => f.id === pre.finca_id) || fincas[0] || {};
  const caf = caficultores.find((c) => c.id === pre.caficultor_id) || caficultores[0] || {};
  const varObj = variedades.find((v) => Number(v.id) === Number(pre.variedad_id)) || {};

  const fechaStr = raw.fecha_inspeccion ? String(raw.fecha_inspeccion).slice(0, 10) : '2026-10-22';
  const cafNombre = `${caf.nombres || 'Pedro Nel'} ${caf.apellidos || 'García'}`.trim();
  const fincaNombre = finca.nombre_finca || finca.nombre || 'Finca La Esperanza';
  const varNombre = varObj.nombre || pre.variedad || 'Geisha';

  return {
    ...raw,
    id: raw.id,
    codigo: pre.codigo_preoferta || `INSP-${String(raw.id || '').slice(0, 6)}`,
    finca: fincaNombre,
    caficultor: cafNombre,
    municipio: finca.municipio || 'Piendamó',
    departamento: finca.departamento || 'Cauca',
    variedad: varNombre,
    fecha: fechaStr,
    fechaProgramada: fechaStr,
    humedadCampo: `${raw.humedad_estimada_campo || 11.2}%`,
    observaciones:
      raw.observaciones_infraestructura ||
      'Infraestructura de beneficio y secado verificada en óptimas condiciones.',
    estado: raw.resultado_inspeccion === 'RECHAZADA' ? 'Rechazada' : 'Completada',
  };
}

export const mapMuestraYAnalisisFisico = mapMuestraFisica;
export const mapSesionYAnalisisSensorial = mapSesionSensorial;

