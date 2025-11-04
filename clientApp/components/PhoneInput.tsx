import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  error,
}) => {
  const [countryCode] = useState('+998');

  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 9 digits for Uzbekistan
    const limited = cleaned.slice(0, 9);

    // Format as XX XXX XX XX
    let formatted = '';
    if (limited.length > 0) {
      formatted = limited.slice(0, 2);
    }
    if (limited.length > 2) {
      formatted += ' ' + limited.slice(2, 5);
    }
    if (limited.length > 5) {
      formatted += ' ' + limited.slice(5, 7);
    }
    if (limited.length > 7) {
      formatted += ' ' + limited.slice(7, 9);
    }

    return formatted;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Phone Number</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TouchableOpacity style={styles.countryCode}>
          <Text style={styles.countryCodeText}>{countryCode}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => onChangeText(formatPhoneNumber(text))}
          placeholder="90 123 45 67"
          placeholderTextColor={Colors.grayText}
          keyboardType="phone-pad"
          maxLength={14} // XX XXX XX XX
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  countryCode: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.gray,
  },
  countryCodeText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
