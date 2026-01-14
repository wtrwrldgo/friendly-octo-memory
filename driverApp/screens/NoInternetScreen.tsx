import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface NoInternetScreenProps {
  navigation?: any;
  onRetry?: () => void;
}

export default function NoInternetScreen({ navigation, onRetry }: NoInternetScreenProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (navigation) {
      // Navigate back to loading screen to check auth again
      navigation.replace('Loading');
    }
  };
  return (
    <LinearGradient
      colors={['#E9F7FF', '#F7FEFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* No Internet 3D Icon */}
          <Image
            source={require('../assets/ui-icons/no-internet-3d.png')}
            style={styles.icon}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>No Internet Connection</Text>

          {/* Message */}
          <Text style={styles.message}>
            Please check your internet connection and try again
          </Text>

          {/* Retry Button */}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    width: 280,
    height: 280,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  retryButton: {
    backgroundColor: '#4D7EFF',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
