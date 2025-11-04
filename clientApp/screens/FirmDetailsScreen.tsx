import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Product } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { getProductsByFirm } from '../services/api';

const FirmDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { firm } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, incrementQuantity, decrementQuantity, getItemQuantity } = useCart();

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

      {/* Firm Info */}
      <View style={styles.firmInfo}>
        <Image
          source={{ uri: firm.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.firmName}>{firm.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>⭐ {firm.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.infoText}>{firm.deliveryTime}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.infoText}>Min ${firm.minOrder}</Text>
        </View>
      </View>

      {/* Products */}
      <FlatList
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
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartText}>View Cart ({cart.items.length})</Text>
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
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  firmName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  dot: {
    marginHorizontal: Spacing.sm,
    color: Colors.grayText,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
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
