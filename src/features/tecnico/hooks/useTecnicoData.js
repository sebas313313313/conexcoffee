import { useTecnico } from '@/hooks/useTecnico';
import { toQueryResult, toCreateMutation } from '@/hooks/contextAdapter';

export const useVisitasTecnicas = () => {
  const { visitas, loading, error, refetch } = useTecnico();
  return toQueryResult(visitas, loading, error, refetch);
};

export const useCrearVisitaTecnica = () => {
  const { createVisita } = useTecnico();
  return toCreateMutation(createVisita);
};
