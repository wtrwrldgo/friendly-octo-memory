# Navigation Icons Setup Guide

## ✅ Downloaded Icons

- ✅ **yandex-maps.png** - Already downloaded and ready

## 📥 Icons You Need to Add

### 1. Google Maps Icon
**File name:** `google-maps.png`

**Where to get it:**
- Option 1: Download from https://www.google.com/maps (extract app icon)
- Option 2: Search "Google Maps icon PNG" and download the colorful pin icon
- Option 3: Use the icon from your screenshot (multicolor pin: red, blue, yellow, green)

**Specifications:**
- Size: 512x512 pixels (or any square size, will auto-resize)
- Format: PNG with transparent or white background
- The icon should be the colorful Google Maps pin

### 2. Apple Maps Icon
**File name:** `apple-maps.png`

**Where to get it:**
- Option 1: Extract from iOS device/simulator
- Option 2: Search "Apple Maps app icon PNG"
- Option 3: Download from Apple Design Resources
- Use the icon from your screenshot (map with navigation arrow and highway sign)

**Specifications:**
- Size: 512x512 pixels (or any square size, will auto-resize)
- Format: PNG with transparent or white background
- The icon should be the Apple Maps app icon (colorful map with navigation)

## 🚀 Quick Setup

1. Download both icons
2. Rename them exactly as:
   - `google-maps.png`
   - `apple-maps.png`
3. Place them in this folder: `/assets/navigation-icons/`
4. Reload your app

## 📁 Final Structure

```
assets/navigation-icons/
├── google-maps.png      ← ADD THIS
├── apple-maps.png       ← ADD THIS
├── yandex-maps.png      ✅ Already added
├── SETUP_ICONS.md       (this file)
└── README.md
```

## 🎨 Temporary Placeholders

If you want to test the modal before adding real icons, you can:
1. Use any PNG image as placeholder
2. Name them `google-maps.png` and `apple-maps.png`
3. The component will display them

## 🔧 Component Updated

✅ NavigationPickerModal is already configured to use these image files
✅ Code is ready - just add the PNG files and reload!

## 📱 Expected Result

After adding the icons, your navigation modal will show:
- 🎯 Google Maps colorful pin icon
- 🗺️ Yandex Maps red logo (already working!)
- 🧭 Apple Maps navigation icon

All with their official brand designs!
