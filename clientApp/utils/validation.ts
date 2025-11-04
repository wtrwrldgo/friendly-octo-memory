/**
 * Form Validation Utilities
 */

/**
 * Validate Uzbekistan phone number
 * Formats: +998XXXXXXXXX or 998XXXXXXXXX
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  // Remove all spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it starts with +998 or 998
  if (!cleanPhone.startsWith('+998') && !cleanPhone.startsWith('998')) {
    return {
      isValid: false,
      error: 'Phone number must start with +998',
    };
  }

  // Remove + and 998 prefix
  const numberPart = cleanPhone.replace(/^\+?998/, '');

  // Check if it has exactly 9 digits
  if (numberPart.length !== 9) {
    return {
      isValid: false,
      error: 'Phone number must have 9 digits after +998',
    };
  }

  // Check if all characters are digits
  if (!/^\d+$/.test(numberPart)) {
    return {
      isValid: false,
      error: 'Phone number can only contain digits',
    };
  }

  // Check if it starts with valid operator codes
  const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '71', '50'];
  const operatorCode = numberPart.substring(0, 2);

  if (!validPrefixes.includes(operatorCode)) {
    return {
      isValid: false,
      error: 'Invalid operator code',
    };
  }

  return { isValid: true };
};

/**
 * Format phone number for display
 * Example: +998 90 123 45 67
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const numberPart = cleanPhone.replace(/^\+?998/, '');

  if (numberPart.length === 9) {
    return `+998 ${numberPart.substring(0, 2)} ${numberPart.substring(2, 5)} ${numberPart.substring(5, 7)} ${numberPart.substring(7, 9)}`;
  }

  return phone;
};

/**
 * Validate verification code
 */
export const validateVerificationCode = (code: string): { isValid: boolean; error?: string } => {
  if (!code || code.length !== 4) {
    return {
      isValid: false,
      error: 'Code must be 4 digits',
    };
  }

  if (!/^\d+$/.test(code)) {
    return {
      isValid: false,
      error: 'Code can only contain digits',
    };
  }

  return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters',
    };
  }

  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must not exceed 50 characters',
    };
  }

  return { isValid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address || address.trim().length < 5) {
    return {
      isValid: false,
      error: 'Address must be at least 5 characters',
    };
  }

  if (address.trim().length > 200) {
    return {
      isValid: false,
      error: 'Address must not exceed 200 characters',
    };
  }

  return { isValid: true };
};
