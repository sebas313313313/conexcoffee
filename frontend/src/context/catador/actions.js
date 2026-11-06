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

  return { updateEvaluacion };
}
