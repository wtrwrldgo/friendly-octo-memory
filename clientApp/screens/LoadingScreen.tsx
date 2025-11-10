import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../types';

type LoadingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Loading'>;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ navigation }) => {
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      navigation.replace('SelectLanguage');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#E9F7FF', '#F7FEFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        {/* Spinner at the TOP */}
        <View style={styles.topLoader}>
          <ActivityIndicator size="large" color="#62B7FF" />
        </View>

        {/* Center content */}
        <View style={styles.center}>
          <Image
            source={require('../assets/watergo-loading.png')}
            style={styles.mascot}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            <Text style={styles.titleWater}>Water</Text>
            <Text style={styles.titleGo}>Go</Text>
          </Text>
          <Text style={styles.sub}>Loading...</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  topLoader: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 4 : 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mascot: {
    width: 320,
    height: 320,
    marginBottom: 16
  },
  title: {
    fontSize: 64,
    fontWeight: '800',
  },
  titleWater: {
    color: '#0C1633'
  },
  titleGo: {
    color: '#62B7FF'
  },
  sub: {
    fontSize: 28,
    color: '#6B7280',
    marginTop: 8
  },
});

export default LoadingScreen;
