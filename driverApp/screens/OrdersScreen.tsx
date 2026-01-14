import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing } from '../config/colors';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { OrdersListSkeleton } from '../components/OrdersListSkeleton';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useToast } from '../context/ToastContext';
import { useActiveOrders } from '../hooks/useOrders';

export default function OrdersScreen({ navigation }: any) {
  const driver = useDriverStore((state) => state.driver);
  const isOnline = useDriverStore((state) => state.isOnline);
  const toggleOnlineStatus = useDriverStore((state) => state.toggleOnlineStatus);
  const { showError, showSuccess } = useToast();
  const t = useLanguageStore((state) => state.t);
  const queryClient = useQueryClient();

  // Fetch orders with React Query - only when driver is online
  const { data: fetchedOrders = [], isLoading, refetch } = useActiveOrders(
    driver?.id,
    isOnline // enabled only when online
  );

  // When offline, show empty list (not cached orders)
  const allOrders = isOnline ? fetchedOrders : [];

  // Split orders into "Now" (immediate) and "Scheduled" (has preferred time)
  // Check both camelCase and snake_case field names for compatibility
  const getPreferredTime = (order: any) => order.preferredDeliveryTime || order.preferred_delivery_time;

  const nowOrders = allOrders.filter((order: any) => {
    // No scheduled time = immediate "Now" order
    return !getPreferredTime(order);
  });

  const scheduledOrders = allOrders.filter((order: any) => {
    // Has scheduled delivery time = "Scheduled" order
    return !!getPreferredTime(order);
  }).sort((a: any, b: any) => {
    // Sort scheduled orders by delivery time (earliest first)
    return new Date(getPreferredTime(a)).getTime() - new Date(getPreferredTime(b)).getTime();
  });

  // Combined orders count for badge
  const orders = allOrders;

  // Tab state for Now/Scheduled
  const [activeTab, setActiveTab] = useState<'now' | 'scheduled'>('now');

  // Clear cache when going offline
  useEffect(() => {
    if (!isOnline) {
      // Clear orders cache when going offline
      queryClient.setQueryData(['orders', 'active', driver?.id], []);
    }
  }, [isOnline, driver?.id, queryClient]);

  // Refresh orders when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (driver?.id && isOnline) {
        refetch();
      }
    }, [driver?.id, isOnline, refetch])
  );

  const handleRefresh = () => {
    refetch();
  };

  const handleToggleOnline = async () => {
    try {
      await toggleOnlineStatus();
      showSuccess(isOnline ? t('orders.nowOffline') : t('orders.nowOnline'));
    } catch (error: any) {
      showError(error.message || t('orders.errors.statusUpdateFailed'));
    }
  };

  // Get icon based on address type
  const getAddressTypeIcon = (addressType?: string) => {
    switch (addressType?.toLowerCase()) {
      case 'house':
        return require('../assets/address/house-3d.png');
      case 'apartment':
        return require('../assets/address/apartment-3d.png');
      case 'office':
        return require('../assets/address/office-3d.png');
      case 'government':
        return require('../assets/address/government-3d.png');
      default:
        return require('../assets/ui-icons/user-3d.png');
    }
  };

  const renderOrder = ({ item, index }: { item: any; index: number }) => {
    const addressType = item.addresses?.type?.toLowerCase();

    // Determine order type: B2B (office), B2G (government)
    const isB2G = addressType === 'government';
    const isB2B = addressType === 'office';

    // Get name color based on type
    const getNameStyle = () => {
      if (isB2B) return styles.customerNameB2B; // Green
      if (isB2G) return styles.customerNameB2G; // Yellow/Orange
      return styles.customerName; // Default
    };

    // Get card accent style
    const getCardStyle = () => {
      if (isB2B) return [styles.orderCard, styles.orderCardB2B];
      if (isB2G) return [styles.orderCard, styles.orderCardB2G];
      return styles.orderCard;
    };

    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        activeOpacity={0.7}
      >
        {/* Top row: Queue Position + Order ID + Status + Type Badge */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>#{index + 1}</Text>
            </View>
            <Text style={styles.orderNumber}>{item.order_number}</Text>
            {isB2B && (
              <View style={styles.typeBadgeB2B}>
                <Text style={styles.typeBadgeTextB2B}>B2B</Text>
              </View>
            )}
            {isB2G && (
              <View style={styles.typeBadgeB2G}>
                <Text style={styles.typeBadgeTextB2G}>B2G</Text>
              </View>
            )}
          </View>
          <StatusBadge stage={item.stage} />
        </View>

        {/* Customer/Place block */}
        <View style={styles.customerBlock}>
          <View style={[
            styles.iconCircle,
            isB2B && styles.iconCircleB2B,
            isB2G && styles.iconCircleB2G,
          ]}>
            <Image
              source={getAddressTypeIcon(addressType)}
              style={styles.iconMonochrome}
              resizeMode="contain"
            />
          </View>
          <View style={styles.infoColumn}>
            <Text style={getNameStyle()}>{item.users?.name || t('orders.customer')}</Text>
            {item.users?.phone && (
              <Text style={styles.phoneNumber}>{item.users.phone}</Text>
            )}
          </View>
        </View>

        {/* Address block */}
        <View style={styles.addressBlock}>
          <View style={styles.addressIconSmall}>
            <Image
              source={require('../assets/ui-icons/address-icon.png')}
              style={styles.addressIconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.addressText} numberOfLines={2}>
            {item.addresses?.address || t('orders.addressNotAvailable')}
          </Text>
        </View>

        {/* Scheduled delivery time badge */}
        {getPreferredTime(item) && (
          <View style={styles.scheduledTimeContainer}>
            <Text style={styles.scheduledTimeIcon}>🕐</Text>
            <Text style={styles.scheduledTimeText}>
              {t('orders.scheduledFor')} {new Date(getPreferredTime(item)).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {new Date(getPreferredTime(item)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{t('orders.activeOrders')}</Text>
            <Text style={styles.headerSubtitle}>
              {driver?.name || t('orders.driver')}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{orders.length}</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusInfo}>
            <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
            <Text style={styles.statusText}>
              {isOnline ? t('orders.availableForOrders') : t('orders.offline')}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.border}
          />
        </View>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'now' && styles.tabActive]}
            onPress={() => setActiveTab('now')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'now' && styles.tabTextActive]}>
              {t('orders.now') || 'Now'} ({nowOrders.length})
            </Text>
            {activeTab === 'now' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scheduled' && styles.tabActive]}
            onPress={() => setActiveTab('scheduled')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'scheduled' && styles.tabTextActive]}>
              {t('orders.scheduled') || 'Scheduled'} ({scheduledOrders.length})
            </Text>
            {activeTab === 'scheduled' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && orders.length === 0 ? (
        <OrdersListSkeleton />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            image={
              isOnline
                ? require('../assets/illustrations/empty-orders.png')
                : require('../assets/illustrations/offline-driver.png')
            }
            title={isOnline ? t('orders.noActiveOrders') : t('orders.youreOffline')}
            message={
              isOnline
                ? t('orders.waitingForOrders')
                : t('orders.turnOnAvailability')
            }
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            isOnline ? (
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            ) : undefined
          }
        >
          {/* Show orders based on active tab */}
          {activeTab === 'now' ? (
            nowOrders.length > 0 ? (
              nowOrders.map((item: any, index: number) => (
                <View key={item.id}>{renderOrder({ item, index })}</View>
              ))
            ) : (
              <View style={styles.emptyTabSection}>
                <Image
                  source={require('../assets/illustrations/empty-orders.png')}
                  style={styles.emptyTabImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTabTitle}>{t('orders.noImmediateOrders') || 'No immediate orders'}</Text>
                <Text style={styles.emptyTabSubtitle}>{t('orders.waitingForOrders') || 'Waiting for new orders'}</Text>
              </View>
            )
          ) : (
            scheduledOrders.length > 0 ? (
              scheduledOrders.map((item: any, index: number) => (
                <View key={item.id}>{renderOrder({ item, index })}</View>
              ))
            ) : (
              <View style={styles.emptyTabSection}>
                <Image
                  source={require('../assets/illustrations/empty-orders.png')}
                  style={styles.emptyTabImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTabTitle}>{t('orders.noScheduledOrders') || 'No scheduled orders'}</Text>
                <Text style={styles.emptyTabSubtitle}>{t('orders.noScheduledOrdersMessage') || 'No orders scheduled for later'}</Text>
              </View>
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Very light grey
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Category Tabs
  tabContainer: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#4D7EFF',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#4D7EFF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8E99AB',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#4D7EFF',
    minWidth: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E0',
    marginRight: 10,
  },
  statusDotOnline: {
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
  },
  listContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 100,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  emptyList: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  // Uber-style clean card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  queueBadge: {
    backgroundColor: '#4D7EFF',
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  queueBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.3,
  },
  // B2B Card styling (green accent)
  orderCardB2B: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  // B2G Card styling (yellow accent)
  orderCardB2G: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  // Type Badges
  typeBadgeB2B: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeTextB2B: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  typeBadgeB2G: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeTextB2G: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  // Customer block
  customerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconMonochrome: {
    width: 44,
    height: 44,
    opacity: 0.75,
  },
  infoColumn: {
    flex: 1,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
  },
  customerNameB2B: {
    fontSize: 17,
    fontWeight: '700',
    color: '#059669', // Green for B2B
    marginBottom: 4,
  },
  customerNameB2G: {
    fontSize: 17,
    fontWeight: '700',
    color: '#D97706', // Yellow/Orange for B2G
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  // Icon circle variants
  iconCircleB2B: {
    backgroundColor: '#D1FAE5', // Light green
  },
  iconCircleB2G: {
    backgroundColor: '#FEF3C7', // Light yellow
  },
  // Address block
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addressIconSmall: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addressIconImage: {
    width: 24,
    height: 24,
    opacity: 0.6,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
  },
  // Scheduled delivery time badge
  scheduledTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scheduledTimeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  scheduledTimeText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '600',
  },
  // Section styles for Now/Scheduled
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
  },
  nowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  scheduledIcon: {
    fontSize: 16,
  },
  sectionBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scheduledBadge: {
    backgroundColor: '#F59E0B',
  },
  scheduledBadgeText: {
    color: '#FFFFFF',
  },
  emptySection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Empty tab section styles
  emptyTabSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTabImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
    opacity: 0.9,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyTabSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
