import { mapFinca, mapLote, mapPreoferta } from '../mappers.js';

export function selectCaficultorData({ rawCaficultores, rawFincas, rawVariedades, rawLotes, rawPreofertas, rawSesionesCatacion }) {
  const mappedFincas = rawFincas.map((f) =>
    mapFinca(f, { caficultores: rawCaficultores, lotes: rawLotes })
  );
  const mappedLotes = rawLotes.map((l) =>
    mapLote(l, { fincas: rawFincas, variedades: rawVariedades })
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
      estado: mapped.estadoCaficultor,
    };
  });
  const mappedOfertas = mappedPreofertas.map((p) => ({
    ...p,
    estado: p.estadoOferta,
  }));

  return {
    caficultores: rawCaficultores,
    variedades: rawVariedades,
    fincas: mappedFincas,
    lotes: mappedLotes,
    preofertas: mappedPreofertas,
    ofertas: mappedOfertas,
  };
}

export const caficultorData = {
  createInitialState: () => ({
    fincas: [],
    lotes: [],
    preofertas: [],
    ofertas: [],
    variedades: [],
    caficultores: [],
  }),
  endpoints: {
    rawCaficultores: '/caficultores',
    rawFincas: '/fincas',
    rawVariedades: '/variedades-cafe',
    rawLotes: '/lotes-cultivo',
    rawPreofertas: '/preofertas',
    rawSesionesCatacion: '/sesiones-catacion',
  },
  routes: {
    '/caficultor/fincas': ['rawCaficultores', 'rawFincas', 'rawLotes'],
    '/caficultor/lotes': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawVariedades'],
    '/caficultor/pre-ofertas': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
    '/caficultor/ofertas': ['rawCaficultores', 'rawFincas', 'rawLotes', 'rawPreofertas', 'rawSesionesCatacion', 'rawVariedades'],
  },
  allSources: ["rawCaficultores", "rawFincas", "rawVariedades", "rawLotes", "rawPreofertas", "rawSesionesCatacion"],
  select: selectCaficultorData,
};
