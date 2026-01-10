import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Firm } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Colors, BorderRadius, CardShadow } from '../constants/Colors';
import { getFirmLogo } from '../utils/imageMapping';

// Blurhash placeholder for loading state
const PLACEHOLDER_BLURHASH = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7teleport';

interface FirmCardProps {
  firm: Firm;
  onPress: () => void;
}

export const FirmCard: React.FC<FirmCardProps> = ({ firm, onPress }) => {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Get local asset by firm name (works in APK)
  const localLogo = getFirmLogo(firm.name);

  // Get image source - prioritize remote homeBanner URLs over local assets
  const getImageSource = () => {
    if (imageError) return null;
    // First priority: remote homeBanner URL (uploaded by firm owner)
    if (firm.homeBannerUrl && typeof firm.homeBannerUrl === 'string') return { uri: firm.homeBannerUrl };
    if (firm.homeBanner && typeof firm.homeBanner === 'string') return { uri: firm.homeBanner };
    // Second priority: bundled homeBanner asset
    if (firm.homeBanner && typeof firm.homeBanner === 'number') return firm.homeBanner;
    // Third priority: local logo asset
    if (localLogo) return localLogo;
    // Fourth priority: remote logo URL
    if (firm.logoUrl && typeof firm.logoUrl === 'string') return { uri: firm.logoUrl };
    if (firm.logo && typeof firm.logo === 'string') return { uri: firm.logo };
    // Fifth priority: bundled logo asset
    if (firm.logo && typeof firm.logo === 'number') return firm.logo;
    return null;
  };

  const imageSource = getImageSource();

  return (
    <View style={styles.card}>
      {/* Brand Banner */}
      <View style={styles.banner}>
        {imageSource ? (
          typeof imageSource === 'object' && 'uri' in imageSource ? (
            // Remote image - use ExpoImage with caching
            <ExpoImage
              source={imageSource.uri}
              style={styles.bannerImage}
              contentFit="cover"
              cachePolicy="disk"
              placeholder={PLACEHOLDER_BLURHASH}
              transition={200}
              onError={() => setImageError(true)}
            />
          ) : (
            // Local bundled asset - use regular Image
            <Image
              source={imageSource}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
            <Text style={styles.bannerPlaceholderText}>{firm.name?.[0] ?? 'W'}</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Image
              source={require('../assets/ui-icons/delivery-icon.png')}
              style={styles.metaIcon}
              resizeMode="contain"
            />
            <Text style={styles.metaText}>{firm.deliveryTime}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Image
              source={require('../assets/ui-icons/address-icon.png')}
              style={styles.metaIcon}
              resizeMode="contain"
            />
            <Text style={styles.metaText}>{firm.location || 'Nukus'}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Image
              source={require('../assets/ui-icons/star-rating.png')}
              style={styles.metaIcon}
              resizeMode="contain"
            />
            <Text style={styles.ratingText}>{(Number(firm.rating) || 0).toFixed(1)}</Text>
          </View>
        </View>

        {/* Chips */}
        {firm.promotions && firm.promotions.length > 0 && (
          <View style={styles.chipsRow}>
            {firm.promotions.map((promo, index) => (
              <View
                key={index}
                style={[
                  styles.chip,
                  promo.color === 'green'
                    ? { backgroundColor: '#E8F5E9' }
                    : { backgroundColor: '#E3F2FD' }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    promo.color === 'green'
                      ? { color: '#0F9D58' }
                      : { color: '#1E88E5' }
                  ]}
                >
                  {promo.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={styles.ctaText}>{t('firmDetails.goToProducts')}</Text>
        <Text style={styles.ctaArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: 16,
    overflow: 'hidden',
    ...CardShadow,
  },
  banner: {
    height: 150,
    width: '100%',
    backgroundColor: '#F0F4F8',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EEF4',
  },
  bannerPlaceholderText: {
    fontSize: 44,
    fontWeight: '700',
    color: Colors.primary,
    opacity: 0.6,
  },
  infoSection: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  metaIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  ratingText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  chip: {
    borderRadius: BorderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  ctaArrow: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 8,
  },
});
