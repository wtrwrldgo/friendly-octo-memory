import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageStore } from '../stores/useLanguageStore';

interface TermsScreenProps {
  navigation: any;
}

export default function TermsScreen({ navigation }: TermsScreenProps) {
  const t = useLanguageStore((state) => state.t);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('terms.title')}</Text>
        <View style={styles.backButton} />
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>{t('terms.lastUpdated')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section1Title')}</Text>
        <Text style={styles.paragraph}>{t('terms.section1Content')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section2Title')}</Text>
        <Text style={styles.paragraph}>{t('terms.section2Content')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section3Title')}</Text>
        <Text style={styles.paragraph}>{t('terms.section3Content')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section4Title')}</Text>
        <Text style={styles.paragraph}>{t('terms.section4Content')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section5Title')}</Text>
        <Text style={styles.paragraph}>{t('terms.section5Content')}</Text>

        <Text style={styles.footer}>{t('terms.footer')}</Text>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#4D7EFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 12,
    marginTop: 24,
  },
  paragraph: {
    fontSize: 15,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 32,
    textAlign: 'center',
  },
});
