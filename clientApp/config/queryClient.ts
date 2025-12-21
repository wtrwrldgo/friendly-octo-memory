/**
 * React Query Client Configuration - Client App
 * Configures React Query with optimal defaults for client app
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
