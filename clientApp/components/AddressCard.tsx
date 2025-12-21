import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface AddressCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
  onDelete?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  iconSource?: any;
  isSelected?: boolean;
  selectedBadgeText?: string;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  title,
  subtitle,
  onPress,
  onDelete,
  containerStyle,
  iconSource,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected, containerStyle]}
      activeOpacity={0.95}
      onPress={onPress}
    >
      {/* Icon */}
      <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
        {iconSource ? (
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        ) : (
          <Text style={styles.iconFallback}>📍</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isSelected && styles.titleSelected]} numberOfLines={1}>
            {title}
          </Text>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>Active</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      </View>

      {/* Action */}
      <View style={styles.actionArea}>
        {onDelete && !isSelected && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        )}
        {isSelected && (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconWrapperSelected: {
    backgroundColor: '#E0ECFF',
  },
  icon: {
    width: 36,
    height: 36,
  },
  iconFallback: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  titleSelected: {
    color: Colors.primary,
  },
  selectedBadge: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  actionArea: {
    marginLeft: 8,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: -2,
  },
});
