import { mapCaficultor, mapFinca, mapLote, mapPreoferta, mapTecnico, mapLaboratorio, mapBroker, mapMuestraYAnalisisFisico, mapContenedor } from '../mappers.js';

export function selectEmpresaData({ rawUsuarios, rawCaficultores, rawEmpresas, rawTecnicos, rawLaboratorios, rawBrokers, rawFincas, rawVariedades, rawLotes, rawPreofertas, rawEvaluacionesFisicas, rawSesionesCatacion, rawContenedores, rawPedidos, rawInspecciones }) {
  const mappedFincas = rawFincas.map((f) =>
    mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
  );
  const mappedLotes = rawLotes.map((l) =>
    mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
  );
  const mappedCaficultores = rawCaficultores.map((c) =>
    mapCaficultor(c, { fincas: rawFincas, empresas: rawEmpresas, usuarios: rawUsuarios })
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
  const mappedBrokers = rawBrokers.map((b) =>
    mapBroker(b, { pedidos: rawPedidos, usuarios: rawUsuarios })
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
      estado: mapped.estadoEmpresa,
    };
  });
  const mappedOfertas = mappedPreofertas.map((p) => ({
    ...p,
    estado: p.estadoOferta,
  }));
  const mappedOfertasLibres = mappedPreofertas.map((p) => ({
    ...p,
    estado: p.estadoLibre,
  }));
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

  return {
    fincas: mappedFincas,
    lotes: mappedLotes,
    variedades: rawVariedades,
    caficultores: mappedCaficultores,
    tecnicos: mappedTecnicos,
    laboratorios: mappedLaboratorios,
    brokers: mappedBrokers,
    preofertas: mappedPreofertas,
    ofertas: mappedOfertas,
    ofertasLibres: mappedOfertasLibres,
    muestras: mappedMuestras,
    contenedores: mappedContenedores,
  };
}

export const empresaData = {
  createInitialState: () => ({
    precintos: [],
    precintosMeta: null,
    brokers: [],
    caficultores: [],
    contenedores: [],
    laboratorios: [],
    muestras: [],
    preofertas: [],
    ofertas: [],
    ofertasLibres: [],
    tecnicos: [],
    fincas: [],
    lotes: [],
    variedades: [],
  }),
  endpoints: {
    rawUsuarios: '/usuarios-sistema',
    rawCaficultores: '/caficultores',
    rawEmpresas: '/empresas-exportadoras',
    rawTecnicos: '/asistentes-tecnicos',
    rawLaboratorios: '/laboratorios',
    rawBrokers: '/brokers',
    rawFincas: '/fincas',
    rawVariedades: '/variedades-cafe',
    rawLotes: '/lotes-cultivo',
    rawPreofertas: '/preofertas',
    rawEvaluacionesFisicas: '/evaluaciones-fisicas',
    rawSesionesCatacion: '/sesiones-catacion',
    rawContenedores: '/contenedores-virtuales',
    rawPedidos: '/pedidos-internacionales',
    rawInspecciones: '/inspecciones-campo',
  },
  routes: {
    '/empresa/precintos': ['rawTecnicos', 'rawUsuarios', 'rawInspecciones'],
    '/empresa/brokers': ['rawBrokers', 'rawPedidos', 'rawUsuarios'],
    '/empresa/caficultores': ['rawCaficultores', 'rawEmpresas', 'rawFincas', 'rawLotes', 'rawUsuarios'],
    '/empresa/laboratorios': ['rawEvaluacionesFisicas', 'rawLaboratorios', 'rawSesionesCatacion', 'rawUsuarios'],
    '/empresa/tecnicos': ['rawInspecciones', 'rawTecnicos', 'rawUsuarios'],
    '/empresa/pre-ofertas': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/empresa/ofertas-libres': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/empresa/ofertas': ['rawCaficultores', 'rawContenedores', 'rawFincas', 'rawInspecciones', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawTecnicos', 'rawUsuarios', 'rawVariedades'],
    '/empresa/muestras': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawUsuarios', 'rawVariedades'],
    '/empresa/contenedores': ['rawBrokers', 'rawCaficultores', 'rawContenedores', 'rawFincas', 'rawLotes', 'rawPedidos', 'rawPreofertas', 'rawSesionesCatacion', 'rawUsuarios', 'rawVariedades'],
  },
  allSources: ["rawUsuarios", "rawCaficultores", "rawEmpresas", "rawTecnicos", "rawLaboratorios", "rawBrokers", "rawFincas", "rawVariedades", "rawLotes", "rawPreofertas", "rawEvaluacionesFisicas", "rawSesionesCatacion", "rawContenedores", "rawPedidos", "rawInspecciones"],
  select: selectEmpresaData,
};
