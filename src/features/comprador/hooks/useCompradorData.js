import { useMemo } from 'react';
import { useComprador } from '@/hooks/useComprador';
import { toQueryResult } from '@/hooks/contextAdapter';

export const useContenedoresComprador = () => {
  const { contenedores, loading, error, refetch } = useComprador();
  return toQueryResult(contenedores, loading, error, refetch);
};

export const useDetalleContenedorComprador = (id) => {
  const { contenedores, loading, error, refetch } = useComprador();
  const detail = useMemo(
    () => contenedores.find((c) => String(c.id) === String(id)),
    [contenedores, id]
  );
  return {
    data: detail,
    isLoading: Boolean(loading),
    isError: Boolean(error),
    error: error ? new Error(error) : null,
    refetch,
  };
};

export function usePaisesDisponibles(contenedores = []) {
  return useMemo(() => {
    return [...new Set(contenedores.map((c) => c.paisDestino).filter(Boolean))];
  }, [contenedores]);
}
