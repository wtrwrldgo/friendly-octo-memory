import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Product } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getProductsByFirm } from '../services/api';

const FirmDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { firm } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, incrementQuantity, decrementQuantity, getItemQuantity } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductsByFirm(firm.id);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title={firm.name} onBack={() => navigation.goBack()} />

      {/* Firm Info Banner */}
      <View style={styles.firmInfo}>
        {/* Full PNG Banner (75% of space) */}
        <Image
          source={{ uri: firm.logo.trim() }}
          style={styles.logoBanner}
          resizeMode="cover"
        />

        {/* Info Overlay at Bottom (25% of space) */}
        <View style={styles.infoOverlay}>
          <View style={styles.nameRatingRow}>
            <Text style={styles.firmName}>{firm.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingValue}>{firm.rating.toFixed(1)}</Text>
              <Text style={styles.ratingStar}>★</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('firmDetails.delivery')}</Text>
              <Text style={styles.infoValue}>{firm.deliveryTime}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('firmDetails.minOrder')}</Text>
              <Text style={styles.infoValue}>{firm.minOrder.toLocaleString()} UZS</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        key="product-grid-2-columns"
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAdd={() => addToCart(item, firm)}
            quantity={getItemQuantity(item.id)}
            onIncrement={() => incrementQuantity(item.id)}
            onDecrement={() => decrementQuantity(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.list,
          cart.items.length > 0 && styles.listWithCart
        ]}
        refreshing={loading}
      />

      {/* Cart Button */}
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartTab')}
        >
          <Text style={styles.cartText}>{t('firmDetails.viewCart')} ({cart.items.length})</Text>
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
  firmInfo: {
    height: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  logoBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%', // PNG fills 65% of banner height
    width: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%', // More space for info (35% instead of 25%)
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  firmName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 3,
  },
  ratingStar: {
    fontSize: 14,
    color: '#FF9800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.grayText,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  listWithCart: {
    paddingBottom: 120, // Extra padding when cart button is visible (cart button height + spacing)
  },
  cartButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
  },
  cartText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  cartTotal: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default FirmDetailsScreen;
