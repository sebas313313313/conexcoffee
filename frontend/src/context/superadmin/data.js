import { mapUsuario, mapCaficultor, mapFinca, mapLote, mapPreoferta, mapEmpresa, mapTecnico, mapLaboratorio, mapCatador, mapBroker, mapComprador, mapMuestraYAnalisisFisico, mapContenedor, mapPedido } from '../mappers.js';

export function selectSuperAdminData({ rawUsuarios, rawCaficultores, rawCatadores, rawEmpresas, rawTecnicos, rawLaboratorios, rawBrokers, rawCompradores, rawFincas, rawVariedades, rawLotes, rawPreofertas, rawEvaluacionesFisicas, rawSesionesCatacion, rawContenedores, rawPedidos, rawInspecciones, rawAlertas }) {
  const mappedUsuarios = rawUsuarios.map(mapUsuario);
  const mappedFincas = rawFincas.map((f) =>
    mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
  );
  const mappedLotes = rawLotes.map((l) =>
    mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
  );
  const mappedCaficultores = rawCaficultores.map((c) =>
    mapCaficultor(c, {
      fincas: rawFincas,
      empresas: rawEmpresas,
      usuarios: rawUsuarios,
    })
  );
  const mappedEmpresas = rawEmpresas.map((e) =>
    mapEmpresa(e, {
      caficultores: rawCaficultores,
      preofertas: rawPreofertas,
      usuarios: rawUsuarios,
    })
  );
  const mappedTecnicos = rawTecnicos.map((t) =>
    mapTecnico(t, { inspecciones: rawInspecciones, usuarios: rawUsuarios })
  );
  const mappedLaboratorios = rawLaboratorios.map((l) =>
    mapLaboratorio(l, {
      evaluacionesFisicas: rawEvaluacionesFisicas,
      sesionesCatacion: rawSesionesCatacion,
      usuarios: rawUsuarios,
    })
  );
  const mappedCatadores = rawCatadores.map((c) =>
    mapCatador(c, {
      laboratorios: rawLaboratorios,
      sesionesCatacion: rawSesionesCatacion,
      usuarios: rawUsuarios,
    })
  );
  const mappedBrokers = rawBrokers.map((b) =>
    mapBroker(b, { pedidos: rawPedidos, usuarios: rawUsuarios })
  );
  const mappedCompradores = rawCompradores.map((c) =>
    mapComprador(c, { pedidos: rawPedidos, usuarios: rawUsuarios })
  );
  const mappedPreofertas = rawPreofertas.map((p) => {
    const mapped = mapPreoferta(p, {
      caficultores: rawCaficultores,
      fincas: rawFincas,
      lotes: rawLotes,
      variedades: rawVariedades,
      sesiones: rawSesionesCatacion,
    });
    return {
      ...mapped,
      caficultorObj: mapped.caficultor,
      fincaObj: mapped.finca,
      caficultor: mapped.caficultor_nombre || 'Pedro Nel García',
      finca: mapped.finca_nombre || 'Finca La Esperanza',
      fechaRegistro: mapped.fecha_creacion || '2026-10-20',
    };
  });
  const mappedMuestras = rawEvaluacionesFisicas.map((ev) =>
    mapMuestraYAnalisisFisico(ev, {
      preofertas: rawPreofertas,
      caficultores: rawCaficultores,
      fincas: rawFincas,
      lotes: rawLotes,
      variedades: rawVariedades,
      laboratorios: rawLaboratorios,
      sesiones: rawSesionesCatacion,
    })
  );
  const mappedContenedores = rawContenedores.map((cnt) =>
    mapContenedor(cnt, {
      preofertas: rawPreofertas,
      fincas: rawFincas,
      lotes: rawLotes,
      variedades: rawVariedades,
      caficultores: rawCaficultores,
      sesiones: rawSesionesCatacion,
    })
  );
  const mappedCompras = rawPedidos.map((ped) =>
    mapPedido(ped, {
      contenedores: mappedContenedores,
      compradores: rawCompradores,
      brokers: rawBrokers,
    })
  );

  return {
    usuarios: mappedUsuarios,
    caficultores: mappedCaficultores,
    catadores: mappedCatadores,
    empresas: mappedEmpresas,
    tecnicos: mappedTecnicos,
    laboratorios: mappedLaboratorios,
    brokers: mappedBrokers,
    compradores: mappedCompradores,
    fincas: mappedFincas,
    variedades: rawVariedades,
    lotes: mappedLotes,
    preofertas: mappedPreofertas,
    ofertas: mappedPreofertas,
    muestras: mappedMuestras,
    contenedores: mappedContenedores,
    compras: mappedCompras,
    alertas: rawAlertas,
  };
}

export const superAdminData = {
  createInitialState: () => ({
    usuarios: [],
    caficultores: [],
    catadores: [],
    empresas: [],
    tecnicos: [],
    laboratorios: [],
    brokers: [],
    compradores: [],
    fincas: [],
    variedades: [],
    lotes: [],
    preofertas: [],
    ofertas: [],
    muestras: [],
    contenedores: [],
    compras: [],
    alertas: [],
  configuracion: {
    nombrePlataforma: 'ConexCoffee Global',
    correoSoporte: 'soporte@conexcoffee.com',
    telefonoSoporte: '+57 310 555 0199',
    monedaBase: 'USD',
    tasaCambioCop: 4200,
    puntajeScaMinimo: 84.0,
    humedadMaximaPermitida: 12.0,
    notificacionesEmail: true,
    dobleFactorObligatorio: false,
    mantenimientoActivo: false,
  },
  }),
  endpoints: {
    rawUsuarios: '/usuarios-sistema',
    rawCaficultores: '/caficultores',
    rawCatadores: '/catadores',
    rawEmpresas: '/empresas-exportadoras',
    rawTecnicos: '/asistentes-tecnicos',
    rawLaboratorios: '/laboratorios',
    rawBrokers: '/brokers',
    rawCompradores: '/compradores-internacionales',
    rawFincas: '/fincas',
    rawVariedades: '/variedades-cafe',
    rawLotes: '/lotes-cultivo',
    rawPreofertas: '/preofertas',
    rawEvaluacionesFisicas: '/evaluaciones-fisicas',
    rawSesionesCatacion: '/sesiones-catacion',
    rawContenedores: '/contenedores-virtuales',
    rawPedidos: '/pedidos-internacionales',
    rawInspecciones: '/inspecciones-campo',
    rawAlertas: '/alertas-seguridad',
  },
  routes: {
    '/superadmin/users': ['rawUsuarios'],
    '/superadmin/caficultores': ['rawCaficultores', 'rawEmpresas', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawUsuarios'],
    '/superadmin/catadores': ['rawCatadores', 'rawLaboratorios', 'rawSesionesCatacion', 'rawUsuarios'],
    '/superadmin/empresas': ['rawCaficultores', 'rawEmpresas', 'rawPreofertas', 'rawUsuarios'],
    '/superadmin/tecnicos': ['rawInspecciones', 'rawTecnicos', 'rawUsuarios'],
    '/superadmin/laboratorios': ['rawEvaluacionesFisicas', 'rawLaboratorios', 'rawSesionesCatacion', 'rawUsuarios'],
    '/superadmin/brokers': ['rawBrokers', 'rawPedidos', 'rawUsuarios'],
    '/superadmin/compradores': ['rawCompradores', 'rawPedidos', 'rawUsuarios'],
    '/superadmin/fincas': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawVariedades'],
    '/superadmin/ofertas': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/superadmin/muestras': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawUsuarios', 'rawVariedades'],
    '/superadmin/contenedores': ['rawCaficultores', 'rawContenedores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/superadmin/compras': ['rawBrokers', 'rawCaficultores', 'rawCompradores', 'rawContenedores', 'rawFincas', 'rawLotes', 'rawPedidos', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/superadmin/blog': [],
    '/superadmin/settings': [],
  },
  allSources: ["rawUsuarios", "rawCaficultores", "rawCatadores", "rawEmpresas", "rawTecnicos", "rawLaboratorios", "rawBrokers", "rawCompradores", "rawFincas", "rawVariedades", "rawLotes", "rawPreofertas", "rawEvaluacionesFisicas", "rawSesionesCatacion", "rawContenedores", "rawPedidos", "rawInspecciones", "rawAlertas"],
  select: selectSuperAdminData,
};
