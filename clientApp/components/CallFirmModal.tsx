import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Linking } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface CallFirmModalProps {
  visible: boolean;
  onClose: () => void;
  firmPhone?: string;
}

const CallFirmModal: React.FC<CallFirmModalProps> = ({
  visible,
  onClose,
  firmPhone,
}) => {
  const { t } = useLanguage();

  const handleCall = () => {
    const phone = firmPhone || '+998901234567';
    Linking.openURL(`tel:${phone}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <Image
            source={require('../assets/cancel-order-icon.png')}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>{t('orderTracking.cancelModalTitle')}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {t('orderTracking.cancelModalMessage')}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>{t('orderTracking.okButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Text style={styles.callBtnIcon}>📞</Text>
              <Text style={styles.callBtnText}>{t('orderTracking.callButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  illustration: {
    width: 180,
    height: 140,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0E1733',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#8088A2',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8088A2',
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#2EC973',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#2EC973',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  callBtnIcon: {
    fontSize: 16,
  },
  callBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CallFirmModal;
