import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import {
  toQueryResult,
  toCreateMutation,
  toUpdateMutation,
} from '@/hooks/contextAdapter';

export const useSuperadminStats = () => {
  const { stats, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(stats, loading, error, refetch);
};

export const useSuperadminMetrics = () => {
  const { metrics, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(metrics, loading, error, refetch);
};

export const useSuperadminActivity = () => {
  const { activity, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(activity, loading, error, refetch);
};

export const useSuperadminModules = () => {
  const { modules, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(modules, loading, error, refetch);
};

export const useSuperadminBrokers = () => {
  const { brokers, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(brokers, loading, error, refetch);
};
export const useCrearSuperadminBroker = () => {
  const { createBroker } = useSuperAdmin();
  return toCreateMutation(createBroker);
};
export const useActualizarSuperadminBroker = () => {
  const { updateBroker } = useSuperAdmin();
  return toUpdateMutation(updateBroker);
};

export const useSuperadminCaficultores = () => {
  const { caficultores, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(caficultores, loading, error, refetch);
};
export const useCrearSuperadminCaficultor = () => {
  const { createCaficultor } = useSuperAdmin();
  return toCreateMutation(createCaficultor);
};
export const useActualizarSuperadminCaficultor = () => {
  const { updateCaficultor } = useSuperAdmin();
  return toUpdateMutation(updateCaficultor);
};

export const useSuperadminCatadores = () => {
  const { catadores, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(catadores, loading, error, refetch);
};
export const useCrearSuperadminCatador = () => {
  const { createCatador } = useSuperAdmin();
  return toCreateMutation(createCatador);
};
export const useActualizarSuperadminCatador = () => {
  const { updateCatador } = useSuperAdmin();
  return toUpdateMutation(updateCatador);
};

export const useSuperadminCompradores = () => {
  const { compradores, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(compradores, loading, error, refetch);
};
export const useCrearSuperadminComprador = () => {
  const { createComprador } = useSuperAdmin();
  return toCreateMutation(createComprador);
};
export const useActualizarSuperadminComprador = () => {
  const { updateComprador } = useSuperAdmin();
  return toUpdateMutation(updateComprador);
};

export const useSuperadminPedidos = () => {
  const { compras, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(compras, loading, error, refetch);
};

export const useSuperadminContenedores = () => {
  const { contenedores, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(contenedores, loading, error, refetch);
};
export const useCrearSuperadminContenedor = () => {
  const { createContenedor } = useSuperAdmin();
  return toCreateMutation(createContenedor);
};
export const useActualizarSuperadminContenedor = () => {
  const { updateContenedor } = useSuperAdmin();
  return toUpdateMutation(updateContenedor);
};

export const useSuperadminEmpresas = () => {
  const { empresas, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(empresas, loading, error, refetch);
};
export const useCrearSuperadminEmpresa = () => {
  const { createEmpresa } = useSuperAdmin();
  return toCreateMutation(createEmpresa);
};
export const useActualizarSuperadminEmpresa = () => {
  const { updateEmpresa } = useSuperAdmin();
  return toUpdateMutation(updateEmpresa);
};

export const useSuperadminFincas = () => {
  const { fincas, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(fincas, loading, error, refetch);
};
export const useCrearSuperadminFinca = () => {
  const { createFinca } = useSuperAdmin();
  return toCreateMutation(createFinca);
};
export const useActualizarSuperadminFinca = () => {
  const { updateFinca } = useSuperAdmin();
  return toUpdateMutation(updateFinca);
};

export const useSuperadminLotes = () => {
  const { lotes, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(lotes, loading, error, refetch);
};
export const useCrearSuperadminLote = () => {
  const { createLote } = useSuperAdmin();
  return toCreateMutation(createLote);
};
export const useActualizarSuperadminLote = () => {
  const { updateLote } = useSuperAdmin();
  return toUpdateMutation(updateLote);
};

export const useSuperadminLaboratorios = () => {
  const { laboratorios, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(laboratorios, loading, error, refetch);
};
export const useCrearSuperadminLaboratorio = () => {
  const { createLaboratorio } = useSuperAdmin();
  return toCreateMutation(createLaboratorio);
};
export const useActualizarSuperadminLaboratorio = () => {
  const { updateLaboratorio } = useSuperAdmin();
  return toUpdateMutation(updateLaboratorio);
};

export const useSuperadminMuestras = () => {
  const { muestras, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(muestras, loading, error, refetch);
};
export const useCrearSuperadminMuestra = () => {
  const { createMuestra } = useSuperAdmin();
  return toCreateMutation(createMuestra);
};
export const useActualizarSuperadminMuestra = () => {
  const { asignarLaboratorioMuestra } = useSuperAdmin();
  return toUpdateMutation(asignarLaboratorioMuestra);
};

export const useSuperadminOfertas = () => {
  const { ofertas, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(ofertas, loading, error, refetch);
};

export const useSuperadminPreofertas = () => {
  const { preofertas, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(preofertas, loading, error, refetch);
};

export const useSuperadminTecnicos = () => {
  const { tecnicos, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(tecnicos, loading, error, refetch);
};
export const useCrearSuperadminTecnico = () => {
  const { createTecnico } = useSuperAdmin();
  return toCreateMutation(createTecnico);
};
export const useActualizarSuperadminTecnico = () => {
  const { updateTecnico } = useSuperAdmin();
  return toUpdateMutation(updateTecnico);
};

export const useSuperadminUsuarios = () => {
  const { usuarios, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(usuarios, loading, error, refetch);
};
export const useCrearSuperadminUsuario = () => {
  const { createUsuario } = useSuperAdmin();
  return toCreateMutation(createUsuario);
};
export const useActualizarSuperadminUsuario = () => {
  const { updateUsuario } = useSuperAdmin();
  return toUpdateMutation(updateUsuario);
};

export const useSuperadminConfiguracion = () => {
  const { configuracion, loading, error, refetch } = useSuperAdmin();
  return toQueryResult(configuracion, loading, error, refetch);
};
