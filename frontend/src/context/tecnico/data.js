import { mapInspeccion } from '../mappers.js';

export function selectTecnicoData({ rawInspecciones, rawPreofertas, rawCaficultores, rawFincas, rawLotes, rawTecnicos }) {
  const mappedVisitas = rawInspecciones.map((ins) =>
    mapInspeccion(ins, {
      preofertas: rawPreofertas,
      caficultores: rawCaficultores,
      fincas: rawFincas,
      lotes: rawLotes,
    })
  );

  return {
    preofertas: rawPreofertas,
    caficultores: rawCaficultores,
    fincas: rawFincas,
    lotes: rawLotes,
    tecnicos: rawTecnicos,
    visitas: mappedVisitas,
  };
}

export const tecnicoData = {
  createInitialState: () => ({
    visitas: [],
    preofertas: [],
    caficultores: [],
    fincas: [],
    lotes: [],
    tecnicos: [],
  }),
  endpoints: {
    rawInspecciones: '/inspecciones-campo',
    rawPreofertas: '/preofertas',
    rawCaficultores: '/caficultores',
    rawFincas: '/fincas',
    rawLotes: '/lotes-cultivo',
    rawTecnicos: '/asistentes-tecnicos',
  },
  routes: {},
  allSources: ["rawInspecciones", "rawPreofertas", "rawCaficultores", "rawFincas", "rawLotes", "rawTecnicos"],
  select: selectTecnicoData,
};
