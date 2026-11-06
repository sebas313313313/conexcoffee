import { useBroker } from '@/hooks/useBroker';
import { toQueryResult } from '@/hooks/contextAdapter';

export const useNegociaciones = () => {
  const { negociaciones, loading, error, refetch } = useBroker();
  return toQueryResult(negociaciones, loading, error, refetch);
};

export const useBrokerContenedores = () => {
  const { contenedores, loading, error, refetch } = useBroker();
  return toQueryResult(contenedores, loading, error, refetch);
};

export const useBrokerOfertas = () => {
  const { ofertasLibres, loading, error, refetch } = useBroker();
  return toQueryResult(ofertasLibres, loading, error, refetch);
};

export const useBrokerMuestras = () => {
  const { muestras, loading, error, refetch } = useBroker();
  return toQueryResult(muestras, loading, error, refetch);
};

export const useBrokerVentas = () => {
  const { ventas, loading, error, refetch } = useBroker();
  return toQueryResult(ventas, loading, error, refetch);
};

export const useBrokerCompradores = () => {
  const { compradores, loading, error, refetch } = useBroker();
  return toQueryResult(compradores, loading, error, refetch);
};

export const useBrokerEventos = () => {
  const { eventos, loading, error, refetch } = useBroker();
  return toQueryResult(eventos, loading, error, refetch);
};
