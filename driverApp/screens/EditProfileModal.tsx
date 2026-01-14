import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDriverStore } from '../stores/useDriverStore';
import { useToast } from '../context/ToastContext';
import { useLanguageStore } from '../stores/useLanguageStore';
import { driverNameSchema, DriverNameFormData } from '../validation';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const driver = useDriverStore((state) => state.driver);
  const updateDriverName = useDriverStore((state) => state.updateDriverName);
  const { showError, showSuccess } = useToast();
  const t = useLanguageStore((state) => state.t);

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { isValid } } = useForm<DriverNameFormData>({
    resolver: zodResolver(driverNameSchema),
    defaultValues: { name: driver?.name || '' },
  });

  useEffect(() => {
    if (visible && driver) {
      reset({ name: driver.name || '' });
    }
  }, [visible, driver, reset]);

  const handleSave = async (data: DriverNameFormData) => {
    if (data.name.trim() === driver?.name) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await updateDriverName(data.name.trim());
      showSuccess(t('editProfileExpanded.profileUpdated'));
      onClose();
    } catch (error: any) {
      showError(error.message || t('editProfileExpanded.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const driverInitial = (driver?.name || 'D').charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>{t('editProfileExpanded.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('editProfileExpanded.editProfile')}</Text>
            <TouchableOpacity
              onPress={handleSubmit(handleSave)}
              style={styles.headerButton}
              disabled={loading || !isValid}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#4D7EFF" />
              ) : (
                <Text style={[styles.saveText, (!isValid || loading) && styles.saveTextDisabled]}>
                  {t('editProfileExpanded.save')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{driverInitial}</Text>
              </View>
              <Text style={styles.avatarLabel}>{t('editProfileExpanded.profilePicture')}</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name Field */}
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <View style={styles.iconWrapper}>
                    <Image
                      source={require('../assets/ui-icons/user-3d.png')}
                      style={styles.fieldIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>{t('editProfileExpanded.fullName')}</Text>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.fieldInput}
                          value={value}
                          onChangeText={onChange}
                          placeholder={t('editProfileExpanded.enterFullName')}
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="words"
                          editable={!loading}
                          autoFocus={false}
                        />
                      )}
                    />
                  </View>
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <View style={styles.iconWrapper}>
                    <Image
                      source={require('../assets/call-icon.png')}
                      style={styles.fieldIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>{t('editProfileExpanded.phoneNumber')}</Text>
                    <Text style={styles.fieldValue}>{driver?.phone || t('editProfileExpanded.notSet')}</Text>
                  </View>
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                </View>
                <Text style={styles.cardHint}>
                  {t('editProfileExpanded.phoneLocked')}
                </Text>
              </View>

              {/* Company Field */}
              {driver?.firm_name && (
                <View style={styles.card}>
                  <View style={styles.fieldRow}>
                    <View style={styles.iconWrapper}>
                      <Image
                        source={require('../assets/ui-icons/delivery-icon.png')}
                        style={styles.fieldIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>{t('editProfileExpanded.company')}</Text>
                      <Text style={styles.fieldValue}>{driver.firm_name}</Text>
                    </View>
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  </View>
                  <Text style={styles.cardHint}>
                    {t('editProfileExpanded.companyLocked')}
                  </Text>
                </View>
              )}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                {t('editProfileExpanded.infoText')}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 70,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.3,
  },
  saveText: {
    fontSize: 16,
    color: '#4D7EFF',
    fontWeight: '700',
  },
  saveTextDisabled: {
    color: '#9CA3AF',
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4D7EFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  avatarLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  formSection: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldIcon: {
    width: 28,
    height: 28,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0C1633',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0C1633',
    paddingVertical: 4,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  lockIcon: {
    fontSize: 16,
  },
  cardHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
    marginLeft: 56,
    lineHeight: 18,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
});
