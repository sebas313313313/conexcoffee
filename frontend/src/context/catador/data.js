import { mapSesionYAnalisisSensorial } from '../mappers.js';

const sesionesDePrueba = [
  ['G01', 'Geisha Natural de Piendamó'],
  ['B02', 'Borbón Rosado Lavado de Morales'],
  ['C03', 'Castillo de El Tambo'],
].map(([referencia, nombre]) => ({
  id: `demo-catacion-${referencia}`,
  codigo: `DEMO-${referencia}`,
  nombre: `Catación de prueba · ${nombre}`,
  objetivo: 'Practicar el diligenciamiento de la evaluación sensorial.',
  cantidadMuestras: 1,
  estado: referencia === 'G01' ? 'Completada' : 'Pendiente',
  ...(referencia === 'G01' ? { puntuacionTotal: 88.75 } : {}),
  unido: true,
  esDePrueba: true,
}));

export function selectCatadorData({ rawPreofertas, rawCaficultores, rawFincas, rawLotes, rawVariedades, rawCatadores, rawEvaluacionesFisicas, rawSesionesCatacion }, previous) {
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
    evaluaciones: import.meta.env?.DEV
      ? [...mapped, ...(previous?.evaluaciones?.filter((item) => item.esDePrueba) ?? sesionesDePrueba)]
      : mapped,
  };
}

export const catadorData = {
  createInitialState: () => ({
    evaluaciones: import.meta.env?.DEV ? sesionesDePrueba : [],
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
    rawSesionesCatacion: { url: '/sesiones-catacion', allPages: true, strictResponse: true },
  },
  routes: {},
  allSources: ["rawPreofertas", "rawCaficultores", "rawFincas", "rawLotes", "rawVariedades", "rawCatadores", "rawEvaluacionesFisicas", "rawSesionesCatacion"],
  select: selectCatadorData,
};
