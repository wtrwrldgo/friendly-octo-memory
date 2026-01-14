/**
 * ORDER DETAIL CARD - USAGE EXAMPLES
 *
 * Modern Uber-style order detail card for driver app
 * Features: Customer info, prominent address, items list, subtle price breakdown, action buttons
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { OrderDetailCard } from './OrderDetailCard';
import { OrderStage } from '../types';

export const OrderDetailCardExample = () => {
  const handleStartDelivery = () => {
    console.log('Starting delivery...');
  };

  const handleNavigate = () => {
    console.log('Opening navigation...');
  };

  const handleComplete = () => {
    console.log('Completing delivery...');
  };

  const handleCall = () => {
    console.log('Calling customer...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Example 1: In Queue Order */}
      <View style={styles.cardWrapper}>
        <OrderDetailCard
          customerName="Alisher Karimov"
          customerPhone="+998901234567"
          address="Yunusabad district, Amir Temur street 15, Apt 42"
          placeName="22 mkr dom 1 a 4 podezd 5 kv"
          items={[
            { name: 'Water Bottle 19L', quantity: 3 },
          ]}
          totalPrice={45.50}
          deliveryFee={5.00}
          serviceFee={2.50}
          stage={OrderStage.IN_QUEUE}
          onStartDelivery={handleStartDelivery}
          onNavigate={handleNavigate}
          onComplete={handleComplete}
          onCall={handleCall}
        />
      </View>

      {/* Example 2: On The Way Order */}
      <View style={styles.cardWrapper}>
        <OrderDetailCard
          customerName="Shohruh Rahimov"
          customerPhone="+998901234568"
          address="Mirzo Ulugbek district, Buyuk Ipak Yuli 123"
          placeName="Maslaxat 21"
          items={[
            { name: 'Water Bottle 19L', quantity: 2 },
          ]}
          totalPrice={32.00}
          deliveryFee={4.00}
          serviceFee={2.00}
          stage={OrderStage.COURIER_ON_THE_WAY}
          onStartDelivery={handleStartDelivery}
          onNavigate={handleNavigate}
          onComplete={handleComplete}
          onCall={handleCall}
        />
      </View>

      {/* Example 3: Arrived Order */}
      <View style={styles.cardWrapper}>
        <OrderDetailCard
          customerName="Nigora Azimova"
          customerPhone="+998901234569"
          address="Shaykhontohur district, Mustaqillik Avenue 56, 3rd floor"
          placeName="IT Park Tashkent"
          items={[
            { name: 'Water Bottle 19L', quantity: 5 },
          ]}
          totalPrice={78.25}
          deliveryFee={6.00}
          serviceFee={3.25}
          stage={OrderStage.COURIER_ARRIVED}
          onStartDelivery={handleStartDelivery}
          onNavigate={handleNavigate}
          onComplete={handleComplete}
          onCall={handleCall}
        />
      </View>

      {/* Example 4: Completed Order */}
      <View style={styles.cardWrapper}>
        <OrderDetailCard
          customerName="Rustam Ortikov"
          customerPhone="+998901234570"
          address="Yashnobod district, Government complex, building 5"
          placeName="Ministry of Finance"
          items={[
            { name: 'Water Bottle 19L', quantity: 10 },
          ]}
          totalPrice={120.00}
          deliveryFee={10.00}
          serviceFee={5.00}
          stage={OrderStage.DELIVERED}
          onStartDelivery={handleStartDelivery}
          onNavigate={handleNavigate}
          onComplete={handleComplete}
          onCall={handleCall}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C1633',
  },
  cardWrapper: {
    padding: 16,
  },
});

/**
 * ============================================
 * HOW TO USE IN ORDERDETAILSSCREEN
 * ============================================
 *
 * 1. Import the component:
 *    import { OrderDetailCard } from '../components/OrderDetailCard';
 *
 * 2. Use it in your screen:
 *    <OrderDetailCard
 *      customerName={order.users?.name || 'Customer'}
 *      customerPhone={order.users?.phone || ''}
 *      address={order.addresses?.address || 'Address not available'}
 *      placeName={order.addresses?.name || order.addresses?.title}
 *      items={order.items.map(item => ({
 *        name: item.product_name,
 *        quantity: item.quantity,
 *      }))}
 *      totalPrice={order.total}
 *      deliveryFee={order.delivery_fee}
 *      serviceFee={order.service_fee}
 *      stage={order.stage}
 *      onStartDelivery={handleStartDelivery}
 *      onNavigate={handleNavigate}
 *      onComplete={handleComplete}
 *    />
 *
 * ============================================
 * DESIGN FEATURES
 * ============================================
 *
 * ✅ Customer Section:
 *    - 52px avatar with light blue background
 *    - Bold customer name (18px)
 *    - Phone number (15px gray)
 *    - Blue call button (48px circle)
 *
 * ✅ Address Section (PROMINENT):
 *    - "DELIVERY ADDRESS" label in caps
 *    - Large address card with border
 *    - 📍 Location pin icon
 *    - Bold address text (16px)
 *    - Optional place name badge (light blue)
 *
 * ✅ Items Section:
 *    - "ORDER ITEMS" label
 *    - 💧 Water drop icon per item
 *    - Quantity × Item name format
 *
 * ✅ Price Breakdown (SUBTLE):
 *    - Items price (regular)
 *    - Delivery fee (small, gray)
 *    - Service fee (small, gray)
 *    - Divider line
 *    - Total (bold, 18px)
 *
 * ✅ Action Buttons (Stage-based):
 *    - IN_QUEUE: "Start Delivery" (blue)
 *    - ON_THE_WAY: "Navigate" + "Mark Arrived" (split)
 *    - ARRIVED: "Complete Delivery" (blue)
 *    - DELIVERED: Green "Delivery Completed" badge
 *
 * ============================================
 * STYLE DETAILS
 * ============================================
 *
 * Colors:
 * - Background: #FFFFFF (white card)
 * - Text: #0C1633 (dark navy)
 * - Accent: #3B82F6 (light blue)
 * - Subtle: #94A3B8 (gray for fees)
 * - Success: #10B981 (green)
 *
 * Typography:
 * - Customer name: 18px bold
 * - Address: 16px semibold (prominent)
 * - Items: 15px medium
 * - Price: 14px regular
 * - Fees: 13px (subtle)
 * - Total: 18px bold
 *
 * Spacing:
 * - Section padding: 20px horizontal, 16px vertical
 * - Card border radius: 20px
 * - Button border radius: 14px
 * - Between sections: 1px divider (#F1F5F9)
 *
 * ============================================
 * PRICE BREAKDOWN EXPLANATION
 * ============================================
 *
 * Total Price = Items + Delivery Fee + Service Fee
 *
 * Example:
 * Items: $38.00
 * Delivery fee: $5.00 (firm revenue)
 * Service fee: $2.50 (WaterGo commission)
 * ────────────────
 * Total: $45.50
 *
 * Note: Fees are displayed in small, gray text to keep them
 * subtle and secondary. The focus is on the total amount.
 */
