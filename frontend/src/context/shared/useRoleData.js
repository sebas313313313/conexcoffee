import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import { createRoleDataController } from './roleDataController';

async function readCollection(url, signal) {
  try {
    const { data } = await api.get(url, { signal });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (signal.aborted) throw error;
    // Conserva la tolerancia a endpoints opcionales que tenían los Providers.
    return [];
  }
}

/** Carga únicamente las dependencias de la pantalla montada bajo el Provider. */
export function useRoleData(definition) {
  const { pathname } = useLocation();
  const [controller] = useState(() => createRoleDataController(definition, readCollection));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const sources = definition.routes[pathname] ?? definition.allSources;
  const scope = sources.join('|');

  useEffect(() => {
    void controller.load(scope, sources);
    return controller.cancel;
  }, [controller, scope, sources]);

  const refetch = useCallback(() => controller.load(scope, sources), [controller, scope, sources]);

  return {
    state: snapshot.data,
    setters: controller.setters,
    loading: snapshot.scope !== scope || snapshot.loading,
    error: snapshot.scope === scope ? snapshot.error : null,
    refetch,
  };
}
