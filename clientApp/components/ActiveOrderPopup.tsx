import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface ActiveOrderPopupProps {
  visible: boolean;
  onClose: () => void;
  onTrackOrder?: () => void;
}

const ActiveOrderPopup: React.FC<ActiveOrderPopupProps> = ({
  visible,
  onClose,
  onTrackOrder,
}) => {
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 3D Water Drop Icon */}
          <Image
            source={require('../assets/watergo-loading.png')}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>{t('orders.activeOrderExists')}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {t('orders.activeOrderMessage')}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>{t('common.ok')}</Text>
            </TouchableOpacity>
            {onTrackOrder && (
              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => {
                  onClose();
                  onTrackOrder();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.trackBtnText}>{t('orders.trackOrder')}</Text>
              </TouchableOpacity>
            )}
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
  trackBtn: {
    flex: 1,
    backgroundColor: '#3B66FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3B66FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  trackBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ActiveOrderPopup;
