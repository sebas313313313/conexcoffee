import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { catadorData } from './catador/data';
import { createCatadorActions } from './catador/actions';
import { selectCatadorSummary } from './catador/summary';

export const CatadorContext = createContext(null);

export const CatadorProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(catadorData);
  const actions = useMemo(() => createCatadorActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectCatadorSummary(state), [state]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    stats: summary.stats,
    cataciones: summary.cataciones,
    evaluaciones: state.evaluaciones,
    setEvaluaciones: setters.setEvaluaciones,
    updateEvaluacion: actions.updateEvaluacion,
    previewEvaluationQr: actions.previewEvaluationQr,
    assignEvaluationQr: actions.assignEvaluationQr,
  }), [state, setters, actions, loading, error, refetch, summary]);

  return <CatadorContext.Provider value={value}>{children}</CatadorContext.Provider>;
};
