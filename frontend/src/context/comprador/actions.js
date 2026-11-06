import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapPedido } from '../mappers';

export function createCompradorActions(state, setters) {
  const { contenedores, compradores, brokers } = state;
  const { setPedidos } = setters;

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

  return { createPedido };
}
