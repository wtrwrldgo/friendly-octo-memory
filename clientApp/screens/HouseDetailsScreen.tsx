import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HouseDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const { addAddress } = useUser();
  const { showToast } = useToast();
  const addressData = route.params?.addressData;

  const [houseNumber, setHouseNumber] = useState('');
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

  const canSubmit = useMemo(() => houseNumber.trim().length > 0 && !isSaving, [houseNumber, isSaving]);

  const submit = async () => {
    if (!canSubmit || !addressData) return;

    setIsSaving(true);

    try {
      await addAddress({
        title: houseNumber.trim(),
        name: houseNumber.trim(),
        address: addressData.address,
        lat: addressData.lat,
        lng: addressData.lng,
        isDefault: addressData.isFirstAddress || false,
        addressType: addressData.addressType,
        apartment: houseNumber.trim(),
        entrance: '',
        comment: '',
      });

      showToast(t('auth.addressSaved'), 'success');

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
      showToast(t('auth.addressSaveError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back Button Row */}
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#0C1633" />
          </Pressable>
        </View>

        {/* Hero Image - Hidden when keyboard is open */}
        {!keyboardVisible && (
          <View style={styles.heroContainer}>
            <Image
              source={require('../assets/illustrations/house.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        )}

      <ScrollView
        contentContainerStyle={styles.container}
        bounces
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <Text style={styles.title}>{t('auth.houseDetails')}</Text>
        <Text style={styles.subtitle}>{t('auth.houseDetailsHelp')}</Text>

        {/* House Number Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>
            {t('auth.houseNumber')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputCard}>
            <Ionicons name="home-outline" size={20} color="#3B82F6" style={styles.inputIcon} />
            <TextInput
              value={houseNumber}
              onChangeText={setHouseNumber}
              placeholder={t('auth.houseNumberPlaceholder')}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!canSubmit}
            onPress={submit}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={canSubmit ? ['#3B82F6', '#2563EB'] : ['#E5E7EB', '#E5E7EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={[styles.ctaText, !canSubmit && styles.ctaTextDisabled]}>
                {isSaving ? t('common.saving') : t('auth.saveAddress')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  // Header Row
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backBtn: {
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

  // Hero Image
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

  // Content
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Typography
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 32,
  },

  // Input Section
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  required: {
    color: '#3B82F6',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#0C1633',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0C1633',
  },

  // Button
  buttonSection: {
    marginTop: 8,
  },
  buttonWrapper: {
    width: '100%',
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
    color: '#9CA3AF',
  },
});
