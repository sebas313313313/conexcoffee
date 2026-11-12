import { mapContenedor, mapPedido } from '../mappers.js';

export function selectCompradorData({ rawContenedores, rawPedidos, rawPreofertas, rawFincas, rawLotes, rawVariedades, rawCaficultores, rawSesionesCatacion, rawCompradores }) {
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

  const mappedPedidos = rawPedidos.map((ped) =>
    mapPedido(ped, {
      compradores: rawCompradores,
    })
  );

  return {
    contenedores: mappedContenedores,
    pedidos: mappedPedidos,
    compradores: rawCompradores,
  };
}

export const compradorData = {
  createInitialState: () => ({
    contenedores: [],
    pedidos: [],
    compradores: [],
  }),
  endpoints: {
    rawContenedores: '/contenedores-virtuales',
    rawPedidos: '/pedidos-internacionales',
    rawPreofertas: '/preofertas',
    rawFincas: '/fincas',
    rawLotes: '/lotes-cultivo',
    rawVariedades: '/variedades-cafe',
    rawCaficultores: '/caficultores',
    rawSesionesCatacion: '/sesiones-catacion',
    rawCompradores: '/compradores-internacionales',
  },
  routes: {},
  allSources: ['rawContenedores', 'rawPedidos', 'rawPreofertas', 'rawFincas', 'rawLotes', 'rawVariedades', 'rawCaficultores', 'rawSesionesCatacion', 'rawCompradores'],
  select: selectCompradorData,
};
