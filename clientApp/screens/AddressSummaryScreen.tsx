import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

// Progress Dot Component
const Dot = ({ active, wide = false }: { active?: boolean; wide?: boolean }) => (
  <View
    style={[
      styles.dot,
      wide && { width: 22 },
      { backgroundColor: active ? '#3B82F6' : '#E2E8F0' },
    ]}
  />
);

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

// Address Type Icons
const getAddressTypeIcon = (type: string) => {
  switch (type) {
    case 'house':
      return '🏠';
    case 'apartment':
      return '🏢';
    case 'government':
      return '🏛️';
    case 'office':
      return '🏢';
    default:
      return '📍';
  }
};

const getAddressTypeName = (type: string) => {
  switch (type) {
    case 'house':
      return 'Private house';
    case 'apartment':
      return 'Apartment';
    case 'government':
      return 'Government building';
    case 'office':
      return 'Office';
    default:
      return type;
  }
};

export default function AddressSummaryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addAddress } = useUser();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const addressData = route.params?.addressData;

  const handleSaveAddress = async () => {
    if (!addressData || isSaving) return;

    setIsSaving(true);

    try {
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

      showToast('Address saved successfully! ✓', 'success');

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
      showToast('Failed to save address. Please try again.', 'error');
      setIsSaving(false);
    }
  };

  if (!addressData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No address data found</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.progress}>
          <Dot active />
          <Dot active />
          <Dot active />
          <Dot active wide />
        </View>

        <Text style={styles.title}>Review Address</Text>
        <Text style={styles.subtitle}>Проверьте правильность адреса</Text>
      </View>

      {/* Summary */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Address Type Card */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>{getAddressTypeIcon(addressData.addressType)}</Text>
          <Text style={styles.cardTitle}>{getAddressTypeName(addressData.addressType)}</Text>
        </View>

        {/* Address Card */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>📍 Address</Text>
          <Text style={styles.addressText}>{addressData.address}</Text>
        </View>

        {/* Apartment Details (if applicable) */}
        {addressData.addressType === 'apartment' && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>🏢 Details</Text>
            <InfoRow label="Entrance" value={addressData.entrance} />
            <InfoRow label="Floor" value={addressData.floor} />
            <InfoRow label="Apartment" value={addressData.apartment} />
            <InfoRow label="Intercom" value={addressData.intercom} />
            {addressData.comment && (
              <View style={[styles.infoRow, { marginTop: 8 }]}>
                <Text style={styles.infoLabel}>Comment</Text>
                <Text style={[styles.infoValue, { marginTop: 4 }]}>{addressData.comment}</Text>
              </View>
            )}
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
          <Text style={styles.editText}>Edit</Text>
        </Pressable>

        <Pressable
          onPress={handleSaveAddress}
          disabled={isSaving}
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>Save Address</Text>
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
    paddingBottom: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#0C1633',
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '800',
    color: '#0C1633',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
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
    backgroundColor: '#F7F9FC',
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  editText: {
    color: '#3B82F6',
    fontSize: 17,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  saveBtnDisabled: {
    backgroundColor: '#AFC7FF',
  },
  saveText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
