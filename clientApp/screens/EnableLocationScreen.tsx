import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { PrimaryButton } from '../components/PrimaryButton';

type EnableLocationScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'EnableLocation'>;
};

const EnableLocationScreen: React.FC<EnableLocationScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleEnableLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        navigation.navigate('AddressSelect');
      } else {
        Alert.alert('Permission Denied', 'Location permission is required for delivery');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location permission');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('AddressSelect');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.subtitle}>
          We need your location to deliver water to your doorstep
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Enable Location"
          onPress={handleEnableLocation}
          loading={loading}
        />
        <PrimaryButton
          title="Skip for now"
          onPress={handleSkip}
          variant="outline"
          style={styles.skipButton}
        />
      </View>
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    padding: Spacing.lg,
  },
  skipButton: {
    marginTop: Spacing.md,
  },
});

export default EnableLocationScreen;
