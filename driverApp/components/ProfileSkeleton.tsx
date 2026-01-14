import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export const ProfileSkeleton = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle} />
        <View style={styles.nameBox} />
        <View style={styles.statusPill} />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitle} />
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
              <View style={styles.valueBox} />
            </View>
          </View>
          <View style={[styles.menuItem, styles.borderTop]}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
              <View style={styles.valueBox} />
            </View>
          </View>
        </View>
      </View>

      {/* Vehicle Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitle} />
        <View style={styles.card}>
          <View style={styles.vehicleItem}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.vehicleModelBox} />
              <View style={styles.plateBox} />
            </View>
          </View>
        </View>
      </View>

      {/* Performance Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitle} />
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
            </View>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitle} />
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
            </View>
          </View>
          <View style={[styles.menuItem, styles.borderTop]}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
            </View>
          </View>
          <View style={[styles.menuItem, styles.borderTop]}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
            </View>
          </View>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.iconBox} />
            <View style={styles.textColumn}>
              <View style={styles.labelBox} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  content: {
    paddingVertical: 24,
    paddingBottom: 40,
  },

  // Header
  headerCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  nameBox: {
    width: 160,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 10,
  },
  statusPill: {
    width: 100,
    height: 36,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
  },

  // Section
  section: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    width: 120,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 68,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  labelBox: {
    width: 140,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 4,
  },
  valueBox: {
    width: 100,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
  },

  // Vehicle Item
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 88,
  },
  vehicleModelBox: {
    width: 120,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  plateBox: {
    width: 90,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
  },
});
