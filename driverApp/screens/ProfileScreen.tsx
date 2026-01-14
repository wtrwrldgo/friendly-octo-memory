import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../config/colors';
import { useDriverStore } from '../stores/useDriverStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useToast } from '../context/ToastContext';
import { useLanguageStore, Language } from '../stores/useLanguageStore';
import { LicensePlate } from '../components/LicensePlate';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import EditVehicleModal from './EditVehicleScreen';
import EditProfileModal from './EditProfileModal';

// Map firm names to their logo files (fallback for local assets)
const FIRM_LOGOS: { [key: string]: any } = {
  'aquawater': require('../assets/firms/aquawater-logo.png'),
  'crystal': require('../assets/firms/crystal-logo.png'),
  'oceanwater': require('../assets/firms/oceanwater-logo.png'),
  'zamzam': require('../assets/firms/zamzam-logo.png'),
};

export default function ProfileScreen({ navigation }: any) {
  const driver = useDriverStore((state) => state.driver);
  const isOnline = useDriverStore((state) => state.isOnline);
  const toggleOnlineStatus = useDriverStore((state) => state.toggleOnlineStatus);
  const logout = useDriverStore((state) => state.logout);
  const refreshDriver = useDriverStore((state) => state.refreshDriver);
  const setSession = useAuthStore((state) => state.setSession);
  const isLocationTracking = useDriverStore((state) => state.isLocationTracking);
  const { showError, showSuccess } = useToast();

  // Refresh driver data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshDriver();
    }, [refreshDriver])
  );
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Get firm logo - prioritize backend URL, fall back to local assets
  const getFirmLogo = (): { uri: string } | any | null => {
    if (!driver?.firm_name) return null;

    // If backend provides a logo URL, use it
    if (driver.firm_logo_url) {
      return { uri: driver.firm_logo_url };
    }

    // Fall back to local assets (case-insensitive lookup)
    const firmNameLower = driver.firm_name.toLowerCase();
    return FIRM_LOGOS[firmNameLower] || null;
  };

  // Language helper
  const getLanguageInfo = (lang: Language) => {
    const info = {
      en: { name: 'English', flagImage: require('../assets/flag-usa.png') },
      ru: { name: 'Русский', flagImage: require('../assets/flag-russia.png') },
      uz: { name: 'O\'zbekcha', flagImage: require('../assets/flag-uzbekistan.png') },
      kk: { name: 'Қарақалпақша', flagImage: require('../assets/flag-karakalpakstan.png') },
    };
    return info[lang];
  };

  const handleLanguageChange = async (lang: Language) => {
    try {
      await setLanguage(lang);
      setShowLanguageModal(false);
      showSuccess(`Language changed to ${getLanguageInfo(lang).name}`);
    } catch (error: any) {
      showError('Failed to change language');
    }
  };

  const handleToggleOnline = async () => {
    if (!driver) return;
    setUpdatingStatus(true);
    try {
      const nextStatus = !isOnline;
      await toggleOnlineStatus();
      showSuccess(nextStatus ? t('profile.nowOnline') : t('profile.nowOffline'));
    } catch (error: any) {
      showError(error?.message || t('profile.errors.statusUpdateFailed'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutModal(false);

      if (logout) {
        await logout();
      } else {
        setSession(null);
      }
      showSuccess(t('profile.loggedOut'));

      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: any) {
      showError(error?.message || t('profile.errors.logoutFailed'));
    }
  };

  if (!driver) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  const driverInitial = (driver.name || 'D').charAt(0).toUpperCase();
  const firmLogo = getFirmLogo();

  // Debug logging
  if (__DEV__) {
    console.log('[ProfileScreen] Driver firm_name:', driver.firm_name);
    console.log('[ProfileScreen] Firm logo available:', !!firmLogo);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FIRM IDENTITY CARD */}
        {driver.firm_name && (
          <View style={styles.firmIdentityCard}>
            {firmLogo ? (
              <Image
                source={firmLogo}
                style={styles.firmIdentityLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.firmIdentityPlaceholder}>
                <Text style={styles.firmIdentityPlaceholderText}>
                  {driver.firm_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.firmIdentityInfo}>
              <Text style={styles.firmIdentityName}>{driver.firm_name}</Text>
              <Text style={styles.firmIdentitySubtitle}>{t('profile.deliveryPartner')}</Text>
            </View>
          </View>
        )}

        {/* TOP CARD: DRIVER + VEHICLE + STATUS */}
        <View style={styles.sectionTop}>
          {/* DRIVER NUMBER BADGE & RATING */}
          <View style={styles.topBadgesRow}>
            <View style={styles.driverNumberBadge}>
              <Image
                source={require('../assets/delivery-van-new.png')}
                style={styles.minivanIcon}
                resizeMode="contain"
              />
              <Text style={styles.driverNumberText}>№{driver.driver_number}</Text>
            </View>

            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStarBadge}>⭐</Text>
              <Text style={styles.ratingTextBadge}>{(driver.rating ?? 5.0).toFixed(1)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.driverCard}
            onPress={() => setShowEditProfileModal(true)}
            activeOpacity={0.7}
          >
            {/* LEFT: AVATAR */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{driverInitial}</Text>
              </View>
            </View>

            {/* MIDDLE: NAME + PHONE + FIRM */}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.name || t('profile.driver')}</Text>
              <Text style={styles.driverPhone}>
                {driver.phone || t('profile.phoneNotSet')}
              </Text>
              {driver.firm_name && (
                <View style={styles.firmContainer}>
                  {firmLogo ? (
                    <Image
                      source={firmLogo}
                      style={styles.firmIconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.firmIconPlaceholder}>
                      <Text style={styles.firmIconPlaceholderText}>
                        {driver.firm_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.driverFirm}>{driver.firm_name}</Text>
                </View>
              )}
            </View>

            {/* RIGHT: VEHICLE MINI INFO */}
            <View style={styles.driverVehicleMini}>
              <Text style={styles.vehicleMiniLabel}>{t('profile.vehicle')}</Text>
              <Text style={styles.vehicleMiniModel}>
                {driver.vehicle_model || t('profile.notSet')}
              </Text>
              {driver.vehicle_number ? (
                <View style={styles.plateMiniWrapper}>
                  <LicensePlate plateNumber={driver.vehicle_number} size="small" />
                </View>
              ) : (
                <Text style={styles.vehicleMiniPlate}>{t('profile.plateNotSet')}</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* ONLINE/OFFLINE STATUS TOGGLE */}
          <TouchableOpacity
            onPress={handleToggleOnline}
            disabled={updatingStatus}
            activeOpacity={0.8}
            style={styles.statusCard}
          >
            <View style={styles.statusContent}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusIndicator,
                    isOnline && styles.statusIndicatorOnline,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isOnline && styles.statusDotOnline,
                    ]}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusTitle,
                      isOnline && styles.statusTitleOnline,
                    ]}
                  >
                    {isOnline ? t('profile.online') : t('profile.offline')}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {isOnline ? t('profile.readyForOrders') : t('profile.notReceivingOrders')}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggleSwitch,
                  isOnline && styles.toggleSwitchActive,
                  updatingStatus && styles.toggleSwitchDisabled,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    isOnline && styles.toggleKnobActive,
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* LOCATION TRACKING STATUS */}
          <View style={styles.locationCard}>
            <View style={styles.locationContent}>
              <View style={styles.locationLeft}>
                <View style={[
                  styles.locationIconContainer,
                  isLocationTracking && styles.locationIconContainerActive
                ]}>
                  <Image
                    source={require('../assets/ui-icons/address-icon.png')}
                    style={styles.locationIcon3D}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTitle}>{t('profile.locationTracking')}</Text>
                  <Text style={[
                    styles.locationStatus,
                    isLocationTracking && styles.locationStatusActive
                  ]}>
                    {isLocationTracking ? t('profile.trackingActive') : t('profile.trackingInactive')}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.locationBadge,
                isLocationTracking && styles.locationBadgeActive
              ]}>
                <View style={[
                  styles.locationBadgeDot,
                  isLocationTracking && styles.locationBadgeDotActive
                ]} />
              </View>
            </View>
          </View>
        </View>

        {/* VEHICLE INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.vehicleInformation')}</Text>
          <TouchableOpacity
            style={styles.vehicleCard}
            onPress={() => setShowEditVehicleModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.vehicleHeader}>
              <Image
                source={require('../assets/delivery-van-new.png')}
                style={styles.vehicleIcon3D}
                resizeMode="contain"
              />
              <View style={styles.vehicleHeaderText}>
                <Text style={styles.vehicleLabel}>{t('profile.yourVehicle')}</Text>
                <Text style={styles.vehicleModel}>
                  {driver.vehicle_brand || t('profile.notSet')}
                </Text>
              </View>
            </View>

            <View style={styles.vehicleDivider} />

            {/* Car Color */}
            <View style={styles.vehicleInfoRow}>
              <Text style={styles.vehicleInfoLabel}>{t('profile.carColor')}</Text>
              <Text style={styles.vehicleInfoValue}>
                {driver.vehicle_color || t('profile.notSet')}
              </Text>
            </View>

            <View style={styles.vehicleDivider} />

            <View style={styles.vehiclePlateSection}>
              <Text style={styles.plateLabel}>{t('profile.licensePlate')}</Text>
              {driver.vehicle_number ? (
                <LicensePlate plateNumber={driver.vehicle_number} size="small" />
              ) : (
                <Text style={styles.plateEmpty}>{t('profile.notSet')}</Text>
              )}
            </View>

            <View style={styles.vehicleEditHint}>
              <Text style={styles.editHintText}>{t('profile.tapToEditVehicle')}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Statistics')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <Image
                  source={require('../assets/ui-icons/statistics-menu.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('profile.statistics')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.borderTop]}
              onPress={() => setShowSupportModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                <Image
                  source={require('../assets/ui-icons/support-menu.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('profile.helpAndSupport')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.borderTop]}
              onPress={() => navigation.navigate('Terms')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                <Image
                  source={require('../assets/ui-icons/terms-menu.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('profile.termsAndConditions')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.borderTop]}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <Image
                  source={require('../assets/ui-icons/privacy-menu.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('profile.privacyPolicy')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.borderTop]}
              onPress={() => setShowLanguageModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <Image
                  source={getLanguageInfo(language).flagImage}
                  style={styles.languageFlagIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{t('profile.language')}</Text>
                <Text style={styles.menuSubtext}>{getLanguageInfo(language).name}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>{t('profile.version')}</Text>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />

      {/* EDIT VEHICLE MODAL */}
      <EditVehicleModal
        visible={showEditVehicleModal}
        onClose={() => setShowEditVehicleModal(false)}
      />

      {/* LANGUAGE SELECTION MODAL */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {(['en', 'ru', 'uz', 'kk'] as Language[]).map((lang) => {
                const info = getLanguageInfo(lang);
                const isSelected = language === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageOption,
                      isSelected && styles.languageOptionSelected,
                    ]}
                    onPress={() => handleLanguageChange(lang)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={info.flagImage}
                      style={styles.languageFlagImage}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.languageName,
                        isSelected && styles.languageNameSelected,
                      ]}
                    >
                      {info.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalContent}>
            <View style={styles.logoutIconContainer}>
              <Text style={styles.logoutIcon}>⚠️</Text>
            </View>

            <Text style={styles.logoutModalTitle}>{t('profile.logout')}</Text>
            <Text style={styles.logoutModalMessage}>{t('profile.logoutConfirm')}</Text>

            <View style={styles.logoutButtonRow}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutCancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutConfirmButtonText}>{t('profile.logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HELP & SUPPORT MODAL */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.supportModalOverlay}>
          <View style={styles.supportModalContent}>
            <View style={styles.supportIconContainer}>
              <Text style={styles.supportIcon}>💬</Text>
            </View>

            <Text style={styles.supportModalTitle}>{t('profile.support')}</Text>
            <Text style={styles.supportModalMessage}>{t('profile.supportMessage')}</Text>

            <TouchableOpacity
              style={styles.supportOkButton}
              onPress={() => setShowSupportModal(false)}
            >
              <Text style={styles.supportOkButtonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    paddingVertical: Spacing.lg,
    paddingBottom: 40,
  },

  // FIRM IDENTITY CARD
  firmIdentityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5EDFF',
  },
  firmIdentityLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 14,
  },
  firmIdentityPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#4D7EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firmIdentityPlaceholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  firmIdentityInfo: {
    flex: 1,
  },
  firmIdentityName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C1633',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  firmIdentitySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  // TOP SECTION
  sectionTop: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: '#4D7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  ratingStarBadge: {
    fontSize: 18,
    marginRight: 6,
  },
  ratingTextBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C1633',
    letterSpacing: 0.5,
  },
  minivanIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  driverNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C1633',
    letterSpacing: 0.5,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D7EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  driverPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  firmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  firmIconImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  firmIconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
    backgroundColor: '#4D7EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firmIconPlaceholderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  driverFirm: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  driverVehicleMini: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  vehicleMiniLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  vehicleMiniModel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 6,
  },
  plateMiniWrapper: {
    alignItems: 'flex-end',
  },
  vehicleMiniPlate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },

  // STATUS TOGGLE
  statusCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statusIndicatorOnline: {
    backgroundColor: '#D1FAE5',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9CA3AF',
  },
  statusDotOnline: {
    backgroundColor: '#10B981',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  statusTitleOnline: {
    color: '#059669',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    padding: 3,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleSwitchDisabled: {
    opacity: 0.6,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  // LOCATION TRACKING CARD
  locationCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  locationIconContainerActive: {
    backgroundColor: '#DBEAFE',
  },
  locationIcon3D: {
    width: 32,
    height: 32,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0C1633',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  locationStatus: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  locationStatusActive: {
    color: '#3B82F6',
  },
  locationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  locationBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9CA3AF',
  },
  locationBadgeDotActive: {
    backgroundColor: '#3B82F6',
  },

  // GENERIC SECTION
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 6,
  },

  // CARD
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },

  // MENU ITEMS
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 72,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  languageFlagIcon: {
    width: 32,
    height: 32,
  },
  menuSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },

  // VEHICLE INFO
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  vehicleIcon3D: {
    width: 56,
    height: 56,
    marginRight: 16,
  },
  vehicleHeaderText: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.3,
  },
  vehicleDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
  },
  vehiclePlateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 16,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  vehicleInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  vehicleInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C1633',
  },
  plateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  plateEmpty: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  vehicleEditHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editHintText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statsItem: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0C1633',
    letterSpacing: -0.5,
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  // FOOTER
  version: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  // LANGUAGE MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  languageModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  languageList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  languageOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4D7EFF',
  },
  languageFlagImage: {
    width: 48,
    height: 48,
    marginRight: 16,
    borderRadius: 8,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0C1633',
    flex: 1,
  },
  languageNameSelected: {
    color: '#4D7EFF',
    fontWeight: '700',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4D7EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // LOGOUT MODAL
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutIcon: {
    fontSize: 32,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  logoutButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // SUPPORT MODAL
  supportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  supportModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  supportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportIcon: {
    fontSize: 32,
  },
  supportModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportModalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  supportOkButton: {
    width: '100%',
    backgroundColor: '#4D7EFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportOkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // LOCATION INFO CARD (DEV ONLY)
  locationInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  locationValueActive: {
    color: '#10B981',
  },
  locationCoords: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationAccuracy: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});
