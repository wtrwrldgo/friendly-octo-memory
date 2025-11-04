import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { LANGUAGES } from '../constants/MockData';
import { PrimaryButton } from '../components/PrimaryButton';

const ProfileScreen: React.FC = () => {
  const { user, selectedAddress, updateUser } = useUser();
  const { clearCart } = useCart();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === (user?.language || 'en'));

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            clearCart();
            // In a real app, navigate to auth flow
            Alert.alert('Success', 'Logged out successfully');
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.userPhone}>{user?.phone || 'No phone'}</Text>
        </View>

        {/* Current Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>
              {selectedAddress?.title || 'No address'}
            </Text>
            <Text style={styles.addressText}>
              {selectedAddress?.address || 'Please select an address'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <MenuItem
            icon="📦"
            title="Order History"
            onPress={() => Alert.alert('Coming Soon', 'Order history feature')}
          />
          <MenuItem
            icon="📍"
            title="Manage Addresses"
            onPress={() => Alert.alert('Coming Soon', 'Manage addresses feature')}
          />
          <MenuItem
            icon="💳"
            title="Payment Methods"
            onPress={() => Alert.alert('Coming Soon', 'Payment methods feature')}
          />
          <MenuItem
            icon="🌐"
            title={`Language - ${currentLanguage?.nativeName || 'English'}`}
            onPress={() => setShowLanguageModal(true)}
          />
          <MenuItem
            icon="📜"
            title="Terms of Service"
            onPress={() => (navigation as any).navigate('TermsOfService')}
          />
          <MenuItem
            icon="🔒"
            title="Privacy Policy"
            onPress={() => (navigation as any).navigate('PrivacyPolicy')}
          />
          <MenuItem
            icon="ℹ️"
            title="Help & Support"
            onPress={() => Alert.alert('Help', 'Contact support: support@watergo.com')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>

            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  user?.language === language.code && styles.languageOptionSelected,
                ]}
                onPress={() => {
                  updateUser({ language: language.code });
                  setShowLanguageModal(false);
                  Alert.alert('Success', `Language changed to ${language.nativeName}`);
                }}
              >
                <View>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.nativeName}</Text>
                </View>
                {user?.language === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <PrimaryButton
              title="Cancel"
              onPress={() => setShowLanguageModal(false)}
              variant="outline"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  languageOptionSelected: {
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
});

export default ProfileScreen;
