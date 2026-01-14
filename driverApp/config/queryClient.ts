import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Stale time: data is considered fresh for 30 seconds
      staleTime: 30 * 1000,

      // Cache time: inactive data is cached for 5 minutes
      gcTime: 5 * 60 * 1000,

      // Refetch on window focus
      refetchOnWindowFocus: false,

      // Refetch on mount if data is stale
      refetchOnMount: true,

      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
