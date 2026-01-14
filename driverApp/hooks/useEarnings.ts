import { useQuery } from '@tanstack/react-query';
import ApiService from '../services/api.service';

/**
 * Query hook for fetching driver earnings and statistics
 * Returns: { today, week, month, total_deliveries }
 */
export const useEarnings = (driverId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['earnings', driverId],
    queryFn: () => {
      if (!driverId) throw new Error('Driver ID is required');
      return ApiService.getEarnings(driverId);
    },
    enabled: enabled && !!driverId,
    // Refetch every 5 minutes to keep earnings up to date
    refetchInterval: 5 * 60 * 1000,
  });
};
