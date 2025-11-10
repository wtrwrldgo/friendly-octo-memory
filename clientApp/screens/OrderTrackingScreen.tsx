import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OrderStage } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { OrderProgressIndicator } from '../components/OrderProgressIndicator';
import { DriverInfoCard } from '../components/DriverInfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReviewModal } from '../components/ReviewModal';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import ApiService from '../services/api';
import { getDriverInfo, getOrderStatus } from '../services/api';

// Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
const getOrdinalSuffix = (num: number, t: (key: string) => string): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return t('orderTracking.queuePositionSuffix1st');
  if (j === 2 && k !== 12) return t('orderTracking.queuePositionSuffix2nd');
  if (j === 3 && k !== 13) return t('orderTracking.queuePositionSuffix3rd');
  return t('orderTracking.queuePositionSuffixTh');
};

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentOrder, setCurrentOrder } = useOrder();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    // Simulate order status updates
    const interval = setInterval(async () => {
      if (currentOrder && currentOrder.stage !== OrderStage.DELIVERED) {
        try {
          const status = await getOrderStatus(currentOrder.id);
          const driver = await getDriverInfo(currentOrder.id);
          setCurrentOrder({
            ...currentOrder,
            stage: status.stage,
            estimatedDelivery: status.estimatedDelivery,
            queuePosition: status.queuePosition,
            ordersAhead: status.ordersAhead,
            driver: driver || currentOrder.driver,
          });
        } catch (error) {
          console.error('Failed to update order status');
        }
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [currentOrder]);

  // Show review modal when order is delivered and not reviewed yet
  useEffect(() => {
    if (currentOrder && currentOrder.stage === OrderStage.DELIVERED && !currentOrder.reviewed) {
      // Delay showing modal by 1 second for better UX
      const timer = setTimeout(() => {
        setShowReviewModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentOrder?.stage, currentOrder?.reviewed]);

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!currentOrder) return;

    try {
      await ApiService.submitReview(currentOrder.id, rating, comment);

      // Mark order as reviewed
      setCurrentOrder({
        ...currentOrder,
        reviewed: true,
      });

      setShowReviewModal(false);
      showToast(t('review.thankYou'), 'success');
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast(t('errors.somethingWentWrong'), 'error');
    }
  };

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <HeaderBar title={t('orderTracking.title')} onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('orderTracking.noActiveOrder')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar title={t('orderTracking.title')} onBack={() => navigation.navigate('MainTabs')} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{t('orderTracking.order')} #{currentOrder.id}</Text>
          <View style={styles.deliveredByRow}>
            <Text style={styles.waterIcon}>💧</Text>
            <Text style={styles.deliveredBy}>
              {t('orderTracking.deliveredBy')} <Text style={styles.firmName}>{currentOrder.firm.name}</Text>
            </Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={[styles.section, { backgroundColor: Colors.white }]}>
          <OrderProgressIndicator currentStage={currentOrder.stage} />

          {/* Queue Position - Large Number with Glow */}
          {currentOrder.stage === OrderStage.IN_QUEUE && currentOrder.queuePosition && currentOrder.ordersAhead !== undefined && (
            <View style={styles.queueContainer}>
              {/* Glowing Number */}
              <View style={styles.queueNumberContainer}>
                <View style={styles.glowEffect} />
                <Text style={styles.queueNumber}>{currentOrder.queuePosition}</Text>
              </View>

              {/* Queue Position Text */}
              <Text style={styles.queueTitle}>
                {t('orderTracking.queuePosition').replace('{position}', `${currentOrder.queuePosition}${getOrdinalSuffix(currentOrder.queuePosition, t)}`)}
              </Text>
              <Text style={styles.queueSubtext}>
                {currentOrder.ordersAhead === 1
                  ? t('orderTracking.courierDeliveringOrders').replace('{count}', String(currentOrder.ordersAhead))
                  : t('orderTracking.courierDeliveringOrdersPlural').replace('{count}', String(currentOrder.ordersAhead))}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderTracking.items')}</Text>
          {currentOrder.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemVolume}>{item.product.volume}   x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {(item.product.price * item.quantity).toLocaleString()} UZS
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery & Payment Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.infoLabel}>{t('orderTracking.deliveryBy')} {currentOrder.firm.name}</Text>
            </View>
            <Text style={styles.infoValue}>{t('cart.free')}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>🎯</Text>
              <Text style={styles.infoLabel}>{t('cart.serviceFee')}</Text>
            </View>
            <Text style={styles.infoValue}>{t('cart.free')}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>💳</Text>
              <View>
                <Text style={styles.infoLabel}>{t('cart.payment')}</Text>
                <Text style={styles.infoSubtext}>{t('cart.cashOnly')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{t('cart.address')}</Text>
                <Text style={styles.addressText}>{currentOrder.deliveryAddress.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>{t('cart.total')}</Text>
          <Text style={styles.totalValue}>{currentOrder.total.toLocaleString()} UZS</Text>
        </View>

        {/* Driver Info - Show only when courier is on the way or delivered */}
        {currentOrder.driver && (currentOrder.stage === OrderStage.COURIER_ON_THE_WAY || currentOrder.stage === OrderStage.DELIVERED) && (
          <View style={styles.driverSection}>
            <DriverInfoCard driver={currentOrder.driver} />
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {currentOrder.stage !== OrderStage.DELIVERED ? (
          <>
            <PrimaryButton
              title={t('orderTracking.cancel')}
              onPress={() => {
                // Handle cancel order
              }}
            />
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportText}>{t('orderTracking.reportProblem')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <PrimaryButton
            title={t('orderTracking.backToHome')}
            onPress={() => {
              setCurrentOrder(null);
              navigation.navigate('MainTabs');
            }}
          />
        )}
      </View>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        driverName={currentOrder?.driver?.name}
        companyName={currentOrder?.firm.name || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.grayText,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  orderHeader: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  orderId: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  deliveredByRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterIcon: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  deliveredBy: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
  },
  firmName: {
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  queueContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  queueNumberContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    marginBottom: Spacing.lg,
  },
  glowEffect: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#60D5F8',
    opacity: 0.3,
    shadowColor: '#60D5F8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 10,
  },
  queueNumber: {
    fontSize: 120,
    fontWeight: '700',
    color: '#60D5F8',
    textShadowColor: '#60D5F8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  queueTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  queueSubtext: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  itemVolume: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  itemPrice: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    marginTop: 2,
  },
  infoValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#34C759',
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    marginTop: 4,
    lineHeight: 18,
  },
  totalSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  driverSection: {
    marginBottom: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  reportText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default OrderTrackingScreen;
