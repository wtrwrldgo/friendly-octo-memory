/**
 * useStatistics Hook
 * Fetches real-time statistics for the driver
 */

import { useQuery } from '@tanstack/react-query';
import ApiService from '../services/api.service';
import { useDriverStore } from '../stores/useDriverStore';

interface StatisticsData {
  // Today
  todayDeliveries: number;
  todayEarnings: number;

  // This Week
  weekDeliveries: number;
  weekEarnings: number;

  // This Month
  monthDeliveries: number;
  monthEarnings: number;

  // Quality Metrics
  cancelledOrders: number;
  driverRating: number;

  // Weekly Chart Data
  weeklyChart: {
    day: string;
    deliveries: number;
    isToday: boolean;
  }[];
}

export function useStatistics() {
  const driver = useDriverStore((state) => state.driver);

  const { data, isLoading, error, refetch } = useQuery<StatisticsData>({
    queryKey: ['statistics', driver?.id],
    queryFn: async () => {
      if (!driver) throw new Error('No driver found');

      // Fetch earnings data
      const earnings = await ApiService.getEarnings(driver.id);

      // Fetch order history for weekly chart
      const history = await ApiService.getOrderHistory(driver.id, 100);

      // Calculate weekly chart data
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Initialize weekly data
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyDeliveries = new Array(7).fill(0);

      // Count deliveries per day
      history.forEach((order: any) => {
        const deliveredDate = new Date(order.delivered_at);
        if (deliveredDate >= weekStart) {
          const dayIndex = deliveredDate.getDay();
          weeklyDeliveries[dayIndex]++;
        }
      });

      // Build weekly chart
      const today = now.getDay();
      const weeklyChart = weeklyDeliveries.map((count, index) => ({
        day: dayNames[index],
        deliveries: count,
        isToday: index === today,
      }));

      // Calculate today's deliveries (from earnings or history)
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayDeliveries = history.filter((order: any) => {
        const deliveredDate = new Date(order.delivered_at);
        return deliveredDate >= todayStart;
      }).length;

      // Calculate week deliveries
      const weekDeliveries = history.filter((order: any) => {
        const deliveredDate = new Date(order.delivered_at);
        return deliveredDate >= weekStart;
      }).length;

      // Calculate month deliveries
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthDeliveries = history.filter((order: any) => {
        const deliveredDate = new Date(order.delivered_at);
        return deliveredDate >= monthStart;
      }).length;

      // Calculate cancelled orders (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const cancelledOrders = history.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return order.stage === 'CANCELLED' && orderDate >= thirtyDaysAgo;
      }).length;

      return {
        todayDeliveries,
        todayEarnings: earnings.today,
        weekDeliveries,
        weekEarnings: earnings.week,
        monthDeliveries,
        monthEarnings: earnings.month,
        cancelledOrders,
        driverRating: driver.rating || 0,
        weeklyChart,
      };
    },
    enabled: !!driver,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    statistics: data,
    isLoading,
    error,
    refetch,
  };
}
