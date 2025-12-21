import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  containerStyle,
  style,
  icon,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            error ? styles.inputError : null,
            style
          ]}
          placeholderTextColor="#A0AEC0"
          {...inputProps}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 10,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 18,
    fontSize: 20,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 62,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 18,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  inputWithIcon: {
    paddingLeft: 52,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
