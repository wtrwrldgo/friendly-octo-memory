import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriverStore } from '../stores/useDriverStore';
import { useToast } from '../context/ToastContext';
import { useLanguageStore } from '../stores/useLanguageStore';

type DocumentType = 'driver_id' | 'driver_license' | 'car_registration';

interface DocumentItem {
  id: DocumentType;
  label: string;
  icon: any;
  backgroundColor: string;
  status: 'uploaded' | 'not_uploaded';
}

export default function DriverDocumentsScreen({ navigation }: any) {
  const driver = useDriverStore((state) => state.driver);
  const { showSuccess } = useToast();
  const t = useLanguageStore((state) => state.t);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const documents: DocumentItem[] = [
    {
      id: 'driver_id',
      label: t('documents.driverId'),
      icon: require('../assets/ui-icons/user-3d.png'),
      backgroundColor: '#FBCFE8',
      status: driver?.driver_id_photo ? 'uploaded' : 'not_uploaded',
    },
    {
      id: 'driver_license',
      label: t('documents.driverLicense'),
      icon: require('../assets/ui-icons/terms-menu.png'),
      backgroundColor: '#DDD6FE',
      status: driver?.driver_license_photo ? 'uploaded' : 'not_uploaded',
    },
    {
      id: 'car_registration',
      label: t('documents.carRegistration'),
      icon: require('../assets/ui-icons/bonuses-menu.png'),
      backgroundColor: '#BBF7D0',
      status: driver?.vehicle_documents_photo ? 'uploaded' : 'not_uploaded',
    },
  ];

  const handleDocumentPress = () => {
    setShowUploadModal(true);
  };

  const handleTakePhoto = () => {
    setShowUploadModal(false);
    // TODO: Implement camera functionality using expo-camera
    // Will require: npm install expo-camera + permissions in app.json
    showSuccess(t('documents.cameraComingSoon'));
  };

  const handleChooseFromGallery = () => {
    setShowUploadModal(false);
    // TODO: Implement gallery picker using expo-image-picker
    // Will require: npm install expo-image-picker + permissions in app.json
    showSuccess(t('documents.galleryComingSoon'));
  };

  const getStatusColor = (status: string) => {
    return status === 'uploaded' ? '#10B981' : '#6B7280';
  };

  const getStatusBgColor = (status: string) => {
    return status === 'uploaded' ? '#D1FAE5' : '#F3F4F6';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('documents.title')}</Text>
          <View style={styles.backButton} />
        </View>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>
          {t('documents.subtitle')}
        </Text>

        {/* DOCUMENTS CARD */}
        <View style={styles.documentsCard}>
          {documents.map((doc, index) => (
            <React.Fragment key={doc.id}>
              <TouchableOpacity
                style={styles.documentRow}
                onPress={handleDocumentPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: doc.backgroundColor }]}>
                  <Image
                    source={doc.icon}
                    style={styles.documentIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.documentContent}>
                  <Text style={styles.documentLabel}>{doc.label}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: getStatusBgColor(doc.status) },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
                    {doc.status === 'uploaded' ? t('documents.uploaded') : t('documents.upload')}
                  </Text>
                </View>
              </TouchableOpacity>
              {index < documents.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* INFO TEXT */}
        <Text style={styles.infoText}>
          {t('documents.infoText')}
        </Text>
      </ScrollView>

      {/* UPLOAD MODAL */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUploadModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('documents.uploadTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('documents.uploadSubtitle')}</Text>

            {/* TAKE PHOTO BUTTON */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={[styles.modalIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.modalIcon}>📷</Text>
              </View>
              <View style={styles.modalButtonContent}>
                <Text style={styles.modalButtonLabel}>{t('documents.takePhoto')}</Text>
                <Text style={styles.modalButtonSubtitle}>{t('documents.useCamera')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* CHOOSE FROM GALLERY BUTTON */}
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonLast]}
              onPress={handleChooseFromGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.modalIconBox, { backgroundColor: '#E0E7FF' }]}>
                <Text style={styles.modalIcon}>🖼️</Text>
              </View>
              <View style={styles.modalButtonContent}>
                <Text style={styles.modalButtonLabel}>{t('documents.chooseGallery')}</Text>
                <Text style={styles.modalButtonSubtitle}>{t('documents.selectPhoto')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowUploadModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 36,
    fontWeight: '500',
    color: '#4D7EFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C1633',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  documentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 68,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  documentIcon: {
    width: 28,
    height: 28,
  },
  documentContent: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0C1633',
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 74,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0C1633',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
  },
  modalButtonLast: {
    marginBottom: 20,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalIcon: {
    fontSize: 24,
  },
  modalButtonContent: {
    flex: 1,
  },
  modalButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C1633',
    marginBottom: 2,
  },
  modalButtonSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  chevron: {
    fontSize: 24,
    color: '#CBD5E0',
    fontWeight: '300',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
});
