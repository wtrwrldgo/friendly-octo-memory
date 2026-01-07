import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing } from '../constants/Colors';
import { FirmCard } from '../components/FirmCard';
import { FirmCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getFirms } from '../services/api';
import { Firm, OrderStage } from '../types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  const { cart } = useCart();
  const { currentOrder } = useOrder();
  const { showError } = useToast();
  const { t } = useLanguage();

  // Get user initial for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  // Avatar colors based on initial
  const avatarColors: Record<string, { bg: string; text: string }> = {
    A: { bg: '#FF6B6B', text: '#FFFFFF' },
    B: { bg: '#4ECDC4', text: '#FFFFFF' },
    C: { bg: '#45B7D1', text: '#FFFFFF' },
    D: { bg: '#96CEB4', text: '#FFFFFF' },
    E: { bg: '#FECA57', text: '#FFFFFF' },
    F: { bg: '#FF9FF3', text: '#FFFFFF' },
    G: { bg: '#54A0FF', text: '#FFFFFF' },
    H: { bg: '#5F27CD', text: '#FFFFFF' },
    I: { bg: '#00D2D3', text: '#FFFFFF' },
    J: { bg: '#FF6348', text: '#FFFFFF' },
    K: { bg: '#7BED9F', text: '#FFFFFF' },
    L: { bg: '#70A1FF', text: '#FFFFFF' },
    M: { bg: '#FF7675', text: '#FFFFFF' },
    N: { bg: '#A29BFE', text: '#FFFFFF' },
    O: { bg: '#FD79A8', text: '#FFFFFF' },
    P: { bg: '#00B894', text: '#FFFFFF' },
    Q: { bg: '#E17055', text: '#FFFFFF' },
    R: { bg: '#0984E3', text: '#FFFFFF' },
    S: { bg: '#6C5CE7', text: '#FFFFFF' },
    T: { bg: '#FDCB6E', text: '#FFFFFF' },
    U: { bg: '#E84393', text: '#FFFFFF' },
    V: { bg: '#00CEC9', text: '#FFFFFF' },
    W: { bg: '#6AB04C', text: '#FFFFFF' },
    X: { bg: '#EB4D4B', text: '#FFFFFF' },
    Y: { bg: '#F9CA24', text: '#FFFFFF' },
    Z: { bg: '#30336B', text: '#FFFFFF' },
  };
  const avatarColor = userInitial ? avatarColors[userInitial] || { bg: '#54A0FF', text: '#FFFFFF' } : null;

  useEffect(() => {
    loadFirms();
  }, []);

  const loadFirms = async () => {
    try {
      const data = await getFirms();
      setFirms(data);
    } catch (error: any) {
      showError(error.message || t('home.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Filter firms based on search query
  const filteredFirms = firms.filter((firm) =>
    firm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrderStatusText = (stage: OrderStage) => {
    switch (stage) {
      case OrderStage.ORDER_PLACED:
        return t('orderTracking.orderPlaced');
      case OrderStage.IN_QUEUE:
        return t('orderTracking.inQueue');
      case OrderStage.COURIER_ON_THE_WAY:
        return t('orderTracking.courierOnWay');
      case OrderStage.DELIVERED:
        return t('orderTracking.delivered');
      default:
        return t('orderTracking.processing');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.logoText}>
            <Text style={styles.waterText}>{t('home.title')}</Text>
            <Text style={styles.goText}>{t('home.subtitle')}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.avatarButton,
              avatarColor && { backgroundColor: avatarColor.bg }
            ]}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.7}
          >
            {userInitial && avatarColor ? (
              <Text style={[styles.avatarText, { color: avatarColor.text }]}>{userInitial}</Text>
            ) : (
              <Image
                source={require('../assets/tab-icons/profile-icon.png')}
                style={styles.avatarIcon}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Field */}
        <View style={styles.searchBox}>
          <Image
            source={require('../assets/ui-icons/search-icon.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('home.search')}
            placeholderTextColor={Colors.grayText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Active Order Banner */}
      {currentOrder && currentOrder.stage !== OrderStage.DELIVERED && (
        <TouchableOpacity
          style={styles.activeOrderBanner}
          onPress={() => navigation.navigate('OrderTracking', { orderId: currentOrder.id })}
          activeOpacity={0.85}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={styles.firmLogoWrapper}>
                <Image
                  source={
                    typeof currentOrder.firm?.logo === 'number'
                      ? currentOrder.firm.logo
                      : typeof currentOrder.firm?.logo === 'string' && currentOrder.firm.logo.length > 0
                      ? { uri: currentOrder.firm.logo }
                      : require('../assets/firms/aquawater-logo.png')
                  }
                  style={styles.firmLogoImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.bannerTextContainer}>
                <View style={styles.bannerTitleRow}>
                  <Text style={styles.bannerTitle}>{currentOrder.firm?.name || t('home.activeOrder')}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{t('home.active')}</Text>
                  </View>
                </View>
                <Text style={styles.bannerSubtitle}>
                  {getOrderStatusText(currentOrder.stage)}
                </Text>
                <Text style={styles.orderNumberText}>
                  {currentOrder.orderNumber || `#${currentOrder.id?.slice(-6)}`}
                </Text>
              </View>
            </View>
            <View style={styles.bannerRight}>
              <View style={styles.arrowCircle}>
                <Text style={styles.bannerArrow}>›</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Firms List */}
      {loading ? (
        <View style={styles.list}>
          <FirmCardSkeleton />
          <FirmCardSkeleton />
          <FirmCardSkeleton />
        </View>
      ) : filteredFirms.length === 0 ? (
        <EmptyState
          icon="💧"
          title={searchQuery ? t('home.noResults') : t('home.noSuppliers')}
          message={
            searchQuery
              ? `${t('home.noCompaniesFound')} "${searchQuery}"`
              : t('home.noSuppliersMessage')
          }
        />
      ) : (
        <FlatList
          data={filteredFirms}
          renderItem={({ item }) => (
            <FirmCard
              firm={item}
              onPress={() => navigation.getParent()?.navigate('FirmDetails', { firm: item })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadFirms}
        />
      )}

      {/* Cart Info Card */}
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartCard}
          onPress={() => navigation.navigate('CartTab')}
          activeOpacity={0.85}
        >
          <View style={styles.cartIconWrapper}>
            <Image source={require('../assets/tab-icons/cart-icon.png')} style={styles.cartIcon} resizeMode="contain" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
            </View>
          </View>
          <View style={styles.cartContent}>
            <Text style={styles.cartTitle}>{t('cart.title')}</Text>
            <Text style={styles.cartSubtitle}>{cart.items.length} {t('cart.items')}</Text>
          </View>
          <Text style={styles.cartTotal}>{t('cart.total')}: {cart.total.toLocaleString()} UZS</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 0.1,
  },
  goText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.1,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8ECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  list: {
    padding: Spacing.md,
  },
  cartCard: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    height: 58,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  cartIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cartIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  cartContent: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  cartSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
  },
  cartTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeOrderBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F4FF',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  firmLogoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F5FF',
    marginRight: 12,
  },
  firmLogoImage: {
    width: '100%',
    height: '100%',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderNumberText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bannerRight: {
    marginLeft: 8,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerArrow: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: -2,
  },
});

export default HomeScreen;
