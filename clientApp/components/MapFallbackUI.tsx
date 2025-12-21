import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapFallbackUIProps {
  onAddressSelected: (address: string, lat?: number, lon?: number) => void;
  onRetry?: () => void;
  placeholder?: string;
}

export const MapFallbackUI: React.FC<MapFallbackUIProps> = ({
  onAddressSelected,
  onRetry,
  placeholder = 'Enter your address manually',
}) => {
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (address.trim()) {
      // Use default coordinates (Nukus) when manually entering address
      onAddressSelected(address.trim(), 42.4531, 59.6103);
    }
  };

  return (
    <View style={styles.container}>
      {/* Error Message */}
      <View style={styles.errorCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="map-outline" size={48} color="#3B82F6" />
        </View>

        <Text style={styles.title}>Map Temporarily Unavailable</Text>
        <Text style={styles.subtitle}>
          Don't worry! You can still continue by entering your address manually.
        </Text>

        {/* Mascot Image */}
        <Image
          source={require('../assets/mascot/water-drop-mascot.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </View>

      {/* Manual Address Input */}
      <ScrollView style={styles.inputSection} keyboardShouldPersistTaps="handled">
        <Text style={styles.inputLabel}>Enter Your Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="#3B82F6" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder={placeholder}
            placeholderTextColor="#8A8FA4"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          Example: Street 123, Building 5, Floor 3, Apt 42, Nukus
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Ionicons name="refresh" size={20} color="#3B82F6" />
              <Text style={styles.retryButtonText}>Retry Map</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              !address.trim() && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!address.trim()}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            You can update your exact location later in settings
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FF',
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8FA4',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  mascot: {
    width: 100,
    height: 100,
    marginTop: 8,
  },
  inputSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(60, 123, 255, 0.25)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#3C7BFF',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0C1633',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#8A8FA4',
    marginTop: 8,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#C9D7FF',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 32,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
});
