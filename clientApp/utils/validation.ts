/**
 * Input Validation Utilities
 *
 * Provides validation functions for user inputs to ensure data quality and security.
 */

/**
 * Validates phone number format
 * Supports: +998XXXXXXXXX (Uzbekistan format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // Check if it matches +998 followed by 9 digits
  const phoneRegex = /^\+998\d{9}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validates name input
 * - Must be at least 2 characters
 * - Must be at most 50 characters
 * - Can contain letters, spaces, hyphens, and apostrophes
 * - No numbers or special characters
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  // Allow letters (including Unicode), spaces, hyphens, and apostrophes
  const nameRegex = /^[\p{L}\s'-]+$/u;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Sanitizes user input to prevent XSS and injection attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/[&]/g, '&amp;') // Escape ampersand
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 200); // Limit length
};

/**
 * Validates email format (for future use)
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats phone number for display
 * Example: +998901234567 → +998 90 123 45 67
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');

  if (cleaned.startsWith('+998') && cleaned.length === 13) {
    return cleaned.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return phone;
};

/**
 * Validates verification code (6 digits)
 */
export const validateVerificationCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};
