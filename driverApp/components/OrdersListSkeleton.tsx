import React from 'react';
import { View, StyleSheet } from 'react-native';

export const OrdersListSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Card 1 */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.smallBox} />
          <View style={styles.badge} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.circle} />
          <View style={styles.textColumn}>
            <View style={styles.mediumBox} />
            <View style={styles.smallBoxThin} />
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.circle} />
          <View style={styles.textColumn}>
            <View style={styles.largeBox} />
          </View>
        </View>
      </View>

      {/* Card 2 */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.smallBox} />
          <View style={styles.badge} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.circle} />
          <View style={styles.textColumn}>
            <View style={styles.mediumBox} />
            <View style={styles.smallBoxThin} />
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.circle} />
          <View style={styles.textColumn}>
            <View style={styles.largeBox} />
          </View>
        </View>
      </View>

      {/* Card 3 */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.smallBox} />
          <View style={styles.badge} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.circle} />
          <View style={styles.textColumn}>
            <View style={styles.mediumBox} />
            <View style={styles.smallBoxThin} />
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.circle} />
          <View style={styles.textColumn}>
            <View style={styles.largeBox} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  smallBox: {
    width: 80,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  badge: {
    width: 60,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  mediumBox: {
    width: 140,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  smallBoxThin: {
    width: 100,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
  },
  largeBox: {
    width: '90%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});
