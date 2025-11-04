import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title="Privacy Policy" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect information you provide directly to us when using WaterGo, including:
        </Text>
        <Text style={styles.bullet}>• Name and phone number</Text>
        <Text style={styles.bullet}>• Delivery addresses</Text>
        <Text style={styles.bullet}>• Order history</Text>
        <Text style={styles.bullet}>• Device information and location data</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bullet}>• Process and deliver your water orders</Text>
        <Text style={styles.bullet}>• Communicate with you about orders and deliveries</Text>
        <Text style={styles.bullet}>• Improve our services</Text>
        <Text style={styles.bullet}>• Send you notifications about order status</Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.text}>
          We share your information only with:
        </Text>
        <Text style={styles.bullet}>• Water suppliers fulfilling your orders</Text>
        <Text style={styles.bullet}>• Delivery drivers assigned to your orders</Text>
        <Text style={styles.bullet}>• Service providers helping us operate the app</Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.text}>
          We implement appropriate security measures to protect your personal information.
          Your payment information is never stored on our servers.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to:
        </Text>
        <Text style={styles.bullet}>• Access your personal data</Text>
        <Text style={styles.bullet}>• Request correction of your data</Text>
        <Text style={styles.bullet}>• Request deletion of your account</Text>
        <Text style={styles.bullet}>• Opt-out of marketing communications</Text>

        <Text style={styles.sectionTitle}>6. Contact Us</Text>
        <Text style={styles.text}>
          If you have questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={styles.contact}>Email: privacy@watergo.com</Text>
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

export default PrivacyPolicyScreen;
