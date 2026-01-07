import { useEffect, useRef, useCallback } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Stage = 'placed' | 'queue' | 'on_the_way' | 'courier_arrived' | 'delivered';

const SOUND_ENABLED_KEY = '@watergo_sound_enabled';

// Sound files for each stage
// Stage 4 (courier_arrived) uses car horn, others use notification sound
const NOTIFICATION_SOUND = require('../assets/sounds/stage-notification.mp3');
const CAR_HORN_SOUND = require('../assets/sounds/stage-arrived.mp3');

const STAGE_SOUNDS: Record<Stage, any> = {
  placed: NOTIFICATION_SOUND,
  queue: NOTIFICATION_SOUND,
  on_the_way: NOTIFICATION_SOUND,
  courier_arrived: CAR_HORN_SOUND,
  delivered: NOTIFICATION_SOUND,
};

export const useStageSounds = () => {
  const soundEnabledRef = useRef<boolean>(true);
  const previousStageRef = useRef<Stage | null>(null);
  const currentPlayerRef = useRef<AudioPlayer | null>(null);

  // Load sound preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const enabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
        soundEnabledRef.current = enabled !== 'false';
        console.log('[StageSounds] Sound preference loaded:', soundEnabledRef.current);
      } catch (error) {
        console.log('[StageSounds] Failed to load sound preference:', error);
      }
    };

    loadPreference();

    // Cleanup on unmount
    return () => {
      if (currentPlayerRef.current) {
        currentPlayerRef.current.release();
        currentPlayerRef.current = null;
      }
    };
  }, []);

  // Play sound for a specific stage
  const playStageSound = useCallback(async (stage: Stage) => {
    console.log('[StageSounds] playStageSound called for:', stage);
    console.log('[StageSounds] Sound enabled:', soundEnabledRef.current);

    if (!soundEnabledRef.current) {
      console.log('[StageSounds] Sound disabled, skipping');
      return;
    }

    try {
      // Release previous player if exists
      if (currentPlayerRef.current) {
        currentPlayerRef.current.release();
        currentPlayerRef.current = null;
      }

      const soundFile = STAGE_SOUNDS[stage];
      console.log('[StageSounds] Loading sound file for stage:', stage);

      // Create a new audio player for this sound
      const player = createAudioPlayer(soundFile);
      currentPlayerRef.current = player;

      // Play the sound
      player.play();
      console.log('[StageSounds] Sound playing for stage:', stage);

    } catch (error) {
      console.log('[StageSounds] Failed to play sound:', error);
    }
  }, []);

  // Handle stage change
  const handleStageChange = useCallback((currentStage: Stage) => {
    const prevStage = previousStageRef.current;

    console.log('[StageSounds] handleStageChange:', prevStage, '->', currentStage);

    // Play sound if stage changed (including first load when prevStage is null)
    if (prevStage !== currentStage) {
      console.log('[StageSounds] Stage changed, playing sound');
      playStageSound(currentStage);
    }

    previousStageRef.current = currentStage;
  }, [playStageSound]);

  // Toggle sound on/off
  const toggleSound = useCallback(async (enabled: boolean) => {
    soundEnabledRef.current = enabled;
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.log('[StageSounds] Failed to save sound preference:', error);
    }
  }, []);

  // Get current sound enabled state
  const isSoundEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const enabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      return enabled !== 'false';
    } catch {
      return true;
    }
  }, []);

  return {
    playStageSound,
    handleStageChange,
    toggleSound,
    isSoundEnabled,
  };
};
