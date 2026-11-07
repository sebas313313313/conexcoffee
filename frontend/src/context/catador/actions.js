import toast from 'react-hot-toast';
import { axiosClient, getErrorMessage } from '../../lib/axios';
import { mapSesionYAnalisisSensorial } from '../mappers';

export function createCatadorActions(state, setters) {
  const { preofertas, caficultores, fincas, lotes, variedades, catadores, evaluacionesFisicas } = state;
  const { setEvaluaciones } = setters;

  const updateEvaluacion = async (id, payload) => {
    try {
      const { data } = await axiosClient.put(`/sesiones-catacion/${id}`, payload);
      setEvaluaciones((prev) =>
        prev.map((ev) =>
          ev.id === id
            ? {
                ...mapSesionYAnalisisSensorial(
                  { ...ev, ...payload, ...data },
                  {
                    preofertas,
                    caficultores,
                    fincas,
                    lotes,
                    variedades,
                    catadores,
                    evaluacionesFisicas,
                  }
                ),
                ...payload,
              }
            : ev
        )
      );
      toast.success('Evaluación sensorial guardada correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const mapEvaluacion = (raw) =>
    mapSesionYAnalisisSensorial(raw, {
      preofertas,
      caficultores,
      fincas,
      lotes,
      variedades,
      catadores,
      evaluacionesFisicas,
    });

  const previewEvaluationQr = async (codigo) => {
    try {
      const { data } = await axiosClient.get(`/sesiones-catacion/codigo/${encodeURIComponent(codigo)}/qr`, { strictResponse: true });
      return mapEvaluacion(data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'No fue posible validar el código QR.'));
      throw err;
    }
  };

  const assignEvaluationQr = async (codigo) => {
    try {
      const { data } = await axiosClient.post(`/sesiones-catacion/codigo/${encodeURIComponent(codigo)}/asignar-qr`, {}, { strictResponse: true });
      const mapped = { ...mapEvaluacion(data.sesion), unido: true, estado: 'En Proceso' };
      setEvaluaciones((prev) => {
        const exists = prev.some((evaluacion) => evaluacion.id === mapped.id);
        return exists ? prev.map((evaluacion) => (evaluacion.id === mapped.id ? { ...evaluacion, ...mapped } : evaluacion)) : [mapped, ...prev];
      });
      toast.success(data.ya_asignada ? 'Esta evaluación ya estaba asignada a tu cuenta.' : 'Evaluación asignada. Ya puedes realizarla.');
      return mapped;
    } catch (err) {
      toast.error(getErrorMessage(err, 'No fue posible asignar la evaluación.'));
      throw err;
    }
  };

  return { updateEvaluacion, previewEvaluationQr, assignEvaluationQr };
}
