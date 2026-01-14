import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationApp } from '../services/navigation.service';

interface NavigationOption {
  app: NavigationApp;
  iconText: string;
  iconColor: string;
  bgColor: string;
  subtitle: string;
}

interface NavigationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectApp: (app: NavigationApp) => void;
}

export default function NavigationPickerModal({
  visible,
  onClose,
  onSelectApp,
}: NavigationPickerModalProps) {
  const navigationOptions: NavigationOption[] = [
    {
      app: NavigationApp.GOOGLE_MAPS,
      iconText: 'G',
      iconColor: '#4285F4',
      bgColor: '#E8F0FE',
      subtitle: 'Navigate with Google Maps',
    },
    {
      app: NavigationApp.YANDEX_MAPS,
      iconText: 'Я',
      iconColor: '#FF0000',
      bgColor: '#FFE5E5',
      subtitle: 'Navigate with Yandex Maps',
    },
  ];

  // Add Apple Maps for iOS
  if (Platform.OS === 'ios') {
    navigationOptions.push({
      app: NavigationApp.APPLE_MAPS,
      iconText: '',
      iconColor: '#000000',
      bgColor: '#F5F5F7',
      subtitle: 'Navigate with Apple Maps',
    });
  }

  const handleSelect = (app: NavigationApp) => {
    onSelectApp(app);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Choose Navigation App</Text>
                <Text style={styles.headerSubtitle}>
                  Select your preferred map application
                </Text>
              </View>

              {/* Navigation Options */}
              <View style={styles.optionsList}>
                {navigationOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.app}
                    style={[
                      styles.optionButton,
                      index < navigationOptions.length - 1 && styles.optionBorderBottom,
                    ]}
                    onPress={() => handleSelect(option.app)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
                      <Text style={[styles.iconText, { color: option.iconColor }]}>
                        {option.iconText}
                      </Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.optionText}>{option.app}</Text>
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E99AB',
    textAlign: 'center',
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E99AB',
  },
  cancelButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});
