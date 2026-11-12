import { axiosClient, getErrorMessage } from '../../lib/axios';
import toast from 'react-hot-toast';

export function createEmpresaPrecintosActions({ setPrecintos, setPrecintosMeta }) {
  const cargarPrecintos = async (page = 1) => {
    const { data, meta } = await axiosClient.get('/inventario-precintos-qr', {
      params: { page, limit: 100 }, strictResponse: true,
    });
    setPrecintos(Array.isArray(data) ? data : []);
    setPrecintosMeta(meta);
  };

  const crearLotePrecintos = async (payload) => {
    try {
      const { data } = await axiosClient.post('/inventario-precintos-qr/lotes', payload, { strictResponse: true });
      await cargarPrecintos(1);
      toast.success(`${data.cantidad} precintos creados`);
      return data;
    } catch (error) { toast.error(getErrorMessage(error)); throw error; }
  };

  const entregarPrecintos = async (payload) => {
    try {
      const { data } = await axiosClient.post('/inventario-precintos-qr/entregas', payload, { strictResponse: true });
      await cargarPrecintos(1);
      toast.success(`${data.entregados} precintos entregados`);
      return data;
    } catch (error) { toast.error(getErrorMessage(error)); throw error; }
  };

  const anularPrecinto = async (id, motivo) => {
    try {
      await axiosClient.patch(`/inventario-precintos-qr/${id}/anular`, { motivo }, { strictResponse: true });
      await cargarPrecintos(1);
      toast.success('Precinto anulado');
    } catch (error) { toast.error(getErrorMessage(error)); throw error; }
  };

  const generarQrPrecintos = async (precintos, signal) => {
    const items = precintos.map((precinto) => ({
      id: precinto.id,
      label: precinto.codigo_suncho_precinto,
      data: `${window.location.origin}/trazabilidad/${encodeURIComponent(precinto.token_qr_externo)}`,
    }));
    const { data } = await axiosClient.post('/qr/batch', { items }, { signal, strictResponse: true });
    return data.items;
  };

  return { cargarPrecintos, crearLotePrecintos, entregarPrecintos, anularPrecinto, generarQrPrecintos };
}
