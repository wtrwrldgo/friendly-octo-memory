import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { LANGUAGES } from '../constants/MockData';

type SelectLanguageScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SelectLanguage'>;
};

const SelectLanguageScreen: React.FC<SelectLanguageScreenProps> = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleContinue = () => {
    navigation.navigate('AskName');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>Choose your preferred language</Text>

        <FlatList
          data={LANGUAGES}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.languageItem,
                selectedLanguage === item.code && styles.languageItemSelected,
              ]}
              onPress={() => setSelectedLanguage(item.code)}
            >
              <View>
                <Text style={styles.languageName}>{item.name}</Text>
                <Text style={styles.languageNative}>{item.nativeName}</Text>
              </View>
              {selectedLanguage === item.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.code}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    marginBottom: Spacing.xl,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  languageItemSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primary + '10',
  },
  languageName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  languageNative: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  checkmark: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
  },
  footer: {
    padding: Spacing.lg,
  },
});

export default SelectLanguageScreen;
