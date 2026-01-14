import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export const OrderDetailSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Address Block */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <View style={styles.circle} />
          <View style={styles.headerText}>
            <View style={styles.mediumBox} />
            <View style={styles.smallBox} />
          </View>
        </View>
        <View style={styles.addressLine} />
        <View style={styles.addressLineShort} />
      </View>

      {/* Product List Block */}
      <View style={styles.block}>
        <View style={styles.productItem}>
          <View style={styles.productLeft}>
            <View style={styles.smallCircle} />
            <View style={styles.productText}>
              <View style={styles.mediumBox} />
              <View style={styles.tinyBox} />
            </View>
          </View>
          <View style={styles.quantityBox} />
        </View>
        <View style={styles.productItem}>
          <View style={styles.productLeft}>
            <View style={styles.smallCircle} />
            <View style={styles.productText}>
              <View style={styles.mediumBox} />
              <View style={styles.tinyBox} />
            </View>
          </View>
          <View style={styles.quantityBox} />
        </View>
      </View>

      {/* Client Info Block */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <View style={styles.circle} />
          <View style={styles.headerText}>
            <View style={styles.mediumBox} />
            <View style={styles.smallBox} />
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.labelBox} />
          <View style={styles.valueBox} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.labelBox} />
          <View style={styles.valueBox} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.labelBox} />
          <View style={styles.valueBox} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  mediumBox: {
    width: 140,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  smallBox: {
    width: 100,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
  },
  addressLine: {
    width: '100%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressLineShort: {
    width: '70%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  productText: {
    flex: 1,
  },
  tinyBox: {
    width: 60,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginTop: 6,
  },
  quantityBox: {
    width: 50,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelBox: {
    width: 80,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
  },
  valueBox: {
    width: 120,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
  },
});
