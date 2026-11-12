import { createLaboratorioQrActions } from './laboratorio/qr';
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
  const qrActions = useMemo(() => createLaboratorioQrActions(refetch), [refetch]);
  const value = useMemo(() => ({
    ...qrActions,
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
    createAnalisisFisico: actions.createAnalisisFisico,
    updateAnalisisFisico: actions.updateAnalisisFisico,
    createAnalisisSensorial: actions.createAnalisisSensorial,
    updateAnalisisSensorial: actions.updateAnalisisSensorial,
    createHojaCatacion: actions.createHojaCatacion,
    updateHojaCatacion: actions.updateHojaCatacion,
    createMuestra: actions.createMuestra,
    updateMuestra: actions.updateMuestra,
    updateResultado: actions.updateResultado,
  }), [state, qrActions, actions, loading, error, refetch, summary]);

  return <LaboratorioContext.Provider value={value}>{children}</LaboratorioContext.Provider>;
};
