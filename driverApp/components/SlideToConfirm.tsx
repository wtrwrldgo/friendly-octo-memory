import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

// Premium WaterGo Blue
const WATERGO_BLUE = '#2F6BFF';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - 32;
const THUMB_SIZE = 60;
const TRACK_HEIGHT = 60;
const MAX_TRANSLATE = BUTTON_WIDTH - THUMB_SIZE - 8;

interface SlideToConfirmProps {
  onConfirm: () => Promise<void>;
  text?: string;
  disabled?: boolean;
}

export default function SlideToConfirm({
  onConfirm,
  text = 'Slide to confirm',
  disabled = false,
}: SlideToConfirmProps) {
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const translateX = useRef(new Animated.Value(0)).current;

  // Use refs for values that PanResponder needs to access
  const statusRef = useRef(status);
  const disabledRef = useRef(disabled);
  const onConfirmRef = useRef(onConfirm);

  // Keep refs in sync with props/state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  // Reset when text changes (new stage)
  useEffect(() => {
    console.log('[SlideToConfirm] Text changed, resetting button. New text:', text);
    setStatus('idle');
    translateX.setValue(0);
  }, [text]);

  const handleConfirm = useCallback(async () => {
    if (statusRef.current === 'processing') return;

    console.log('[SlideToConfirm] handleConfirm called');
    setStatus('processing');

    try {
      await onConfirmRef.current();
      console.log('[SlideToConfirm] onConfirm completed successfully');
    } catch (error) {
      console.error('[SlideToConfirm] Error confirming:', error);
    } finally {
      // Reset after completion or error
      setStatus('idle');
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [translateX]);

  // Store handleConfirm in ref so PanResponder can access latest version
  const handleConfirmRef = useRef(handleConfirm);
  useEffect(() => {
    handleConfirmRef.current = handleConfirm;
  }, [handleConfirm]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current && statusRef.current === 'idle',
      onMoveShouldSetPanResponder: () => !disabledRef.current && statusRef.current === 'idle',
      onPanResponderGrant: () => {
        translateX.setOffset(0);
      },
      onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (disabledRef.current || statusRef.current !== 'idle') return;
        const newValue = Math.max(0, Math.min(gestureState.dx, MAX_TRANSLATE));
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (disabledRef.current || statusRef.current !== 'idle') {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          return;
        }

        translateX.flattenOffset();
        const currentValue = gestureState.dx;

        if (currentValue > MAX_TRANSLATE * 0.8) {
          // Slide completed - trigger confirmation
          console.log('[SlideToConfirm] Slide threshold reached, triggering confirm');
          Animated.spring(translateX, {
            toValue: MAX_TRANSLATE,
            useNativeDriver: false,
          }).start(() => {
            // Use ref to get latest handleConfirm
            handleConfirmRef.current();
          });
        } else {
          // Slide not completed - reset
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const renderIcon = () => {
    if (status === 'processing') {
      return (
        <View style={styles.iconContainer}>
          <Text style={styles.loaderText}>⏳</Text>
        </View>
      );
    }

    return (
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>→</Text>
      </View>
    );
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${text}. Slide to confirm action`}
      accessibilityHint="Slide the button to the right to confirm"
      accessibilityState={{ disabled, busy: status === 'processing' }}
    >
      <View style={styles.track}>
        <Text style={styles.trackText}>{text}</Text>

        <Animated.View
          {...(status === 'idle' ? panResponder.panHandlers : {})}
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {renderIcon()}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  track: {
    width: '100%',
    height: TRACK_HEIGHT,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  trackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: 0.3,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE - 8,
    backgroundColor: WATERGO_BLUE,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: WATERGO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loaderText: {
    fontSize: 24,
  },
});
