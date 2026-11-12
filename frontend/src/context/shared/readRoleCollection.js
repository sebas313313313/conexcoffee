/** Admite colecciones opcionales y catálogos paginados requeridos por formularios. */
export async function readRoleCollection(client, source, signal) {
  const options = typeof source === 'string' ? { url: source } : source;
  const records = [];
  let page = 1;
  let totalPages = 1;
  try {
    do {
      signal.throwIfAborted();
      const response = await client.get(options.url, {
        signal,
        ...(options.strictResponse ? { strictResponse: true } : {}),
        ...(options.params || options.allPages ? {
          params: { ...options.params, ...(options.allPages ? { page, limit: 100 } : {}) },
        } : {}),
      });
      signal.throwIfAborted();
      records.push(...(Array.isArray(response.data) ? response.data : []));
      totalPages = options.allPages ? Number(response.meta?.totalPages) || 1 : 1;
      page += 1;
    } while (page <= totalPages);
    return records;
  } catch (error) {
    if (signal.aborted || options.strictResponse) throw error;
    // Mantener la tolerancia previa a las colecciones opcionales del backend.
    return [];
  }
}
