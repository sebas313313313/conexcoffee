import { mapCaficultor, mapFinca, mapLote, mapPreoferta, mapTecnico, mapLaboratorio, mapBroker, mapMuestraYAnalisisFisico, mapContenedor } from '../mappers.js';

import { crearDetalleSensorial, vincularFichaMuestra } from '../muestras/detalle.js';

export function selectEmpresaData({ rawCaficultores, rawEmpresas, rawTecnicos, rawLaboratorios, rawBrokers, rawFincas, rawVariedades, rawLotes, rawPreofertas, rawEvaluacionesFisicas, rawSesionesCatacion, rawContenedores, rawInspecciones, rawHojasMuestras = [] }) {
  const mappedFincas = rawFincas.map((f) =>
    mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
  );
  const mappedLotes = rawLotes.map((l) =>
    mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
  );
  const mappedCaficultores = rawCaficultores.map((c) =>
    mapCaficultor(c, { fincas: rawFincas, empresas: rawEmpresas })
  );
  const mappedTecnicos = rawTecnicos.map((t) =>
    mapTecnico(t, { inspecciones: rawInspecciones })
  );
  const mappedLaboratorios = rawLaboratorios.map((l) =>
    mapLaboratorio(l, {
      evalFisicas: rawEvaluacionesFisicas,
    })
  );
  const mappedBrokers = rawBrokers.map((b) =>
    mapBroker(b)
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
  const mappedMuestras = rawEvaluacionesFisicas.map((ev) => {
    const muestra = mapMuestraYAnalisisFisico(ev, {
      preofertas: rawPreofertas,
      caficultores: rawCaficultores,
      fincas: rawFincas,
      lotes: rawLotes,
      variedades: rawVariedades,
      laboratorios: rawLaboratorios,
      sesiones: rawSesionesCatacion,
    });
    return {
      ...muestra,
      fichaDetalle: vincularFichaMuestra({ ...ev, estado: muestra.estadoMuestraLab }, {
        preofertas: rawPreofertas, fincas: rawFincas, caficultores: rawCaficultores,
        variedades: rawVariedades, laboratorios: rawLaboratorios, inspecciones: rawInspecciones,
      }),
      detalleSensorial: crearDetalleSensorial(ev.id, rawSesionesCatacion, rawHojasMuestras),
    };
  });
  const mappedContenedores = rawContenedores.map((cnt) =>
    mapContenedor({ ...cnt, ofertas_asignadas: cnt.ofertas_asignadas ?? [] }, {
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
    rawInspecciones: '/inspecciones-campo',
    rawHojasMuestras: { url: '/hojas-catacion-cva', allPages: true },
  },
  routes: {
    '/empresa/ventas': [],
    '/empresa/precintos': ['rawTecnicos', 'rawInspecciones'],
    '/empresa/brokers': ['rawBrokers'],
    '/empresa/caficultores': ['rawCaficultores', 'rawEmpresas', 'rawFincas', 'rawLotes'],
    '/empresa/laboratorios': ['rawEvaluacionesFisicas', 'rawLaboratorios'],
    '/empresa/tecnicos': ['rawInspecciones', 'rawTecnicos'],
    '/empresa/pre-ofertas': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/empresa/ofertas-libres': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/empresa/ofertas': ['rawCaficultores', 'rawContenedores', 'rawFincas', 'rawInspecciones', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawTecnicos', 'rawVariedades'],
    '/empresa/muestras': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawHojasMuestras', 'rawInspecciones', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/empresa/contenedores': ['rawBrokers', 'rawCaficultores', 'rawContenedores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
  },
  allSources: ['rawCaficultores', 'rawEmpresas', 'rawTecnicos', 'rawLaboratorios', 'rawBrokers', 'rawFincas', 'rawVariedades', 'rawLotes', 'rawPreofertas', 'rawEvaluacionesFisicas', 'rawSesionesCatacion', 'rawContenedores', 'rawInspecciones'],
  select: selectEmpresaData,
};
