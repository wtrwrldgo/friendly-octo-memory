import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api.service';

/**
 * Query hook for fetching driver profile from API
 * Note: In most cases, you should use useDriverStore from Zustand instead
 * This is useful when you need to refetch fresh data from the server
 */
export const useDriverProfile = (driverId: string | undefined, enabled = false) => {
  return useQuery({
    queryKey: ['driver', 'profile', driverId],
    queryFn: () => {
      if (!driverId) throw new Error('Driver ID is required');
      return ApiService.getDriverProfile(driverId);
    },
    enabled: enabled && !!driverId,
  });
};

/**
 * Mutation hook for updating driver name
 */
export const useUpdateDriverName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, name }: { driverId: string; name: string }) =>
      ApiService.updateDriverName(driverId, name),
    onSuccess: (_data, variables) => {
      // Invalidate driver profile to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile', variables.driverId] });
    },
  });
};

/**
 * Mutation hook for updating driver district
 */
export const useUpdateDriverDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, district }: { driverId: string; district: string }) =>
      ApiService.updateDriverDistrict(driverId, district),
    onSuccess: (_data, variables) => {
      // Invalidate driver profile and active orders (district affects which orders are shown)
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile', variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    },
  });
};

/**
 * Mutation hook for updating driver online status
 */
export const useToggleOnlineStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, isOnline }: { driverId: string; isOnline: boolean }) =>
      ApiService.updateDriverOnlineStatus(driverId, isOnline),
    onSuccess: (_data, variables) => {
      // Invalidate driver profile
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile', variables.driverId] });
    },
  });
};

/**
 * Mutation hook for updating driver location
 */
export const useUpdateDriverLocation = () => {
  return useMutation({
    mutationFn: ({ driverId, latitude, longitude }: { driverId: string; latitude: number; longitude: number }) =>
      ApiService.updateDriverLocation(driverId, latitude, longitude),
    // No need to invalidate queries for location updates (happens frequently)
  });
};
