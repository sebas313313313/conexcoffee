import { useCatador } from '@/hooks/useCatador';
import { toQueryResult, toUpdateMutation } from '@/hooks/contextAdapter';

export const useCataciones = () => {
  const { cataciones, loading, error, refetch } = useCatador();
  return toQueryResult(cataciones, loading, error, refetch);
};

export const useEvaluaciones = () => {
  const { evaluaciones, loading, error, refetch } = useCatador();
  return toQueryResult(evaluaciones, loading, error, refetch);
};

export const useActualizarEvaluacion = () => {
  const { updateEvaluacion } = useCatador();
  return toUpdateMutation(updateEvaluacion);
};
