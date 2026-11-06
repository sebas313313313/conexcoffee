import { mapSesionYAnalisisSensorial } from '../mappers.js';

export function selectCatadorData({ rawPreofertas, rawCaficultores, rawFincas, rawLotes, rawVariedades, rawCatadores, rawEvaluacionesFisicas, rawSesionesCatacion }) {
  const mapped = rawSesionesCatacion.map((ses) =>
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

  return {
    preofertas: rawPreofertas,
    caficultores: rawCaficultores,
    fincas: rawFincas,
    lotes: rawLotes,
    variedades: rawVariedades,
    catadores: rawCatadores,
    evaluacionesFisicas: rawEvaluacionesFisicas,
    evaluaciones: mapped,
  };
}

export const catadorData = {
  createInitialState: () => ({
    evaluaciones: [],
    preofertas: [],
    caficultores: [],
    fincas: [],
    lotes: [],
    variedades: [],
    catadores: [],
    evaluacionesFisicas: [],
  }),
  endpoints: {
    rawPreofertas: '/preofertas',
    rawCaficultores: '/caficultores',
    rawFincas: '/fincas',
    rawLotes: '/lotes-cultivo',
    rawVariedades: '/variedades-cafe',
    rawCatadores: '/catadores',
    rawEvaluacionesFisicas: '/evaluaciones-fisicas',
    rawSesionesCatacion: '/sesiones-catacion',
  },
  routes: {},
  allSources: ["rawPreofertas", "rawCaficultores", "rawFincas", "rawLotes", "rawVariedades", "rawCatadores", "rawEvaluacionesFisicas", "rawSesionesCatacion"],
  select: selectCatadorData,
};
