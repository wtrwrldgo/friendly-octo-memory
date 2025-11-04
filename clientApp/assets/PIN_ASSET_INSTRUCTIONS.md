# Pin Asset Instructions

## Required: Add pin.png

The `SelectAddressScreen.tsx` requires a pin icon image at:

```
assets/pin.png
```

### Specifications

- **Format**: PNG with transparency
- **Size**: 60x60 pixels (or 40x40)
- **Style**: Map pin/marker icon (like a location pin)
- **Color**: Red, blue, or your app's primary color

### Quick Options

**Option 1: Create from Icon**
Use any icon library (Material Icons, Ionicons) and export as PNG:
- Search for "location pin" or "map marker"
- Export at 60x60 or 120x120 (for @2x retina)

**Option 2: Use Online Tool**
- Visit https://www.flaticon.com or https://icons8.com
- Search "map pin" or "location marker"
- Download PNG (60x60px)
- Rename to `pin.png`

**Option 3: Design Tool**
Use Figma, Sketch, or any design tool:
- Create 60x60 canvas
- Draw a classic map pin shape
- Export as PNG with transparency

### Example Pin Shape

A classic map pin looks like:
```
    ●
   ╱ ╲
  ╱   ╲
 ╱     ╲
●-------●
   ╲ ╱
    ▼
```

### Placement

Once you have your `pin.png` file, place it in:
```
/Users/musabekisakov/claudeCode/clientApp/assets/pin.png
```

The app will use this image to display the selected location marker on the map.

---

**Note**: The app will crash if `pin.png` is missing. Please add this file before running the SelectAddressScreen.
