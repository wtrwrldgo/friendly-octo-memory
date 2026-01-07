import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateUserProfile } from '../services/api';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../constants/MockData';
import { useStageSounds } from '../hooks/useStageSounds';

// WaterGo Brand Colors
const Colors = {
  primary: '#5167FF',
  text: '#0C1633',
  secondary: '#6B7280',
  background: '#F6F8FF',
  white: '#FFFFFF',
  divider: '#E5E7EB',
  danger: '#EF4444',
};

const CARD_RADIUS = 16;

// Menu icons
const menuIcons = {
  orders: require('../assets/ui-icons/orders-menu.png'),
  address: require('../assets/ui-icons/address-icon.png'),
  payment: require('../assets/ui-icons/credit-card.png'),
  notification: require('../assets/ui-icons/notification-bell.png'),
  language: require('../assets/ui-icons/language-globe.png'),
  privacy: require('../assets/ui-icons/privacy-menu.png'),
  support: require('../assets/ui-icons/support-menu.png'),
  about: require('../assets/ui-icons/info-icon.png'),
};


// Menu Row Component with icons
const MenuRow = React.memo(function MenuRow({
  title,
  icon,
  rightText,
  rightComponent,
  onPress,
  showArrow = true,
  isLast = false,
}: {
  title: string;
  icon?: any;
  rightText?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  isLast?: boolean;
}) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.menuRow}
        disabled={!onPress}
      >
        {icon && <Image source={icon} style={styles.menuIcon} resizeMode="contain" />}
        <Text style={styles.menuTitle}>{title}</Text>
        {rightText && <Text style={styles.menuRightText}>{rightText}</Text>}
        {rightComponent}
        {showArrow && !rightComponent && (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
});

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, updateUser, setUser, setAddresses, setSelectedAddress, selectedAddress, addresses } = useUser();
  const { clearCart } = useCart();
  const { t } = useLanguage();
  const { toggleSound, isSoundEnabled } = useStageSounds();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 24) : 34;

  useEffect(() => {
    const loadSoundPref = async () => {
      const enabled = await isSoundEnabled();
      setNotificationsEnabled(enabled);
    };
    loadSoundPref();
  }, [isSoundEnabled]);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await toggleSound(value);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === (user?.language || 'en'));

  const avatarLetter = useMemo(() => {
    const name = user?.name || 'W';
    return name.charAt(0).toUpperCase();
  }, [user?.name]);

  const getLanguageFlag = (langCode?: string) => {
    switch (langCode) {
      case 'en': return require('../assets/flag-usa.png');
      case 'ru': return require('../assets/flag-russia.png');
      case 'uz': return require('../assets/flag-uzbekistan.png');
      case 'kaa': return require('../assets/flag-karakalpakstan.png');
      default: return require('../assets/flag-usa.png');
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      t('profile.deleteAddress') || 'Delete Address',
      t('profile.deleteAddressConfirm') || 'Are you sure you want to delete this address?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.delete') || 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            setAddresses(updatedAddresses);
            if (selectedAddress?.id === addressId) {
              setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
            }
          },
        },
      ]
    );
  };

  const handleEditName = () => {
    setEditName(user?.name || '');
    setShowEditNameModal(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert(t('common.error') || 'Error', t('profile.nameRequired') || 'Name is required');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile({ name: editName.trim() });
      updateUser({ name: editName.trim() });
      setShowEditNameModal(false);
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', t('profile.updateFailed') || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout') || 'Log Out',
      t('profile.logoutConfirm') || 'Are you sure you want to log out?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('profile.logout') || 'Log Out',
          style: 'destructive',
          onPress: () => {
            clearCart();
            setUser(null);
            setAddresses([]);
            setSelectedAddress(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || t('profile.guest')}
            </Text>
            <Text style={styles.userPhone} numberOfLines={1}>
              {user?.phone || '+998 XX XXX XX XX'}
            </Text>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditName}>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={14} color="#059669" />
              <Text style={styles.verifiedText}>{t('profile.verified') || 'Verified'}</Text>
            </View>
          </View>
        </View>

        {/* Saved Addresses Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressSectionHeader}>
            <Text style={styles.addressSectionTitle}>
              {t('profile.savedAddresses') || 'Saved Addresses'}
            </Text>
            <Text style={styles.addressCount}>
              {addresses.length > 0 ? `${addresses.length}` : ''}
            </Text>
          </View>

          {/* Address List */}
          {addresses.length > 0 ? (
            addresses.map((address) => {
              const isSelected = selectedAddress?.id === address.id;
              // Use user-inputted name if available, otherwise fall back to address type
              const displayTitle = address.name ? address.name :
                                   address.addressType === 'house' ? (t('auth.privateHouse') || 'Home') :
                                   address.addressType === 'apartment' ? (t('auth.apartment') || 'Apartment') :
                                   address.addressType === 'office' ? (t('auth.office') || 'Office') :
                                   address.addressType === 'government' ? (t('auth.government') || 'Government') :
                                   address.title || 'My Address';

              return (
                <View key={address.id} style={[styles.addressCard, isSelected && styles.addressCardSelected]}>
                  <TouchableOpacity
                    style={styles.addressCardTouchable}
                    onPress={() => setSelectedAddress(address)}
                    activeOpacity={0.7}
                  >
                    {/* Address Content */}
                    <View style={styles.addressContent}>
                      <Text style={[styles.addressTitle, isSelected && styles.addressTitleSelected]} numberOfLines={1}>
                        {displayTitle}
                      </Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {address.address}
                      </Text>
                    </View>

                    {/* Selected indicator - green checkmark */}
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>

                  {/* Delete action */}
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleDeleteAddress(address.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteIconText}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.noAddressCard}>
              <Text style={styles.noAddressEmoji}>📍</Text>
              <Text style={styles.noAddressText}>
                {t('profile.noAddresses') || 'No saved addresses'}
              </Text>
              <Text style={styles.noAddressHint}>
                {t('profile.addAddressHint') || 'Add your first delivery address'}
              </Text>
            </View>
          )}

          {/* Add New Address Button */}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => navigation.navigate('SelectAddress')}
            activeOpacity={0.7}
          >
            <Text style={styles.addAddressText}>+ {t('address.addNewAddress') || 'Add New Address'}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Menu Card */}
        <View style={styles.menuCard}>
          <MenuRow
            title={t('profile.myOrders') || 'My Orders'}
            icon={menuIcons.orders}
            onPress={() => navigation.navigate('OrdersTab')}
          />
          <MenuRow
            title={t('profile.myAddresses') || 'My Addresses'}
            icon={menuIcons.address}
            onPress={() => navigation.navigate('SelectAddress')}
          />
          <MenuRow
            title={t('profile.paymentMethods') || 'Payment Methods'}
            icon={menuIcons.payment}
            rightText={user?.defaultPaymentMethod === 'cash' ? (t('payment.cash') || 'Cash') : user?.defaultPaymentMethod === 'card' ? (t('payment.card') || 'Card') : undefined}
            onPress={() => navigation.navigate('PaymentMethod', { fromProfile: true })}
          />
          <MenuRow
            title={t('profile.notifications') || 'Notifications'}
            icon={menuIcons.notification}
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: Colors.divider, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.divider}
                style={styles.switch}
              />
            }
          />
          <MenuRow
            title={t('profile.language') || 'Language'}
            icon={menuIcons.language}
            rightText={currentLanguage?.nativeName || 'English'}
            onPress={() => setShowLanguageModal(true)}
            isLast
          />
        </View>

        {/* Settings Card */}
        <View style={styles.menuCard}>
          <MenuRow
            title={t('profile.privacySecurity') || 'Privacy & Security'}
            icon={menuIcons.privacy}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <MenuRow
            title={t('profile.support') || 'Support'}
            icon={menuIcons.support}
            onPress={() => Alert.alert(t('profile.support') || 'Support', t('profile.contactSupport') || 'Contact us at support@watergo.uz')}
          />
          <MenuRow
            title={t('profile.aboutWaterGo') || 'About WaterGo'}
            icon={menuIcons.about}
            onPress={() => navigation.navigate('TermsOfService')}
            isLast
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>{t('profile.logout') || 'Log Out'}</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>{t('profile.version') || 'Version'} 1.0.0</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('languageModal.title') || 'Select Language'}</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {LANGUAGES.map((language) => {
                const flagImage = getLanguageFlag(language.code);
                const isSelected = user?.language === language.code;

                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      isSelected && styles.languageOptionSelected,
                    ]}
                    onPress={() => {
                      updateUser({ language: language.code });
                      setShowLanguageModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={flagImage} style={styles.langFlag} resizeMode="contain" />
                    <View style={styles.langTextContainer}>
                      <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                        {language.name}
                      </Text>
                      <Text style={styles.langNative}>{language.nativeName}</Text>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowEditNameModal(false)}
          >
            <View style={styles.editNameModalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('profile.editName') || 'Edit Name'}</Text>
                <TouchableOpacity
                  onPress={() => setShowEditNameModal(false)}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeIcon}>×</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('profile.enterName') || 'Enter your name'}
                placeholderTextColor="#9CA3AF"
                autoFocus
                maxLength={50}
              />

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveName}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save') || 'Save'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },

  // Profile Header Card
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: CARD_RADIUS,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 14,
  },
  userName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  userPhone: {
    color: Colors.secondary,
    fontSize: 15,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  verifiedCheck: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  nameInput: {
    backgroundColor: '#F6F8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Address Section
  addressSection: {
    marginTop: 16,
  },
  addressSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginLeft: 4,
    marginRight: 4,
  },
  addressSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  addressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 8,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 14,
  },
  addressCardSelected: {
    backgroundColor: '#F0F7FF',
  },
  addressCardTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContent: {
    flex: 1,
    paddingRight: 12,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
  },
  addressTitleSelected: {
    color: Colors.primary,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkCircleSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E',
  },
  checkMark: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  deleteIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: -1,
  },
  noAddressCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 10,
  },
  noAddressEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAddressText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  noAddressHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  addAddressButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },

  // Menu Card
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: CARD_RADIUS,
    marginTop: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 60,
  },
  menuIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  menuRightText: {
    color: Colors.secondary,
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    color: '#C4C4C4',
    fontSize: 24,
    fontWeight: '300',
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },

  // Logout Button
  logoutButton: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: CARD_RADIUS,
    backgroundColor: Colors.white,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '500',
  },

  // Version
  versionText: {
    marginTop: 24,
    textAlign: 'center',
    color: Colors.secondary,
    fontSize: 13,
  },

  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  closeIcon: {
    fontSize: 28,
    color: Colors.secondary,
    fontWeight: '300',
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  languageOptionSelected: {
    backgroundColor: '#F6F8FF',
  },
  langFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 14,
  },
  langTextContainer: {
    flex: 1,
  },
  langName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  langNameSelected: {
    color: Colors.primary,
  },
  langNative: {
    fontSize: 14,
    color: Colors.secondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});

export default ProfileScreen;
