import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { useLanguage } from '../context/LanguageContext';

export type PaymentMethod = 'cash' | 'card' | 'wallet';

interface PaymentMethodOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: string;
  iconUrl?: any;
  available: boolean;
}

export default function PaymentMethodScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const paymentMethodsLocalized: PaymentMethodOption[] = [
    {
      id: 'cash',
      title: t('payment.cash'),
      subtitle: t('payment.cashDescription'),
      icon: '💵',
      iconUrl: require('../assets/payment/cash-icon.png'),
      available: true,
    },
    {
      id: 'card',
      title: t('payment.card'),
      subtitle: t('payment.cardDescription'),
      icon: '💳',
      iconUrl: require('../assets/payment/payme-icon.png'),
      available: false,
    },
    {
      id: 'wallet',
      title: t('payment.wallet'),
      subtitle: t('payment.walletDescription'),
      icon: '💰',
      iconUrl: require('../assets/payment/click-icon.png'),
      available: false,
    },
  ];

  const handleContinue = () => {
    if (route.params?.onSelect) {
      route.params.onSelect(selectedMethod);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={t('payment.title')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>{t('payment.selectMethod')}</Text>

        {paymentMethodsLocalized.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && method.available && styles.methodCardSelected,
              !method.available && styles.methodCardDisabled,
            ]}
            onPress={() => method.available && handleSelect(method.id)}
            disabled={!method.available}
            activeOpacity={method.available ? 0.7 : 1}
          >
            <View style={[styles.methodIcon, !method.available && styles.methodIconDisabled]}>
              {method.iconUrl ? (
                <Image
                  source={method.iconUrl}
                  style={styles.methodIconImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.methodIconText}>{method.icon}</Text>
              )}
            </View>

            <View style={styles.methodContent}>
              <View style={styles.methodHeader}>
                <Text style={[styles.methodTitle, !method.available && styles.methodTitleDisabled]}>
                  {method.title}
                </Text>
                {!method.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>{t('payment.comingSoon')}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.methodSubtitle, !method.available && styles.methodSubtitleDisabled]}>
                {method.subtitle}
              </Text>
            </View>

            {/* Only show radio for available methods */}
            {method.available && (
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
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            {t('payment.cashOnlyNote')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, selectedMethod && styles.continueButtonEnabled]}
          onPress={handleContinue}
          disabled={!selectedMethod}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={selectedMethod ? ['#3B66FF', '#5B7FFF'] : ['#E2E8F0', '#E2E8F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={[styles.continueText, !selectedMethod && styles.continueTextDisabled]}>
              {t('payment.confirm')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
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
  // Method Cards
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  methodCardSelected: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  methodCardDisabled: {
    backgroundColor: '#FAFAFA',
  },
  // Method Icon
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodIconDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  methodIconText: {
    fontSize: 28,
  },
  methodIconImage: {
    width: 48,
    height: 48,
  },
  // Method Content
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  methodTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  methodTitleDisabled: {
    color: '#9CA3AF',
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  methodSubtitleDisabled: {
    color: '#D1D5DB',
  },
  // Coming Soon Badge - more subtle
  comingSoonBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Radio Button
  radioButton: {
    marginLeft: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  // Note Section
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  // Footer
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueButtonEnabled: {
    shadowColor: '#5167FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  continueTextDisabled: {
    color: '#94A3B8',
  },
});
