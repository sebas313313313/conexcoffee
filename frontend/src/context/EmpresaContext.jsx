import { createEmpresaPrecintosActions } from './empresa/precintos';
import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { empresaData } from './empresa/data';
import { createEmpresaActions } from './empresa/actions';
import { selectEmpresaSummary } from './empresa/summary';

export const EmpresaContext = createContext(null);

export const EmpresaProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(empresaData);
  const actions = useMemo(() => createEmpresaActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectEmpresaSummary(state), [state]);
  const precintosActions = useMemo(() => createEmpresaPrecintosActions(setters), [setters]);
  const value = useMemo(() => ({
    ...precintosActions,
    precintos: state.precintos,
    precintosMeta: state.precintosMeta,
    loading,
    error,
    refetch,
    kpis: summary.kpis,
    actividad: summary.actividad,
    brokers: state.brokers,
    caficultores: state.caficultores,
    contenedores: state.contenedores,
    laboratorios: state.laboratorios,
    muestras: state.muestras,
    preofertas: state.preofertas,
    ofertas: state.ofertas,
    ofertasLibres: state.ofertasLibres,
    tecnicos: state.tecnicos,
    createBroker: actions.createBroker,
    updateBroker: actions.updateBroker,
    createCaficultor: actions.createCaficultor,
    updateCaficultor: actions.updateCaficultor,
    createContenedor: actions.createContenedor,
    updateContenedor: actions.updateContenedor,
    createLaboratorio: actions.createLaboratorio,
    updateLaboratorio: actions.updateLaboratorio,
    createMuestra: actions.createMuestra,
    updateMuestra: actions.updateMuestra,
    createPreoferta: actions.createPreoferta,
    updatePreoferta: actions.updatePreoferta,
    createOferta: actions.createOferta,
    updateOferta: actions.updateOferta,
    updateOfertaLibre: actions.updateOfertaLibre,
    createTecnico: actions.createTecnico,
    updateTecnico: actions.updateTecnico,
  }), [state, precintosActions, actions, loading, error, refetch, summary]);

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>;
};
