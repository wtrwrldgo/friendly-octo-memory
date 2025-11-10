/**
 * Development Configuration
 *
 * This file contains flags for development/testing purposes.
 * Toggle these flags to bypass certain flows during development.
 */

/**
 * BYPASS_AUTH
 *
 * When set to `true`:
 * - Skips all authentication screens (Welcome, Language, Name, Phone, Verify Code)
 * - Automatically logs in with a mock user
 * - App launches directly to the main Home screen
 *
 * When set to `false`:
 * - Normal authentication flow is used
 * - User must complete all onboarding steps
 *
 * Default: false (use normal auth flow in production)
 */
export const BYPASS_AUTH = false;

/**
 * Mock user data used when BYPASS_AUTH is enabled
 */
export const MOCK_USER = {
  id: 'dev-user-001',
  name: 'Test User',
  phone: '+1234567890',
  language: 'en',
};

/**
 * Mock address data used when BYPASS_AUTH is enabled
 */
export const MOCK_ADDRESS = {
  id: 'dev-address-001',
  title: 'Home',
  address: 'Test Street 123, Test City',
  lat: 41.2995,
  lng: 69.2401,
  isDefault: true,
};
