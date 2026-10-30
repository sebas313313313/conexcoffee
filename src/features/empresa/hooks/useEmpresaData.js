import { useEmpresa } from '@/hooks/useEmpresa';
import { toQueryResult, toCreateMutation, toUpdateMutation } from '@/hooks/contextAdapter';

export const useEmpresaKpis = () => {
  const { kpis, loading, error, refetch } = useEmpresa();
  return toQueryResult(kpis, loading, error, refetch);
};

export const useEmpresaActividad = () => {
  const { actividad, loading, error, refetch } = useEmpresa();
  return toQueryResult(actividad, loading, error, refetch);
};

export const useEmpresaBrokers = () => {
  const { brokers, loading, error, refetch } = useEmpresa();
  return toQueryResult(brokers, loading, error, refetch);
};
export const useCrearEmpresaBroker = () => {
  const { createBroker } = useEmpresa();
  return toCreateMutation(createBroker);
};
export const useActualizarEmpresaBroker = () => {
  const { updateBroker } = useEmpresa();
  return toUpdateMutation(updateBroker);
};

export const useEmpresaCaficultores = () => {
  const { caficultores, loading, error, refetch } = useEmpresa();
  return toQueryResult(caficultores, loading, error, refetch);
};
export const useCrearEmpresaCaficultor = () => {
  const { createCaficultor } = useEmpresa();
  return toCreateMutation(createCaficultor);
};
export const useActualizarEmpresaCaficultor = () => {
  const { updateCaficultor } = useEmpresa();
  return toUpdateMutation(updateCaficultor);
};

export const useEmpresaContenedores = () => {
  const { contenedores, loading, error, refetch } = useEmpresa();
  return toQueryResult(contenedores, loading, error, refetch);
};
export const useCrearEmpresaContenedor = () => {
  const { createContenedor } = useEmpresa();
  return toCreateMutation(createContenedor);
};
export const useActualizarEmpresaContenedor = () => {
  const { updateContenedor } = useEmpresa();
  return toUpdateMutation(updateContenedor);
};

export const useEmpresaLaboratorios = () => {
  const { laboratorios, loading, error, refetch } = useEmpresa();
  return toQueryResult(laboratorios, loading, error, refetch);
};
export const useCrearEmpresaLaboratorio = () => {
  const { createLaboratorio } = useEmpresa();
  return toCreateMutation(createLaboratorio);
};
export const useActualizarEmpresaLaboratorio = () => {
  const { updateLaboratorio } = useEmpresa();
  return toUpdateMutation(updateLaboratorio);
};

export const useEmpresaMuestras = () => {
  const { muestras, loading, error, refetch } = useEmpresa();
  return toQueryResult(muestras, loading, error, refetch);
};
export const useCrearEmpresaMuestra = () => {
  const { createMuestra } = useEmpresa();
  return toCreateMutation(createMuestra);
};
export const useActualizarEmpresaMuestra = () => {
  const { updateMuestra } = useEmpresa();
  return toUpdateMutation(updateMuestra);
};

export const useEmpresaPreofertas = () => {
  const { preofertas, loading, error, refetch } = useEmpresa();
  return toQueryResult(preofertas, loading, error, refetch);
};
export const useCrearEmpresaPreoferta = () => {
  const { createPreoferta } = useEmpresa();
  return toCreateMutation(createPreoferta);
};
export const useActualizarEmpresaPreoferta = () => {
  const { updatePreoferta } = useEmpresa();
  return toUpdateMutation(updatePreoferta);
};

export const useEmpresaOfertas = () => {
  const { ofertas, loading, error, refetch } = useEmpresa();
  return toQueryResult(ofertas, loading, error, refetch);
};
export const useCrearEmpresaOferta = () => {
  const { createOferta } = useEmpresa();
  return toCreateMutation(createOferta);
};
export const useActualizarEmpresaOferta = () => {
  const { updateOferta } = useEmpresa();
  return toUpdateMutation(updateOferta);
};

export const useEmpresaTecnicos = () => {
  const { tecnicos, loading, error, refetch } = useEmpresa();
  return toQueryResult(tecnicos, loading, error, refetch);
};
export const useCrearEmpresaTecnico = () => {
  const { createTecnico } = useEmpresa();
  return toCreateMutation(createTecnico);
};
export const useActualizarEmpresaTecnico = () => {
  const { updateTecnico } = useEmpresa();
  return toUpdateMutation(updateTecnico);
};

export const useEmpresaOfertasLibres = () => {
  const { ofertasLibres, loading, error, refetch } = useEmpresa();
  return toQueryResult(ofertasLibres, loading, error, refetch);
};
export const useCrearEmpresaOfertaLibre = () => {
  const { createPreoferta } = useEmpresa();
  return toCreateMutation(createPreoferta);
};
export const useActualizarEmpresaOfertaLibre = () => {
  const { updateOfertaLibre } = useEmpresa();
  return toUpdateMutation(updateOfertaLibre);
};
