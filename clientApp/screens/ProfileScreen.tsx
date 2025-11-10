import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../constants/MockData';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, selectedAddress, updateUser, setUser, setAddresses, setSelectedAddress } = useUser();
  const { clearCart } = useCart();
  const { t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === (user?.language || 'en'));

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: () => {
            // Clear all user data
            clearCart();
            setUser(null);
            setAddresses([]);
            setSelectedAddress(null);

            // App.tsx will automatically navigate to auth flow when user is null
            // No need to manually reset navigation
          },
        },
      ]
    );
  };

  const MenuItem: React.FC<{ icon: string; title: string; onPress: () => void }> = ({
    icon,
    title,
    onPress,
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || t('profile.guest')}</Text>
          <Text style={styles.userPhone}>{user?.phone || t('profile.noPhone')}</Text>
        </View>

        {/* Current Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.currentAddress')}</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>
              {selectedAddress?.title || t('profile.noAddress')}
            </Text>
            <Text style={styles.addressText}>
              {selectedAddress?.address || t('profile.selectAddress')}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <MenuItem
            icon="📦"
            title={t('profile.orderHistory')}
            onPress={() => navigation.navigate('OrdersTab')}
          />
          <MenuItem
            icon="📍"
            title={t('profile.manageAddresses')}
            onPress={() => navigation.navigate('SelectAddress')}
          />
          <MenuItem
            icon="💳"
            title={t('profile.paymentMethods')}
            onPress={() => navigation.navigate('PaymentMethod')}
          />
          <MenuItem
            icon="🌐"
            title={`${t('profile.language')} - ${currentLanguage?.nativeName || 'English'}`}
            onPress={() => setShowLanguageModal(true)}
          />
          <MenuItem
            icon="📜"
            title={t('profile.termsOfService')}
            onPress={() => navigation.navigate('TermsOfService')}
          />
          <MenuItem
            icon="🔒"
            title={t('profile.privacyPolicy')}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <MenuItem
            icon="ℹ️"
            title={t('profile.helpSupport')}
            onPress={() => Alert.alert(t('profile.help'), t('profile.contactSupport'))}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('profile.version')} 1.0.0</Text>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('languageModal.title')}</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={styles.languageList}>
              {LANGUAGES.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    user?.language === language.code && styles.languageOptionSelected,
                    index !== LANGUAGES.length - 1 && styles.languageOptionBorder,
                  ]}
                  onPress={() => {
                    updateUser({ language: language.code });
                    setShowLanguageModal(false);
                    Alert.alert(t('common.success'), `${t('languageModal.changed')} ${language.nativeName}`);
                  }}
                  activeOpacity={0.7}
                >
                  {/* Language Flag */}
                  <View style={styles.languageIconContainer}>
                    <Text style={styles.languageIcon}>{language.flag}</Text>
                  </View>

                  {/* Language Text */}
                  <View style={styles.languageTextContainer}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNative}>{language.nativeName}</Text>
                  </View>

                  {/* Checkmark */}
                  {user?.language === language.code && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  content: {
    padding: Spacing.md,
  },
  userCard: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userPhone: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.grayText,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  addressCard: {
    padding: Spacing.md,
    backgroundColor: Colors.gray,
    margin: Spacing.md,
    marginTop: 0,
    borderRadius: BorderRadius.sm,
  },
  addressTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  addressText: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  menuArrow: {
    fontSize: 24,
    color: Colors.grayText,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoutText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.error,
  },
  version: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.grayText,
    fontWeight: '600',
  },
  languageList: {
    paddingHorizontal: Spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  languageOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  languageOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  languageIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageIcon: {
    fontSize: 32,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 15,
    color: Colors.grayText,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '700',
  },
});

export default ProfileScreen;
