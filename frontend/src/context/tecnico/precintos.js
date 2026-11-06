import { axiosClient, getErrorMessage } from '../../lib/axios';
import toast from 'react-hot-toast';

export function createTecnicoPrecintosActions({ setPrecintos, setPrecintosMeta }) {
  const cargarMisPrecintos = async (page = 1) => {
    const { data, meta } = await axiosClient.get('/inventario-precintos-qr', {
      params: { page, limit: 100 }, strictResponse: true,
    });
    setPrecintos(Array.isArray(data) ? data : []);
    setPrecintosMeta(meta);
  };

  const vincularSaco = async (payload) => {
    try {
      const { data } = await axiosClient.post('/inventario-precintos-qr/vincular-saco', payload, { strictResponse: true });
      await cargarMisPrecintos(1);
      toast.success('Saco vinculado al precinto');
      return data;
    } catch (error) { toast.error(getErrorMessage(error)); throw error; }
  };

  const cargarFlujoPrecinto = async (token) => {
    const { data } = await axiosClient.get(`/trazabilidad-escaneos/flujo/${token}`, { strictResponse: true });
    return data;
  };

  const corregirVinculo = async (token, payload) => {
    try {
      const { data } = await axiosClient.patch(`/inventario-precintos-qr/vinculos/${token}`, payload, { strictResponse: true });
      await cargarMisPrecintos(1);
      toast.success('Vinculación corregida');
      return data;
    } catch (error) { toast.error(getErrorMessage(error)); throw error; }
  };

  return { cargarMisPrecintos, vincularSaco, cargarFlujoPrecinto, corregirVinculo };
}
