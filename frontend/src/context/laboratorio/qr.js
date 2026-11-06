import { axiosClient } from '../../lib/axios';
import toast from 'react-hot-toast';

export function createLaboratorioQrActions(refetch) {
  const cargarFlujoPrecinto = async (token) => {
    const { data } = await axiosClient.get(`/trazabilidad-escaneos/flujo/${token}`, { strictResponse: true });
    return data;
  };

  const registrarAnalisisQr = async (token, payload) => {
    const { data } = await axiosClient.post(`/trazabilidad-escaneos/laboratorio/${token}/analisis`, payload, { strictResponse: true });
    await refetch();
    toast.success('Análisis físico registrado');
    return data;
  };

  return { cargarFlujoPrecinto, registrarAnalisisQr };
}
