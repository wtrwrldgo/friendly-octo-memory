import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Colors } from '../constants/Colors';
import { Product } from '../types';
import { getProductImageByName } from '../utils/imageMapping';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedProductName } from '../utils/translations';

type Props = {
  product: Product;
  onAdd: () => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export const ProductCard: React.FC<Props> = ({
  product,
  onAdd,
  quantity,
  onIncrement,
  onDecrement,
}) => {
  const { t, language } = useLanguage();
  const hasInCart = quantity > 0;
  const [imageError, setImageError] = useState(false);

  // Get translated product name
  const translatedName = getTranslatedProductName(product, language);

  // Get local asset by product name (works in APK)
  const localImage = getProductImageByName(product.name, product.volume);

  // Determine image source - prioritize local assets for APK
  const getImageSource = (): ImageSourcePropType | null => {
    if (imageError) return null;
    // Try local asset first (most reliable for APK)
    if (localImage) return localImage;
    // Fallback to bundled asset
    if (typeof product.image === 'number') return product.image;
    // Fallback to URL (for remote images)
    if (typeof product.image === 'string' && product.image) return { uri: product.image };
    return null;
  };

  const imageSource = getImageSource();

  return (
    <View style={styles.card}>
      {/* Top image */}
      <View style={styles.imageWrapper}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {product.name?.[0] ?? '💧'}
            </Text>
          </View>
        )}
      </View>

      {/* Title + Volume Badge */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {translatedName}
        </Text>
        {product.volume && (
          <View style={styles.volumeBadge}>
            <Text style={styles.volumeText}>{product.volume}</Text>
          </View>
        )}
      </View>

      {/* Price */}
      <Text style={styles.price}>{product.price.toLocaleString()} <Text style={styles.currency}>UZS</Text></Text>

      {/* Add Button / Counter */}
      {!hasInCart ? (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAdd}
          activeOpacity={0.8}
        >
          <Text style={styles.addText}>{t('product.add')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.counterWrapper}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={onDecrement}
            activeOpacity={0.7}
          >
            <Text style={styles.counterSign}>−</Text>
          </TouchableOpacity>

          <Text style={styles.counterValue}>{quantity}</Text>

          <TouchableOpacity
            style={styles.counterBtn}
            onPress={onIncrement}
            activeOpacity={0.7}
          >
            <Text style={styles.counterSign}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  imageWrapper: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    overflow: 'hidden',
  },

  image: {
    width: 110,
    height: 110,
  },

  imagePlaceholder: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
  },

  imagePlaceholderText: {
    fontSize: 36,
    color: Colors.primary,
    fontWeight: '700',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    lineHeight: 17,
  },

  volumeBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 6,
  },

  volumeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  currency: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  addBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  addText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  counterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterSign: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  counterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    minWidth: 24,
    textAlign: 'center',
  },
});
