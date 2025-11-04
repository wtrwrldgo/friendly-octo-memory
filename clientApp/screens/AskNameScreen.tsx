import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useUser } from '../context/UserContext';

type AskNameScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'AskName'>;
};

const AskNameScreen: React.FC<AskNameScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const { updateUser } = useUser();

  const handleContinue = () => {
    if (name.trim()) {
      updateUser({ name: name.trim() });
      navigation.navigate('AuthPhone');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>We'll use this to personalize your experience</Text>

        <TextField
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          autoFocus
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!name.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  emoji: {
    fontSize: 60,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    marginBottom: Spacing.xl,
  },
  footer: {
    padding: Spacing.lg,
  },
});

export default AskNameScreen;
