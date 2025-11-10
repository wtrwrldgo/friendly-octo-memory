import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Firm } from '../types';
import { Colors, Spacing } from '../constants/Colors';
import { useLanguage } from '../context/LanguageContext';

interface FirmCardProps {
  firm: Firm;
  onPress: () => void;
}

export const FirmCard: React.FC<FirmCardProps> = ({ firm, onPress }) => {
  const { t } = useLanguage();
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header Section with Full PNG */}
      <View style={styles.header}>
        {/* Full PNG Logo as Background */}
        <Image
          source={{ uri: firm.logo.trim() }}
          style={styles.logoFull}
          resizeMode="cover"
        />

        {/* Firm Name Badge (top-left) */}
        <View style={styles.nameBadge}>
          <Text style={styles.nameBadgeText}>{firm.name.toUpperCase()}</Text>
        </View>
      </View>

      {/* White Info Section */}
      <View style={styles.infoSection}>
        {/* Firm Name and Rating Row */}
        <View style={styles.nameRatingRow}>
          <Text style={styles.firmName} numberOfLines={1}>
            {firm.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{firm.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Time and Location Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{firm.deliveryTime}</Text>
          </View>
          {firm.location && (
            <>
              <View style={styles.detailDot} />
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detailText}>{firm.location}</Text>
              </View>
            </>
          )}
        </View>

        {/* Promotional Badges */}
        {firm.promotions && firm.promotions.length > 0 && (
          <View style={styles.promosRow}>
            {firm.promotions.map((promo, index) => (
              <View
                key={index}
                style={[
                  styles.promoBadge,
                  promo.color === 'green' ? styles.promoBadgeGreen : styles.promoBadgeBlue,
                ]}
              >
                <Text
                  style={[
                    styles.promoText,
                    promo.color === 'green' ? styles.promoTextGreen : styles.promoTextBlue,
                  ]}
                >
                  {promo.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>{t('firmDetails.goToProducts')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  // Header Section
  header: {
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  logoFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  nameBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.white, // Required for efficient shadow rendering
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nameBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  // Info Section
  infoSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  firmName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  star: {
    fontSize: 16,
    marginRight: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  detailText: {
    fontSize: 15,
    color: Colors.grayText,
    fontWeight: '500',
  },
  detailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grayText,
    marginHorizontal: Spacing.sm,
  },
  promosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  promoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promoBadgeGreen: {
    backgroundColor: '#E8F5E9',
  },
  promoBadgeBlue: {
    backgroundColor: '#E3F2FD',
  },
  promoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  promoTextGreen: {
    color: '#2E7D32',
  },
  promoTextBlue: {
    color: '#1976D2',
  },
  ctaButton: {
    backgroundColor: Colors.primary, // Required for efficient shadow rendering
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
