import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, Language } from '../i18n/translations';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/api';
import { Address } from '../types';
import { scale, moderateScale, wp } from '../constants/Colors';
import { getProductImageByName } from '../utils/imageMapping';
import { getTranslatedProductName } from '../utils/translations';

// 3D Duolingo-style color palette
const C = {
  bg: '#F6F8FF',
  card: '#FFFFFF',
  primary: '#3B66FF',
  primary2: '#6E8CFF',
  text: '#0E1733',
  sub: '#8088A2',
  success: '#21C065',
  pill: '#EEF2FF',
  gray: '#F5F5F5',
};

// Helper Components
function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={s.counter}>
      <TouchableOpacity style={s.pillBtn} onPress={() => onChange(Math.max(0, value - 1))}>
        <Text style={s.pillBtnTxt}>−</Text>
      </TouchableOpacity>
      <Text style={s.qty}>{value}</Text>
      <TouchableOpacity style={s.pillBtn} onPress={() => onChange(value + 1)}>
        <Text style={s.pillBtnTxt}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatUZS(n: number) {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

// Address selection modal component
function AddressSelectionModal({
  visible,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNew,
  bottomInset,
}: {
  visible: boolean;
  onClose: () => void;
  addresses: any[];
  selectedAddress: any;
  onSelectAddress: (address: any) => void;
  onAddNew: () => void;
  bottomInset: number;
}) {
  const getAddressIcon = (type?: string) => {
    switch (type) {
      case 'house': return require('../assets/address/house-3d.png');
      case 'apartment': return require('../assets/address/apartment-3d.png');
      case 'government': return require('../assets/address/government-3d.png');
      case 'office': return require('../assets/address/office-3d.png');
      default: return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Mánzil saylań</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.addressList} contentContainerStyle={[s.addressListContent, { paddingBottom: Math.max(bottomInset, Platform.OS === 'android' ? 48 : 16) + 24 }]}>
            {addresses.map((address) => {
              const iconSource = getAddressIcon(address.addressType);
              return (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    s.addressOption,
                    selectedAddress?.id === address.id && s.addressOptionSelected,
                  ]}
                  onPress={() => {
                    onSelectAddress(address);
                    onClose();
                  }}
                >
                  {iconSource ? (
                    <Image source={iconSource} style={s.addressOptionIcon} resizeMode="contain" />
                  ) : (
                    <Image
                      source={require('../assets/ui-icons/address-icon.png')}
                      style={s.addressOptionIcon}
                      resizeMode="contain"
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.addressOptionTitle}>{address.title}</Text>
                    <Text style={s.addressOptionText} numberOfLines={1}>
                      {address.address}
                    </Text>
                  </View>
                  {selectedAddress?.id === address.id && (
                    <View style={s.checkIcon}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Add New Address Button */}
            <TouchableOpacity
              style={s.addNewAddressBtn}
              onPress={() => {
                onClose();
                onAddNew();
              }}
              activeOpacity={0.7}
            >
              <View style={s.addNewIcon}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>+</Text>
              </View>
              <Text style={s.addNewText}>Jańa mánzil qosıw</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Wheel Picker Component (Apple-style number wheel)
function WheelPicker({
  items,
  selectedIndex,
  onSelect,
  itemHeight = 40,
  visibleItems = 3,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
}) {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const containerHeight = itemHeight * visibleItems;
  const paddingVertical = (containerHeight - itemHeight) / 2;

  React.useEffect(() => {
    // Scroll to selected item on mount
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * itemHeight,
        animated: false,
      });
    }, 50);
  }, []);

  const handleScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    onSelect(clampedIndex);

    // Snap to item
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * itemHeight,
      animated: true,
    });
  };

  return (
    <View style={{ height: containerHeight, overflow: 'hidden' }}>
      {/* Selection highlight */}
      <View
        style={{
          position: 'absolute',
          top: paddingVertical,
          left: 0,
          right: 0,
          height: itemHeight,
          backgroundColor: '#EEF2FF',
          borderRadius: 12,
          zIndex: 0,
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingVertical }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              height: itemHeight,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              onSelect(index);
              scrollViewRef.current?.scrollTo({
                y: index * itemHeight,
                animated: true,
              });
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: selectedIndex === index ? '700' : '500',
                color: selectedIndex === index ? '#0E1733' : '#8088A2',
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Time selection modal component with wheel picker and date selection
function TimeSelectionModal({
  visible,
  onClose,
  onSelect,
  currentSelection,
  language,
  bottomInset,
  firmDeliveryTime,
  scheduleDaysLimit = 7,
  scheduleTimeInterval = 30,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string, date?: Date) => void;
  currentSelection: string;
  language: Language;
  bottomInset: number;
  firmDeliveryTime?: string;
  scheduleDaysLimit?: number;
  scheduleTimeInterval?: number;
}) {
  // Get translations and use real firm delivery time from CRM
  const deliveryTime = firmDeliveryTime || '30-45 min';
  const langTranslations = (translations as any)[language] || translations.en;
  const baseTs = langTranslations.timeSelection || {};

  // Build subtitle with actual firm delivery time - use regex to replace any time pattern
  const timePattern = /\d+-\d+\s*[^\s)]+/g; // Matches patterns like "15-25 min", "15-25 minutes", "15-25 минут", but NOT the closing ")"

  const getDeliverNowSubtitle = () => {
    const baseText = baseTs.deliverNowSubtitle || 'Delivered within {time}';
    return baseText
      .replace('{time}', deliveryTime)
      .replace(timePattern, deliveryTime);
  };

  const getOrderNowText = () => {
    const baseText = baseTs.orderNow || 'Order now ({time})';
    return baseText
      .replace('{time}', deliveryTime)
      .replace(timePattern, deliveryTime);
  };

  const ts = {
    title: baseTs.title || 'Delivery Time',
    now: baseTs.now || 'Now',
    selectTime: baseTs.selectTime || 'Select time',
    deliverNow: baseTs.deliverNow || 'Deliver now',
    deliverNowSubtitle: getDeliverNowSubtitle(),
    orderNow: getOrderNowText(),
    today: baseTs.today || 'Today',
    tomorrow: baseTs.tomorrow || 'Tomorrow',
    selectDay: baseTs.selectDay || 'Select day',
    hour: baseTs.hour || 'Hour',
    minute: baseTs.minute || 'Minute',
    confirm: baseTs.confirm || 'Confirm',
    days: baseTs.days || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: baseTs.months || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };
  const days = ts.days || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ts.months || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // Always default to "now" mode when modal opens
  const [mode, setMode] = React.useState<'now' | 'schedule'>('now');

  // Generate dates based on firm's scheduleDaysLimit setting
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const daysLimit = Math.min(Math.max(scheduleDaysLimit, 1), 10); // Clamp between 1-10
    for (let i = 0; i < daysLimit; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = React.useMemo(() => generateDates(), [scheduleDaysLimit]);
  const [selectedDateIndex, setSelectedDateIndex] = React.useState(0);

  // Format date for display
  const formatDateLabel = (date: Date, index: number) => {
    if (index === 0) return ts.today;
    if (index === 1) return ts.tomorrow;
    return days[date.getDay()];
  };

  const formatDateSub = (date: Date) => {
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Parse current time or use next available hour
  const getInitialTime = () => {
    if (!currentSelection.startsWith(ts.now) && currentSelection.includes(':')) {
      const timePart = currentSelection.split(' ')[0];
      if (timePart && timePart.includes(':')) {
        const [h, m] = timePart.split(':').map(Number);
        return { hour: h, minute: m };
      }
    }
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    return { hour: nextHour, minute: 0 };
  };

  const initialTime = getInitialTime();
  const [selectedHour, setSelectedHour] = React.useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = React.useState(initialTime.minute);

  // Generate hours (00-23) and minutes based on firm's scheduleTimeInterval
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Generate minute intervals based on scheduleTimeInterval
  // For intervals >= 60 min (1hr+), show only hourly slots (minute = 00)
  // For intervals < 60 min, show minute intervals within each hour
  const interval = [1, 2, 5, 10, 15, 30, 60, 120, 180].includes(scheduleTimeInterval) ? scheduleTimeInterval : 30;
  const minuteValues = interval >= 60
    ? [0] // For hourly intervals, only show :00
    : Array.from({ length: 60 / interval }, (_, i) => i * interval);
  const minutes = minuteValues.map(m => m.toString().padStart(2, '0'));

  const handleConfirm = () => {
    if (mode === 'now') {
      onSelect(ts.orderNow);
    } else {
      const selectedDate = availableDates[selectedDateIndex];
      const dateLabel = formatDateLabel(selectedDate, selectedDateIndex);
      const timeStr = `${hours[selectedHour]}:${minutes[selectedMinute]}`;
      onSelect(`${timeStr} - ${dateLabel}, ${formatDateSub(selectedDate)}`, selectedDate);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={[s.timeModalContent, { paddingBottom: Math.max(bottomInset, Platform.OS === 'android' ? 48 : 16) + 24 }]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{ts.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Toggle */}
          <View style={s.timeToggleContainer}>
            <TouchableOpacity
              style={[s.timeToggleBtn, mode === 'now' && s.timeToggleBtnActive]}
              onPress={() => setMode('now')}
            >
              <Text style={[s.timeToggleText, mode === 'now' && s.timeToggleTextActive]}>
                {ts.now}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.timeToggleBtn, mode === 'schedule' && s.timeToggleBtnActive]}
              onPress={() => setMode('schedule')}
            >
              <Text style={[s.timeToggleText, mode === 'schedule' && s.timeToggleTextActive]}>
                {ts.selectTime}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content based on mode */}
          {mode === 'now' ? (
            <View style={s.nowContent}>
              <Image
                source={require('../assets/ui-icons/delivery-icon.png')}
                style={s.nowIcon}
                resizeMode="contain"
              />
              <Text style={s.nowTitle}>{ts.deliverNow}</Text>
              <Text style={s.nowSubtitle}>{ts.deliverNowSubtitle}</Text>
            </View>
          ) : (
            <View style={s.scheduleContainer}>
              {/* Date Selection */}
              <Text style={s.sectionLabel}>{ts.selectDay}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.dateScrollView}
                contentContainerStyle={s.dateScrollContent}
              >
                {availableDates.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      s.dateCard,
                      selectedDateIndex === index && s.dateCardSelected,
                    ]}
                    onPress={() => setSelectedDateIndex(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      s.dateLabelMain,
                      selectedDateIndex === index && s.dateLabelMainSelected,
                    ]}>
                      {formatDateLabel(date, index)}
                    </Text>
                    <Text style={[
                      s.dateLabelSub,
                      selectedDateIndex === index && s.dateLabelSubSelected,
                    ]}>
                      {formatDateSub(date)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Time Selection */}
              <Text style={[s.sectionLabel, { marginTop: 12 }]}>{ts.selectTime}</Text>
              <View style={s.wheelContainer}>
                <View style={s.wheelRow}>
                  {/* Hour Wheel */}
                  <View style={s.wheelColumn}>
                    <Text style={s.wheelLabel}>{ts.hour}</Text>
                    <WheelPicker
                      items={hours}
                      selectedIndex={selectedHour}
                      onSelect={setSelectedHour}
                    />
                  </View>

                  {/* Separator */}
                  <Text style={s.wheelSeparator}>:</Text>

                  {/* Minute Wheel */}
                  <View style={s.wheelColumn}>
                    <Text style={s.wheelLabel}>{ts.minute}</Text>
                    <WheelPicker
                      items={minutes}
                      selectedIndex={selectedMinute}
                      onSelect={setSelectedMinute}
                    />
                  </View>
                </View>

                <Text style={s.selectedTimePreview}>
                  {hours[selectedHour]}:{minutes[selectedMinute]} - {formatDateLabel(availableDates[selectedDateIndex], selectedDateIndex)}, {formatDateSub(availableDates[selectedDateIndex])}
                </Text>
              </View>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity style={s.confirmTimeBtn} onPress={handleConfirm}>
            <Text style={s.confirmTimeBtnText}>{ts.confirm}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Address Warning Modal component (cross-platform)
function AddressWarningModal({
  visible,
  onClose,
  type,
  onAddAddress,
  onSelectAddress,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  type: 'no_address' | 'select_address';
  onAddAddress: () => void;
  onSelectAddress: () => void;
  t: (key: string) => string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={s.alertOverlay}>
        <View style={s.alertContainer}>
          {/* Icon */}
          <View style={s.alertIconContainer}>
            <Ionicons name="location-outline" size={28} color="#6B7280" />
          </View>

          {/* Title */}
          <Text style={s.alertTitle}>
            {type === 'no_address' ? t('cart.addressRequired') : t('cart.selectAddressBtn')}
          </Text>

          {/* Message */}
          <Text style={s.alertMessage}>
            {type === 'no_address'
              ? t('cart.selectAddressToOrder')
              : t('cart.selectAddressToContinue')}
          </Text>

          {/* Buttons */}
          <View style={s.alertButtonsContainer}>
            <TouchableOpacity
              style={s.alertSecondaryBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={s.alertSecondaryText}>{t('common.back') || 'Back'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.alertPrimaryBtn}
              onPress={() => {
                onClose();
                if (type === 'no_address') {
                  onAddAddress();
                } else {
                  onSelectAddress();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={s.alertPrimaryText}>
                {type === 'no_address' ? t('address.addAddress') : t('cart.selectAddressBtn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { cart, clearCart, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const { addresses, user } = useUser();
  const { setCurrentOrder, addToHistory, hasActiveOrder, currentOrder } = useOrder();
  const { t, language } = useLanguage();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressWarningModal, setShowAddressWarningModal] = useState(false);
  const [addressWarningType, setAddressWarningType] = useState<'no_address' | 'select_address'>('select_address');
  const [showFeeInfoModal, setShowFeeInfoModal] = useState(false);
  const [feeInfoType, setFeeInfoType] = useState<'delivery' | 'service'>('delivery');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Store selected delivery date
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(user?.defaultPaymentMethod || null); // Use default from profile if set
  const [cartSelectedAddress, setCartSelectedAddress] = useState<Address | null>(null); // Local cart address selection

  // Set initial time selection based on language and firm delivery time from CRM
  React.useEffect(() => {
    const langTranslations = (translations as any)[language] || translations.en;
    const deliveryTime = cart.firm?.deliveryTime || '30-45 min';
    const baseText = langTranslations.timeSelection?.orderNow || 'Order now ({time})';
    const timePattern = /\d+-\d+\s*[^\s)]+/g; // Matches "15-25 min", "15-25 минут", but NOT the closing ")"
    const orderNowText = baseText
      .replace('{time}', deliveryTime)
      .replace(timePattern, deliveryTime);
    setSelectedTime(orderNowText);
  }, [language, cart.firm?.deliveryTime]);

  // Initialize payment method from user's default when user data loads
  React.useEffect(() => {
    if (user?.defaultPaymentMethod && !selectedPaymentMethod) {
      setSelectedPaymentMethod(user.defaultPaymentMethod);
    }
  }, [user?.defaultPaymentMethod]);

  // Log addresses on focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== CartScreen Focused ===');
      console.log('Cart Selected Address:', cartSelectedAddress);
      console.log('All Addresses:', addresses);
      console.log('========================');
    }, [cartSelectedAddress, addresses])
  );

  // Handle address row click
  const handleAddressClick = () => {
    if (addresses.length === 0) {
      // No addresses - go directly to map
      navigation.navigate('SelectAddress');
    } else {
      // Has addresses - show selection modal
      setShowAddressModal(true);
    }
  };

  // Calculate totals - all prices in UZS
  const subtotal = useMemo(() => cart.total, [cart.total]);
  const bottleDepositEnabled = cart.firm?.bottleDepositEnabled ?? false;
  const bottleDepositPrice = cart.firm?.bottleDepositPrice ?? 15000;
  const deliveryFee = cart.firm?.deliveryFee ?? 0;
  const minOrder = cart.firm?.minOrder ?? 0;
  const total = useMemo(() => subtotal + (bottleDepositEnabled ? bottleDepositPrice : 0) + deliveryFee, [subtotal, bottleDepositEnabled, bottleDepositPrice, deliveryFee]);
  const isMinOrderMet = subtotal >= minOrder;

  const handleCheckout = async () => {
    console.log('Checkout clicked - cartSelectedAddress:', cartSelectedAddress);
    console.log('All addresses:', addresses);

    // Check minimum order requirement
    if (minOrder > 0 && !isMinOrderMet) {
      showError(`Minimum buyırtpa ${formatUZS(minOrder)} UZS`);
      return;
    }

    // Check if an address is selected in cart
    if (!cartSelectedAddress) {
      if (addresses.length === 0) {
        setAddressWarningType('no_address');
        setShowAddressWarningModal(true);
      } else {
        setAddressWarningType('select_address');
        setShowAddressWarningModal(true);
      }
      return;
    }

    if (!cart.firm) return;

    setLoading(true);
    try {
      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      // Convert selectedTime to ISO datetime string
      let preferredDeliveryTime: string | null = null;
      if (selectedDate) {
        // Parse time like "14:30 - Today, 1 December"
        // Extract just the time part before the " - "
        const timePart = selectedTime.split(' - ')[0];
        if (timePart && timePart.includes(':')) {
          const [hours, minutes] = timePart.split(':').map(Number);
          // Use the selected date from the modal
          const deliveryDate = new Date(selectedDate);
          deliveryDate.setHours(hours, minutes, 0, 0);
          preferredDeliveryTime = deliveryDate.toISOString();
        }
      }

      const order = await createOrder({
        items: orderItems,
        firmId: cart.firm.id,
        addressId: cartSelectedAddress.id,
        total: total,
        preferredDeliveryTime,
        paymentMethod: (selectedPaymentMethod as 'cash' | 'card') || 'cash',
      });

      await setCurrentOrder(order);
      addToHistory(order);
      clearCart();
      navigation.navigate('OrderTracking', { orderId: order.id });
    } catch (error: any) {
      showError(error.message || t('cart.orderError'));
    } finally {
      setLoading(false);
    }
  };

  // Show blocked state when there's an active order
  if (hasActiveOrder) {
    return (
      <SafeAreaView style={s.emptyContainer} edges={['top']}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('cart.title')}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Image
            source={require('../assets/watergo-loading.png')}
            style={s.blockedMascot}
            resizeMode="contain"
          />
          <Text style={s.blockedTitle}>{t('cart.orderOnTheWay')}</Text>
          <Text style={s.blockedSubtitle}>
            {t('orders.waitForDelivery') || 'Wait for your current order to be delivered before placing a new one.'}
          </Text>
          <TouchableOpacity
            style={s.trackOrderButton}
            onPress={() => navigation.navigate('OrderTracking', { orderId: currentOrder?.id })}
            activeOpacity={0.9}
          >
            <Text style={s.trackOrderButtonText}>{t('cart.trackOrder')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={s.emptyContainer} edges={['top']}>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('cart.title')}</Text>
        </View>
        <View style={s.emptyContent}>
          <Image
            source={require('../assets/illustrations/cart-checkout.png')}
            style={s.emptyCartImage}
            resizeMode="contain"
          />
          <Text style={s.emptyCartTitle}>{t('cart.emptyCart')}</Text>
          <Text style={s.emptyCartSubtitle}>{t('cart.emptyCartMessage')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.title}>{cart.firm?.name || 'AQUAwater'}</Text>

        {/* Product Cards */}
        {cart.items.map((item) => (
          <View key={item.product.id} style={s.card}>
            {/* Delete Button - Top Right */}
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => removeFromCart(item.product.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={s.deleteIcon}>×</Text>
            </TouchableOpacity>

            {/* Product Image with Circular Background */}
            <View style={s.productImgWrapper}>
              <View style={s.productCircleBg} />
              <Image
                source={getProductImageByName(item.product.name, item.product.volume)}
                style={s.productImg}
                resizeMode="contain"
                fadeDuration={0}
              />
            </View>

            <View style={s.productContent}>
              <Text style={s.productTitle}>
                {(() => {
                  const productName = getTranslatedProductName(item.product, language);
                  // Check if volume number is already in the name (handles both "19L" and "19Л" Cyrillic)
                  const volumeNum = item.product.volume?.match(/\d+/)?.[0] || '';
                  const nameHasVolume = volumeNum && productName.includes(volumeNum);
                  return nameHasVolume ? productName : `${productName} • ${item.product.volume}`;
                })()}
              </Text>
              <Text style={s.productSubtitle}>{t('product.returnable')}</Text>

              <View style={s.productFooter}>
                <QuantityStepper
                  value={item.quantity}
                  onChange={(newQty) => {
                    if (newQty === 0) {
                      removeFromCart(item.product.id);
                    } else if (newQty > item.quantity) {
                      incrementQuantity(item.product.id);
                    } else {
                      decrementQuantity(item.product.id);
                    }
                  }}
                />
                <Text style={s.price}>{formatUZS(item.product.price * item.quantity)} UZS</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Section Divider */}
        <View style={s.sectionDivider} />

        {/* Options Card - Grouped */}
        <View style={s.optionsCard}>
          {/* Delivery Time Row */}
          <TouchableOpacity style={s.optionRow} onPress={() => setShowTimeModal(true)} activeOpacity={0.7}>
            <View style={s.optionIconWrap3D}>
              <Image
                source={require('../assets/ui-icons/delivery-icon.png')}
                style={s.optionIcon3D}
                resizeMode="contain"
              />
            </View>
            <View style={s.optionContent}>
              <Text style={s.optionLabel}>{t('cart.deliveryTime')}</Text>
              <Text style={s.optionValue}>{selectedTime}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C9D0" />
          </TouchableOpacity>

          <View style={s.optionDivider} />

          {/* Payment Row */}
          <TouchableOpacity
            style={s.optionRow}
            onPress={() => navigation.navigate('PaymentMethod', {
              onSelect: (method: string) => setSelectedPaymentMethod(method)
            })}
            activeOpacity={0.7}
          >
            <View style={s.optionIconWrap3D}>
              <Image
                source={
                  selectedPaymentMethod === 'cash'
                    ? require('../assets/payment/cash-icon.png')
                    : require('../assets/payment/card-icon.png')
                }
                style={s.optionIcon3D}
                resizeMode="contain"
              />
            </View>
            <View style={s.optionContent}>
              <Text style={s.optionLabel}>{t('payment.title') || 'Payment'}</Text>
              <Text style={s.optionValue}>
                {selectedPaymentMethod === 'cash'
                  ? (t('payment.cash') || 'Cash')
                  : selectedPaymentMethod === 'card'
                    ? (t('payment.card') || 'Card')
                    : (t('cart.selectPayment') || 'Select')}
              </Text>
            </View>
            <View style={s.checkIconSmall}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C9D0" />
          </TouchableOpacity>

          <View style={s.optionDivider} />

          {/* Address Row */}
          <TouchableOpacity style={s.optionRow} onPress={handleAddressClick} activeOpacity={0.7}>
            <View style={s.optionIconWrap3D}>
              <Image
                source={require('../assets/ui-icons/address-icon.png')}
                style={s.optionIcon3D}
                resizeMode="contain"
              />
            </View>
            <View style={s.optionContent}>
              <Text style={s.optionLabel}>{t('cart.address')}</Text>
              <Text style={s.optionValue} numberOfLines={1}>
                {cartSelectedAddress ? cartSelectedAddress.address : t('cart.select')}
              </Text>
            </View>
            {cartSelectedAddress && (
              <View style={s.checkIconSmall}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#C4C9D0" />
          </TouchableOpacity>
        </View>

        {/* Minimum Order Warning */}
        {minOrder > 0 && !isMinOrderMet && (
          <View style={s.minOrderWarning}>
            <Ionicons name="alert-circle" size={18} color="#F59E0B" />
            <Text style={s.minOrderWarningText}>
              Minimum buyırtpa: {formatUZS(minOrder)} UZS (házir: {formatUZS(subtotal)} UZS)
            </Text>
          </View>
        )}

        {/* Order Summary Card */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={s.summaryValue}>{formatUZS(subtotal)} UZS</Text>
          </View>
          {bottleDepositEnabled && (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>{t('product.bottleDeposit') || 'Bottle deposit'}</Text>
              <Text style={s.summaryValue}>{formatUZS(bottleDepositPrice)} UZS</Text>
            </View>
          )}
          <View style={s.summaryRow}>
            <View style={s.summaryLabelWithInfo}>
              <Text style={s.summaryLabel}>{t('cart.delivery')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setFeeInfoType('delivery');
                  setShowFeeInfoModal(true);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="information-circle-outline" size={16} color="#8088A2" />
              </TouchableOpacity>
            </View>
            {deliveryFee === 0 ? (
              <Text style={s.summaryValueFree}>{t('cart.free')}</Text>
            ) : (
              <Text style={s.summaryValue}>{formatUZS(deliveryFee)} UZS</Text>
            )}
          </View>
          <View style={s.summaryRow}>
            <View style={s.summaryLabelWithInfo}>
              <Text style={s.summaryLabel}>{t('cart.serviceFee')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setFeeInfoType('service');
                  setShowFeeInfoModal(true);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="information-circle-outline" size={16} color="#8088A2" />
              </TouchableOpacity>
            </View>
            <Text style={s.summaryValueFree}>{t('cart.free')}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryTotalLabel}>{t('cart.total')}</Text>
            <Text style={s.summaryTotalValue}>{formatUZS(total)} UZS</Text>
          </View>
        </View>
      </ScrollView>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={addresses}
        selectedAddress={cartSelectedAddress}
        onSelectAddress={(address) => {
          setCartSelectedAddress(address);
          setShowAddressModal(false);
        }}
        onAddNew={() => {
          setShowAddressModal(false);
          navigation.navigate('SelectAddress');
        }}
        bottomInset={insets.bottom}
      />

      {/* Time Selection Modal */}
      <TimeSelectionModal
        visible={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        onSelect={(time, date) => {
          setSelectedTime(time);
          setSelectedDate(date || null);
        }}
        currentSelection={selectedTime}
        language={language}
        bottomInset={insets.bottom}
        firmDeliveryTime={cart.firm?.deliveryTime}
        scheduleDaysLimit={cart.firm?.scheduleDaysLimit}
        scheduleTimeInterval={cart.firm?.scheduleTimeInterval}
      />

      {/* Address Warning Modal */}
      <AddressWarningModal
        visible={showAddressWarningModal}
        onClose={() => setShowAddressWarningModal(false)}
        type={addressWarningType}
        onAddAddress={() => navigation.navigate('SelectAddress')}
        onSelectAddress={() => setShowAddressModal(true)}
        t={t}
      />

      {/* Fee Info Modal */}
      <Modal
        visible={showFeeInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeeInfoModal(false)}
      >
        <TouchableOpacity
          style={s.feeInfoModalOverlay}
          activeOpacity={1}
          onPress={() => setShowFeeInfoModal(false)}
        >
          <View style={s.feeInfoModalContent}>
            <View style={s.feeInfoModalIcon}>
              <Ionicons
                name={feeInfoType === 'delivery' ? 'car-outline' : 'water-outline'}
                size={32}
                color={C.primary}
              />
            </View>
            <Text style={s.feeInfoModalTitle}>
              {feeInfoType === 'delivery' ? t('cart.deliveryFeeInfo') : t('cart.serviceFeeInfo')}
            </Text>
            <Text style={s.feeInfoModalText}>
              {feeInfoType === 'delivery'
                ? t('cart.deliveryFeeDesc')
                : t('cart.serviceFeeDesc')}
            </Text>
            <TouchableOpacity
              style={s.feeInfoModalButton}
              onPress={() => setShowFeeInfoModal(false)}
            >
              <Text style={s.feeInfoModalButtonText}>{t('cart.understood')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Footer */}
      <View style={[s.footer]}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleCheckout} disabled={loading}>
          <View style={s.ctaWrapper}>
            <LinearGradient colors={[C.primary, C.primary2]} style={s.cta}>
              {loading ? (
                <Text style={s.ctaTxt}>{t('cart.loading')}</Text>
              ) : (
                <View style={s.ctaContent}>
                  <Text style={s.ctaTxt}>{t('cart.placeOrderBtn')} • {formatUZS(total)} UZS</Text>
                  <Text style={s.ctaSubtitle}>
                    ⏱ {selectedTime.includes(':') && !selectedTime.includes('(')
                      ? selectedTime.split(',')[0]
                      : cart.firm?.deliveryTime || '30-45 min'}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 3 },
});

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  // Product Cards
  card: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    paddingRight: 40,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 12,
    elevation: 3,
  },
  productImgWrapper: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productCircleBg: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF4FF',
    zIndex: 1,
  },
  productImg: {
    width: 44,
    height: 44,
    zIndex: 2,
  },
  productContent: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  pillBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  pillBtnTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: C.primary,
  },
  qty: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    minWidth: 24,
    textAlign: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: -1,
  },
  // Section Divider
  sectionDivider: {
    height: 12,
  },
  // Product Subtitle
  productSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 10,
  },
  // Options Card - Grouped
  optionsCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWrap3D: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon3D: {
    width: 40,
    height: 40,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8088A2',
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  // Legacy fee styles (kept for reference)
  feesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  feeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  feeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8088A2',
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  // Minimum Order Warning
  minOrderWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  minOrderWarningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  // Order Summary Card
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8088A2',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  summaryValueFree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  summaryLabelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Fee Info Modal
  feeInfoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  feeInfoModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  feeInfoModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  feeInfoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  feeInfoModalText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8088A2',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  feeInfoModalButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  feeInfoModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Option Rows
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    minHeight: 64,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  rowCardCompact: {
    minHeight: 52,
    paddingVertical: 10,
  },
  rowIconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIcon: {
    fontSize: 28,
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
  },
  rowIconImage: {
    width: 40,
    height: 40,
  },
  rowIconImageSmall: {
    width: 32,
    height: 32,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  rowSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rowRight: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    textAlign: 'right',
  },
  rowRightFree: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22C55E',
    textAlign: 'right',
  },
  rowChevron: {
    fontSize: 20,
    color: '#C4C9D0',
    marginLeft: 2,
  },
  // Free Badge (legacy - kept for reference)
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  // Check Icons
  checkIconSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconTextSmall: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: C.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  addressList: {
    maxHeight: 400,
  },
  addressListContent: {
    paddingBottom: 24,
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.pill,
  },
  addressOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  addressOptionIcon: {
    width: 64,
    height: 64,
  },
  addressOptionIconFallback: {
    fontSize: 32,
    width: 56,
    textAlign: 'center',
  },
  addressOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  addressOptionText: {
    fontSize: 14,
    color: C.sub,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  addNewAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
    backgroundColor: '#F0F4FF',
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C5D5FF',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  addNewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addNewText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8088A2',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
  },
  ctaWrapper: {
    borderRadius: 16,
    backgroundColor: C.primary,
    overflow: 'hidden',
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  cta: {
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTxt: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    ...shadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.pill,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  modalClose: {
    fontSize: 24,
    color: C.sub,
    fontWeight: '600',
  },
  timeSlotsList: {
    maxHeight: 400,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.pill,
  },
  timeSlotIcon: {
    fontSize: 24,
  },
  timeSlotIconImage: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: C.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
  },
  emptyCartImage: {
    width: wp(75),
    height: wp(75),
    marginBottom: scale(40),
  },
  emptyCartTitle: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: scale(16),
    letterSpacing: -0.5,
  },
  emptyCartSubtitle: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(26),
    maxWidth: wp(85),
  },
  // Blocked state styles (active order)
  blockedMascot: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  blockedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0E1733',
    textAlign: 'center',
    marginBottom: 12,
  },
  blockedSubtitle: {
    fontSize: 16,
    color: '#8088A2',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  trackOrderButton: {
    backgroundColor: '#3B66FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3B66FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  trackOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Time Modal Styles
  timeModalContent: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  timeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: C.pill,
    margin: 20,
    borderRadius: 16,
    padding: 4,
  },
  timeToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeToggleBtnActive: {
    backgroundColor: C.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.sub,
  },
  timeToggleTextActive: {
    color: C.text,
  },
  scheduleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.sub,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateScrollView: {
    marginHorizontal: -20,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dateCard: {
    backgroundColor: C.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  dateCardSelected: {
    backgroundColor: C.primary,
  },
  dateLabelMain: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  dateLabelMainSelected: {
    color: '#FFFFFF',
  },
  dateLabelSub: {
    fontSize: 12,
    fontWeight: '500',
    color: C.sub,
  },
  dateLabelSubSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nowContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  nowIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  nowTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  nowSubtitle: {
    fontSize: 16,
    color: C.sub,
  },
  wheelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  wheelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  wheelColumn: {
    alignItems: 'center',
    width: 100,
  },
  wheelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.sub,
    marginBottom: 8,
  },
  wheelSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: C.text,
    marginHorizontal: 20,
    marginTop: 24,
  },
  selectedTimePreview: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: C.primary,
    backgroundColor: C.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  confirmTimeBtn: {
    backgroundColor: C.primary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmTimeBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Custom Alert Modal Styles (cross-platform)
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alertContainer: {
    backgroundColor: C.card,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  alertIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    width: 44,
    height: 44,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 15,
    color: C.sub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  alertButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertCancelBtn: {
    flex: 1,
    backgroundColor: C.pill,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  alertCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.sub,
  },
  alertSecondaryBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  alertSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  alertPrimaryBtn: {
    flex: 1,
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  alertPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CartScreen;
