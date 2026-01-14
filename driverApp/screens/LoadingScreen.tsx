import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useDriverStore } from '../stores/useDriverStore';

interface LoadingScreenProps {
  navigation: any;
}

export default function LoadingScreen({ navigation }: LoadingScreenProps) {
  const session = useAuthStore((state) => state.session);
  const driver = useDriverStore((state) => state.driver);

  // Animated dots
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;

  // Keep loop references so we can stop them
  const loop1 = useRef<Animated.CompositeAnimation | null>(null);
  const loop2 = useRef<Animated.CompositeAnimation | null>(null);
  const loop3 = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const createLoop = (dot: Animated.Value, delay: number) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.35,
            duration: 350,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return animation;
    };

    loop1.current = createLoop(dot1, 0);
    loop2.current = createLoop(dot2, 140);
    loop3.current = createLoop(dot3, 280);

    return () => {
      loop1.current?.stop();
      loop2.current?.stop();
      loop3.current?.stop();
    };
  }, [dot1, dot2, dot3]);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = () => {
      setTimeout(() => {
        if (isMounted) {
          // Navigate based on authentication state
          if (session || driver) {
            navigation.replace('Main');
          } else {
            navigation.replace('Login');
          }
        }
      }, 1500);
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigation, session, driver]);

  const dotStyle = (v: Animated.Value) => ({
    opacity: v,
    transform: [
      {
        scale: v.interpolate({
          inputRange: [0.35, 1],
          outputRange: [0.9, 1.25],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>
          <Text style={styles.titleWater}>Water</Text>
          <Text style={styles.titleGo}>Go</Text>
        </Text>

        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dotStyle(dot1)]} />
          <Animated.View style={[styles.dot, dotStyle(dot2)]} />
          <Animated.View style={[styles.dot, dotStyle(dot3)]} />
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.driverText}>Driver</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  titleWater: {
    color: '#0C1633',
    fontWeight: '600',
  },
  titleGo: {
    color: '#3B66FF',
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B66FF',
    marginHorizontal: 5,
  },
  bottom: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  driverText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0C1633',
    letterSpacing: 0.5,
  },
});
