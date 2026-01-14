import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../config/colors';
import { StatusBadge } from '../components/StatusBadge';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useOrderHistory } from '../hooks/useOrders';

export default function HistoryScreen({ navigation }: any) {
  const driver = useDriverStore((state) => state.driver);
  const t = useLanguageStore((state) => state.t);

  // Fetch order history with React Query
  const { data: orders = [], isLoading, refetch } = useOrderHistory(driver?.id);

  // Refresh history when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (driver?.id) {
        refetch();
      }
    }, [driver?.id, refetch])
  );

  const handleRefresh = () => {
    refetch();
  };

  const getAddressTypeIcon = (type: string) => {
    const lowerType = type?.toLowerCase();
    switch (lowerType) {
      case 'government':
        return require('../assets/address/government-3d.png');
      case 'office':
        return require('../assets/address/office-3d.png');
      case 'house':
        return require('../assets/address/house-3d.png');
      case 'apartment':
        return require('../assets/address/apartment-3d.png');
      default:
        return require('../assets/address/apartment-3d.png');
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const addressType = item.addresses?.type;
    const deliveryDateStr = item.delivered_at
      ? new Date(item.delivered_at).toLocaleDateString()
      : new Date(item.created_at).toLocaleDateString();

    // Format delivery time
    const deliveryTime = item.delivered_at
      ? new Date(item.delivered_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Format items
    const itemsList = item.items && item.items.length > 0
      ? item.items.map((orderItem: { quantity: number; product_name: string }) => `${orderItem.quantity}× ${orderItem.product_name}`).join(', ')
      : t('historyExpanded.noItems');

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        activeOpacity={0.9}
      >
        {/* Top Row: Icon + Info + Badge */}
        <View style={styles.cardTop}>
          <View style={styles.cardIconWrapper}>
            <Image
              source={getAddressTypeIcon(addressType)}
              style={styles.cardIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardCustomerName}>{item.users?.name || t('historyExpanded.customer')}</Text>
              <StatusBadge stage={item.stage} />
            </View>
            <Text style={styles.cardOrderNumber}>#{item.order_number}</Text>
            <Text style={styles.cardDate}>{deliveryDateStr} • {deliveryTime}</Text>
          </View>
        </View>

        {/* Address Preview */}
        <View style={styles.cardAddress}>
          <Text style={styles.cardAddressText} numberOfLines={1}>
            {item.addresses?.address || t('historyExpanded.addressNotAvailable')}
          </Text>
        </View>

        {/* Items Preview */}
        <View style={styles.cardItems}>
          <Text style={styles.cardItemsText} numberOfLines={1}>
            {itemsList}
          </Text>
        </View>

        {/* Bottom Row: Delivery info + Arrow */}
        <View style={styles.cardBottom}>
          <Text style={styles.cardDeliveryText}>
            {item.stage === 'DELIVERED' ? t('historyExpanded.delivered') : t('historyExpanded.cancelled')}
          </Text>
          <View style={styles.cardArrowCircle}>
            <Text style={styles.cardArrow}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    console.log('[DEV] Rendering empty state, orders.length:', orders.length);
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../assets/illustrations/empty-orders.png')}
          style={styles.emptyIllustration}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>{t('historyExpanded.noHistory')}</Text>
        <Text style={styles.emptyText}>
          {t('historyExpanded.noHistoryMessage')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('historyExpanded.deliveryHistory')}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmpty : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(12,22,51,0.06)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C1633',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  // Card styles matching client app
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F5FF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    width: 36,
    height: 36,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardCustomerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  cardOrderNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardAddress: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cardAddressText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  cardItems: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  cardItemsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDeliveryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  cardArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: -2,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyIllustration: {
    width: 220,
    height: 220,
    marginBottom: Spacing.xl,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E99AB',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 24,
    fontWeight: '400',
  },
});
