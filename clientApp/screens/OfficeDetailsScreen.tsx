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

export default function OfficeDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addressData = route.params?.addressData;

  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [officeNumber, setOfficeNumber] = useState('');
  const [reception, setReception] = useState('');
  const [comment, setComment] = useState('');

  const onNext = () => {
    // Add office details to address data
    const updatedAddressData = {
      ...addressData,
      entrance,
      floor,
      apartment: officeNumber, // Using 'apartment' field for room/office number
      intercom: reception, // Using 'intercom' field for reception info
      comment,
    };

    // Navigate to summary screen
    navigation.navigate('AddressSummary', { addressData: updatedAddressData });
  };

  // Check if required fields are filled
  const isValid = officeNumber.trim().length > 0;

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

        <Text style={styles.title}>Office Details</Text>
        <Text style={styles.subtitle}>Поможет курьеру найти ваш офис</Text>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../assets/address/office-3d.png')}
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
          <Text style={styles.label}>Building Entrance</Text>
          <TextField
            value={entrance}
            onChangeText={setEntrance}
            placeholder="e.g., Main entrance, A, B"
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Floor</Text>
          <TextField
            value={floor}
            onChangeText={setFloor}
            placeholder="e.g., 8"
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.labelRequired}>Office / Room Number *</Text>
          <TextField
            value={officeNumber}
            onChangeText={setOfficeNumber}
            placeholder="e.g., 805, Suite 12A"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reception / Security</Text>
          <TextField
            value={reception}
            onChangeText={setReception}
            placeholder="e.g., Ask for John, Call +998901234567"
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Additional Info</Text>
          <TextField
            value={comment}
            onChangeText={setComment}
            placeholder="Any additional delivery instructions"
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
          <Text style={styles.nextText}>Next</Text>
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
