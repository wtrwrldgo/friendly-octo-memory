import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes, scale, moderateScale, wp } from '../constants/Colors';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types';
import { StageBadge } from '../components/StageBadge';
import { getTranslatedProductName } from '../utils/translations';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentOrder, orderHistory, loadOrders } = useOrder();
  const { t, language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // Helper function to safely convert to Date and format
  const toDate = (date: Date | string | null | undefined): Date | null => {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    const d = toDate(date);
    if (!d) return '';
    return d.toLocaleDateString();
  };

  const formatTime = (date: Date | string | null | undefined) => {
    const d = toDate(date);
    if (!d) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to format scheduled delivery time
  const formatScheduledTime = (date: Date | string | null | undefined) => {
    const d = toDate(date);
    if (!d) return null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to format order number - show real number from backend
  const formatOrderNumber = (orderNumber: string | undefined, orderId: string | undefined) => {
    // Use real order number from backend (e.g., ORD-20231208-0001)
    if (orderNumber) return orderNumber;
    // Fallback to ID if no order number
    return `#${(orderId || '').slice(-8)}`;
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.getParent()?.navigate('OrderTracking', { orderId: order.id })}
        activeOpacity={0.9}
      >
        {/* Top Row: Logo + Info + Badge */}
        <View style={styles.cardTop}>
          <View style={styles.cardLogoWrapper}>
            <Image
              source={
                typeof order.firm.logo === 'string' && order.firm.logo.length > 0
                  ? { uri: order.firm.logo }
                  : typeof order.firm.logo === 'number'
                  ? order.firm.logo
                  : require('../assets/firms/aquawater-logo.png')
              }
              style={styles.cardLogo}
              resizeMode="cover"
            />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardFirmName}>{order.firm.name}</Text>
              <StageBadge stage={order.stage} showIcon={false} />
            </View>
            <Text style={styles.cardOrderNumber}>
              {formatOrderNumber(order.orderNumber, order.id)}
            </Text>
            <Text style={styles.cardDate}>
              {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
            </Text>
          </View>
        </View>

        {/* Items Preview */}
        <View style={styles.cardItems}>
          <Text style={styles.cardItemsText} numberOfLines={1}>
            {order.items.map(item => `${item.quantity}x ${getTranslatedProductName(item.product, language)}`).join(', ')}
          </Text>
        </View>

        {/* Bottom Row: Total + Arrow */}
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardTotalLabel}>{t('orders.total')}</Text>
            <Text style={styles.cardTotalValue}>{Math.round(order.total).toLocaleString()} UZS</Text>
          </View>
          <View style={styles.cardArrowCircle}>
            <Text style={styles.cardArrow}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.title')}</Text>
      </View>

      {!currentOrder && orderHistory.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <Image
            source={require('../assets/illustrations/empty-orders.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>{t('orders.noOrders')}</Text>
          <Text style={styles.emptyText}>
            {t('orders.noOrdersMessage')}
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={orderHistory}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            currentOrder ? (
              <View style={styles.activeOrderSection}>
                {/* Active Order Card - Modern Design */}
                <TouchableOpacity
                  style={styles.liveOrderCard}
                  onPress={() => navigation.getParent()?.navigate('OrderTracking', { orderId: currentOrder.id })}
                  activeOpacity={0.9}
                >
                  {/* Top Row: Logo + Info + Live Badge */}
                  <View style={styles.liveOrderTop}>
                    <View style={styles.liveOrderLogoWrapper}>
                      <Image
                        source={
                          typeof currentOrder.firm.logo === 'string' && currentOrder.firm.logo.length > 0
                            ? { uri: currentOrder.firm.logo }
                            : typeof currentOrder.firm.logo === 'number'
                            ? currentOrder.firm.logo
                            : require('../assets/firms/aquawater-logo.png')
                        }
                        style={styles.liveOrderLogo}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.liveOrderInfo}>
                      <View style={styles.liveOrderTitleRow}>
                        <Text style={styles.liveOrderFirmName}>{currentOrder.firm.name}</Text>
                        <View style={styles.liveBadgeNew}>
                          <View style={styles.liveDotNew} />
                          <Text style={styles.liveTextNew}>{t('orders.live')}</Text>
                        </View>
                      </View>
                      <Text style={styles.liveOrderNumber}>
                        {formatOrderNumber(currentOrder.orderNumber, currentOrder.id)}
                      </Text>
                    </View>
                  </View>

                  {/* Status Row */}
                  <View style={styles.liveOrderStatusRow}>
                    <StageBadge stage={currentOrder.stage} showIcon={false} />
                    {currentOrder.preferredDeliveryTime && (
                      <View style={styles.scheduledBadge}>
                        <Text style={styles.scheduledIcon}>🕐</Text>
                        <Text style={styles.scheduledText}>
                          {formatScheduledTime(currentOrder.preferredDeliveryTime)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Items Preview */}
                  <View style={styles.liveOrderItems}>
                    <Text style={styles.liveOrderItemsText} numberOfLines={1}>
                      {currentOrder.items.map(item => `${item.quantity}x ${getTranslatedProductName(item.product, language)}`).join(', ')}
                    </Text>
                  </View>

                  {/* Bottom Row: Total + Track Button */}
                  <View style={styles.liveOrderBottom}>
                    <View>
                      <Text style={styles.liveOrderTotalLabel}>{t('orders.total')}</Text>
                      <Text style={styles.liveOrderTotalValue}>{Math.round(currentOrder.total).toLocaleString()} UZS</Text>
                    </View>
                    <View style={styles.trackButton}>
                      <Text style={styles.trackButtonText}>{t('orders.viewTracking')}</Text>
                      <Text style={styles.trackButtonArrow}>›</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {orderHistory.length > 0 && (
                  <View style={styles.historySeparator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.historySeparatorText}>{t('orders.history')}</Text>
                    <View style={styles.separatorLine} />
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
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
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    paddingHorizontal: scale(32),
    paddingVertical: scale(40),
  },
  emptyImage: {
    width: wp(75),
    height: wp(75),
    marginBottom: scale(40),
  },
  emptyTitle: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: scale(16),
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(26),
    maxWidth: wp(85),
  },
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
  cardLogoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F5FF',
    marginRight: 12,
  },
  cardLogo: {
    width: '100%',
    height: '100%',
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
  cardFirmName: {
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
  cardTotalLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  cardTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
  activeOrderSection: {
    marginBottom: Spacing.lg,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activeOrderTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  liveText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  activeOrderCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  historySeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  historySeparatorText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.grayText,
    marginHorizontal: Spacing.md,
  },
  // Live Order Card Styles
  liveOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#E0ECFF',
  },
  liveOrderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveOrderLogoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F0F5FF',
    marginRight: 12,
  },
  liveOrderLogo: {
    width: '100%',
    height: '100%',
  },
  liveOrderInfo: {
    flex: 1,
  },
  liveOrderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveOrderFirmName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  liveBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDotNew: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveTextNew: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  liveOrderNumber: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  liveOrderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scheduledIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  scheduledText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  liveOrderItems: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  liveOrderItemsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  liveOrderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveOrderTotalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  liveOrderTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  trackButtonArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrdersScreen;
