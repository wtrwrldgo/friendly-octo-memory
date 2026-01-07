#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the actual translations
const translationsModule = require('./i18n/translations.ts');

console.log('\n📋 Checking translations across all 4 languages...\n');

// Get all translation keys from English (reference)
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Check if a key exists in an object
function hasKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  return true;
}

// Get the value of a key
function getKeyValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

try {
  // Try to load translations by executing the TypeScript (it's actually JavaScript-compatible)
  const translationsContent = fs.readFileSync(path.join(__dirname, 'i18n', 'translations.ts'), 'utf-8');

  // Extract each language object using regex
  const extractLang = (langCode) => {
    const regex = new RegExp(`${langCode}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\s*(?:as const)?[,;]`, 'i');
    const match = translationsContent.match(regex);
    if (!match) return null;

    try {
      // Try to parse as an object
      const objStr = '{' + match[1] + '\n}';
      // This is a simple check - we'll manually verify key structure
      return match[1];
    } catch (e) {
      return null;
    }
  };

  // Manual check: verify specific important keys exist in all languages
  const criticalKeys = [
    'auth.welcome',
    'auth.getStarted',
    'auth.next',
    'auth.skip',
    'auth.selectLanguage',
    'auth.continue',
    'auth.heyThere',
    'auth.enterPhone',
    'auth.sendCode',
    'auth.verifyCode',
    'auth.login',
    'auth.haveAccount',
    'auth.phoneNotFound',
    'auth.phoneNotFoundMessage',
    'auth.enableLocation',
    'home.greeting',
    'home.searchPlaceholder',
    'cart.title',
    'cart.empty',
    'orders.title',
    'orders.active',
    'profile.title',
    'profile.editProfile',
    'common.confirm',
    'common.cancel',
    'errors.network',
    'errors.unknown'
  ];

  const languages = {
    en: 'English',
    ru: 'Russian',
    uz: 'Uzbek',
    kaa: 'Karakalpak'
  };

  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 TRANSLATION VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check each language section exists
  const langResults = {};
  Object.keys(languages).forEach(langCode => {
    const langContent = extractLang(langCode);
    langResults[langCode] = {
      exists: !!langContent,
      content: langContent
    };
  });

  console.log('✅ Language Sections Found:\n');
  Object.keys(languages).forEach(langCode => {
    const status = langResults[langCode].exists ? '✅' : '❌';
    console.log(`   ${status} ${languages[langCode]} (${langCode})`);
  });

  // Verify critical keys are present in all languages by checking raw content
  console.log('\n\n📍 Verifying Critical Translation Keys:\n');

  const missingByLang = {};
  Object.keys(languages).forEach(langCode => {
    missingByLang[langCode] = [];
  });

  criticalKeys.forEach(keyPath => {
    const [category, key] = keyPath.split('.');
    let allPresent = true;

    Object.keys(languages).forEach(langCode => {
      const content = langResults[langCode].content;
      if (!content) {
        allPresent = false;
        missingByLang[langCode].push(keyPath);
        return;
      }

      // Check if the key exists in the content string
      const keyRegex = new RegExp(`${key}:\\s*['"']`, 'i');
      const categoryRegex = new RegExp(`${category}:\\s*\\{`, 'i');

      if (!categoryRegex.test(content) || !keyRegex.test(content)) {
        allPresent = false;
        missingByLang[langCode].push(keyPath);
      }
    });

    const status = allPresent ? '✅' : '⚠️ ';
    console.log(`   ${status} ${keyPath}`);
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📈 SUMMARY:\n');

  let hasIssues = false;
  Object.keys(languages).forEach(langCode => {
    const missing = missingByLang[langCode];
    if (missing.length > 0) {
      console.log(`\n❌ ${languages[langCode]} (${langCode}): ${missing.length} missing keys`);
      missing.forEach(key => console.log(`     - ${key}`));
      hasIssues = true;
    } else {
      console.log(`\n✅ ${languages[langCode]} (${langCode}): All critical keys present`);
    }
  });

  if (!hasIssues) {
    console.log('\n\n🎉 All critical translations are present across all 4 languages!');
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  process.exit(hasIssues ? 1 : 0);

} catch (error) {
  console.error('Error checking translations:', error.message);
  process.exit(1);
}
