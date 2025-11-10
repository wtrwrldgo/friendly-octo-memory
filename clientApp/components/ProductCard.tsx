import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Product } from '../types';
import { Colors, Spacing } from '../constants/Colors';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdd,
  quantity = 0,
  onIncrement,
  onDecrement,
}) => {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      {/* Product Image with Circular Background */}
      <View style={styles.imageWrapper}>
        <View style={styles.circleBackground} />
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.volume}>{product.volume}</Text>
        <Text style={styles.price}>{product.price.toLocaleString()} UZS</Text>
      </View>

      {/* Add Button or Quantity Controls */}
      {quantity === 0 ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>{t('product.add')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={onDecrement}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={onIncrement}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    width: '48%',
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E8F4F8',
  },
  image: {
    width: 180,
    height: 180,
    zIndex: 1,
  },
  content: {
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 22,
    minHeight: 44,
  },
  volume: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayText,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  addButton: {
    backgroundColor: '#4E7FFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4E7FFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },
  quantityButtonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    minWidth: 30,
    textAlign: 'center',
  },
});
