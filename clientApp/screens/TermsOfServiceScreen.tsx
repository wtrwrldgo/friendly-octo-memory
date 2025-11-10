import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { HeaderBar } from '../components/HeaderBar';
import { useLanguage } from '../context/LanguageContext';

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderBar title={t('profile.termsOfService')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{t('terms.title')}</Text>
        <Text style={styles.updated}>{t('terms.lastUpdated')}: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section1Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section1Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section2Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section2Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section3Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section3Text')}
        </Text>
        <Text style={styles.bullet}>{t('terms.section3Bullet1')}</Text>
        <Text style={styles.bullet}>{t('terms.section3Bullet2')}</Text>
        <Text style={styles.bullet}>{t('terms.section3Bullet3')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section4Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section4Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section5Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section5Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section6Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section6Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section7Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section7Text')}
        </Text>
        <Text style={styles.bullet}>{t('terms.section7Bullet1')}</Text>
        <Text style={styles.bullet}>{t('terms.section7Bullet2')}</Text>
        <Text style={styles.bullet}>{t('terms.section7Bullet3')}</Text>
        <Text style={styles.bullet}>{t('terms.section7Bullet4')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section8Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section8Text')}
        </Text>
        <Text style={styles.bullet}>{t('terms.section8Bullet1')}</Text>
        <Text style={styles.bullet}>{t('terms.section8Bullet2')}</Text>
        <Text style={styles.bullet}>{t('terms.section8Bullet3')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section9Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section9Text')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section10Title')}</Text>
        <Text style={styles.text}>
          {t('terms.section10Text')}
        </Text>
        <Text style={styles.contact}>{t('terms.contactEmail')}</Text>
        <Text style={styles.contact}>{t('terms.contactPhone')}</Text>
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
