import { useLaboratorio } from '@/hooks/useLaboratorio';
import {
  toQueryResult,
  toCreateMutation,
  toUpdateMutation,
  toRemoveMutation,
} from '@/hooks/contextAdapter';

export const useMuestrasResumen = () => {
  const { muestrasResumen, loading, error, refetch } = useLaboratorio();
  return toQueryResult(muestrasResumen, loading, error, refetch);
};

export const useCatadores = () => {
  const { catadores, loading, error, refetch } = useLaboratorio();
  return toQueryResult(catadores, loading, error, refetch);
};
export const useCrearCatador = () => {
  const { createCatador } = useLaboratorio();
  return toCreateMutation(createCatador);
};
export const useActualizarCatador = () => {
  const { updateCatador } = useLaboratorio();
  return toUpdateMutation(updateCatador);
};
export const useEliminarCatador = () => {
  const { removeCatador } = useLaboratorio();
  return toRemoveMutation(removeCatador);
};

export const useAnalisisFisicos = () => {
  const { analisisFisicos, loading, error, refetch } = useLaboratorio();
  return toQueryResult(analisisFisicos, loading, error, refetch);
};
export const useCrearAnalisisFisico = () => {
  const { createAnalisisFisico } = useLaboratorio();
  return toCreateMutation(createAnalisisFisico);
};
export const useActualizarAnalisisFisico = () => {
  const { updateAnalisisFisico } = useLaboratorio();
  return toUpdateMutation(updateAnalisisFisico);
};

export const useAnalisisSensoriales = () => {
  const { analisisSensoriales, loading, error, refetch } = useLaboratorio();
  return toQueryResult(analisisSensoriales, loading, error, refetch);
};
export const useCrearAnalisisSensorial = () => {
  const { createAnalisisSensorial } = useLaboratorio();
  return toCreateMutation(createAnalisisSensorial);
};
export const useActualizarAnalisisSensorial = () => {
  const { updateAnalisisSensorial } = useLaboratorio();
  return toUpdateMutation(updateAnalisisSensorial);
};

export const useHojasCatacion = () => {
  const { hojasCatacion, loading, error, refetch } = useLaboratorio();
  return toQueryResult(hojasCatacion, loading, error, refetch);
};
export const useActualizarHojaCatacion = () => {
  const { updateHojaCatacion } = useLaboratorio();
  return toUpdateMutation(updateHojaCatacion);
};

export const useMuestras = () => {
  const { muestras, loading, error, refetch } = useLaboratorio();
  return toQueryResult(muestras, loading, error, refetch);
};
export const useCrearMuestra = () => {
  const { createMuestra } = useLaboratorio();
  return toCreateMutation(createMuestra);
};
export const useActualizarMuestra = () => {
  const { updateMuestra } = useLaboratorio();
  return toUpdateMutation(updateMuestra);
};

export const useResultados = () => {
  const { resultados, loading, error, refetch } = useLaboratorio();
  return toQueryResult(resultados, loading, error, refetch);
};
export const useActualizarResultado = () => {
  const { updateResultado } = useLaboratorio();
  return toUpdateMutation(updateResultado);
};
