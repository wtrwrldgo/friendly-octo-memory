import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { OrderStage } from '../types';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getDriverInfo, getOrderStatus, getOrderById } from '../services/api';
import ApiService from '../services/api';
import { ReviewModal } from '../components/ReviewModal';
import { DriverCard } from '../components/DriverCard';
import CallFirmModal from '../components/CallFirmModal';
import CancelledOrderModal from '../components/CancelledOrderModal';
import OrderReturnedToQueueModal from '../components/OrderReturnedToQueueModal';
import OrderDeletedModal from '../components/OrderDeletedModal';
import { getFirmLogo, getProductImageByName } from '../utils/imageMapping';
import { useStageSounds } from '../hooks/useStageSounds';
import { getTranslatedProductName } from '../utils/translations';

type Stage = 'placed' | 'queue' | 'on_the_way' | 'courier_arrived' | 'delivered';

/* ---------- SMALL COMPONENTS ---------- */

const ProgressBar: React.FC<{ stage: Stage; t: any }> = ({ stage, t }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isPlacedDone =
    stage === 'queue' || stage === 'on_the_way' || stage === 'courier_arrived' || stage === 'delivered';
  const isQueueDone = stage === 'on_the_way' || stage === 'courier_arrived' || stage === 'delivered';
  const isOnTheWayDone = stage === 'courier_arrived' || stage === 'delivered';
  const isCourierArrivedDone = stage === 'delivered';

  // Calculate progress percentage based on stage
  const getProgressPercentage = () => {
    switch (stage) {
      case 'placed':
        return 0;
      case 'queue':
        return 25;
      case 'on_the_way':
        return 50;
      case 'courier_arrived':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: getProgressPercentage(),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [stage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '80%'],
  });

  return (
    <View style={styles.progressContainer}>
      {/* Background line */}
      <View style={styles.progressLineBackground} />

      {/* Animated green progress line */}
      <Animated.View
        style={[
          styles.progressLineActive,
          { width: progressWidth }
        ]}
      />

      {/* Steps */}
      <View style={styles.progressRow}>
        <StatusStep
          label={t('orderTracking.orderPlaced')}
          active={stage === 'placed'}
          done={isPlacedDone}
        />
        <StatusStep
          label={t('orderTracking.inQueue')}
          active={stage === 'queue'}
          done={isQueueDone}
        />
        <StatusStep
          label={t('orderTracking.onTheWay')}
          active={stage === 'on_the_way'}
          done={isOnTheWayDone}
        />
        <StatusStep
          label={t('orderTracking.courierArrived')}
          active={stage === 'courier_arrived'}
          done={isCourierArrivedDone}
        />
        <StatusStep label={t('orderTracking.delivered')} active={stage === 'delivered'} done={false} />
      </View>
    </View>
  );
};

interface StatusStepProps {
  label: string;
  active?: boolean;
  done?: boolean;
}

const StatusStep: React.FC<StatusStepProps> = ({ label, active, done }) => {
  const circleStyle = [
    styles.stepCircle,
    done && styles.stepCircleDone,
    active && !done && styles.stepCircleActive,
  ];

  return (
    <View style={styles.stepContainer}>
      <View style={circleStyle}>
        {done ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        ) : active ? (
          <Text style={styles.stepActiveDot}>•</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.stepLabel,
          active && styles.stepLabelActive,
          done && styles.stepLabelDone,
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
};

/* ---------- STAGE CONFIG ---------- */

function getStageContent(params: {
  stage: Stage;
  queuePosition: number;
  ordersAhead: number;
  t: any;
}) {
  const { stage, queuePosition, ordersAhead, t } = params;

  // Stage-specific illustrations
  const orderPlacedIllustration = require('../assets/illustrations/order-placed.png');
  const orderQueueIllustration = require('../assets/illustrations/order-queue.png');
  const deliveryVanIllustration = require('../assets/illustrations/delivery-van-new.png');
  const courierArrivedIllustration = require('../assets/illustrations/delivery-tracking.png');
  const orderDeliveredIllustration = require('../assets/illustrations/order-delivered.png');

  switch (stage) {
    case 'placed':
      return {
        headline: t('orderTracking.orderPlaced'),
        subline: t('orderTracking.receivedOrder'),
        illustrationSource: orderPlacedIllustration,
      };
    case 'queue':
      const suffix = queuePosition === 1 ? t('orderTracking.queuePositionSuffix1st')
        : queuePosition === 2 ? t('orderTracking.queuePositionSuffix2nd')
        : queuePosition === 3 ? t('orderTracking.queuePositionSuffix3rd')
        : t('orderTracking.queuePositionSuffixTh');
      const orderText = ordersAhead === 1 ? t('orderTracking.moreOrder') : t('orderTracking.moreOrders');
      return {
        headline: `${t('orderTracking.queuePosition').replace('{position}', queuePosition.toString())}${suffix} ${t('orderTracking.inLine')}`,
        subline: `${t('orderTracking.willDeliver')} ${ordersAhead} ${orderText} ${t('orderTracking.beforeYours')}.`,
        illustrationSource: orderQueueIllustration,
      };
    case 'on_the_way':
      return {
        headline: t('orderTracking.courierOnWay'),
        subline: t('orderTracking.orderArriveSoon'),
        illustrationSource: deliveryVanIllustration,
      };
    case 'courier_arrived':
      return {
        headline: t('orderTracking.courierArrived'),
        subline: t('orderTracking.courierAtDoor'),
        illustrationSource: courierArrivedIllustration,
      };
    case 'delivered':
      return {
        headline: t('orderTracking.delivered'),
        subline: t('orderTracking.orderDeliveredMessage'),
        illustrationSource: orderDeliveredIllustration,
      };
    default:
      return {
        headline: '',
        subline: '',
        illustrationSource: orderPlacedIllustration,
      };
  }
}

function stageToInternal(stage: OrderStage): Stage {
  switch (stage) {
    case OrderStage.ORDER_PLACED:
      return 'placed';
    case OrderStage.IN_QUEUE:
      return 'queue';
    case OrderStage.COURIER_ON_THE_WAY:
      return 'on_the_way';
    case OrderStage.COURIER_ARRIVED:
      return 'courier_arrived';
    case OrderStage.DELIVERED:
      return 'delivered';
    default:
      return 'placed';
  }
}

/* ---------- MAIN COMPONENT ---------- */

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentOrder, setCurrentOrder } = useOrder();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const { handleStageChange } = useStageSounds();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCallFirmModal, setShowCallFirmModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [showReturnedToQueueModal, setShowReturnedToQueueModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const previousStageRef = useRef<OrderStage | null>(null);

  // Function to fetch latest order status
  const fetchOrderStatus = useCallback(async () => {
    if (!currentOrder || currentOrder.stage === OrderStage.DELIVERED || currentOrder.stage === OrderStage.CANCELLED) return;

    try {
      const status = await getOrderStatus(currentOrder.id);
      const driver = await getDriverInfo(currentOrder.id);

      // Check if any relevant data changed (stage, driver info, or queue position)
      // Also check if driver data has new fields like carBrand that weren't fetched before
      const driverHasNewInfo = driver && (
        driver.id !== currentOrder.driver?.id ||
        driver.carBrand !== currentOrder.driver?.carBrand ||
        driver.carColor !== currentOrder.driver?.carColor ||
        driver.company !== currentOrder.driver?.company ||
        driver.vehicleNumber !== currentOrder.driver?.vehicleNumber
      );
      const hasChanges =
        status.stage !== currentOrder.stage ||
        driverHasNewInfo ||
        status.queuePosition !== currentOrder.queuePosition ||
        status.ordersAhead !== currentOrder.ordersAhead;

      if (hasChanges) {
        setCurrentOrder({
          ...currentOrder,
          stage: status.stage,
          estimatedDelivery: status.estimatedDelivery,
          queuePosition: status.queuePosition,
          ordersAhead: status.ordersAhead,
          driver: driver || currentOrder.driver,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      // Check if order was deleted (404 or "Order not found" error)
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setShowDeletedModal(true);
      }
      // Silently ignore network errors - they are expected when backend is unavailable
      // The polling will retry automatically
    }
  }, [currentOrder, setCurrentOrder]);

  // Fetch full order on mount to get paymentMethod and other fields
  useEffect(() => {
    const fetchFullOrder = async () => {
      if (!currentOrder) return;
      try {
        const fullOrder = await getOrderById(currentOrder.id);
        // Update with full order data (includes paymentMethod)
        setCurrentOrder({
          ...currentOrder,
          ...fullOrder,
        });
      } catch (error) {
        console.log('Failed to fetch full order:', error);
      }
    };
    fetchFullOrder();
  }, []);

  // Fetch status immediately on mount
  useEffect(() => {
    fetchOrderStatus();
  }, []);

  // Poll for order status updates - fast polling for real-time feel
  useEffect(() => {
    if (!currentOrder || currentOrder.stage === OrderStage.DELIVERED || currentOrder.stage === OrderStage.CANCELLED) return;

    const interval = setInterval(fetchOrderStatus, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [currentOrder?.id, currentOrder?.stage, fetchOrderStatus]);

  // Show cancelled modal when order is cancelled
  useEffect(() => {
    if (currentOrder && currentOrder.stage === OrderStage.CANCELLED) {
      setShowCancelledModal(true);
    }
  }, [currentOrder?.stage]);

  // Detect when order is returned to queue (driver cancelled)
  useEffect(() => {
    if (currentOrder) {
      const prevStage = previousStageRef.current;
      const currentStage = currentOrder.stage;

      // If order was ON_THE_WAY or COURIER_ARRIVED and now is IN_QUEUE, show the modal
      if (
        (prevStage === OrderStage.COURIER_ON_THE_WAY || prevStage === OrderStage.COURIER_ARRIVED) &&
        currentStage === OrderStage.IN_QUEUE
      ) {
        setShowReturnedToQueueModal(true);
      }

      // Update previous stage ref
      previousStageRef.current = currentStage;
    }
  }, [currentOrder?.stage]);

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

  // Play sound when stage changes
  useEffect(() => {
    if (currentOrder) {
      const internalStage = stageToInternal(currentOrder.stage);
      handleStageChange(internalStage);
    }
  }, [currentOrder?.stage, handleStageChange]);

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

      // Redirect to home after 1.5 seconds to let user see the success message
      setTimeout(() => {
        setCurrentOrder(null);
        navigation.navigate('MainTabs', { screen: 'HomeTab' });
      }, 1500);
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast(t('orderTracking.somethingWrong'), 'error');
    }
  };

  const stage = currentOrder ? stageToInternal(currentOrder.stage) : 'placed';

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('orderTracking.title')}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('orderTracking.noActiveOrder')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Use real queue data from backend (defaults to 1st in line if not available)
  const queuePosition = currentOrder.queuePosition ?? 1;
  const ordersAhead = currentOrder.ordersAhead ?? 0;

  // Safe defaults for financial fields (may be undefined from backend)
  const subtotal = currentOrder.subtotal ?? currentOrder.total ?? 0;
  const deliveryFee = currentOrder.deliveryFee ?? 0;
  const serviceFee = currentOrder.serviceFee ?? 0;
  const total = currentOrder.total ?? 0;

  const { headline, subline, illustrationSource } = getStageContent({
    stage,
    queuePosition,
    ordersAhead,
    t,
  });

  // Convert cart items to order items - keep full product data for image
  const items = currentOrder.items;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainTabs')}>
          <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orderTracking.title')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order summary */}
        <View style={styles.orderCard}>
          {/* Order Number */}
          <Text style={styles.orderNumber}>
            {currentOrder.orderNumber || `#${currentOrder.id?.slice(-8)}`}
          </Text>

          {/* Deliver by / Delivered by */}
          <View style={styles.deliverByRow}>
            <View style={styles.firmLogoMini}>
              <Image
                source={
                  typeof currentOrder.firm.logo === 'number'
                    ? currentOrder.firm.logo
                    : typeof currentOrder.firm.logo === 'string' && currentOrder.firm.logo.length > 0
                    ? { uri: currentOrder.firm.logo }
                    : getFirmLogo(currentOrder.firm.name) || require('../assets/firms/aquawater-logo.png')
                }
                style={styles.firmLogoMiniImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.deliverByText}>
              {stage === 'delivered' ? 'Delivered by ' : 'Deliver by: '}
              <Text style={styles.firmNameText}>{currentOrder.firm.name}</Text>
            </Text>
          </View>
        </View>

        {/* Progress + illustration + text */}
        <View style={styles.progressCard}>
          <ProgressBar stage={stage} t={t} />

          <View style={styles.vanSection}>
            <Image
              source={illustrationSource}
              style={styles.vanImage}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>

          <View style={styles.etaBlock}>
            <Text style={styles.etaTitle}>{headline}</Text>
            {subline ? <Text style={styles.etaSubtitle}>{subline}</Text> : null}
          </View>
        </View>

        {/* Driver card показываем только на этапе on_the_way, courier_arrived и delivered */}
        {currentOrder.driver && (stage === 'on_the_way' || stage === 'courier_arrived' || stage === 'delivered') && (
          <DriverCard
            name={currentOrder.driver.name}
            plateNumber={currentOrder.driver.vehicleNumber}
            carBrand={currentOrder.driver.carBrand}
            carColor={currentOrder.driver.carColor}
            onCallPress={() => {
              // TODO: Implement call functionality
              console.log('Call driver:', currentOrder.driver?.phone);
            }}
          />
        )}

        {/* Items (товар) — на всех этапах */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>{t('orderTracking.items')}</Text>
          {items.map((item, index) => (
            <View key={`item-${item.product?.id || index}`} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={styles.itemImageWrapper}>
                  <Image
                    source={getProductImageByName(item.product.name, item.product.volume)}
                    style={styles.itemImage}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                </View>
                <View>
                  <Text style={styles.itemTitle}>{getTranslatedProductName(item.product, language)}</Text>
                  <Text style={styles.itemSubtitle}>
                    {item.product.volume} × {item.quantity}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>
                {((item.product.price ?? 0) * (item.quantity ?? 1)).toLocaleString()} UZS
              </Text>
            </View>
          ))}
        </View>

        {/* Fee Breakdown */}
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('orderTracking.subtotal')}</Text>
            <Text style={styles.feeValue}>{subtotal.toLocaleString()} UZS</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('orderTracking.deliveryFee')}</Text>
            {deliveryFee === 0 ? (
              <Text style={styles.feeValueFree}>{t('cart.free')}</Text>
            ) : (
              <Text style={styles.feeValue}>{deliveryFee.toLocaleString()} UZS</Text>
            )}
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('orderTracking.serviceFee')}</Text>
            {serviceFee === 0 ? (
              <Text style={styles.feeValueFree}>{t('cart.free')}</Text>
            ) : (
              <Text style={styles.feeValue}>{serviceFee.toLocaleString()} UZS</Text>
            )}
          </View>
          <View style={[styles.feeRow, styles.paymentRow]}>
            <Text style={styles.feeLabel}>{t('orderTracking.paymentMethod')}</Text>
            <View style={styles.paymentMethodWrapper}>
              <Image
                source={
                  currentOrder.paymentMethod === 'card'
                    ? require('../assets/payment/payme-icon.png')
                    : require('../assets/payment/cash-icon.png')
                }
                style={styles.paymentIcon}
                resizeMode="contain"
              />
              <Text style={styles.feeValue}>
                {currentOrder.paymentMethod === 'card'
                  ? t('orderTracking.card')
                  : t('orderTracking.cash')}
              </Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t('orderTracking.total')}</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} UZS</Text>
        </View>

        {/* Bottom actions */}
        {currentOrder.stage !== OrderStage.DELIVERED ? (
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCallFirmModal(true)}
            >
              <Text style={styles.cancelText}>{t('orderTracking.cancel')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCurrentOrder(null);
                navigation.navigate('MainTabs');
              }}
            >
              <Text style={styles.cancelText}>{t('orderTracking.backToHome')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        driverName={currentOrder?.driver?.name}
        companyName={currentOrder?.firm.name || ''}
        companyLogo={
          typeof currentOrder?.firm.logo === 'number'
            ? currentOrder.firm.logo
            : typeof currentOrder?.firm.logo === 'string' && currentOrder.firm.logo.length > 0
            ? currentOrder.firm.logo
            : getFirmLogo(currentOrder?.firm.name || '') || require('../assets/firms/aquawater-logo.png')
        }
      />

      {/* Call Firm Modal */}
      <CallFirmModal
        visible={showCallFirmModal}
        onClose={() => setShowCallFirmModal(false)}
        firmPhone={currentOrder?.firm.phone}
      />

      {/* Cancelled Order Modal */}
      <CancelledOrderModal
        visible={showCancelledModal}
        onClose={() => {
          setShowCancelledModal(false);
          setCurrentOrder(null);
          navigation.navigate('MainTabs', { screen: 'HomeTab' });
        }}
        firmName={currentOrder?.firm.name}
      />

      {/* Order Returned to Queue Modal */}
      <OrderReturnedToQueueModal
        visible={showReturnedToQueueModal}
        onClose={() => setShowReturnedToQueueModal(false)}
        firmName={currentOrder?.firm.name}
      />

      {/* Order Deleted Modal */}
      <OrderDeletedModal
        visible={showDeletedModal}
        onClose={() => {
          setShowDeletedModal(false);
          setCurrentOrder(null);
          navigation.navigate('MainTabs', { screen: 'HomeTab' });
        }}
      />
    </SafeAreaView>
  );
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#0C1633',
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#0C1633',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8FA6',
  },
  orderCard: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  deliverByRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliverByText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  firmNameText: {
    fontWeight: '600',
    color: '#374151',
  },
  firmLogoMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  firmLogoMiniImage: {
    width: '100%',
    height: '100%',
  },
  progressCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  progressLineBackground: {
    position: 'absolute',
    top: 13,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#E5E9F2',
    borderRadius: 2,
  },
  progressLineActive: {
    position: 'absolute',
    top: 13,
    left: '10%',
    height: 3,
    backgroundColor: '#2EC973',
    borderRadius: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D6DEFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  stepCircleActive: {
    borderColor: '#2F6BFF',
    backgroundColor: '#E5EDFF',
  },
  stepCircleDone: {
    borderColor: '#2EC973',
    backgroundColor: '#2EC973',
  },
  stepIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  stepActiveDot: {
    fontSize: 20,
    color: '#2F6BFF',
    marginTop: -2,
  },
  stepLabel: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    color: '#9BA0B8',
  },
  stepLabelActive: {
    color: '#0C1633',
    fontWeight: '600',
  },
  stepLabelDone: {
    color: '#2EC973',
    fontWeight: '600',
  },
  vanSection: {
    marginTop: 8,
    alignItems: 'center',
  },
  vanImage: {
    width: 220,
    height: 140,
  },
  etaBlock: {
    marginTop: 6,
    alignItems: 'center',
  },
  etaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
    textAlign: 'center',
  },
  etaSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#8A8FA6',
    textAlign: 'center',
  },
  itemsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  itemImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F4F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: 40,
    height: 40,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0C1633',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#8A8FA6',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F6BFF',
    marginLeft: 8,
  },
  feeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#8A8FA6',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C1633',
  },
  feeValueFree: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22C55E',
  },
  paymentRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F7FF',
  },
  paymentMethodWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  totalCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0C1633',
  },
  bottomButtons: {
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: '#2F6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportText: {
    marginTop: 10,
    fontSize: 14,
    color: '#2F6BFF',
    textDecorationLine: 'underline',
  },
});

export default OrderTrackingScreen;
