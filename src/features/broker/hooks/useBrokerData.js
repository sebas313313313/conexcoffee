import { useBroker } from '@/hooks/useBroker';
import { toQueryResult } from '@/hooks/contextAdapter';

export const useNegociaciones = () => {
  const { negociaciones, loading, error, refetch } = useBroker();
  return toQueryResult(negociaciones, loading, error, refetch);
};
