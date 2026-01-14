import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDriverStore } from '../stores/useDriverStore';
import { useToast } from '../context/ToastContext';
import { useLanguageStore } from '../stores/useLanguageStore';
import { vehicleSchema, VehicleFormData } from '../validation';

interface EditVehicleModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditVehicleModal({ visible, onClose }: EditVehicleModalProps) {
  const driver = useDriverStore((state) => state.driver);
  const updateVehicleInfo = useDriverStore((state) => state.updateVehicleInfo);
  const { showSuccess, showError } = useToast();
  const t = useLanguageStore((state) => state.t);

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { isValid } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_model: driver?.vehicle_model || '',
      vehicle_number: driver?.vehicle_number || '',
    },
  });

  const handleSave = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      await updateVehicleInfo(data.vehicle_model.trim(), data.vehicle_number.trim());
      showSuccess(t('editVehicle.vehicleUpdated'));
      onClose();
    } catch (error: any) {
      showError(error.message || t('editVehicle.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>{t('editVehicle.title')}</Text>
          <Text style={styles.modalSubtitle}>{t('editVehicle.subtitle')}</Text>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {/* CAR MODEL */}
            <View style={styles.inputRow}>
              <View style={styles.iconBox}>
                <Image
                  source={require('../assets/ui-icons/delivery-icon.png')}
                  style={styles.inputIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>{t('editVehicle.carModel')}</Text>
                <Controller
                  control={control}
                  name="vehicle_model"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      placeholder={t('editVehicle.carModelPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                />
              </View>
            </View>

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* PLATE NUMBER */}
            <View style={styles.inputRow}>
              <View style={styles.iconBox}>
                <Image
                  source={require('../assets/ui-icons/address-icon.png')}
                  style={styles.inputIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>{t('editVehicle.plateNumber')}</Text>
                <Controller
                  control={control}
                  name="vehicle_number"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={(text) => onChange(text.toUpperCase())}
                      placeholder={t('editVehicle.plateNumberPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="characters"
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            onPress={handleSubmit(handleSave)}
            disabled={loading || !isValid}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4D7EFF', '#3A66F5']}
              style={[styles.saveButton, (!isValid || loading) && styles.saveButtonDisabled]}
            >
              <Text style={styles.saveButtonText}>
                {loading ? t('askName.saving') : t('editVehicle.saveChanges')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CANCEL BUTTON */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 68,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  inputIcon: {
    width: 24,
    height: 24,
    tintColor: '#6B7280',
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C1633',
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 74,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
});
