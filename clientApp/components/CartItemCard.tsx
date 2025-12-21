import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { CartItem } from '../types';

interface CartItemCardProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      {/* Product Image */}
      {typeof item.product.image === 'string' ? (
        <Image source={{ uri: item.product.image }} style={styles.image} resizeMode="contain" />
      ) : (
        <Image source={item.product.image} style={styles.image} resizeMode="contain" />
      )}

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.volume}>{item.product.volume}</Text>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={onDecrement} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={onIncrement} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Price and Delete */}
      <View style={styles.rightSection}>
        <Text style={styles.price}>
          {item.product.price.toLocaleString()} UZS
        </Text>
        <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  volume: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    marginBottom: Spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  quantity: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: Spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: Spacing.sm,
  },
  price: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 18,
  },
});
