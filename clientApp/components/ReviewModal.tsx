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
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { PrimaryButton } from './PrimaryButton';
import { useLanguage } from '../context/LanguageContext';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  driverName?: string;
  companyName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  driverName,
  companyName,
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
            <Text style={[styles.star, rating >= star && styles.starFilled]}>
              {rating >= star ? '⭐' : '☆'}
            </Text>
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t('review.title')}</Text>
              <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Emoji Illustration */}
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>
                {rating === 0 ? '😊' : rating <= 2 ? '😞' : rating === 3 ? '😐' : rating === 4 ? '😊' : '🤩'}
              </Text>
            </View>

            {/* Question */}
            <Text style={styles.question}>{t('review.rateDelivery')}</Text>

            {/* Star Rating */}
            {renderStars()}

            {/* Driver Info (if available) */}
            {driverName && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t('review.rateDriver')}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.driverEmoji}>👨‍💼</Text>
                  <Text style={styles.infoValue}>{driverName}</Text>
                </View>
              </View>
            )}

            {/* Company Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('review.rateCompany')}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.companyEmoji}>💧</Text>
                <Text style={styles.infoValue}>{companyName}</Text>
              </View>
            </View>

            {/* Comment Input */}
            <Text style={styles.commentLabel}>{t('review.addComment')}</Text>
            <TextInput
              style={styles.commentInput}
              placeholder={t('review.commentPlaceholder')}
              placeholderTextColor={Colors.grayText}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <PrimaryButton
                title={t('review.submitReview')}
                onPress={handleSubmit}
              />
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>{t('review.skipReview')}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.grayText,
    fontWeight: '600',
  },
  emojiContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  emoji: {
    fontSize: 80,
  },
  question: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  star: {
    fontSize: 48,
    color: '#E0E0E0',
  },
  starFilled: {
    color: '#FFD700',
  },
  infoCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    color: Colors.grayText,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  companyEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  infoValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  commentLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  commentInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 100,
    marginBottom: Spacing.lg,
  },
  buttonsContainer: {
    marginTop: Spacing.md,
  },
  skipButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.grayText,
    fontWeight: '600',
  },
});
