import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriverStore } from '../stores/useDriverStore';
import { OrderStage } from '../types';
import { useToast } from '../context/ToastContext';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useUpdateOrderStatus } from '../hooks/useOrders';
import SlideToConfirm from '../components/SlideToConfirm';
import NavigationPickerModal from '../components/NavigationPickerModal';
import { useNavigationPicker } from '../hooks/useNavigationPicker';

export default function ActiveOrderScreen({ navigation }: any) {
  const activeOrder = useDriverStore((state) => state.activeOrder);
  const setActiveOrder = useDriverStore((state) => state.setActiveOrder);
  const driver = useDriverStore((state) => state.driver);
  const startLocationTracking = useDriverStore((state) => state.startLocationTracking);
  const stopLocationTracking = useDriverStore((state) => state.stopLocationTracking);
  const isLocationTracking = useDriverStore((state) => state.isLocationTracking);
  const { showError, showSuccess } = useToast();
  const t = useLanguageStore((state) => state.t);
  const updateOrderMutation = useUpdateOrderStatus();
  const { isVisible, showPicker, hidePicker, handleSelectApp } = useNavigationPicker();

  // Start location tracking when order is active
  useEffect(() => {
    if (activeOrder && !isLocationTracking) {
      console.log('[ActiveOrder] Starting location tracking for active order');
      startLocationTracking().catch((error) => {
        console.error('[ActiveOrder] Failed to start location tracking:', error);
      });
    }

    // Cleanup: stop tracking when component unmounts or order is delivered
    return () => {
      if (activeOrder?.stage === OrderStage.DELIVERED || !activeOrder) {
        console.log('[ActiveOrder] Stopping location tracking');
        stopLocationTracking();
      }
    };
  }, [activeOrder, isLocationTracking]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const updateOrderStage = async (newStage: OrderStage) => {
    if (!activeOrder) return;

    try {
      await updateOrderMutation.mutateAsync({ orderId: activeOrder.id, stage: newStage });

      const stageMessages: Record<OrderStage, string> = {
        [OrderStage.ORDER_PLACED]: t('activeOrder.stageMessages.orderPlaced'),
        [OrderStage.IN_QUEUE]: t('activeOrder.stageMessages.inQueue'),
        [OrderStage.COURIER_ON_THE_WAY]: t('activeOrder.stageMessages.courierOnTheWay'),
        [OrderStage.COURIER_ARRIVED]: t('activeOrder.stageMessages.courierArrived'),
        [OrderStage.DELIVERED]: t('activeOrder.stageMessages.delivered'),
        [OrderStage.CANCELLED]: t('activeOrder.stageMessages.cancelled'),
      };

      showSuccess(stageMessages[newStage] || t('common.success'));

      // Update active order with new stage
      setActiveOrder({ ...activeOrder, stage: newStage });

      if (newStage === OrderStage.DELIVERED) {
        // Clear active order when delivered
        setTimeout(() => setActiveOrder(null), 1000);
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      showError(error.message || t('activeOrder.errors.updateFailed'));
      throw error;
    }
  };

  const handlePrimaryAction = async () => {
    if (!activeOrder || !driver) {
      throw new Error('Order or driver not found');
    }

    console.log('[ActiveOrder] handlePrimaryAction - Current stage:', activeOrder.stage);

    if (activeOrder.stage === OrderStage.COURIER_ON_THE_WAY) {
      console.log('[ActiveOrder] Marking arrived...');
      await updateOrderStage(OrderStage.COURIER_ARRIVED);
    } else if (activeOrder.stage === OrderStage.COURIER_ARRIVED) {
      console.log('[ActiveOrder] Completing delivery...');
      await updateOrderStage(OrderStage.DELIVERED);
    }
  };

  const getSlideText = () => {
    if (!activeOrder) return '';

    let text;
    switch (activeOrder.stage) {
      case OrderStage.COURIER_ON_THE_WAY:
        text = t('activeOrder.slideToArrive');
        break;
      case OrderStage.COURIER_ARRIVED:
        text = t('activeOrder.slideToComplete');
        break;
      case OrderStage.DELIVERED:
      default:
        text = t('activeOrder.stageMessages.delivered');
    }

    return text;
  };

  const handleNavigate = () => {
    if (!activeOrder?.addresses?.latitude || !activeOrder?.addresses?.longitude) {
      showError(t('errors.locationError'));
      return;
    }

    const { latitude, longitude, address } = activeOrder.addresses;
    showPicker(latitude, longitude, address);
  };

  const getAddressIcon = (addressType?: string) => {
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
        return require('../assets/ui-icons/address-icon.png');
    }
  };

  const renderStageIcon = (isCompleted: boolean) => {
    if (isCompleted) {
      return <Text style={styles.checkIcon}>✓</Text>;
    } else {
      return <ActivityIndicator size="small" color="#FFFFFF" />;
    }
  };

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('activeOrder.errors.noActiveOrder')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quantityLabel = `${activeOrder.quantity || 1}×  ${t('activeOrder.bottles')}`;
  const isDelivered = activeOrder.stage === OrderStage.DELIVERED;

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>{t('tabs.active')}</Text>
            <Text style={styles.orderNumberLarge}>#{activeOrder.order_number}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress list - 4 Stages */}
        <View style={styles.progressCard}>
          {/* Step 1: In Queue - Always Completed */}
          <View style={styles.progressRow}>
            <View style={styles.progressCircleContainer}>
              <View style={[styles.checkCircle, styles.checkCircleCompleted]}>
                {renderStageIcon(true)}
              </View>
              {/* Line 1 - Always active */}
              <View style={[styles.connectingLine, styles.connectingLineActive]} />
            </View>
            <View style={styles.progressTextBlock}>
              <Text style={styles.progressTitle}>{t('activeOrder.stageMessages.inQueue')}</Text>
              <Text style={styles.progressSubtitle}>{t('orderStatus.orderPlaced')}</Text>
            </View>
          </View>

          {/* Step 2: Accept Order */}
          <View style={styles.progressRow}>
            <View style={styles.progressCircleContainer}>
              <View
                style={[
                  styles.checkCircle,
                  (activeOrder.stage === OrderStage.COURIER_ON_THE_WAY ||
                    activeOrder.stage === OrderStage.COURIER_ARRIVED ||
                    activeOrder.stage === OrderStage.DELIVERED)
                    ? styles.checkCircleCompleted
                    : styles.checkCircleLoading,
                ]}
              >
                {renderStageIcon(
                  activeOrder.stage === OrderStage.COURIER_ON_THE_WAY ||
                    activeOrder.stage === OrderStage.COURIER_ARRIVED ||
                    activeOrder.stage === OrderStage.DELIVERED
                )}
              </View>
              {/* Line 2 - Active when arrived or delivered */}
              <View
                style={[
                  styles.connectingLine,
                  (activeOrder.stage === OrderStage.COURIER_ARRIVED ||
                    activeOrder.stage === OrderStage.DELIVERED) && styles.connectingLineActive,
                ]}
              />
            </View>
            <View style={styles.progressTextBlock}>
              <Text style={styles.progressTitle}>{t('orders.acceptOrder')}</Text>
              <Text style={styles.progressSubtitle}>{t('orders.startDelivery')}</Text>
            </View>
          </View>

          {/* Step 3: Arrive at Location */}
          <View style={styles.progressRow}>
            <View style={styles.progressCircleContainer}>
              <View
                style={[
                  styles.checkCircle,
                  (activeOrder.stage === OrderStage.COURIER_ARRIVED || activeOrder.stage === OrderStage.DELIVERED)
                    ? styles.checkCircleCompleted
                    : styles.checkCircleLoading,
                ]}
              >
                {renderStageIcon(
                  activeOrder.stage === OrderStage.COURIER_ARRIVED || activeOrder.stage === OrderStage.DELIVERED
                )}
              </View>
              {/* Line 3 - Active when delivered */}
              <View
                style={[
                  styles.connectingLine,
                  activeOrder.stage === OrderStage.DELIVERED && styles.connectingLineActive,
                ]}
              />
            </View>
            <View style={styles.progressTextBlock}>
              <Text style={styles.progressTitle}>{t('activeOrder.arrivedAtLocation')}</Text>
              <Text style={styles.progressSubtitle}>{t('activeOrder.onTheWay')}</Text>
            </View>
          </View>

          {/* Step 4: Complete Delivery */}
          <View style={styles.progressRow}>
            <View style={styles.progressCircleContainer}>
              <View
                style={[
                  styles.checkCircle,
                  activeOrder.stage === OrderStage.DELIVERED
                    ? styles.checkCircleCompleted
                    : styles.checkCircleLoading,
                ]}
              >
                {renderStageIcon(activeOrder.stage === OrderStage.DELIVERED)}
              </View>
            </View>
            <View style={styles.progressTextBlock}>
              <Text style={styles.progressTitle}>{t('activeOrder.completingDelivery')}</Text>
              <Text style={styles.progressSubtitle}>{t('orders.completeDelivery')}</Text>
            </View>
          </View>
        </View>

        {/* Premium Customer Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>{t('activeOrder.customer')}</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerInfo}>
              <View style={styles.avatarCircle}>
                <Image
                  source={require('../assets/ui-icons/user-3d.png')}
                  style={styles.avatar3DIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerNameBold}>{activeOrder.users?.name || t('activeOrder.customer')}</Text>
                <Text style={styles.phoneNumber}>{activeOrder.users?.phone}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleCall(activeOrder.users?.phone)} style={styles.callButtonLarge}>
              <Image
                source={require('../assets/call-icon.png')}
                style={styles.callIcon3D}
                resizeMode="contain"
              />
              <Text style={styles.callButtonText}>{t('orders.callCustomer')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Address Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>{t('activeOrder.deliveryAddress')}</Text>

          {/* Address Info */}
          <View style={styles.addressInfoContainer}>
            <View style={styles.addressIconWrapper}>
              <Image
                source={getAddressIcon(activeOrder.addresses?.type)}
                style={styles.addressIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.addressTextWrapper}>
              <Text style={styles.addressTitle}>{activeOrder.addresses?.title || t('orders.deliveryAddress')}</Text>
              <Text style={styles.addressDetail}>{activeOrder.addresses?.address}</Text>
              {/* Show floor for apartment, office, and government */}
              {(activeOrder.addresses?.type?.toLowerCase() === 'apartment' ||
                activeOrder.addresses?.type?.toLowerCase() === 'office' ||
                activeOrder.addresses?.type?.toLowerCase() === 'government') &&
                activeOrder.addresses?.floor && (
                  <Text style={styles.floorInfo}>Floor: {activeOrder.addresses.floor}</Text>
                )}
            </View>
          </View>

          {/* Navigate Button */}
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={handleNavigate}
            activeOpacity={0.7}
          >
            <Image
              source={require('../assets/ui-icons/navigate-icon.png')}
              style={styles.navigateIcon}
              resizeMode="contain"
            />
            <Text style={styles.navigateText}>{t('orders.navigate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Order Summary Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>{t('activeOrder.orderItems')}</Text>
          <View style={styles.orderItemRow}>
            <View style={styles.itemIconContainer}>
              <Image
                source={require('../assets/aqua-water-icon.png')}
                style={styles.waterIcon3D}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemName}>{quantityLabel}</Text>
            <Text style={styles.itemPrice}>{(activeOrder.total || 0).toLocaleString()} UZS</Text>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodBadge}>
                <Image
                  source={
                    activeOrder.payment_method === 'card'
                      ? require('../assets/payment/card-icon.png')
                      : require('../assets/payment/cash-icon.png')
                  }
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentMethodText}>
                  {activeOrder.payment_method === 'card' ? 'Card' : 'Cash'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cancel Info Card */}
        <View style={styles.cancelInfoCard}>
          <Text style={styles.cancelInfoText}>
            {t('activeOrder.cancelInfo')}
          </Text>
          <TouchableOpacity
            style={styles.callFirmButton}
            onPress={() => Linking.openURL('tel:+998901234567')}
            activeOpacity={0.7}
          >
            <Text style={styles.callFirmIcon}>📞</Text>
            <Text style={styles.callFirmText}>+998 90 123 45 67</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Slide to confirm button - Fixed at bottom */}
      <View style={styles.bottomButtonContainer}>
        <SlideToConfirm
          onConfirm={handlePrimaryAction}
          text={getSlideText()}
          disabled={isDelivered}
        />
      </View>

      {/* Navigation Picker Modal */}
      <NavigationPickerModal
        visible={isVisible}
        onClose={hidePicker}
        onSelectApp={handleSelectApp}
      />
    </SafeAreaView>
  );
}

// Premium WaterGo Colors
const WATERGO_BLUE = '#2F6BFF';
const TEXT_DARK = '#0C1633';
const TEXT_MUTED = '#6B7280';
const TEXT_LIGHT = '#9CA3AF';
const BG_WHITE = '#FFFFFF';
const BG_LIGHT = '#F9FAFB';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_WHITE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_WHITE,
  },
  emptyText: {
    fontSize: 18,
    color: TEXT_MUTED,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Premium Header
  headerContainer: {
    backgroundColor: BG_WHITE,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BG_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: TEXT_DARK,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 13,
    color: TEXT_LIGHT,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderNumberLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: 0.5,
  },

  // Stage Progress Card
  progressCard: {
    backgroundColor: BG_WHITE,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  checkCircleCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  checkCircleLoading: {
    borderColor: WATERGO_BLUE,
    backgroundColor: WATERGO_BLUE,
  },
  checkIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressTextBlock: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  progressSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  connectingLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  connectingLineActive: {
    backgroundColor: '#10B981',
  },

  // Premium Card Styles
  premiumCard: {
    backgroundColor: BG_WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Customer Card Styles
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BG_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar3DIcon: {
    width: 40,
    height: 40,
  },
  customerDetails: {
    flex: 1,
  },
  customerNameBold: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  callButtonLarge: {
    backgroundColor: WATERGO_BLUE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: WATERGO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callIcon3D: {
    width: 20,
    height: 20,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: BG_WHITE,
  },

  // Address Card Styles
  addressInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressIcon: {
    width: 52,
    height: 52,
    opacity: 0.6,
  },
  addressTextWrapper: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 16,
    color: TEXT_MUTED,
    lineHeight: 22,
    fontWeight: '400',
  },
  floorInfo: {
    fontSize: 15,
    color: WATERGO_BLUE,
    fontWeight: '600',
    marginTop: 6,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WATERGO_BLUE,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: WATERGO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  navigateIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
  },
  navigateText: {
    fontSize: 17,
    fontWeight: '700',
    color: BG_WHITE,
    letterSpacing: 0.3,
  },

  // Order Summary Styles
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BG_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waterIcon3D: {
    width: 32,
    height: 32,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  paymentRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 10,
  },
  paymentIcon: {
    width: 36,
    height: 36,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },

  // Bottom Action Button Container
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BG_WHITE,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // Cancel Info Card
  cancelInfoCard: {
    backgroundColor: '#FFF8E6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  cancelInfoText: {
    fontSize: 14,
    color: '#7A6A3A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  callFirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callFirmIcon: {
    fontSize: 16,
  },
  callFirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
