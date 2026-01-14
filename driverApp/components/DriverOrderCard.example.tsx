/**
 * EXAMPLE USAGE OF DriverOrderCard
 *
 * This file shows how to use the DriverOrderCard component in your screens.
 * Copy the relevant code snippets to your OrdersScreen or any other screen.
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { DriverOrderCard } from './DriverOrderCard';
import { OrderStage } from '../types';

// Example data showcasing all address types
const exampleOrders = [
  {
    id: '1',
    orderNumber: '#WG-2024-001',
    stage: OrderStage.IN_QUEUE,
    customerName: 'Alisher Karimov',
    customerPhone: '+998901234567',
    addressType: 'Apartment' as const,
    placeName: '22 mkr dom 1 a 4 podezd 5 kv',
    address: 'Yunusabad district, Amir Temur street 15',
    price: 45.50,
  },
  {
    id: '2',
    orderNumber: '#WG-2024-002',
    stage: OrderStage.COURIER_ON_THE_WAY,
    customerName: 'Shohruh Rahimov',
    customerPhone: '+998901234568',
    addressType: 'House' as const,
    placeName: 'Maslaxat 21',
    address: 'Mirzo Ulugbek district, Buyuk Ipak Yuli 123',
    price: 32.00,
  },
  {
    id: '3',
    orderNumber: '#WG-2024-003',
    stage: OrderStage.ORDER_PLACED,
    customerName: 'Nigora Azimova',
    customerPhone: '+998901234569',
    addressType: 'Office' as const,
    placeName: 'IT Park Tashkent',
    address: 'Shaykhontohur district, Mustaqillik Avenue 56, 3rd floor',
    price: 78.25,
  },
  {
    id: '4',
    orderNumber: '#WG-2024-004',
    stage: OrderStage.COURIER_ARRIVED,
    customerName: 'Rustam Ortikov',
    customerPhone: '+998901234570',
    addressType: 'Government' as const,
    placeName: 'Ministry of Finance',
    address: 'Yashnobod district, Government complex, building 5',
    price: 120.00,
  },
  {
    id: '5',
    orderNumber: '#WG-2024-005',
    stage: OrderStage.DELIVERED,
    customerName: 'Dilnoza Yusupova',
    customerPhone: '+998901234571',
    addressType: 'Private' as const,
    placeName: 'Sofia Bakery',
    address: 'Chilanzar district, Bunyodkor street 25',
    price: 65.75,
  },
  {
    id: '6',
    orderNumber: '#WG-2024-006',
    stage: OrderStage.IN_QUEUE,
    customerName: 'Aziz Nurmatov',
    customerPhone: '+998901234572',
    addressType: 'Custom' as const,
    placeName: 'Blue Tower Mall',
    address: 'Yakkasaray district, Shota Rustaveli street 88',
    price: 52.00,
  },
];

// Example Screen Component
export const ExampleOrdersScreen = () => {
  const handleOrderPress = (orderId: string) => {
    console.log('Order pressed:', orderId);
    // Navigate to order details screen
    // navigation.navigate('OrderDetails', { orderId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={exampleOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriverOrderCard
            orderNumber={item.orderNumber}
            stage={item.stage}
            customerName={item.customerName}
            customerPhone={item.customerPhone}
            addressType={item.addressType}
            placeName={item.placeName}
            address={item.address}
            price={item.price}
            onPress={() => handleOrderPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: 16,
  },
});

/**
 * ============================================
 * HOW TO USE IN ORDERSSCREEN
 * ============================================
 *
 * 1. Import the component:
 *    import { DriverOrderCard } from '../components/DriverOrderCard';
 *
 * 2. Replace your current renderOrder function with:
 *    const renderOrder = ({ item }: { item: any }) => (
 *      <DriverOrderCard
 *        orderNumber={`#${item.order_number}`}
 *        stage={item.stage}
 *        customerName={item.users?.name || 'Customer'}
 *        customerPhone={item.users?.phone || ''}
 *        addressType={item.addresses?.type || 'Apartment'}
 *        placeName={item.addresses?.name || item.addresses?.title}
 *        address={item.addresses?.address || 'Address not available'}
 *        price={item.total || 0}
 *        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
 *      />
 *    );
 *
 * 3. Use it in your FlatList:
 *    <FlatList
 *      data={orders}
 *      keyExtractor={(item) => item.id}
 *      renderItem={renderOrder}
 *      contentContainerStyle={{ padding: 16 }}
 *    />
 *
 * ============================================
 * ADDRESS TYPES & ICONS
 * ============================================
 *
 * Apartment → 🏢 Purple (#8B5CF6)
 *   Example: "22 mkr dom 1 a 4 podezd 5 kv"
 *
 * House → 🏠 Blue (#3B82F6)
 *   Example: "Maslaxat 21"
 *
 * Office → 👜 Beige (#D4A574)
 *   Example: "IT Park Tashkent"
 *
 * Private → 🏪 Yellow (#EAB308)
 *   Example: "Sofia Bakery"
 *
 * Government → 🏛️ Green (#10B981)
 *   Example: "Ministry of Finance"
 *
 * Custom → 📍 Gray (#6B7280)
 *   Example: "Blue Tower Mall"
 *
 * ============================================
 * ORDER STATUS COLORS
 * ============================================
 *
 * IN QUEUE → Orange (#F97316)
 * ON THE WAY → Blue (#3B82F6)
 * COMPLETED → Green (#10B981)
 *
 * ============================================
 * FEATURES
 * ============================================
 *
 * ✅ Order ID in bold orange
 * ✅ Address type badge with icon + color
 * ✅ Status badge (IN QUEUE, ON THE WAY, COMPLETED)
 * ✅ User avatar + name + phone
 * ✅ Call button (tap to dial customer)
 * ✅ Location pin + full address
 * ✅ Place name badge (optional, color-matched)
 * ✅ Bold price in dark navy
 * ✅ Soft blue shadow (Uber/Bolt style)
 * ✅ 22px rounded corners
 * ✅ Clean, breathable spacing
 */
