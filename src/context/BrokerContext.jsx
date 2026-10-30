import { createContext, useState, useEffect, useCallback } from 'react';
import { axiosClient, getErrorMessage } from '../lib/axios';
import { mapContenedor, mapPedido } from './mappers';

export const BrokerContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const BrokerProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [negociaciones, setNegociaciones] = useState([]);
  const [contenedores, setContenedores] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        rawContenedores,
        rawPedidos,
        rawPreofertas,
        rawFincas,
        rawLotes,
        rawVariedades,
        rawCaficultores,
        rawSesionesCatacion,
        rawCompradores,
        rawBrokers,
      ] = await Promise.all([
        safeGet('/contenedores-virtuales'),
        safeGet('/pedidos-internacionales'),
        safeGet('/preofertas'),
        safeGet('/fincas'),
        safeGet('/lotes-cultivo'),
        safeGet('/variedades-cafe'),
        safeGet('/caficultores'),
        safeGet('/sesiones-catacion'),
        safeGet('/compradores-internacionales'),
        safeGet('/brokers'),
      ]);

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

      setContenedores(mappedContenedores);
      setNegociaciones(mappedPedidos);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalUsd = negociaciones.reduce((acc, n) => acc + Number(n.totalUsd || 0), 0);

  const stats = [
    {
      label: 'Negociaciones Activas',
      value: String(negociaciones.length),
      change: `${contenedores.length} contenedores en portafolio`,
      iconName: 'Handshake',
    },
    {
      label: 'Volumen Transado (USD)',
      value: `$${totalUsd.toLocaleString()} USD`,
      change: 'Contratos FOB Buenaventura / Cartagena',
      iconName: 'DollarSign',
    },
    {
      label: 'Destinos Internacionales',
      value: '4 Países',
      change: 'Alemania, EE. UU., Japón, Corea',
      iconName: 'Globe2',
    },
    {
      label: 'Tasa de Cierre Comercial',
      value: '94.2%',
      change: 'Lotes Especiales >86 SCA',
      iconName: 'TrendingUp',
    },
  ];

  return (
    <BrokerContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        stats,
        negociaciones,
      }}
    >
      {children}
    </BrokerContext.Provider>
  );
};
