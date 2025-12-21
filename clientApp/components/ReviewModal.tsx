import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Colors, BorderRadius } from '../constants/Colors';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  driverName?: string;
  companyName: string;
  companyLogo: string | number; // Logo URL or require() image
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  driverName,
  companyName,
  companyLogo,
}) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert(t('review.selectRating'));
      return;
    }
    onSubmit(rating, comment);
    // Reset state
    setRating(0);
    setComment('');
  };

  const handleSkip = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const getRatingText = () => {
    if (rating === 0) return '';
    if (rating <= 2) return 'Poor';
    if (rating === 3) return 'Average';
    if (rating === 4) return 'Good';
    return 'Excellent!';
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <View style={[
              styles.starCircle,
              rating >= star && styles.starCircleActive
            ]}>
              <Text style={[
                styles.starIcon,
                rating >= star && styles.starIconActive
              ]}>
                ★
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleSkip}
        />
        <View style={styles.modalContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Close Button */}
            <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Driver Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={require('../assets/driver-avatar.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Rate Your Experience</Text>
            <Text style={styles.subtitle}>
              How was your delivery with {driverName || 'your driver'}?
            </Text>

            {/* Star Rating */}
            {renderStars()}

            {/* Rating Text */}
            {rating > 0 && (
              <Text style={styles.ratingText}>{getRatingText()}</Text>
            )}

            {/* Company Info */}
            <View style={styles.companyCard}>
              <View style={styles.companyInfo}>
                <Text style={styles.companyLabel}>Company</Text>
                <View style={styles.companyRow}>
                  <View style={styles.companyLogoWrapper}>
                    <Image
                      source={typeof companyLogo === 'string'
                        ? { uri: companyLogo }
                        : companyLogo
                      }
                      style={styles.companyLogo}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.companyName}>{companyName}</Text>
                </View>
              </View>
            </View>

            {/* Comment Input */}
            <Text style={styles.commentLabel}>
              Tell us more (Optional)
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with others..."
              placeholderTextColor="#9BA0B8"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  rating === 0 && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={rating === 0}
              >
                <Text style={styles.submitButtonText}>
                  Submit Review
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 20,
    color: '#8A8FA6',
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#E5EDFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8FA6',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  starCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E9F2',
  },
  starCircleActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  starIcon: {
    fontSize: 28,
    color: '#D6DEFF',
  },
  starIconActive: {
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2EC973',
    textAlign: 'center',
    marginBottom: 24,
  },
  companyCard: {
    backgroundColor: '#F4F7FF',
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 24,
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyLabel: {
    fontSize: 13,
    color: '#8A8FA6',
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyLogoWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  companyName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F4F7FF',
    borderRadius: BorderRadius.lg,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonsContainer: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#D6DEFF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    fontSize: 15,
    color: '#8A8FA6',
    fontWeight: '600',
  },
});
