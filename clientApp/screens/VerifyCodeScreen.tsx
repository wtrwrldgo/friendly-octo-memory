import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Animated, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { verifyCode } from '../services/api';
import { useUser } from '../context/UserContext';

type VerifyCodeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyCode'>;
  route: RouteProp<AuthStackParamList, 'VerifyCode'>;
};

const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useUser();
  const { phone } = route.params;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulsing animation for the lock emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await verifyCode(phone, code);
      // Update user context with verified user data
      updateUser(result.user);
      navigation.navigate('EnableLocation');
    } catch (error: any) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
      Alert.alert('Error', error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            🔐
          </Animated.Text>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>We sent a code to {phone}</Text>

          <View style={styles.inputContainer}>
            <TextField
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              placeholder="1234"
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
            />
          </View>

          <PrimaryButton
            title="Verify"
            onPress={handleVerify}
            disabled={code.length !== 4}
            loading={loading}
          />
        </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  centerContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
    textAlign: 'center',
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
    marginBottom: Spacing.xxl,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
});

export default VerifyCodeScreen;
