import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export default function OfficeDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const { addAddress } = useUser();
  const { showToast } = useToast();
  const addressData = route.params?.addressData;

  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [officeNumber, setOfficeNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Hide hero image when keyboard is open
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onNext = async () => {
    if (!isValid || !addressData || isSaving) return;

    setIsSaving(true);

    try {
      await addAddress({
        title: addressData.address.split(',')[0] || 'My Address',
        address: addressData.address,
        lat: addressData.lat,
        lng: addressData.lng,
        isDefault: addressData.isFirstAddress || false,
        addressType: addressData.addressType,
        name: name.trim(),
        floor: floor.trim(),
        apartment: officeNumber.trim(),
        comment: '',
      });

      showToast('Address saved successfully!', 'success');

      if (addressData.isFirstAddress) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'HomeTab' }],
                  index: 0,
                },
              },
            ],
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'ProfileTab' }],
                  index: 0,
                },
              },
            ],
          })
        );
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = name.trim().length > 0 && officeNumber.trim().length > 0 && !isSaving;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#0C1633" />
        </Pressable>

        <Text style={styles.title}>{t('auth.officeDetails')}</Text>
        <Text style={styles.subtitle}>{t('auth.officeDetailsHelp')}</Text>
      </View>

      {/* Hero Image - Hidden when keyboard is open */}
      {!keyboardVisible && (
        <View style={styles.heroContainer}>
          <Image
            source={require('../assets/illustrations/office-building.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Form */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Company Name (required) */}
        <Text style={styles.label}>
          {t('auth.companyName')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputCard}>
          <Ionicons name="business-outline" size={18} color="#6B7280" style={styles.leftIcon} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('auth.companyNamePlaceholder')}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        {/* Floor */}
        <Text style={styles.labelSecondary}>{t('auth.floor')}</Text>
        <View style={styles.inputCard}>
          <Ionicons name="layers-outline" size={18} color="#6B7280" style={styles.leftIcon} />
          <TextInput
            value={floor}
            onChangeText={setFloor}
            placeholder={t('auth.floorPlaceholder')}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="number-pad"
          />
        </View>

        {/* Office Number (required) */}
        <Text style={styles.label}>
          {t('auth.officeNumber')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputCard}>
          <Ionicons name="document-text-outline" size={18} color="#6B7280" style={styles.leftIcon} />
          <TextInput
            value={officeNumber}
            onChangeText={setOfficeNumber}
            placeholder={t('auth.officeNumberPlaceholder')}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Button */}
      <View style={styles.sticky}>
        <TouchableOpacity activeOpacity={0.9} disabled={!isValid} onPress={onNext}>
          <LinearGradient
            colors={isValid ? ['#3B82F6', '#2563EB'] : ['#D1D5DB', '#D1D5DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text style={[styles.ctaText, !isValid && styles.ctaTextDisabled]}>
              {isSaving ? 'SAVING...' : 'SAVE ADDRESS'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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
    paddingTop: 4,
    paddingBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C1633',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#0C1633',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Hero Image - Full width (same as HouseDetails)
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    backgroundColor: '#EBF4FF',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Form
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 14,
    marginBottom: 8,
  },
  labelSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 14,
    marginBottom: 8,
  },
  required: {
    color: '#3B82F6',
  },

  // Input
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 14,
    height: 52,
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0C1633',
  },

  // Sticky Button
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    backgroundColor: '#F7F9FC',
  },
  cta: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  ctaTextDisabled: {
    color: '#6B7280',
  },
});
