import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

// Base dimensions (iPhone 14 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Responsive scaling functions
export const wp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

export const hp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

// Scale based on width (for horizontal elements)
export const scale = (size: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
};

// Scale based on height (for vertical elements)
export const verticalScale = (size: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
};

// Moderate scale - less aggressive scaling for fonts
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor);
};

// Screen dimensions
export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};

export const Colors = {
  white: '#FFFFFF',
  text: '#0C1633',
  primary: '#2D6FFF',
  gray: '#F5F5F5',
  grayText: '#8E8E93',
  border: '#E5E5EA',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// Android uses more rounded corners for Material Design feel
export const BorderRadius = {
  sm: isAndroid ? 12 : 8,
  md: isAndroid ? 16 : 12,
  lg: isAndroid ? 20 : 16,
  xl: isAndroid ? 28 : 24,
  xxl: isAndroid ? 32 : 28,
  round: 999,
};

// Android-specific card elevation
export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
});
