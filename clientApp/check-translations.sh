#!/bin/bash

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 TRANSLATION VALIDATION REPORT"
echo "═══════════════════════════════════════════════════════"
echo ""

# Critical keys to check (format: key_name expected_count)
CRITICAL_KEYS=(
  "welcome:4"
  "getStarted:4"
  "next:4"
  "skip:4"
  "selectLanguage:4"
  "continue:4"
  "heyThere:4"
  "enterPhone:4"
  "sendCode:4"
  "verifyCode:4"
  "login:4"
  "haveAccount:4"
  "phoneNotFound:4"
  "phoneNotFoundMessage:4"
  "enableLocation:4"
  "greeting:4"
  "searchPlaceholder:4"
  "title:16"  # Multiple sections have 'title'
  "empty:4"
  "active:4"
  "editProfile:4"
  "confirm:4"
  "cancel:4"
)

echo "✅ Checking key translations across all 4 languages..."
echo ""

MISSING_COUNT=0
TOTAL_CHECKED=0

for item in "${CRITICAL_KEYS[@]}"; do
  KEY="${item%:*}"
  EXPECTED="${item#*:}"

  # Count occurrences of the key
  COUNT=$(grep -c "^\s*${KEY}:" i18n/translations.ts)

  TOTAL_CHECKED=$((TOTAL_CHECKED + 1))

  if [ "$COUNT" -ge "$EXPECTED" ]; then
    echo "   ✅ ${KEY}: Found ${COUNT} translations"
  else
    echo "   ❌ ${KEY}: Found ${COUNT} translations (expected at least ${EXPECTED})"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📈 SUMMARY:"
echo ""
echo "   Total keys checked: ${TOTAL_CHECKED}"
echo "   Complete: $((TOTAL_CHECKED - MISSING_COUNT))"
echo "   Missing/Incomplete: ${MISSING_COUNT}"
echo ""

# Check newly added login-related keys
echo "═══════════════════════════════════════════════════════"
echo "🔍 Recently Added Keys (Login Functionality):"
echo ""

LOGIN_KEYS=("login" "haveAccount" "phoneNotFound" "phoneNotFoundMessage")

for KEY in "${LOGIN_KEYS[@]}"; do
  # Check each language section
  EN_COUNT=$(awk '/en: \{/,/^  \}/ { if (/^\s*'"$KEY"':/) print }' i18n/translations.ts | wc -l | tr -d ' ')
  RU_COUNT=$(awk '/ru: \{/,/^  \}/ { if (/^\s*'"$KEY"':/) print }' i18n/translations.ts | wc -l | tr -d ' ')
  UZ_COUNT=$(awk '/uz: \{/,/^  \}/ { if (/^\s*'"$KEY"':/) print }' i18n/translations.ts | wc -l | tr -d ' ')
  KAA_COUNT=$(awk '/kaa: \{/,/^  \}/ { if (/^\s*'"$KEY"':/) print }' i18n/translations.ts | wc -l | tr -d ' ')

  TOTAL=$((EN_COUNT + RU_COUNT + UZ_COUNT + KAA_COUNT))

  if [ "$TOTAL" -ge 4 ]; then
    echo "   ✅ ${KEY}: Present in all 4 languages"
  else
    echo "   ⚠️  ${KEY}: Found in ${TOTAL}/4 languages"
    [ "$EN_COUNT" -eq 0 ] && echo "      - Missing in English"
    [ "$RU_COUNT" -eq 0 ] && echo "      - Missing in Russian"
    [ "$UZ_COUNT" -eq 0 ] && echo "      - Missing in Uzbek"
    [ "$KAA_COUNT" -eq 0 ] && echo "      - Missing in Karakalpak"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

if [ "$MISSING_COUNT" -eq 0 ]; then
  echo "🎉 All checked translations are complete!"
  echo ""
  exit 0
else
  echo "⚠️  Some translations may need attention"
  echo ""
  exit 1
fi
