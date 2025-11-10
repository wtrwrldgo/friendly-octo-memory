import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
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
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || t('home.guest')}</Text>
          </View>
        </View>

        {/* Search Field */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
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
          activeOpacity={0.8}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={styles.pulseIndicator}>
                <View style={styles.pulseOuter} />
                <View style={styles.pulseInner} />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>{t('home.activeOrder')}</Text>
                <Text style={styles.bannerSubtitle}>
                  {getOrderStatusText(currentOrder.stage)}
                </Text>
              </View>
            </View>
            <View style={styles.bannerRight}>
              <Text style={styles.bannerArrow}>→</Text>
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

      {/* Cart Button */}
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartTab')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
          </View>
          <Text style={styles.cartText}>{t('home.viewCart')}</Text>
          <Text style={styles.cartTotal}>${cart.total.toFixed(2)}</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  goText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    padding: 0,
  },
  list: {
    padding: Spacing.md,
  },
  cartButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cartBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  cartText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  cartTotal: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  activeOrderBanner: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseIndicator: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pulseOuter: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    opacity: 0.2,
  },
  pulseInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  bannerRight: {
    marginLeft: Spacing.md,
  },
  bannerArrow: {
    fontSize: 24,
    color: Colors.primary,
  },
});

export default HomeScreen;
