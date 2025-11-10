import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title={t('profile.privacyPolicy')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{t('privacy.title')}</Text>
        <Text style={styles.updated}>{t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section1Title')}</Text>
        <Text style={styles.text}>
          {t('privacy.section1Text')}
        </Text>
        <Text style={styles.bullet}>{t('privacy.section1Bullet1')}</Text>
        <Text style={styles.bullet}>{t('privacy.section1Bullet2')}</Text>
        <Text style={styles.bullet}>{t('privacy.section1Bullet3')}</Text>
        <Text style={styles.bullet}>{t('privacy.section1Bullet4')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section2Title')}</Text>
        <Text style={styles.text}>
          {t('privacy.section2Text')}
        </Text>
        <Text style={styles.bullet}>{t('privacy.section2Bullet1')}</Text>
        <Text style={styles.bullet}>{t('privacy.section2Bullet2')}</Text>
        <Text style={styles.bullet}>{t('privacy.section2Bullet3')}</Text>
        <Text style={styles.bullet}>{t('privacy.section2Bullet4')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section3Title')}</Text>
        <Text style={styles.text}>
          {t('privacy.section3Text')}
        </Text>
        <Text style={styles.bullet}>{t('privacy.section3Bullet1')}</Text>
        <Text style={styles.bullet}>{t('privacy.section3Bullet2')}</Text>
        <Text style={styles.bullet}>{t('privacy.section3Bullet3')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section4Title')}</Text>
        <Text style={styles.text}>
          {t('privacy.section4Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('privacy.section5Title')}</Text>
        <Text style={styles.text}>
          {t('privacy.section5Text')}
        </Text>
        <Text style={styles.bullet}>{t('privacy.section5Bullet1')}</Text>
        <Text style={styles.bullet}>{t('privacy.section5Bullet2')}</Text>
        <Text style={styles.bullet}>{t('privacy.section5Bullet3')}</Text>
        <Text style={styles.bullet}>{t('privacy.section5Bullet4')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section6Title')}</Text>
        <Text style={styles.text}>
          {t('privacy.section6Text')}
        </Text>
        <Text style={styles.contact}>{t('privacy.contactEmail')}</Text>
        <Text style={styles.contact}>{t('privacy.contactPhone')}</Text>
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
