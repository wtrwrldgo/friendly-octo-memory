import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Checkmark Component for selected state
const Checkmark = ({ active }: { active: boolean }) => (
  <View style={[styles.checkmark, active && styles.checkmarkActive]}>
    {active && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
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
      ]}
    >
      <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
        {item.icon ? (
          <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <Text style={styles.emoji}>{item.emoji}</Text>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{item.title}</Text>
        {!!item.hint && <Text style={styles.cardHint}>{item.hint}</Text>}
      </View>
      <Checkmark active={active} />
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
    } else if (selected === 'house') {
      navigation.navigate('HouseDetails', { addressData: updatedAddressData });
    } else {
      navigation.navigate('AddressSummary', { addressData: updatedAddressData });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          {/* Cancel button for authenticated users */}
          {!isSignupFlow && (
            <Pressable onPress={handleCancel} hitSlop={10} style={styles.cancelButton}>
              <Text style={styles.cancelText}>✕</Text>
            </Pressable>
          )}
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
    backgroundColor: '#F7F9FC',
  },

  // Header - More compact
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  backArrow: {
    fontSize: 20,
    color: '#0C1633',
    fontWeight: '500',
  },
  cancelButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  title: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },

  // Card - Cleaner, more clickable
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginTop: 10,
    shadowColor: '#0C1633',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardActive: {
    backgroundColor: '#F8FAFF',
    borderColor: '#3B82F6',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#EBF3FF',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  iconImage: {
    width: 56,
    height: 56,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
    marginBottom: 2,
  },
  cardTitleActive: {
    color: '#2563EB',
  },
  cardHint: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },

  // Checkmark - Cleaner radio style
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkmarkActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmarkIcon: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Sticky Button
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#F7F9FC',
  },
  nextBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nextBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
