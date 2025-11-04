import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { PrimaryButton } from '../components/PrimaryButton';

export type PaymentMethod = 'cash' | 'card' | 'wallet';

interface PaymentMethodOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: string;
  available: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'cash',
    title: 'Cash on Delivery',
    subtitle: 'Pay when you receive your order',
    icon: '💵',
    available: true,
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    subtitle: 'Pay securely with your card',
    icon: '💳',
    available: false, // Enable when backend is ready
  },
  {
    id: 'wallet',
    title: 'Digital Wallet',
    subtitle: 'UzCard, Humo, Payme',
    icon: '💰',
    available: false, // Enable when backend is ready
  },
];

export default function PaymentMethodScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');

  const handleContinue = () => {
    if (route.params?.onSelect) {
      route.params.onSelect(selectedMethod);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Payment Method" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
              !method.available && styles.methodCardDisabled,
            ]}
            onPress={() => method.available && setSelectedMethod(method.id)}
            disabled={!method.available}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>{method.icon}</Text>
            </View>

            <View style={styles.methodContent}>
              <View style={styles.methodHeader}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                {!method.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </View>
              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>

            <View style={styles.radioButton}>
              <View
                style={[
                  styles.radioOuter,
                  selectedMethod === method.id && styles.radioOuterSelected,
                ]}
              >
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            Cash on delivery is currently the only available payment method. Card and wallet
            payments will be available soon.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedMethod}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  methodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  methodIconText: {
    fontSize: 24,
  },
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  methodSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  radioButton: {
    marginLeft: Spacing.sm,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  note: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#1E40AF',
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
