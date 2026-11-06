/**
 * Estado y ciclo de vida de las colecciones de un Provider.
 * La caché pertenece a esta instancia: nunca se comparte entre roles o sesiones.
 */
export function createRoleDataController(definition, request) {
  let snapshot = {
    data: definition.createInitialState(),
    scope: null,
    loading: true,
    error: null,
  };
  const listeners = new Set();
  let activeRequest = null;
  let generation = 0;
  const revisions = {};

  const publish = (next) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const cancel = () => {
    generation += 1;
    activeRequest?.controller.abort();
    activeRequest = null;
  };

  const setters = Object.fromEntries(
    Object.keys(snapshot.data).map((field) => [
      `set${field[0].toUpperCase()}${field.slice(1)}`,
      (update) => {
        // Las demás colecciones pueden terminar de cargar sin pisar esta mutación.
        revisions[field] = (revisions[field] || 0) + 1;
        const previous = snapshot.data[field];
        const value = typeof update === 'function' ? update(previous) : update;
        publish({ ...snapshot, data: { ...snapshot.data, [field]: value } });
      },
    ])
  );

  const load = (scope, sources) => {
    if (activeRequest?.scope === scope) return activeRequest.promise;
    cancel();
    const currentGeneration = generation;
    const initialRevisions = { ...revisions };
    const controller = new AbortController();
    publish({ ...snapshot, scope, loading: true, error: null });

    const promise = Promise.all(
      sources.map(async (source) => {
        const data = await request(definition.endpoints[source], controller.signal);
        return [source, data];
      })
    ).then((entries) => {
      if (currentGeneration !== generation || controller.signal.aborted) return;
      const raw = Object.fromEntries(Object.keys(definition.endpoints).map((key) => [key, []]));
      Object.assign(raw, Object.fromEntries(entries));
      const mapped = definition.select(raw, snapshot.data);
      const unchanged = Object.fromEntries(Object.entries(mapped).filter(([field]) =>
        (revisions[field] || 0) === (initialRevisions[field] || 0)
      ));
      definition.onLoaded?.(raw, unchanged);
      publish({
        data: { ...snapshot.data, ...unchanged },
        scope,
        loading: false,
        error: null,
      });
    }).catch((error) => {
      if (currentGeneration !== generation || controller.signal.aborted) return;
      publish({ ...snapshot, loading: false, error: error.message || 'No se pudieron cargar los datos' });
    }).finally(() => {
      if (currentGeneration === generation) activeRequest = null;
    });

    activeRequest = { scope, controller, promise };
    return promise;
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setters,
    load,
    cancel,
  };
}
