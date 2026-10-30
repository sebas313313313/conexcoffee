import { useCaficultor } from '@/hooks/useCaficultor';
import { toQueryResult, toCreateMutation, toUpdateMutation } from '@/hooks/contextAdapter';

export const useFincas = () => {
  const { fincas, loading, error, refetch } = useCaficultor();
  return toQueryResult(fincas, loading, error, refetch);
};
export const useCrearFinca = () => {
  const { createFinca } = useCaficultor();
  return toCreateMutation(createFinca);
};
export const useActualizarFinca = () => {
  const { updateFinca } = useCaficultor();
  return toUpdateMutation(updateFinca);
};

export const useLotes = () => {
  const { lotes, loading, error, refetch } = useCaficultor();
  return toQueryResult(lotes, loading, error, refetch);
};
export const useCaficultorLotes = useLotes;
export const useCrearLote = () => {
  const { createLote } = useCaficultor();
  return toCreateMutation(createLote);
};
export const useActualizarLote = () => {
  const { updateLote } = useCaficultor();
  return toUpdateMutation(updateLote);
};

export const usePreofertas = () => {
  const { preofertas, loading, error, refetch } = useCaficultor();
  return toQueryResult(preofertas, loading, error, refetch);
};
export const useCrearPreoferta = () => {
  const { createPreoferta } = useCaficultor();
  return toCreateMutation(createPreoferta);
};
export const useActualizarPreoferta = () => {
  const { updatePreoferta } = useCaficultor();
  return toUpdateMutation(updatePreoferta);
};

export const useOfertas = () => {
  const { ofertas, loading, error, refetch } = useCaficultor();
  return toQueryResult(ofertas, loading, error, refetch);
};
