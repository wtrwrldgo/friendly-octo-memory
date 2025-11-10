# Translation API Integration Guide

This guide explains how to use the From-To.io translation API integration in the WaterGo app.

## Overview

The app now supports real-time translation using the From-To.io API service. This allows dynamic translation of text content between supported languages including English, Russian, Uzbek, and Karakalpak.

## Features

- **Text Translation**: Translate text between any supported languages
- **Batch Translation**: Translate multiple texts in a single operation
- **Transliteration**: Convert between Latin and Cyrillic scripts
- **Language Detection**: Automatic language code mapping
- **Error Handling**: Graceful fallback to original text on errors

## Supported Languages

| Language | App Code | API Code |
|----------|----------|----------|
| English | `en` | `eng_Latn` |
| Russian | `ru` | `rus_Cyrl` |
| Uzbek | `uz` | `uzn_Latn` |
| Karakalpak | `kaa` | `kaa` |

## API Endpoints

### 1. Translate Text
**Endpoint**: `POST https://api.from-to.uz/api/v1/translate`

Translates text from one language to another.

**Request Body**:
```json
{
  "body": {
    "lang_from": "uz",
    "lang_to": "kaa",
    "resultCase": "latin",
    "text": "Salom"
  }
}
```

**Response**:
```json
{
  "result": "Сәлем"
}
```

### 2. Transliterate Text
**Endpoint**: `POST https://api.from-to.uz/api/v1/transliterate`

Converts text between Latin and Cyrillic scripts.

**Request Body**:
```json
{
  "body": {
    "lang_from": "uz_latin",
    "lang_to": "uz_cyrillic",
    "text": "Salom"
  }
}
```

**Response**:
```json
{
  "result": "салом"
}
```

**Available Scripts**:
- `uz_latin` - Uzbek Latin script
- `uz_cyrillic` - Uzbek Cyrillic script
- `kaa_latin` - Karakalpak Latin script
- `kaa_cyrillic` - Karakalpak Cyrillic script

### 3. Get Available Languages
**Endpoint**: `GET https://cdn.from-to.uz/languages.json`

Returns a list of all available languages.

**Response**:
```json
[
  {
    "name": "English",
    "code": "eng_Latn"
  },
  {
    "name": "Russian",
    "code": "rus_Cyrl"
  },
  {
    "name": "Uzbek",
    "code": "uzn_Latn"
  },
  {
    "name": "Karakalpak",
    "code": "kaa"
  }
]
```

## Usage in Components

### Using the Hook (Recommended)

The easiest way to use translation in components is via the `useTranslation` hook:

```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { translateText, isTranslating, error } = useTranslation();
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslate = async () => {
    const result = await translateText('Hello', 'kaa', 'latin');
    setTranslatedText(result);
  };

  return (
    <View>
      <Text>{translatedText}</Text>
      {isTranslating && <Text>Translating...</Text>}
      {error && <Text>Error: {error}</Text>}
      <Button title="Translate" onPress={handleTranslate} />
    </View>
  );
};
```

### Using the Service Directly

For more control, use the TranslationService directly:

```typescript
import TranslationService from '../services/translation.service';

// Simple translation
const translated = await TranslationService.translate(
  'Hello world',
  'en',
  'kaa',
  'latin'
);

// Batch translation
const texts = ['Hello', 'Goodbye', 'Thank you'];
const translations = await TranslationService.batchTranslate(
  texts,
  'en',
  'kaa',
  'latin'
);

// Transliteration
const cyrillic = await TranslationService.transliterate(
  'Salom',
  'uz_latin',
  'uz_cyrillic'
);

// Get available languages
const languages = await TranslationService.getAvailableLanguages();
```

## Hook Methods

### `translateText(text, targetLang, resultCase?)`
Translates text from the current app language to the target language.

**Parameters**:
- `text` (string): Text to translate
- `targetLang` (string): Target language code ('en', 'ru', 'uz', 'kaa')
- `resultCase` ('cyrill' | 'latin', optional): Output script format

**Returns**: Promise<string>

**Example**:
```typescript
const result = await translateText('Hello', 'kaa', 'latin');
// Result: "Сәлем" or "Sálem" depending on resultCase
```

### `translateFromTo(text, fromLang, toLang, resultCase?)`
Translates text from a specific source language to target language.

**Parameters**:
- `text` (string): Text to translate
- `fromLang` (string): Source language code
- `toLang` (string): Target language code
- `resultCase` ('cyrill' | 'latin', optional): Output script format

**Returns**: Promise<string>

**Example**:
```typescript
const result = await translateFromTo('Salom', 'uz', 'en', 'latin');
// Result: "Hello"
```

### `batchTranslate(texts, targetLang, resultCase?)`
Translates multiple texts at once.

**Parameters**:
- `texts` (string[]): Array of texts to translate
- `targetLang` (string): Target language code
- `resultCase` ('cyrill' | 'latin', optional): Output script format

**Returns**: Promise<string[]>

**Example**:
```typescript
const results = await batchTranslate(
  ['Home', 'Cart', 'Orders'],
  'kaa',
  'latin'
);
// Results: ["Bas bet", "Sebet", "Buyırtpalar"]
```

### `transliterate(text, fromScript, toScript)`
Converts text between Latin and Cyrillic scripts.

**Parameters**:
- `text` (string): Text to transliterate
- `fromScript` ('uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic')
- `toScript` ('uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic')

**Returns**: Promise<string>

**Example**:
```typescript
const cyrillic = await transliterate('Salom', 'uz_latin', 'uz_cyrillic');
// Result: "салом"
```

## Real-World Examples

### Example 1: Dynamic Product Name Translation

```typescript
import { useTranslation } from '../hooks/useTranslation';

const ProductCard = ({ product }) => {
  const { translateText } = useTranslation();
  const [localizedName, setLocalizedName] = useState(product.name);

  useEffect(() => {
    const translateProductName = async () => {
      const translated = await translateText(product.name, 'kaa', 'latin');
      setLocalizedName(translated);
    };
    translateProductName();
  }, [product.name]);

  return (
    <View>
      <Text>{localizedName}</Text>
      <Text>{product.price} UZS</Text>
    </View>
  );
};
```

### Example 2: Real-time Search Translation

```typescript
import { useTranslation } from '../hooks/useTranslation';

const SearchScreen = () => {
  const { translateText, isTranslating } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [translatedQuery, setTranslatedQuery] = useState('');

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    // Translate search query to English for backend search
    const translated = await translateText(text, 'en', 'latin');
    setTranslatedQuery(translated);

    // Perform search with translated query
    searchProducts(translated);
  };

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search products..."
      />
      {isTranslating && <ActivityIndicator />}
    </View>
  );
};
```

### Example 3: Multi-language Welcome Message

```typescript
import { useTranslation } from '../hooks/useTranslation';

const WelcomeScreen = () => {
  const { batchTranslate } = useTranslation();
  const [welcomeMessages, setWelcomeMessages] = useState<string[]>([]);

  useEffect(() => {
    const loadWelcomeMessages = async () => {
      const messages = [
        'Welcome to WaterGo!',
        'Order water delivered to your door',
        'Fast and reliable service'
      ];

      const translated = await batchTranslate(messages, 'kaa', 'latin');
      setWelcomeMessages(translated);
    };
    loadWelcomeMessages();
  }, []);

  return (
    <View>
      {welcomeMessages.map((msg, index) => (
        <Text key={index}>{msg}</Text>
      ))}
    </View>
  );
};
```

### Example 4: Script Switcher

```typescript
import { useTranslation } from '../hooks/useTranslation';

const ScriptSwitcher = ({ text }) => {
  const { transliterate } = useTranslation();
  const [displayText, setDisplayText] = useState(text);
  const [isLatin, setIsLatin] = useState(true);

  const toggleScript = async () => {
    const newScript = isLatin ? 'kaa_cyrillic' : 'kaa_latin';
    const oldScript = isLatin ? 'kaa_latin' : 'kaa_cyrillic';

    const result = await transliterate(displayText, oldScript, newScript);
    setDisplayText(result);
    setIsLatin(!isLatin);
  };

  return (
    <View>
      <Text>{displayText}</Text>
      <Button
        title={isLatin ? 'Switch to Cyrillic' : 'Switch to Latin'}
        onPress={toggleScript}
      />
    </View>
  );
};
```

## Error Handling

The hook automatically handles errors and provides fallback behavior:

```typescript
const { translateText, error } = useTranslation();

const result = await translateText('Hello', 'kaa');

if (error) {
  // Error occurred, result will be the original text
  console.error('Translation failed:', error);
  // Show error toast to user
} else {
  // Translation successful
  console.log('Translated:', result);
}
```

## Best Practices

1. **Cache Translations**: Store frequently used translations in state or AsyncStorage to avoid repeated API calls

2. **Batch Operations**: Use `batchTranslate` when translating multiple texts to reduce API calls

3. **Loading States**: Always show loading indicators during translation

4. **Error Fallbacks**: Display original text when translation fails

5. **Script Selection**: Use 'latin' resultCase for better readability on most devices

6. **Debouncing**: For real-time translation (search, etc.), debounce input to avoid excessive API calls

## Performance Tips

```typescript
// ✅ Good: Batch translate multiple items
const translations = await batchTranslate(
  items.map(item => item.name),
  'kaa',
  'latin'
);

// ❌ Bad: Translate items one by one
for (const item of items) {
  const translation = await translateText(item.name, 'kaa', 'latin');
}

// ✅ Good: Cache translations
const [cachedTranslations, setCachedTranslations] = useState({});
if (cachedTranslations[text]) {
  return cachedTranslations[text];
}
const result = await translateText(text, 'kaa');
setCachedTranslations({ ...cachedTranslations, [text]: result });

// ✅ Good: Debounce real-time translation
import { debounce } from 'lodash';

const debouncedTranslate = useCallback(
  debounce(async (text) => {
    const result = await translateText(text, 'kaa');
    setTranslated(result);
  }, 500),
  []
);
```

## Troubleshooting

### Issue: Translation not working
- Check internet connectivity
- Verify API endpoints are accessible
- Check language codes are correct
- Review error messages in console

### Issue: Slow translation
- Use batch translation for multiple texts
- Implement caching
- Add debouncing for real-time translation

### Issue: Wrong script output
- Specify `resultCase` parameter ('cyrill' or 'latin')
- Use transliteration for script conversion

## API Rate Limits

The From-To.io API may have rate limits. Consider:
- Implementing request throttling
- Caching frequent translations
- Using batch operations when possible

## Support

For issues with the From-To.io API itself, contact:
- Website: https://from-to.uz
- API Documentation: https://api.from-to.uz/docs
