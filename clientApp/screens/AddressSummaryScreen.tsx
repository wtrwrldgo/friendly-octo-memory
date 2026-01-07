import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import LocalApiService from '../services/local-api.service';

// Info Row Component
const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

// Address Type Icons - 3D Images
const getAddressTypeIcon = (type: string) => {
  switch (type) {
    case 'house':
      return require('../assets/address/house-3d.png');
    case 'apartment':
      return require('../assets/address/apartment-3d.png');
    case 'government':
      return require('../assets/address/government-3d.png');
    case 'office':
      return require('../assets/address/office-3d.png');
    default:
      return require('../assets/address/house-3d.png');
  }
};

const getAddressTypeName = (type: string, t: any) => {
  switch (type) {
    case 'house':
      return t('auth.privateHouse') || 'Private House';
    case 'apartment':
      return t('auth.apartment') || 'Apartment';
    case 'government':
      return t('auth.government') || 'Government';
    case 'office':
      return t('auth.office') || 'Office';
    default:
      return type;
  }
};

export default function AddressSummaryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addAddress } = useUser();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  const addressData = route.params?.addressData;

  // Extract city name from address string (e.g., "Street, City, Country" -> "City")
  const extractCityName = (address: string): string => {
    const parts = address.split(',').map(p => p.trim());
    // Usually city is in the second part of the address
    if (parts.length >= 2) {
      return parts[1];
    }
    // Fallback to first part
    return parts[0];
  };

  const handleSaveAddress = async () => {
    if (!addressData || isSaving) return;

    setIsSaving(true);

    try {
      // Check if delivery is available in this city
      const cityName = extractCityName(addressData.address);
      console.log('📍 Checking delivery availability for city:', cityName);

      const deliveryCheck = await LocalApiService.checkDeliveryAvailability(cityName);
      console.log('📍 Delivery check result:', deliveryCheck);

      if (!deliveryCheck.canDeliver) {
        // City not supported - navigate to CityNotSupported screen
        console.log('❌ Delivery not available in this city');
        setIsSaving(false);
        navigation.navigate('CityNotSupported', {
          cityName: deliveryCheck.cityName || cityName,
          address: addressData.address,
        });
        return;
      }

      console.log('✅ Delivery available - saving address');

      // Save address to user context
      await addAddress({
        title: addressData.address.split(',')[0] || 'My Address',
        address: addressData.address,
        lat: addressData.lat,
        lng: addressData.lng,
        isDefault: addressData.isFirstAddress || false,
        addressType: addressData.addressType,
        entrance: addressData.entrance,
        floor: addressData.floor,
        apartment: addressData.apartment,
        intercom: addressData.intercom,
        comment: addressData.comment,
      });

      showToast(t('auth.addressSaved'), 'success');

      // If this is first address during signup, user will be redirected to MainNavigator
      // Otherwise, navigate back to ProfileTab
      if (addressData.isFirstAddress) {
        // First address during signup - App.tsx will handle redirect to MainNavigator
        console.log('✅ First address saved during signup - App.tsx will redirect to MainNavigator');
      } else {
        // Adding additional address - navigate back to ProfileTab
        console.log('✅ Additional address saved - navigating back to ProfileTab');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'ProfileTab' }],
                  index: 0,
                },
              },
            ],
          })
        );
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showToast(t('auth.addressSaveError'), 'error');
      setIsSaving(false);
    }
  };

  if (!addressData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('addressSummary.noData')}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>{t('addressSummary.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#1E293B" />
          </Pressable>
        </View>

        <Text style={styles.title}>{t('auth.reviewAddress') || 'Review Address'}</Text>
        <Text style={styles.subtitle}>{t('auth.reviewAddressHint') || 'Please verify your address details'}</Text>
      </View>

      {/* Summary */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Address Type Card */}
        <View style={styles.typeCard}>
          <View style={styles.typeIconWrapper}>
            <Image
              source={getAddressTypeIcon(addressData.addressType)}
              style={styles.typeIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.typeTitle}>{getAddressTypeName(addressData.addressType, t)}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{t('auth.addressType') || 'Address Type'}</Text>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <Image
                source={require('../assets/ui-icons/address-icon.png')}
                style={styles.cardIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.sectionTitle}>{t('auth.address') || 'Address'}</Text>
          </View>
          <View style={styles.cardDivider} />
          <Text style={styles.addressText}>{addressData.address}</Text>
        </View>

        {/* Details Card (if applicable) */}
        {(addressData.entrance || addressData.floor || addressData.apartment || addressData.intercom) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrapper}>
                <Image
                  source={getAddressTypeIcon(addressData.addressType)}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.sectionTitle}>{t('auth.details') || 'Details'}</Text>
            </View>
            <View style={styles.cardDivider} />
            <InfoRow label={t('auth.entrance') || 'Entrance'} value={addressData.entrance} />
            <InfoRow label={t('auth.floor') || 'Floor'} value={addressData.floor} />
            <InfoRow label={t('auth.apartment') || 'Apartment'} value={addressData.apartment} />
            <InfoRow label={t('auth.intercom') || 'Intercom'} value={addressData.intercom} />
          </View>
        )}
      </ScrollView>

      {/* Sticky Buttons */}
      <View style={styles.sticky}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.editBtn}
          disabled={isSaving}
        >
          <Text style={styles.editText}>{t('auth.edit')}</Text>
        </Pressable>

        <Pressable
          onPress={handleSaveAddress}
          disabled={isSaving}
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>{t('auth.saveAddress')}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backArrow: {
    fontSize: 22,
    color: '#0C1633',
    fontWeight: '600',
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '800',
    color: '#0C1633',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6B7280',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },

  // Type Card
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0C1633',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  typeIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typeIcon: {
    width: 90,
    height: 90,
  },
  typeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0C1633',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    width: 36,
    height: 36,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8ECF2',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
  },
  addressText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#0C1633',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Sticky Buttons
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#F7F9FC',
    flexDirection: 'row',
    gap: 14,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#0C1633',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  editText: {
    color: '#3B82F6',
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#AFC7FF',
    shadowOpacity: 0,
  },
  saveText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
