import { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../lib/axios';
import { mapContenedor, mapPedido } from './mappers';

export const CompradorContext = createContext(null);

const safeGet = async (url) => {
  try {
    const { data } = await axiosClient.get(url);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const CompradorProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [contenedores, setContenedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [brokers, setBrokers] = useState([]);

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
      setPedidos(mappedPedidos);
      setCompradores(rawCompradores);
      setBrokers(rawBrokers);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createPedido = async (payload) => {
    try {
      const contenedorMatch =
        contenedores.find((c) => c.id === payload.contenedorId || c.codigo === payload.contenedor) ||
        contenedores[0];
      const compradorMatch = compradores[0];
      const brokerMatch = brokers[0];

      const body = {
        codigo_pedido:
          payload.codigo || `ORD-2026-${String(Math.floor(100 + Math.random() * 900))}`,
        contenedor_id: contenedorMatch?.id,
        comprador_id: compradorMatch?.id,
        broker_id: brokerMatch?.id,
        valor_total_usd:
          Number(String(payload.totalEstimado || payload.total || '18500').replace(/[^0-9.]/g, '')) ||
          18500,
        incoterm: payload.incoterm || 'FOB Buenaventura',
        estado: 'ORDEN_CREADA',
      };

      const { data } = await axiosClient.post('/pedidos-internacionales', body);
      const mapped = mapPedido(
        { ...payload, ...data },
        { contenedores, compradores, brokers }
      );
      setPedidos((prev) => [mapped, ...prev]);
      toast.success('Solicitud de compra internacional registrada exitosamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const paisesDisponibles = ['Todos', 'Colombia', 'Etiopía', 'Brasil', 'Perú'];

  return (
    <CompradorContext.Provider
      value={{
        loading,
        error,
        refetch: fetchAll,
        contenedores,
        pedidos,
        paisesDisponibles,
        createPedido,
      }}
    >
      {children}
    </CompradorContext.Provider>
  );
};
