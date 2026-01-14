import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing } from '../config/colors';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useStatistics } from '../hooks/useStatistics';

export default function StatisticsScreen({ navigation }: any) {
  const t = useLanguageStore((state) => state.t);
  const { statistics, isLoading, error } = useStatistics();

  // Map real data to UI structure
  const summaryStats = statistics ? [
    {
      label: t('statisticsExpanded.today'),
      value: String(statistics.todayDeliveries),
      subtitle: t('statistics.deliveries'),
      trend: '+0',
      trendUp: true
    },
    {
      label: t('earningsExpanded.thisWeek'),
      value: String(statistics.weekDeliveries),
      subtitle: t('statistics.deliveries'),
      trend: '+0',
      trendUp: true
    },
    {
      label: t('earningsExpanded.thisMonth'),
      value: String(statistics.monthDeliveries),
      subtitle: t('statistics.deliveries'),
      trend: '+0',
      trendUp: true
    },
  ] : [];

  const weeklyData = statistics?.weeklyChart || [];

  const maxDeliveries = weeklyData.length > 0
    ? Math.max(...weeklyData.map(d => d.deliveries))
    : 1;

  const qualityMetrics = statistics ? [
    {
      icon: '✕',
      label: t('statisticsExpanded.cancelledOrders'),
      value: String(statistics.cancelledOrders),
      subtitle: t('statisticsExpanded.last30Days'),
      color: '#EF4444',
      bgColor: '#FEE2E2'
    },
    {
      icon: '★',
      label: t('statisticsExpanded.driverRating'),
      value: statistics.driverRating.toFixed(1),
      subtitle: t('statisticsExpanded.outOf5'),
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('statisticsExpanded.statistics')}</Text>
          <Text style={styles.headerSubtitle}>{t('statisticsExpanded.performanceOverview')}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D7EFF" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load statistics</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      )}

      {/* Content */}
      {!isLoading && !error && statistics && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Summary Cards */}
        <View style={styles.section}>
          <View style={styles.summaryCardsRow}>
            {summaryStats.map((stat, index) => (
              <View key={index} style={styles.summaryCardWrapper}>
                <LinearGradient
                  colors={['#4D7EFF', '#2D5FE5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.summaryCard}
                >
                  <View style={styles.summaryCardTop}>
                    <Text style={styles.summaryLabel}>{stat.label}</Text>
                    <View style={[styles.trendBadge, !stat.trendUp && styles.trendBadgeDown]}>
                      <Text style={styles.trendText}>{stat.trend}</Text>
                    </View>
                  </View>
                  <Text style={styles.summaryValue}>{stat.value}</Text>
                  <Text style={styles.summarySubtitle}>{stat.subtitle}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('statisticsExpanded.weeklyActivity')}</Text>
            <Text style={styles.sectionSubtitle}>{t('statisticsExpanded.last7Days')}</Text>
          </View>
          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {/* Horizontal grid lines */}
              <View style={styles.gridLines}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gridLine} />
                ))}
              </View>

              {/* Bars */}
              <View style={styles.barsContainer}>
                {weeklyData.map((item, index) => {
                  const barHeight = (item.deliveries / maxDeliveries) * 140;
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        {item.isToday && (
                          <View style={styles.todayIndicator}>
                            <Text style={styles.todayText}>{t('statisticsExpanded.today')}</Text>
                          </View>
                        )}
                        <LinearGradient
                          colors={item.isToday ? ['#10B981', '#059669'] : ['#4D7EFF', '#3A66F5']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={[styles.bar, { height: Math.max(barHeight, 25) }]}
                        >
                          <Text style={styles.barValue}>{item.deliveries}</Text>
                        </LinearGradient>
                      </View>
                      <Text style={[styles.dayLabel, item.isToday && styles.dayLabelToday]}>
                        {item.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Quality Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('statisticsExpanded.performance')}</Text>
            <Text style={styles.sectionSubtitle}>{t('statisticsExpanded.keyMetrics')}</Text>
          </View>
          <View style={styles.metricsGrid}>
            {qualityMetrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <View style={[styles.metricIconLarge, { backgroundColor: metric.bgColor }]}>
                  <Text style={[styles.metricIconTextLarge, { color: metric.color }]}>
                    {metric.icon}
                  </Text>
                </View>
                <Text style={styles.metricValueLarge}>{metric.value}</Text>
                <Text style={styles.metricLabelLarge}>{metric.label}</Text>
                <Text style={styles.metricSubtitle}>{metric.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('statisticsExpanded.watergoApp')}</Text>
          <Text style={styles.footerVersion}>{t('statisticsExpanded.version')}</Text>
        </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#0C1633',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E99AB',
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E99AB',
  },

  // Summary Cards
  summaryCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  summaryCardWrapper: {
    flex: 1,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 20,
    minHeight: 120,
    justifyContent: 'space-between',
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
    flex: 1,
  },
  trendBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendBadgeDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -1,
  },
  summarySubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.85,
  },

  // Chart
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.xl,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  chartContainer: {
    height: 200,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
    marginBottom: 12,
    position: 'relative',
  },
  todayIndicator: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  todayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bar: {
    width: 32,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E99AB',
    marginTop: 4,
  },
  dayLabelToday: {
    color: '#10B981',
    fontWeight: '700',
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  metricIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconTextLarge: {
    fontSize: 26,
  },
  metricValueLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 4,
  },
  metricLabelLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: 40,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E99AB',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '500',
    color: '#CBD5E0',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#8E99AB',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
