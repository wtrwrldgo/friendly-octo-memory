-- Migration: Add missing columns to users and firms tables
-- Date: 2025-11-27
-- Description: Adds language column to users and is_active column to firms

-- ============================================
-- USERS TABLE
-- ============================================

-- Add language column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' NOT NULL;

-- Update existing users to have default language
UPDATE users
SET language = 'en'
WHERE language IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.language IS 'User preferred language (en, ru, kaa, etc.)';

-- ============================================
-- FIRMS TABLE
-- ============================================

-- Add is_active column if it doesn't exist
ALTER TABLE firms
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing firms to be active by default
UPDATE firms
SET is_active = true
WHERE is_active IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN firms.is_active IS 'Whether the firm is currently active and visible to users';
