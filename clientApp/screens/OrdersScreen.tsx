import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useOrder } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';
import { Order } from '../types';
import { StageBadge } from '../components/StageBadge';
import { PrimaryButton } from '../components/PrimaryButton';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentOrder, orderHistory } = useOrder();
  const { t } = useLanguage();

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.getParent()?.navigate('OrderTracking', { orderId: order.id })}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{t('orders.order')} #{order.id}</Text>
            <Text style={styles.orderDate}>
              {order.createdAt.toLocaleDateString()} • {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <StageBadge stage={order.stage} />
        </View>

        <View style={styles.firmInfo}>
          <Image
            source={{ uri: order.firm.logo }}
            style={styles.firmLogo}
            resizeMode="contain"
          />
          <Text style={styles.firmName}>{order.firm.name}</Text>
        </View>

        <View style={styles.orderItems}>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.quantity}x {item.product.name}
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} {t('orders.moreItems')}
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>{t('orders.total')}</Text>
          <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.title')}</Text>
      </View>

      {!currentOrder && orderHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>{t('orders.noOrders')}</Text>
          <Text style={styles.emptyText}>
            {t('orders.historyMessage')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orderHistory}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            currentOrder ? (
              <View style={styles.activeOrderSection}>
                <View style={styles.activeOrderHeader}>
                  <Text style={styles.activeOrderTitle}>{t('orders.activeOrder')}</Text>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{t('orders.live')}</Text>
                  </View>
                </View>

                <View style={[styles.orderCard, styles.activeOrderCard]}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>{t('orders.order')} #{currentOrder.id}</Text>
                      <Text style={styles.orderDate}>
                        {currentOrder.createdAt.toLocaleDateString()} • {currentOrder.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <StageBadge stage={currentOrder.stage} />
                  </View>

                  <View style={styles.firmInfo}>
                    <Image
                      source={{ uri: currentOrder.firm.logo }}
                      style={styles.firmLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.firmName}>{currentOrder.firm.name}</Text>
                  </View>

                  <View style={styles.orderItems}>
                    {currentOrder.items.slice(0, 2).map((item, index) => (
                      <Text key={index} style={styles.itemText}>
                        {item.quantity}x {item.product.name}
                      </Text>
                    ))}
                    {currentOrder.items.length > 2 && (
                      <Text style={styles.moreItems}>
                        +{currentOrder.items.length - 2} {t('orders.moreItems')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.totalLabel}>{t('orders.total')}</Text>
                    <Text style={styles.totalValue}>${currentOrder.total.toFixed(2)}</Text>
                  </View>
                </View>

                <PrimaryButton
                  title={t('orders.viewTracking')}
                  onPress={() => {
                    // Navigate to OrderTracking screen in the parent stack navigator
                    navigation.getParent()?.navigate('OrderTracking', { orderId: currentOrder.id });
                  }}
                />

                {orderHistory.length > 0 && (
                  <View style={styles.historySeparator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.historySeparatorText}>{t('orders.history')}</Text>
                    <View style={styles.separatorLine} />
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderId: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: FontSizes.xs,
    color: Colors.grayText,
  },
  firmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  firmLogo: {
    width: 32,
    height: 32,
    marginRight: Spacing.sm,
  },
  firmName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  orderItems: {
    marginBottom: Spacing.sm,
  },
  itemText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  activeOrderSection: {
    marginBottom: Spacing.lg,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activeOrderTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  liveText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  activeOrderCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  historySeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  historySeparatorText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.grayText,
    marginHorizontal: Spacing.md,
  },
});

export default OrdersScreen;
