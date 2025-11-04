/**
 * useApi Hook
 *
 * Custom hook for handling API calls with loading and error states.
 * Simplifies API integration in components.
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseApiResult<T, Args extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for handling API calls with automatic loading and error states
 *
 * @example
 * const { data, loading, error, execute } = useApi(
 *   () => ApiService.getFirms(),
 *   { immediate: true }
 * );
 */
export function useApi<T, Args extends any[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, Args> {
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...([] as any));
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for paginated API calls
 *
 * @example
 * const { data, loading, loadMore, hasMore } = usePaginatedApi(
 *   (page) => ApiService.getOrders(page)
 * );
 */
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number) => Promise<T[]>,
  limit: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const newData = await apiFunction(page, limit);

      if (newData.length < limit) {
        setHasMore(false);
      }

      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, limit, loading, hasMore]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);

      const newData = await apiFunction(1, limit);

      if (newData.length < limit) {
        setHasMore(false);
      }

      setData(newData);
      setPage(2);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, limit]);

  useEffect(() => {
    loadMore();
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

/**
 * Hook for mutation API calls (POST, PUT, DELETE)
 *
 * @example
 * const { mutate, loading } = useMutation(
 *   (order) => ApiService.createOrder(order),
 *   { onSuccess: (order) => navigation.navigate('OrderTracking', { orderId: order.id }) }
 * );
 */
export function useMutation<T, Args extends any[] = []>(
  mutationFunction: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (...args: Args): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await mutationFunction(...args);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}
