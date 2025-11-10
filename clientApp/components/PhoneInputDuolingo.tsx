import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: ViewStyle;
}

export const PhoneInputDuolingo: React.FC<Props> = ({
  value,
  onChangeText,
  containerStyle,
}) => {
  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 9);

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
    <View style={[styles.wrap, containerStyle]}>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>+998</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => onChangeText(formatPhoneNumber(text))}
        placeholder="90 123 45 67"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        maxLength={12}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  codeBox: {
    width: 76,
    height: '100%',
    backgroundColor: '#FFFFFF', // Required for efficient shadow rendering
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C1633',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 18,
    fontSize: 24,
    fontWeight: '600',
    color: '#0C1633',
  },
});
