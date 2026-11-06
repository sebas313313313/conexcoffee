import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapInspeccion } from '../mappers';

export function createTecnicoActions(state, setters) {
  const { preofertas, caficultores, fincas, lotes, tecnicos } = state;
  const { setVisitas } = setters;

  const createVisita = async (payload) => {
    try {
      const preMatch = preofertas[0];
      const tecMatch = tecnicos[0];
      const body = {
        preoferta_id: payload.preoferta_id || preMatch?.id,
        asistente_tecnico_id: payload.asistente_tecnico_id || tecMatch?.id,
        fecha_inspeccion: payload.fecha || new Date().toISOString().slice(0, 10),
        altitud_medida_msnm: Number(String(payload.altitud || '1750').replace(/[^0-9.]/g, '')) || 1750,
        humedad_relativa_ambiente: 68.5,
        observaciones_agronomicas:
          payload.recomendacion || payload.observaciones || 'Inspección fitosanitaria aprobada en campo.',
        es_aprobada: true,
      };
      const { data } = await axiosClient.post('/inspecciones-campo', body);
      const mapped = mapInspeccion(
        { ...payload, ...data },
        { preofertas, caficultores, fincas, lotes }
      );
      setVisitas((prev) => [mapped, ...prev]);
      toast.success('Acta de visita técnica registrada correctamente');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  return { createVisita };
}
