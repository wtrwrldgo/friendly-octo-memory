import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { FirmCard } from '../components/FirmCard';
import { FirmCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getFirms } from '../services/api';
import { Firm } from '../types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedAddress, user } = useUser();
  const { cart } = useCart();
  const { showError } = useToast();

  useEffect(() => {
    loadFirms();
  }, []);

  const loadFirms = async () => {
    try {
      const data = await getFirms();
      setFirms(data);
    } catch (error: any) {
      showError(error.message || 'Failed to load water suppliers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Guest'}! 👋</Text>
          <TouchableOpacity>
            <Text style={styles.address} numberOfLines={1}>
              📍 {selectedAddress?.address || 'Select address'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Firms List */}
      {loading ? (
        <View style={styles.list}>
          <FirmCardSkeleton />
          <FirmCardSkeleton />
          <FirmCardSkeleton />
        </View>
      ) : firms.length === 0 ? (
        <EmptyState
          icon="💧"
          title="No Water Suppliers"
          message="No water suppliers are available in your area at the moment. Please check back later."
        />
      ) : (
        <FlatList
          data={firms}
          renderItem={({ item }) => (
            <FirmCard
              firm={item}
              onPress={() => navigation.getParent()?.navigate('FirmDetails', { firm: item })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadFirms}
        />
      )}

      {/* Cart Button */}
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.getParent()?.navigate('Cart')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.items.length}</Text>
          </View>
          <Text style={styles.cartText}>View Cart</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  address: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  list: {
    padding: Spacing.md,
  },
  cartButton: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cartBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  cartText: {
    flex: 1,
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

export default HomeScreen;
