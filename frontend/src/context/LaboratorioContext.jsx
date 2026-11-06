import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { laboratorioData } from './laboratorio/data';
import { createLaboratorioActions } from './laboratorio/actions';
import { selectLaboratorioSummary } from './laboratorio/summary';

export const LaboratorioContext = createContext(null);

export const LaboratorioProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(laboratorioData);
  const actions = useMemo(() => createLaboratorioActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectLaboratorioSummary(state), [state]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    stats: summary.stats,
    muestrasResumen: summary.muestrasResumen,
    catadores: state.catadores,
    analisisFisicos: state.analisisFisicos,
    analisisSensoriales: state.analisisSensoriales,
    hojasCatacion: state.hojasCatacion,
    muestras: state.muestras,
    resultados: state.resultados,
    createCatador: actions.createCatador,
    updateCatador: actions.updateCatador,
    removeCatador: actions.removeCatador,
    createAnalisisFisico: actions.createAnalisisFisico,
    updateAnalisisFisico: actions.updateAnalisisFisico,
    createAnalisisSensorial: actions.createAnalisisSensorial,
    updateAnalisisSensorial: actions.updateAnalisisSensorial,
    createHojaCatacion: actions.createHojaCatacion,
    updateHojaCatacion: actions.updateHojaCatacion,
    createMuestra: actions.createMuestra,
    updateMuestra: actions.updateMuestra,
    updateResultado: actions.updateResultado,
  }), [state, actions, loading, error, refetch, summary]);

  return <LaboratorioContext.Provider value={value}>{children}</LaboratorioContext.Provider>;
};
