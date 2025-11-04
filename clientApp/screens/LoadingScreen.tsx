import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes } from '../constants/Colors';

type LoadingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Loading'>;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ navigation }) => {
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💧</Text>
      <Text style={styles.title}>WaterGo</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xl,
  },
  loader: {
    marginTop: Spacing.xl,
  },
});

export default LoadingScreen;
