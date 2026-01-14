import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '../config/colors';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useDriverStore } from '../stores/useDriverStore';
import LocalApiService from '../services/local-api.service';

interface EarningsData {
  todayEarnings: number;
  todayDeliveries: number;
  weekEarnings: number;
  weekDeliveries: number;
  monthEarnings: number;
  monthDeliveries: number;
  totalEarnings: number;
  totalDeliveries: number;
}

export default function EarningsScreen() {
  const t = useLanguageStore((state) => state.t);
  const driver = useDriverStore((state) => state.driver);
  const [earnings, setEarnings] = useState<EarningsData>({
    todayEarnings: 0,
    todayDeliveries: 0,
    weekEarnings: 0,
    weekDeliveries: 0,
    monthEarnings: 0,
    monthDeliveries: 0,
    totalEarnings: 0,
    totalDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driver?.id) {
      fetchEarnings(driver.id);
    }
  }, [driver?.id]);

  const fetchEarnings = async (driverId: string) => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all delivered orders via LocalApiService
      const allOrders = await LocalApiService.getOrderHistory(driverId, 500);

      // Calculate earnings (filter by delivered_at date)
      const todayOrders = (allOrders || []).filter(
        (order: any) => order.delivered_at && order.delivered_at >= todayStart
      );
      const weekOrders = (allOrders || []).filter(
        (order: any) => order.delivered_at && order.delivered_at >= weekStart
      );
      const monthOrders = (allOrders || []).filter(
        (order: any) => order.delivered_at && order.delivered_at >= monthStart
      );

      setEarnings({
        todayEarnings: todayOrders.reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0),
        todayDeliveries: todayOrders.length,
        weekEarnings: weekOrders.reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0),
        weekDeliveries: weekOrders.length,
        monthEarnings: monthOrders.reduce((sum: number, order: any) => sum + (order.delivery_fee || 0), 0),
        monthDeliveries: monthOrders.length,
        totalEarnings: (allOrders || []).reduce(
          (sum: number, order: any) => sum + (order.delivery_fee || 0),
          0
        ),
        totalDeliveries: (allOrders || []).length,
      });
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (driver?.id) {
      setLoading(true);
      fetchEarnings(driver.id);
    }
  };

  const renderStatCard = (
    title: string,
    earnings: number,
    deliveries: number,
    color: string
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statEarnings, { color }]}>{earnings.toLocaleString()} UZS</Text>
      <Text style={styles.statDeliveries}>{deliveries} {t('earningsExpanded.deliveries')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('earningsExpanded.myEarnings')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Total Earnings Highlight */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t('earningsExpanded.totalEarnings')}</Text>
          <Text style={styles.totalAmount}>{earnings.totalEarnings.toLocaleString()} UZS</Text>
          <Text style={styles.totalDeliveries}>
            {earnings.totalDeliveries} {t('earningsExpanded.totalDeliveries')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            t('earningsExpanded.today'),
            earnings.todayEarnings,
            earnings.todayDeliveries,
            Colors.success
          )}
          {renderStatCard(
            t('earningsExpanded.thisWeek'),
            earnings.weekEarnings,
            earnings.weekDeliveries,
            Colors.primary
          )}
          {renderStatCard(
            t('earningsExpanded.thisMonth'),
            earnings.monthEarnings,
            earnings.monthDeliveries,
            Colors.info
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('earningsExpanded.howEarningsWork')}</Text>
          <Text style={styles.infoText}>
            {t('earningsExpanded.earningsInfo')}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {earnings.totalDeliveries > 0
                ? Math.round(earnings.totalEarnings / earnings.totalDeliveries).toLocaleString()
                : '0'} UZS
            </Text>
            <Text style={styles.quickStatLabel}>{t('earningsExpanded.avgPerDelivery')}</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {earnings.totalDeliveries > 0
                ? Math.round(earnings.totalDeliveries / 30)
                : 0}
            </Text>
            <Text style={styles.quickStatLabel}>{t('earningsExpanded.avgPerDay')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  totalDeliveries: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    opacity: 0.8,
  },
  statsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  statEarnings: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: 4,
  },
  statDeliveries: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    lineHeight: 20,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
});
