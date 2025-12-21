import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { AddressCard } from '../components/AddressCard';
import { useUser } from '../context/UserContext';
import { getUserAddresses } from '../services/api';

type AddressSelectScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'AddressSelect'>;
};

const AddressSelectScreen: React.FC<AddressSelectScreenProps> = ({ navigation }) => {
  const { addresses, setAddresses, selectedAddress, setSelectedAddress, setUser, user } = useUser();
  const [loading, setLoading] = useState(true);

  // ---- GET ADDRESS ICON ----
  const getAddressIcon = (addressType?: 'house' | 'apartment' | 'government' | 'office') => {
    switch (addressType) {
      case 'house':
        return require('../assets/address/house-3d.png');
      case 'apartment':
        return require('../assets/address/apartment-3d.png');
      case 'office':
        return require('../assets/address/office-3d.png');
      case 'government':
        return require('../assets/address/government-3d.png');
      default:
        return require('../assets/address/house-3d.png'); // Default fallback
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Reload addresses when user returns from SelectAddress screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAddresses();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAddresses = async () => {
    try {
      const data = await getUserAddresses();
      setAddresses(data);

      // Auto-select default address or first address
      const defaultAddress = data.find(addr => addr.isDefault) || data[0];
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Set user ID to mark authentication as complete
    if (user) {
      setUser({ ...user, id: Date.now().toString() });
    } else {
      // If no user exists yet, create a basic user object
      setUser({
        id: Date.now().toString(),
        name: 'Guest',
        phone: '',
        language: 'en',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Select Address</Text>
        <Text style={styles.subtitle}>
          {addresses.length === 0
            ? 'Add your first delivery address to continue'
            : 'Choose your delivery address'}
        </Text>

        {/* Show empty state for first-time users */}
        {!loading && addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptyText}>
              Add your first address to start ordering water
            </Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={({ item }) => (
              <AddressCard
                title={item.title}
                subtitle={item.address}
                iconSource={getAddressIcon(item.addressType)}
                onPress={() => setSelectedAddress(item)}
                isSelected={selectedAddress?.id === item.id}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}

        {/* Add New Address Button */}
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => navigation.navigate('SelectAddress')}
        >
          <Text style={styles.addAddressIcon}>📍</Text>
          <Text style={styles.addAddressText}>
            {addresses.length === 0 ? 'Add Address on Map' : 'Add New Address'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedAddress}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    marginBottom: Spacing.lg,
  },
  list: {
    paddingBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  addAddressIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  addAddressText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  footer: {
    padding: Spacing.lg,
  },
});

export default AddressSelectScreen;
