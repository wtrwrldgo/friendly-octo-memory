import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface HeaderBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  onBack,
  rightAction,
}) => {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {rightAction ? (
          <TouchableOpacity style={styles.rightButton} onPress={rightAction.onPress}>
            <Text style={styles.rightIcon}>{rightAction.icon}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  rightButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    fontSize: 16,
  },
  placeholder: {
    width: 36,
  },
});
