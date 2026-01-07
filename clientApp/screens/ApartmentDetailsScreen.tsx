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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export default function ApartmentDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const { addAddress } = useUser();
  const { showToast } = useToast();
  const addressData = route.params?.addressData;

  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [comment, setComment] = useState('');
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

  const canSubmit = useMemo(() => apartment.trim().length > 0 && !isSaving, [apartment, isSaving]);

  const submit = async () => {
    if (!canSubmit || !addressData) return;

    setIsSaving(true);

    try {
      await addAddress({
        title: apartment.trim(),
        name: apartment.trim(),
        address: addressData.address,
        lat: addressData.lat,
        lng: addressData.lng,
        isDefault: addressData.isFirstAddress || false,
        addressType: addressData.addressType,
        entrance: entrance.trim(),
        floor: floor.trim(),
        apartment: apartment.trim(),
        comment: comment.trim(),
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
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
            <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color="#0C1633" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          bounces
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Text style={styles.title}>{t('auth.apartmentDetails')}</Text>
          <Text style={styles.subtitle}>{t('auth.apartmentDetailsHelp')}</Text>

          {/* Hero Image - Hidden when keyboard is open */}
          {!keyboardVisible && (
            <View style={styles.heroContainer}>
              <Image
                source={require('../assets/illustrations/apartment.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Apartment Number (required) */}
          <Text style={styles.label}>
            {t('auth.apartmentNumber')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.inputCardFull, styles.inputCardPrimary]}>
            <Ionicons name="home-outline" size={20} color="#3B82F6" style={styles.leftIcon} />
            <TextInput
              value={apartment}
              onChangeText={(t) => setApartment(t.replace(/[^\w-]/g, ''))}
              placeholder={t('auth.apartmentPlaceholder')}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              returnKeyType="next"
            />
          </View>

          {/* Floor + Entrance Row */}
          <View style={styles.row2}>
            <View style={styles.halfField}>
              <Text style={styles.labelSmall}>{t('auth.floor')}</Text>
              <View style={styles.inputCard}>
                <Ionicons name="layers-outline" size={18} color="#6B7280" style={styles.leftIconSmall} />
                <TextInput
                  value={floor}
                  onChangeText={(t) => setFloor(t.replace(/[^\d]/g, ''))}
                  keyboardType="number-pad"
                  placeholder={t('auth.floorPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputSmall}
                />
              </View>
            </View>

            <View style={styles.halfField}>
              <Text style={styles.labelSmall}>{t('auth.entrance')}</Text>
              <View style={styles.inputCard}>
                <Ionicons name="enter-outline" size={18} color="#6B7280" style={styles.leftIconSmall} />
                <TextInput
                  value={entrance}
                  onChangeText={(t) => setEntrance(t.replace(/[^\d]/g, ''))}
                  keyboardType="number-pad"
                  placeholder={t('auth.entrancePlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputSmall}
                />
              </View>
            </View>
          </View>

          {/* Comment - lighter, optional */}
          <Text style={styles.labelOptional}>{t('auth.additionalInfo')}</Text>
          <View style={styles.commentCard}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('auth.additionalInfoPlaceholder')}
              placeholderTextColor="#9CA3AF"
              style={styles.commentInput}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!canSubmit}
            onPress={submit}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={canSubmit ? ['#3B82F6', '#2563EB'] : ['#D1D5DB', '#D1D5DB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={[styles.ctaText, !canSubmit && styles.ctaTextDisabled]}>
                {isSaving ? t('common.saving') : t('auth.saveAddress')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: keyboardVisible ? 40 : 24 }} />
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

  // Header
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
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

  // Content
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Typography
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 21,
    marginBottom: 12,
  },

  // Hero Image - Full width (same as HouseDetails)
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    marginLeft: -20,
    marginBottom: 20,
    backgroundColor: '#EBF4FF',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#3B82F6',
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  labelOptional: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 6,
  },

  // Primary Input (Apartment)
  inputCardFull: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 48,
    paddingRight: 16,
    marginBottom: 20,
  },
  inputCardPrimary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    shadowColor: '#0C1633',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0C1633',
  },

  // Row for Entrance + Floor
  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  inputCard: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 42,
    paddingRight: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  leftIconSmall: {
    position: 'absolute',
    left: 14,
  },
  inputSmall: {
    flex: 1,
    fontSize: 15,
    color: '#0C1633',
  },

  // Comment - lighter
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
  },
  commentInput: {
    fontSize: 15,
    color: '#0C1633',
    textAlignVertical: 'top',
  },

  // Button
  buttonWrapper: {
    marginTop: 24,
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
