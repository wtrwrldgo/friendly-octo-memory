import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface CancelledOrderModalProps {
  visible: boolean;
  onClose: () => void;
  firmName?: string;
}

const CancelledOrderModal: React.FC<CancelledOrderModalProps> = ({
  visible,
  onClose,
  firmName,
}) => {
  const { t } = useLanguage();

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
          <Text style={styles.title}>{t('orderTracking.orderCancelled')}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {t('orderTracking.orderCancelledMessage').replace('{firm}', firmName || '')}
          </Text>

          {/* Button */}
          <TouchableOpacity
            style={styles.okButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.okButtonText}>{t('orderTracking.okButton')}</Text>
          </TouchableOpacity>
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
    color: '#DC2626',
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
  okButton: {
    width: '100%',
    backgroundColor: '#2F6BFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CancelledOrderModal;
