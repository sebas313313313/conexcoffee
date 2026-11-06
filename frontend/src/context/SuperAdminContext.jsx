import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { superAdminData } from './superadmin/data';
import { createSuperAdminActions } from './superadmin/actions';
import { selectSuperAdminSummary } from './superadmin/summary';

export const SuperAdminContext = createContext(null);

export const SuperAdminProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(superAdminData);
  const actions = useMemo(() => createSuperAdminActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectSuperAdminSummary(state), [state]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    stats: summary.stats,
    metrics: summary.metrics,
    activity: summary.activity,
    modules: summary.modules,
    usuarios: state.usuarios,
    caficultores: state.caficultores,
    catadores: state.catadores,
    empresas: state.empresas,
    tecnicos: state.tecnicos,
    laboratorios: state.laboratorios,
    brokers: state.brokers,
    compradores: state.compradores,
    fincas: state.fincas,
    variedades: state.variedades,
    lotes: state.lotes,
    preofertas: state.preofertas,
    ofertas: state.ofertas,
    muestras: state.muestras,
    contenedores: state.contenedores,
    compras: state.compras,
    configuracion: state.configuracion,
    createUsuario: actions.createUsuario,
    updateUsuario: actions.updateUsuario,
    toggleEstadoUsuario: actions.toggleEstadoUsuario,
    createCaficultor: actions.createCaficultor,
    updateCaficultor: actions.updateCaficultor,
    asignarEmpresaCaficultor: actions.asignarEmpresaCaficultor,
    createCatador: actions.createCatador,
    updateCatador: actions.updateCatador,
    createEmpresa: actions.createEmpresa,
    updateEmpresa: actions.updateEmpresa,
    createTecnico: actions.createTecnico,
    updateTecnico: actions.updateTecnico,
    createLaboratorio: actions.createLaboratorio,
    updateLaboratorio: actions.updateLaboratorio,
    createBroker: actions.createBroker,
    updateBroker: actions.updateBroker,
    createComprador: actions.createComprador,
    updateComprador: actions.updateComprador,
    createFinca: actions.createFinca,
    updateFinca: actions.updateFinca,
    createLote: actions.createLote,
    createMuestra: actions.createMuestra,
    asignarLaboratorioMuestra: actions.asignarLaboratorioMuestra,
    createContenedor: actions.createContenedor,
    updateContenedor: actions.updateContenedor,
    toggleEstadoContenedor: actions.toggleEstadoContenedor,
    asignarOfertaContenedor: actions.asignarOfertaContenedor,
    updateConfiguracion: actions.updateConfiguracion,
  }), [state, actions, loading, error, refetch, summary]);

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};
