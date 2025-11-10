import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextField } from '../components/TextField';
import { useLanguage } from '../context/LanguageContext';

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

export default function ApartmentDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const addressData = route.params?.addressData;

  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [intercom, setIntercom] = useState('');
  const [comment, setComment] = useState('');

  // Use translations - apartment details only
  const labels = {
    title: t('auth.apartmentDetails'),
    subtitle: t('auth.apartmentDetailsHelp'),
  };

  const onNext = () => {
    // Add apartment details to address data
    const updatedAddressData = {
      ...addressData,
      entrance,
      floor,
      apartment,
      intercom,
      comment,
    };

    // Navigate to summary screen
    navigation.navigate('AddressSummary', { addressData: updatedAddressData });
  };

  // Check if required fields are filled
  const isValid = apartment.trim().length > 0;

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

        <Text style={styles.title}>{labels.title}</Text>
        <Text style={styles.subtitle}>{labels.subtitle}</Text>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../assets/address/apartment-3d.png')}
          style={styles.buildingIcon}
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('auth.entrance')}</Text>
          <TextField
            value={entrance}
            onChangeText={setEntrance}
            placeholder={t('auth.entrancePlaceholder')}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('auth.floor')}</Text>
          <TextField
            value={floor}
            onChangeText={setFloor}
            placeholder={t('auth.floorPlaceholder')}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.labelRequired}>{t('auth.apartmentNumber')} *</Text>
          <TextField
            value={apartment}
            onChangeText={setApartment}
            placeholder={t('auth.apartmentPlaceholder')}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('auth.intercom')}</Text>
          <TextField
            value={intercom}
            onChangeText={setIntercom}
            placeholder={t('auth.intercomPlaceholder')}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('auth.additionalInfo')}</Text>
          <TextField
            value={comment}
            onChangeText={setComment}
            placeholder={t('auth.additionalInfoPlaceholder')}
            multiline
            numberOfLines={3}
            autoCapitalize="sentences"
          />
        </View>
      </ScrollView>

      {/* Sticky Next Button */}
      <View style={styles.sticky}>
        <Pressable
          onPress={onNext}
          disabled={!isValid}
          style={[styles.nextBtn, !isValid && styles.nextBtnDisabled]}
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

  // Icon
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  buildingIcon: {
    width: 120,
    height: 120,
  },

  // Form
  fieldGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0C1633',
    marginBottom: 8,
  },
  labelRequired: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0C1633',
    marginBottom: 8,
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
    fontWeight: '800',
  },
});
