import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

type AddressType = 'house' | 'apartment' | 'government' | 'office';

type Option = {
  id: AddressType;
  title: string;
  hint?: string;
  icon?: any;
  emoji: string;
};

// OPTIONS will be generated inside component to access translations

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

// Radio Button Component
const Radio = ({ active }: { active: boolean }) => (
  <View style={[styles.radio, { borderColor: active ? '#3B82F6' : '#E5E7EB' }]}>
    {active && <View style={styles.radioInner} />}
  </View>
);

// Memoized Option Card Component
const OptionCard = memo(
  ({
    item,
    active,
    onPress,
  }: {
    item: Option;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.card,
        active && styles.cardActive,
        active && { borderColor: '#3B82F6' },
      ]}
    >
      {item.icon ? (
        <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
      ) : (
        <Text style={styles.emoji}>{item.emoji}</Text>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {!!item.hint && <Text style={styles.cardHint}>{item.hint}</Text>}
      </View>
      <Radio active={active} />
    </Pressable>
  )
);

export default function AddressTypeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<AddressType | null>(null);

  // Get address data from previous screen
  const addressData = route.params?.addressData;

  // Check if user is in signup flow or authenticated
  const isSignupFlow = addressData?.isFirstAddress === true;

  // Handle cancel button (only for authenticated users)
  const handleCancel = () => {
    if (!isSignupFlow) {
      navigation.goBack();
    }
  };

  // Generate options with translations
  const OPTIONS: Option[] = [
    {
      id: 'house',
      title: t('auth.privateHouse'),
      hint: t('auth.privateHouseHint'),
      icon: require('../assets/address/house-3d.png'),
      emoji: '🏠',
    },
    {
      id: 'apartment',
      title: t('auth.apartment'),
      hint: t('auth.apartmentHint'),
      icon: require('../assets/address/apartment-3d.png'),
      emoji: '🏢',
    },
    {
      id: 'government',
      title: t('auth.government'),
      hint: t('auth.governmentHint'),
      icon: require('../assets/address/government-3d.png'),
      emoji: '🏛️',
    },
    {
      id: 'office',
      title: t('auth.office'),
      hint: t('auth.officeHint'),
      icon: require('../assets/address/office-3d.png'),
      emoji: '🏢',
    },
  ];

  const onNext = () => {
    if (!selected) return;

    // Add address type to the address data
    const updatedAddressData = {
      ...addressData,
      addressType: selected,
    };

    // Route to appropriate details screen based on building type
    if (selected === 'apartment') {
      navigation.navigate('ApartmentDetails', { addressData: updatedAddressData });
    } else if (selected === 'office') {
      navigation.navigate('OfficeDetails', { addressData: updatedAddressData });
    } else if (selected === 'government') {
      navigation.navigate('GovernmentDetails', { addressData: updatedAddressData });
    } else {
      // For private house, go directly to summary (no floors/entrance needed)
      navigation.navigate('AddressSummary', { addressData: updatedAddressData });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          {/* Cancel button for authenticated users */}
          {!isSignupFlow && (
            <Pressable onPress={handleCancel} hitSlop={10}>
              <Text style={styles.cancelText}>✕</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.progress}>
          <Dot active />
          <Dot active />
          <Dot active wide />
          <Dot />
        </View>

        <Text style={styles.title}>{t('auth.selectAddressType')}</Text>
        <Text style={styles.subtitle}>{t('auth.addressTypeHelp')}</Text>
      </View>

      {/* List */}
      <FlatList
        data={OPTIONS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <OptionCard
            item={item}
            active={selected === item.id}
            onPress={() => setSelected(item.id)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Next Button */}
      <View style={styles.sticky}>
        <Pressable
          onPress={onNext}
          disabled={!selected}
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
        >
          <Text style={styles.nextText}>{t('auth.next')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F9FC'
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8
  },
  backArrow: {
    fontSize: 24,
    color: '#0C1633'
  },
  cancelText: {
    fontSize: 24,
    color: '#0C1633',
    fontWeight: '600',
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
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
    color: '#6B7280'
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardActive: {
    backgroundColor: '#EDF3FF',
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
  },
  emoji: {
    fontSize: 46,
  },
  iconImage: {
    width: 70,
    height: 70,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633'
  },
  cardHint: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280'
  },

  // Radio
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },

  // Sticky Button
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  nextBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  nextBtnDisabled: {
    backgroundColor: '#AFC7FF',
  },
  nextText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800'
  },
});
