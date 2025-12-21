import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { Colors, Spacing } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { getProductsByFirm } from '../services/api';
import ActiveOrderPopup from '../components/ActiveOrderPopup';
import { getFirmLogo } from '../utils/imageMapping';

const FirmDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { firm } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActiveOrderPopup, setShowActiveOrderPopup] = useState(false);

  const { cart, addToCart, incrementQuantity, decrementQuantity, getItemQuantity } = useCart();
  const { hasActiveOrder, currentOrder } = useOrder();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // Get single banner image
  const getBannerSource = () => {
    const localLogo = getFirmLogo(firm.name);
    if (localLogo) return localLogo;
    if (typeof firm.logo === 'number') return firm.logo;
    if (typeof firm.logo === 'string' && firm.logo) return { uri: firm.logo };
    return null;
  };

  const bannerSource = getBannerSource();

  // Handle add to cart with active order check
  const handleAddToCart = (product: Product) => {
    if (hasActiveOrder) {
      setShowActiveOrderPopup(true);
      return;
    }
    addToCart(product, firm);
  };

  // Handle increment with active order check
  const handleIncrement = (productId: string) => {
    if (hasActiveOrder) {
      setShowActiveOrderPopup(true);
      return;
    }
    incrementQuantity(productId);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductsByFirm(firm.id);
      setProducts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, []);

  const cartTotalUZS = Math.round(cart.total);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title={firm.name} onBack={() => navigation.goBack()} />

      {/* Brand Banner - static, simple header */}
      <View style={styles.bannerContainer}>
        {bannerSource ? (
          <Image source={bannerSource} style={styles.bannerImage} resizeMode="cover" />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.bannerPlaceholderText}>{firm.name?.[0] ?? 'W'}</Text>
          </View>
        )}
      </View>

      {/* Company Info - flat, integrated */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Image
            source={require('../assets/ui-icons/delivery-icon.png')}
            style={styles.infoIcon}
            resizeMode="contain"
          />
          <Text style={styles.infoValue}>{firm.deliveryTime}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Image
            source={require('../assets/ui-icons/address-icon.png')}
            style={styles.infoIcon}
            resizeMode="contain"
          />
          <Text style={styles.infoValue}>{firm.location || 'Nukus'}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Image
            source={require('../assets/ui-icons/star-rating.png')}
            style={styles.infoIcon}
            resizeMode="contain"
          />
          <Text style={styles.ratingValue}>{(Number(firm.rating) || 0).toFixed(1)}</Text>
        </View>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          key="product-grid-2-columns"
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAdd={() => handleAddToCart(item)}
              quantity={getItemQuantity(item.id)}
              onIncrement={() => handleIncrement(item.id)}
              onDecrement={() => decrementQuantity(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            cart.items.length > 0 && styles.listWithCart,
            products.length === 0 && styles.emptyListPadding,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No products available</Text>
              <Text style={styles.emptySubtitle}>
                This firm doesn't have any products yet
              </Text>
            </View>
          }
        />
      )}

      {/* Cart Info Card */}
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={[styles.cartCard, { bottom: Math.max(Spacing.lg, insets.bottom + 12) }]}
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
          <Text style={styles.cartTotal}>{t('cart.total')}: {cartTotalUZS.toLocaleString()} UZS</Text>
        </TouchableOpacity>
      )}

      {/* Active Order Popup */}
      <ActiveOrderPopup
        visible={showActiveOrderPopup}
        onClose={() => setShowActiveOrderPopup(false)}
        onTrackOrder={() => navigation.navigate('OrderTracking', { orderId: currentOrder?.id })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
  // Banner - static, simple brand header
  bannerContainer: {
    height: 175,
    backgroundColor: '#F5F7FA',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FA',
  },
  bannerPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    opacity: 0.3,
  },
  // Info bar - flat, integrated with page
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  infoIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  listWithCart: {
    paddingBottom: 100,
  },
  emptyListPadding: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.grayText,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCard: {
    position: 'absolute',
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
});

export default FirmDetailsScreen;
