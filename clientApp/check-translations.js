#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsPath = path.join(__dirname, 'i18n', 'translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf-8');

// Extract translation keys used in the codebase
const { execSync } = require('child_process');
const usedKeysRaw = execSync(
  "grep -rh \"t('\" --include=\"*.tsx\" --exclude-dir=node_modules . | grep -o \"t('[^']*')\" | sed \"s/t('//g\" | sed \"s/')//g\" | sort -u",
  { encoding: 'utf-8', cwd: __dirname }
);

const usedKeys = usedKeysRaw
  .split('\n')
  .filter(key => key && key.length > 0 && !key.includes(',') && !key.includes('.') || key.match(/^[a-z]+\.[a-zA-Z0-9_]+$/))
  .filter(key => key.match(/^[a-z]+\.[a-zA-Z0-9_]+$/)); // Only valid keys like "auth.login"

console.log(`\n📋 Checking ${usedKeys.length} translation keys across 4 languages...\n`);

// Parse translations for each language
const languages = {
  en: { name: 'English', keys: new Set() },
  ru: { name: 'Russian', keys: new Set() },
  uz: { name: 'Uzbek', keys: new Set() },
  kaa: { name: 'Karakalpak', keys: new Set() }
};

// Extract keys from translations.ts for each language
Object.keys(languages).forEach(langCode => {
  // Find the language section
  const langRegex = new RegExp(`${langCode}:\\s*{([\\s\\S]*?)\\n\\s*}\\s*(?:as const)?[,;]`, 'i');
  const match = translationsContent.match(langRegex);

  if (match) {
    const section = match[1];

    // Extract all keys like "auth: { ... }"
    const categoryRegex = /(\w+):\s*{/g;
    let categoryMatch;

    while ((categoryMatch = categoryRegex.exec(section)) !== null) {
      const category = categoryMatch[1];

      // Find the category content
      const categoryStartIndex = categoryMatch.index + categoryMatch[0].length;
      let braceCount = 1;
      let categoryEndIndex = categoryStartIndex;

      for (let i = categoryStartIndex; i < section.length && braceCount > 0; i++) {
        if (section[i] === '{') braceCount++;
        if (section[i] === '}') braceCount--;
        categoryEndIndex = i;
      }

      const categoryContent = section.substring(categoryStartIndex, categoryEndIndex);

      // Extract key names
      const keyRegex = /(\w+):\s*['"]/g;
      let keyMatch;

      while ((keyMatch = keyRegex.exec(categoryContent)) !== null) {
        const key = `${category}.${keyMatch[1]}`;
        languages[langCode].keys.add(key);
      }
    }
  }
});

// Check for missing translations
const missingTranslations = {};
const results = {
  total: usedKeys.length,
  complete: 0,
  missing: []
};

usedKeys.forEach(key => {
  const missing = [];

  Object.keys(languages).forEach(langCode => {
    if (!languages[langCode].keys.has(key)) {
      missing.push(langCode);
    }
  });

  if (missing.length === 0) {
    results.complete++;
  } else {
    results.missing.push({ key, languages: missing });
    if (!missingTranslations[key]) {
      missingTranslations[key] = [];
    }
    missingTranslations[key].push(...missing);
  }
});

// Display results
console.log('═══════════════════════════════════════════════════════');
console.log('📊 TRANSLATION VALIDATION REPORT');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`✅ Complete translations: ${results.complete}/${results.total}`);
console.log(`❌ Incomplete translations: ${results.missing.length}/${results.total}\n`);

if (results.missing.length > 0) {
  console.log('⚠️  MISSING TRANSLATIONS:\n');

  // Group by language
  const byLanguage = {
    en: [],
    ru: [],
    uz: [],
    kaa: []
  };

  results.missing.forEach(({ key, languages }) => {
    languages.forEach(lang => {
      byLanguage[lang].push(key);
    });
  });

  Object.keys(byLanguage).forEach(langCode => {
    if (byLanguage[langCode].length > 0) {
      console.log(`\n📍 ${languages[langCode].name} (${langCode}): ${byLanguage[langCode].length} missing`);
      byLanguage[langCode].slice(0, 10).forEach(key => {
        console.log(`   - ${key}`);
      });
      if (byLanguage[langCode].length > 10) {
        console.log(`   ... and ${byLanguage[langCode].length - 10} more`);
      }
    }
  });

  console.log('\n═══════════════════════════════════════════════════════');
  process.exit(1);
} else {
  console.log('🎉 All translations are complete across all 4 languages!');
  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(0);
}
