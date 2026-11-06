import { mapContenedor, mapPedido } from '../mappers.js';
import { getStored, setStored } from './storage.js';
import {
  BROKER_CONTENEDORES_SEED,
  BROKER_OFERTAS_LIBRES_SEED,
  BROKER_MUESTRAS_SEED,
  BROKER_VENTAS_SEED,
  BROKER_COMPRADORES_SEED,
  BROKER_EVENTOS_SEED,
} from '../../features/broker/data/brokerData.js';

export function selectBrokerData({ rawContenedores, rawPedidos, rawPreofertas, rawFincas, rawLotes, rawVariedades, rawCaficultores, rawSesionesCatacion, rawCompradores, rawBrokers }, previous) {
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
      contenedores: mappedContenedores,
      compradores: rawCompradores,
      brokers: rawBrokers,
    })
  );

  const contenedores = mappedContenedores.length > 0
    ? [
        ...BROKER_CONTENEDORES_SEED,
        ...mappedContenedores.filter(
          (mc) => !BROKER_CONTENEDORES_SEED.some((bc) => bc.codigo === mc.codigo_contenedor)
        ),
      ]
    : previous.contenedores;
  return { negociaciones: mappedPedidos, contenedores };
}

export const brokerData = {
  createInitialState: () => ({
    negociaciones: [],
    contenedores: getStored('conexcoffee_broker_contenedores', BROKER_CONTENEDORES_SEED),
    ofertasLibres: getStored('conexcoffee_broker_ofertas', BROKER_OFERTAS_LIBRES_SEED),
    muestras: getStored('conexcoffee_broker_muestras', BROKER_MUESTRAS_SEED),
    ventas: getStored('conexcoffee_broker_ventas', BROKER_VENTAS_SEED),
    compradores: getStored('conexcoffee_broker_compradores', BROKER_COMPRADORES_SEED),
    eventos: getStored('conexcoffee_broker_eventos', BROKER_EVENTOS_SEED),
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
    rawBrokers: '/brokers',
  },
  routes: {
    '/broker/ofertas': [],
    '/broker/muestras': [],
    '/broker/ventas': [],
    '/broker/compradores': [],
    '/broker/eventos': [],
    '/broker/contenedores': ['rawContenedores', 'rawPreofertas', 'rawFincas', 'rawLotes', 'rawVariedades', 'rawCaficultores', 'rawSesionesCatacion'],
  },
  allSources: ["rawContenedores", "rawPedidos", "rawPreofertas", "rawFincas", "rawLotes", "rawVariedades", "rawCaficultores", "rawSesionesCatacion", "rawCompradores", "rawBrokers"],
  select: selectBrokerData,
  onLoaded(raw, mapped) {
    if (raw.rawContenedores.length > 0 && mapped.contenedores) {
      setStored('conexcoffee_broker_contenedores', mapped.contenedores);
    }
  },
};
