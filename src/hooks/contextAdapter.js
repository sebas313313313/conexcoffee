export function toQueryResult(data, loading, error, refetch) {
  return {
    data: Array.isArray(data) ? data : data ?? [],
    isLoading: Boolean(loading),
    isError: false,
    error: error ? new Error(error) : null,
    refetch,
  };
}

export function toCreateMutation(createFn) {
  return {
    isPending: false,
    mutateAsync: (payload) => createFn(payload),
    mutate: (payload, options = {}) => {
      Promise.resolve(createFn(payload))
        .then((res) => options?.onSuccess?.(res))
        .catch((err) => options?.onError?.(err));
    },
  };
}

export function toUpdateMutation(updateFn) {
  return {
    isPending: false,
    mutateAsync: (arg) => {
      const id = arg?.id;
      const payload = arg?.payload ?? arg;
      return updateFn(id, payload);
    },
    mutate: (arg, options = {}) => {
      const id = arg?.id;
      const payload = arg?.payload ?? arg;
      Promise.resolve(updateFn(id, payload))
        .then((res) => options?.onSuccess?.(res))
        .catch((err) => options?.onError?.(err));
    },
  };
}

export function toRemoveMutation(removeFn) {
  return {
    isPending: false,
    mutateAsync: (id) => removeFn(id),
    mutate: (id, options = {}) => {
      Promise.resolve(removeFn(id))
        .then((res) => options?.onSuccess?.(res))
        .catch((err) => options?.onError?.(err));
    },
  };
}
