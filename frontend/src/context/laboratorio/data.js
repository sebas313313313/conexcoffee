import { mapCatador, mapMuestraYAnalisisFisico, mapSesionYAnalisisSensorial } from '../mappers.js';

export function selectLaboratorioData({ rawCatadores, rawLaboratorios, rawCaficultores, rawFincas, rawLotes, rawVariedades, rawPreofertas, rawEvaluacionesFisicas, rawSesionesCatacion }) {
  const mappedCatadores = rawCatadores.map((c) =>
    mapCatador(c, { laboratorios: rawLaboratorios })
  );

  const mappedFisicos = rawEvaluacionesFisicas.map((ev) =>
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

  const mappedSensoriales = rawSesionesCatacion.map((ses) =>
    mapSesionYAnalisisSensorial(ses, {
      preofertas: rawPreofertas,
      caficultores: rawCaficultores,
      fincas: rawFincas,
      lotes: rawLotes,
      variedades: rawVariedades,
      catadores: rawCatadores,
      evaluacionesFisicas: rawEvaluacionesFisicas,
    })
  );

  const mappedMuestras = mappedFisicos.map((m) => ({
    ...m,
    estado: m.estadoMuestraLab || 'Calificada',
  }));

  const mappedResultados = mappedFisicos.map((m) => ({
    ...m,
    estado: m.estadoResultado || 'Aprobada',
  }));

  return {
    laboratorios: rawLaboratorios,
    preofertas: rawPreofertas,
    caficultores: rawCaficultores,
    fincas: rawFincas,
    lotes: rawLotes,
    variedades: rawVariedades,
    catadores: mappedCatadores,
    analisisFisicos: mappedFisicos,
    analisisSensoriales: mappedSensoriales,
    hojasCatacion: mappedSensoriales,
    muestras: mappedMuestras,
    resultados: mappedResultados,
  };
}

export const laboratorioData = {
  createInitialState: () => ({
    catadores: [],
    analisisFisicos: [],
    analisisSensoriales: [],
    hojasCatacion: [],
    muestras: [],
    resultados: [],
    laboratorios: [],
    preofertas: [],
    caficultores: [],
    fincas: [],
    lotes: [],
    variedades: [],
  }),
  endpoints: {
    rawCatadores: '/catadores',
    rawLaboratorios: '/laboratorios',
    rawCaficultores: '/caficultores',
    rawFincas: '/fincas',
    rawLotes: '/lotes-cultivo',
    rawVariedades: '/variedades-cafe',
    rawPreofertas: '/preofertas',
    rawEvaluacionesFisicas: '/evaluaciones-fisicas',
    rawSesionesCatacion: '/sesiones-catacion',
  },
  routes: {
    '/laboratorio/catadores': ['rawCatadores', 'rawLaboratorios'],
    '/laboratorio/dashboard': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/laboratorio/analisis-fisico': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/laboratorio/muestras': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/laboratorio/resultados': ['rawCaficultores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/laboratorio/analisis-sensorial': ['rawCaficultores', 'rawCatadores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/laboratorio/hojas-catacion': ['rawCaficultores', 'rawCatadores', 'rawEvaluacionesFisicas', 'rawFincas', 'rawLaboratorios', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
  },
  allSources: ['rawCatadores', 'rawLaboratorios', 'rawCaficultores', 'rawFincas', 'rawLotes', 'rawVariedades', 'rawPreofertas', 'rawEvaluacionesFisicas', 'rawSesionesCatacion'],
  select: selectLaboratorioData,
};
