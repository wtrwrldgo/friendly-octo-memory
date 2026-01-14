import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api.service';
import { OrderStage } from '../types';

/**
 * Query hook for fetching active orders (IN_QUEUE)
 */
export const useActiveOrders = (driverId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['orders', 'active', driverId],
    queryFn: () => {
      if (!driverId) throw new Error('Driver ID is required');
      console.log('[useOrders] Fetching active orders for driver:', driverId);
      return ApiService.getActiveOrders(driverId);
    },
    enabled: enabled && !!driverId,
    refetchInterval: enabled ? 5000 : false, // Only poll when enabled (online)
    staleTime: 0, // Always consider data stale to get fresh data
    gcTime: 0, // Don't cache data when query is disabled (was cacheTime in v4)
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when app comes to foreground
  });
};

/**
 * Query hook for fetching order history (DELIVERED orders)
 */
export const useOrderHistory = (driverId: string | undefined, limit = 50) => {
  return useQuery({
    queryKey: ['orders', 'history', driverId, limit],
    queryFn: () => {
      if (!driverId) throw new Error('Driver ID is required');
      return ApiService.getOrderHistory(driverId, limit);
    },
    enabled: !!driverId,
  });
};

/**
 * Query hook for fetching a single order by ID
 */
export const useOrder = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required');
      return ApiService.getOrderById(orderId);
    },
    enabled: !!orderId,
    refetchInterval: 10000, // Refetch every 10 seconds for active order updates
  });
};

/**
 * Mutation hook for accepting an order
 */
export const useAcceptOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      ApiService.acceptOrder(orderId, driverId),
    onSuccess: (_data, variables) => {
      // Invalidate active orders to refetch the list
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
      // Invalidate the specific order
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] });
    },
  });
};

/**
 * Mutation hook for updating order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, stage }: { orderId: string; stage: OrderStage }) =>
      ApiService.updateOrderStatus(orderId, stage),
    onSuccess: (_data, variables) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate history if order was delivered
      if (variables.stage === OrderStage.DELIVERED) {
        queryClient.invalidateQueries({ queryKey: ['orders', 'history'] });
        queryClient.invalidateQueries({ queryKey: ['earnings'] });
      }
    },
  });
};
