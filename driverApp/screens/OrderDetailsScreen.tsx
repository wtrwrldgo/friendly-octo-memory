import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import YaMap, { Marker } from 'react-native-yamap';
import { OrderStage } from '../types';
import { useToast } from '../context/ToastContext';
import { useDriverStore } from '../stores/useDriverStore';
import { useLanguageStore } from '../stores/useLanguageStore';
import ApiService from '../services/api.service';
import SlideToConfirm from '../components/SlideToConfirm';
import { MAP_CONFIG } from '../config/mapkit.config';

interface OrderDetailsScreenProps {
  route: {
    params: {
      orderId: string;
    };
  };
  navigation: any;
}

export default function OrderDetailsScreen({ route, navigation }: OrderDetailsScreenProps) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { showError, showSuccess } = useToast();
  const driver = useDriverStore((state) => state.driver);
  const setActiveOrder = useDriverStore((state) => state.setActiveOrder);
  const t = useLanguageStore((state) => state.t);
  const insets = useSafeAreaInsets();


  useEffect(() => {
    fetchOrderDetails();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      console.log('[OrderDetails] Fetching order:', orderId);
      const orderData = await ApiService.getOrderById(orderId);
      console.log('[OrderDetails] Order fetched, stage:', orderData?.stage);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      showError(error.message || t('orderDetails.errors.loadFailed'));
      // Navigate to Main screen instead of goBack to avoid navigation errors
      navigation.navigate('Main');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStage = async (newStage: OrderStage) => {
    try {
      await ApiService.updateOrderStatus(orderId, newStage);

      const stageMessages: Record<OrderStage, string> = {
        [OrderStage.ORDER_PLACED]: t('activeOrder.stageMessages.orderPlaced'),
        [OrderStage.IN_QUEUE]: t('activeOrder.stageMessages.inQueue'),
        [OrderStage.COURIER_ON_THE_WAY]: t('activeOrder.stageMessages.courierOnTheWay'),
        [OrderStage.COURIER_ARRIVED]: t('activeOrder.stageMessages.courierArrived'),
        [OrderStage.DELIVERED]: t('activeOrder.stageMessages.delivered'),
        [OrderStage.CANCELLED]: t('activeOrder.stageMessages.cancelled'),
      };

      showSuccess(stageMessages[newStage] || t('common.success'));

      if (newStage === OrderStage.DELIVERED) {
        setTimeout(() => navigation.navigate('Main'), 1000);
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      showError(error.message || t('activeOrder.errors.updateFailed'));
      throw error; // Re-throw so SlideToConfirm can handle it
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = () => {
    if (!order?.addresses?.latitude || !order?.addresses?.longitude) {
      setErrorMessage(t('errors.locationError'));
      setShowErrorModal(true);
      return;
    }

    // Show custom modal to choose navigation app
    setShowNavigationModal(true);
  };

  const openGoogleMaps = (latitude: number, longitude: number) => {
    setShowNavigationModal(false);

    // Platform-specific Google Maps URLs
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url!)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url!);
        } else {
          // Fallback to browser-based Google Maps
          const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          return Linking.openURL(fallbackUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening Google Maps:', err);
        setErrorMessage(t('orderDetails.cannotOpenGoogleMaps'));
        setShowErrorModal(true);
      });
  };

  const openYandexMaps = (latitude: number, longitude: number) => {
    setShowNavigationModal(false);

    // Yandex Maps URL scheme
    const yandexUrl = `yandexmaps://maps.yandex.com/?rtext=~${latitude},${longitude}&rtt=auto`;
    const yandexWebUrl = `https://yandex.com/maps/?rtext=~${latitude},${longitude}&rtt=auto`;

    Linking.canOpenURL(yandexUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(yandexUrl);
        } else {
          // Fallback to browser-based Yandex Maps
          return Linking.openURL(yandexWebUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening Yandex Maps:', err);
        setErrorMessage(t('orderDetails.cannotOpenYandexMaps'));
        setShowErrorModal(true);
      });
  };

  const openAppleMaps = (latitude: number, longitude: number) => {
    setShowNavigationModal(false);

    // Apple Maps URL scheme (works on iOS)
    const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}&dirflg=d`;
    const appleWebUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}`;

    Linking.canOpenURL(appleMapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(appleMapsUrl);
        } else {
          // Fallback to web-based Apple Maps
          return Linking.openURL(appleWebUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening Apple Maps:', err);
        setErrorMessage(t('orderDetails.cannotOpenAppleMaps'));
        setShowErrorModal(true);
      });
  };

  // Get address icon based on type
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
        return require('../assets/ui-icons/address-icon.png'); // Default 3D address pin
    }
  };

  const handlePrimaryAction = async () => {
    if (!order || !driver) {
      throw new Error('Order or driver not found');
    }

    console.log('[OrderDetails] handlePrimaryAction - Current stage:', order.stage);

    if (order.stage === OrderStage.IN_QUEUE) {
      // Accept and assign order to driver
      console.log('[OrderDetails] Accepting order...');
      await ApiService.acceptOrder(orderId, driver.id);
      showSuccess(t('activeOrder.stageMessages.courierOnTheWay'));
      console.log('[OrderDetails] Order accepted, fetching updated order...');
      await fetchOrderDetails();
      // Set active order to show in bottom tab
      setActiveOrder(order);
    } else if (order.stage === OrderStage.COURIER_ON_THE_WAY) {
      console.log('[OrderDetails] Marking arrived...');
      await updateOrderStage(OrderStage.COURIER_ARRIVED);
      console.log('[OrderDetails] Marked arrived, fetching updated order...');
      await fetchOrderDetails();
    } else if (order.stage === OrderStage.COURIER_ARRIVED) {
      console.log('[OrderDetails] Completing delivery...');
      await updateOrderStage(OrderStage.DELIVERED);
      console.log('[OrderDetails] Delivery completed, fetching updated order...');
      await fetchOrderDetails();
      // Clear active order when delivered
      setActiveOrder(null);
    }
  };

  const getSlideText = () => {
    if (!order) return '';

    let text;
    switch (order.stage) {
      case OrderStage.IN_QUEUE:
        text = t('activeOrder.slideToAccept');
        break;
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

    console.log('[OrderDetails] getSlideText - Stage:', order.stage, 'Text:', text);
    return text;
  };

  const renderStageIcon = (isCompleted: boolean) => {
    if (isCompleted) {
      // Green checkmark for completed stages
      return <Text style={styles.checkIcon}>✓</Text>;
    } else {
      // ActivityIndicator loading spinner for incomplete stages
      return <ActivityIndicator size="small" color="#FFFFFF" />;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const isDelivered = order.stage === OrderStage.DELIVERED;

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>{t('orderDetails.title')}</Text>
            <Text style={styles.orderNumberLarge}>#{order.order_number}</Text>
            {/* Scheduled delivery time badge */}
            {order.preferred_delivery_time && (
              <View style={styles.scheduledTimeContainer}>
                <Text style={styles.scheduledTimeIcon}>🕐</Text>
                <Text style={styles.scheduledTimeText}>
                  {t('orders.scheduledFor')} {new Date(order.preferred_delivery_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {new Date(order.preferred_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
          </View>
          <View style={{ width: 44 }} />
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
                  (order.stage === OrderStage.COURIER_ON_THE_WAY ||
                    order.stage === OrderStage.COURIER_ARRIVED ||
                    order.stage === OrderStage.DELIVERED)
                    ? styles.checkCircleCompleted
                    : styles.checkCircleLoading,
                ]}
              >
                {renderStageIcon(
                  order.stage === OrderStage.COURIER_ON_THE_WAY ||
                    order.stage === OrderStage.COURIER_ARRIVED ||
                    order.stage === OrderStage.DELIVERED
                )}
              </View>
              {/* Line 2 - Active when arrived or delivered */}
              <View
                style={[
                  styles.connectingLine,
                  (order.stage === OrderStage.COURIER_ARRIVED ||
                    order.stage === OrderStage.DELIVERED) && styles.connectingLineActive,
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
                  (order.stage === OrderStage.COURIER_ARRIVED || order.stage === OrderStage.DELIVERED)
                    ? styles.checkCircleCompleted
                    : styles.checkCircleLoading,
                ]}
              >
                {renderStageIcon(
                  order.stage === OrderStage.COURIER_ARRIVED || order.stage === OrderStage.DELIVERED
                )}
              </View>
              {/* Line 3 - Active when delivered */}
              <View
                style={[
                  styles.connectingLine,
                  order.stage === OrderStage.DELIVERED && styles.connectingLineActive,
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
                  order.stage === OrderStage.DELIVERED
                    ? styles.checkCircleCompleted
                    : styles.checkCircleLoading,
                ]}
              >
                {renderStageIcon(order.stage === OrderStage.DELIVERED)}
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
          <Text style={styles.cardTitle}>{t('orderDetails.customer')}</Text>
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
                <Text style={styles.customerNameBold}>{order.users?.name || t('orderDetails.customer')}</Text>
                <Text style={styles.phoneNumber}>{order.users?.phone}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleCall(order.users?.phone)} style={styles.callButtonLarge}>
              <Image
                source={require('../assets/call-icon.png')}
                style={styles.callIcon3D}
                resizeMode="contain"
              />
              <Text style={styles.callButtonText}>{t('orderDetails.call')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Address Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>{t('orderDetails.deliveryAddress')}</Text>

          {/* Address Info */}
          <View style={styles.addressInfoContainer}>
            <View style={styles.addressIconWrapper}>
              <Image
                source={getAddressIcon(order.addresses?.type)}
                style={styles.addressIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.addressTextWrapper}>
              <Text style={styles.addressTitle}>{order.addresses?.title || t('orderDetails.deliveryAddress')}</Text>
              <Text style={styles.addressDetail}>{order.addresses?.address}</Text>
              {/* Show floor for apartment, office, and government */}
              {(order.addresses?.type?.toLowerCase() === 'apartment' ||
                order.addresses?.type?.toLowerCase() === 'office' ||
                order.addresses?.type?.toLowerCase() === 'government') &&
                order.addresses?.floor && (
                  <Text style={styles.floorInfo}>Floor: {order.addresses.floor}</Text>
                )}
            </View>
          </View>

          {/* Embedded Map */}
          {order.addresses?.latitude && order.addresses?.longitude && (
            <View style={styles.mapContainer}>
              <YaMap
                style={styles.map}
                initialRegion={{
                  lat: parseFloat(String(order.addresses.latitude)),
                  lon: parseFloat(String(order.addresses.longitude)),
                  zoom: MAP_CONFIG.orderDetailZoom,
                }}
                showUserPosition={false}
              >
                <Marker
                  point={{
                    lat: parseFloat(String(order.addresses.latitude)),
                    lon: parseFloat(String(order.addresses.longitude)),
                  }}
                  scale={1.2}
                />
              </YaMap>
            </View>
          )}

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
            <Text style={styles.navigateText}>{t('orderDetails.navigate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Order Summary Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.cardTitle}>{t('orderDetails.orderItems')}</Text>
          {order.items && order.items.map((item: { id: string; product_name: string; quantity: number; price: number; product_image?: string }, index: number) => (
            <View key={index} style={styles.orderItemRow}>
              <View style={styles.itemIconContainer}>
                {item.product_image ? (
                  <Image
                    source={{ uri: item.product_image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../assets/aqua-water-icon.png')}
                    style={styles.waterIcon3D}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={styles.itemName}>{item.quantity}× {item.product_name}</Text>
              <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} UZS</Text>
            </View>
          ))}

          {/* Total Price */}
          <View style={styles.totalPriceRow}>
            <Text style={styles.totalLabel}>{t('orderDetails.total')}</Text>
            <Text style={styles.totalPrice}>{order.total.toLocaleString()} UZS</Text>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentMethodBadge}>
                <Image
                  source={
                    order.payment_method === 'card'
                      ? require('../assets/payment/card-icon.png')
                      : require('../assets/payment/cash-icon.png')
                  }
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentMethodText}>
                  {order.payment_method === 'card' ? 'Card' : 'Cash'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cancel Order Button */}
        <TouchableOpacity
          style={styles.cancelOrderButton}
          onPress={() => setShowCancelModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelOrderButtonText}>{t('orderDetails.cancelOrder')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Slide to confirm button - Fixed at bottom */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <SlideToConfirm
          onConfirm={handlePrimaryAction}
          text={getSlideText()}
          disabled={isDelivered}
        />
      </View>

      {/* Navigation App Selection Modal */}
      <Modal
        visible={showNavigationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNavigationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('orderDetails.chooseNavigationApp')}</Text>
              <Text style={styles.modalSubtitle}>{t('orderDetails.selectMapApp')}</Text>
            </View>

            {/* Navigation Options */}
            <View style={styles.navigationOptions}>
              {/* Google Maps Option */}
              <TouchableOpacity
                style={styles.navigationOption}
                onPress={() => order?.addresses && openGoogleMaps(parseFloat(String(order.addresses.latitude)), parseFloat(String(order.addresses.longitude)))}
                activeOpacity={0.7}
              >
                <View style={styles.navigationIconContainer}>
                  <Text style={styles.navigationIcon}>🗺️</Text>
                </View>
                <View style={styles.navigationTextContainer}>
                  <Text style={styles.navigationOptionTitle}>Google Maps</Text>
                  <Text style={styles.navigationOptionSubtitle}>Navigate with Google Maps</Text>
                </View>
                <Text style={styles.navigationChevron}>›</Text>
              </TouchableOpacity>

              {/* Yandex Maps Option */}
              <TouchableOpacity
                style={styles.navigationOption}
                onPress={() => order?.addresses && openYandexMaps(parseFloat(String(order.addresses.latitude)), parseFloat(String(order.addresses.longitude)))}
                activeOpacity={0.7}
              >
                <View style={styles.navigationIconContainer}>
                  <Text style={styles.navigationIcon}>🧭</Text>
                </View>
                <View style={styles.navigationTextContainer}>
                  <Text style={styles.navigationOptionTitle}>Yandex Maps</Text>
                  <Text style={styles.navigationOptionSubtitle}>Navigate with Yandex Maps</Text>
                </View>
                <Text style={styles.navigationChevron}>›</Text>
              </TouchableOpacity>

              {/* Apple Maps Option */}
              <TouchableOpacity
                style={styles.navigationOption}
                onPress={() => order?.addresses && openAppleMaps(parseFloat(String(order.addresses.latitude)), parseFloat(String(order.addresses.longitude)))}
                activeOpacity={0.7}
              >
                <View style={styles.navigationIconContainer}>
                  <Text style={styles.navigationIcon}>🍎</Text>
                </View>
                <View style={styles.navigationTextContainer}>
                  <Text style={styles.navigationOptionTitle}>Apple Maps</Text>
                  <Text style={styles.navigationOptionSubtitle}>Navigate with Apple Maps</Text>
                </View>
                <Text style={styles.navigationChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowNavigationModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContent}>
            {/* Error Icon */}
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>

            {/* Error Title */}
            <Text style={styles.errorTitle}>{t('common.error')}</Text>

            {/* Error Message */}
            <Text style={styles.errorMessage}>{errorMessage}</Text>

            {/* OK Button */}
            <TouchableOpacity
              style={styles.errorOkButton}
              onPress={() => setShowErrorModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.errorOkText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            {/* Icon */}
            <Image
              source={require('../assets/cancel-order-icon.png')}
              style={styles.cancelModalImage}
              resizeMode="contain"
            />

            {/* Title */}
            <Text style={styles.cancelModalTitle}>{t('orderDetails.cancelOrder')}</Text>

            {/* Message */}
            <Text style={styles.cancelModalMessage}>
              {t('activeOrder.cancelInfo')}
            </Text>

            {/* Buttons */}
            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalCloseBtn}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelModalCloseBtnText}>{t('common.ok')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelModalCallBtn}
                onPress={() => {
                  Linking.openURL(`tel:${order?.firms?.phone || '+998901234567'}`);
                  setShowCancelModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelModalCallIcon}>📞</Text>
                <Text style={styles.cancelModalCallBtnText}>{t('orderDetails.call')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_WHITE,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  // Scheduled delivery time badge
  scheduledTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scheduledTimeIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  scheduledTimeText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '600',
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
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  map: {
    flex: 1,
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
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: WATERGO_BLUE,
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

  // Navigation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: BG_WHITE,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationOptions: {
    gap: 12,
    marginBottom: 20,
  },
  navigationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_LIGHT,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navigationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BG_WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  navigationIcon: {
    fontSize: 24,
  },
  navigationTextContainer: {
    flex: 1,
  },
  navigationOptionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  navigationOptionSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  navigationChevron: {
    fontSize: 32,
    color: TEXT_MUTED,
    fontWeight: '400',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_MUTED,
  },

  // Error Modal Styles
  errorModalContent: {
    backgroundColor: BG_WHITE,
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorOkButton: {
    backgroundColor: WATERGO_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  errorOkText: {
    fontSize: 17,
    fontWeight: '700',
    color: BG_WHITE,
  },

  // Cancel Order Button
  cancelOrderButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  cancelOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Cancel Modal Styles
  cancelModalContent: {
    backgroundColor: BG_WHITE,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  cancelModalImage: {
    width: 180,
    height: 140,
    marginBottom: 20,
  },
  cancelModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 12,
  },
  cancelModalMessage: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  cancelModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelModalCloseBtn: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelModalCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  cancelModalCallBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelModalCallIcon: {
    fontSize: 16,
  },
  cancelModalCallBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
