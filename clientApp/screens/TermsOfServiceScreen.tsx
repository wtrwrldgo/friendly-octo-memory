import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title="Terms of Service" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Last updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing and using WaterGo, you accept and agree to be bound by these Terms of Service.
          If you do not agree, please do not use our services.
        </Text>

        <Text style={styles.sectionTitle}>2. Service Description</Text>
        <Text style={styles.text}>
          WaterGo is a water delivery platform that connects customers with local water suppliers.
          We facilitate the ordering and delivery of bottled water but do not directly sell or deliver water ourselves.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.text}>
          You are responsible for:
        </Text>
        <Text style={styles.bullet}>• Providing accurate information</Text>
        <Text style={styles.bullet}>• Maintaining the security of your account</Text>
        <Text style={styles.bullet}>• All activities under your account</Text>

        <Text style={styles.sectionTitle}>4. Orders and Payment</Text>
        <Text style={styles.text}>
          • All orders are subject to availability{'\n'}
          • Prices are set by individual suppliers{'\n'}
          • Payment is currently cash on delivery{'\n'}
          • Delivery fees may apply based on location{'\n'}
          • Minimum order amounts may vary by supplier
        </Text>

        <Text style={styles.sectionTitle}>5. Cancellations and Refunds</Text>
        <Text style={styles.text}>
          • You may cancel orders before they are confirmed{'\n'}
          • Once a driver is assigned, cancellations may not be possible{'\n'}
          • Refunds for damaged or incorrect orders handled case-by-case{'\n'}
          • Contact support for refund requests
        </Text>

        <Text style={styles.sectionTitle}>6. Delivery</Text>
        <Text style={styles.text}>
          • Delivery times are estimates and not guaranteed{'\n'}
          • You must provide accurate delivery address{'\n'}
          • Someone must be present to receive the order{'\n'}
          • Additional fees may apply for failed delivery attempts
        </Text>

        <Text style={styles.sectionTitle}>7. Prohibited Uses</Text>
        <Text style={styles.text}>
          You may not:
        </Text>
        <Text style={styles.bullet}>• Provide false information</Text>
        <Text style={styles.bullet}>• Place fraudulent orders</Text>
        <Text style={styles.bullet}>• Abuse or harass drivers or support staff</Text>
        <Text style={styles.bullet}>• Use the service for illegal purposes</Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.text}>
          WaterGo is not liable for:
        </Text>
        <Text style={styles.bullet}>• Quality of products from suppliers</Text>
        <Text style={styles.bullet}>• Delays caused by suppliers or drivers</Text>
        <Text style={styles.bullet}>• Issues outside our control</Text>

        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.text}>
          We reserve the right to modify these terms at any time. Continued use of the service
          constitutes acceptance of modified terms.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.text}>
          For questions about these Terms of Service:
        </Text>
        <Text style={styles.contact}>Email: support@watergo.com</Text>
        <Text style={styles.contact}>Phone: +998 XX XXX XXXX</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  updated: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  text: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 24,
    paddingLeft: Spacing.md,
  },
  contact: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '500',
    paddingLeft: Spacing.md,
    marginTop: Spacing.xs,
  },
});

export default TermsOfServiceScreen;
