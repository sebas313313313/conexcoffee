import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { tecnicoData } from './tecnico/data';
import { createTecnicoActions } from './tecnico/actions';
import { selectTecnicoSummary } from './tecnico/summary';

export const TecnicoContext = createContext(null);

export const TecnicoProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(tecnicoData);
  const actions = useMemo(() => createTecnicoActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectTecnicoSummary(state), [state]);
  const value = useMemo(() => ({
    loading,
    error,
    refetch,
    stats: summary.stats,
    visitas: state.visitas,
    createVisita: actions.createVisita,
  }), [state, actions, loading, error, refetch, summary]);

  return <TecnicoContext.Provider value={value}>{children}</TecnicoContext.Provider>;
};
