# Product Images Guide - WaterGo CRM

## Overview
The CRM now supports product images, specifically PNG icons for water bottles of different sizes.

## Image Setup

### Directory Structure
```
public/
└── products/
    └── bottles/
        ├── 19l.png   (19 liter bottle icon)
        ├── 10l.png   (10 liter bottle icon)
        ├── 5l.png    (5 liter bottle icon)
        └── 0.5l.png  (0.5 liter bottle icon)
```

### Image Requirements

**Format:** PNG with transparency
**Recommended Size:** 512x512px or higher
**Aspect Ratio:** Square or vertical (bottle-shaped)
**Background:** Transparent
**File Size:** < 100KB per image

### Image Placement

1. Create the directory structure:
```bash
mkdir -p public/products/bottles
```

2. Place your PNG images in the `public/products/bottles/` directory with the following names:
   - `19l.png` - For 19 liter bottles
   - `10l.png` - For 10 liter bottles
   - `5l.png` - For 5 liter bottles
   - `0.5l.png` - For 0.5-1.5 liter bottles

## Current Product Mapping

The following products have been configured with images:

| Product | Volume | Image Path |
|---------|--------|------------|
| Premium 19L Water Bottle | 19L | `/products/bottles/19l.png` |
| Medium 10L Water Bottle | 10L | `/products/bottles/10l.png` |
| Small 5L Water Bottle | 5L | `/products/bottles/5l.png` |
| 1.5L Bottled Water (Pack of 6) | 1.5L | `/products/bottles/0.5l.png` |
| Sparkling Water 19L | 19L | `/products/bottles/19l.png` |
| Monthly Subscription (8x 19L) | 19L | `/products/bottles/19l.png` |

## How Images Are Displayed

### Products Page (`/firm-products`)
- Images appear in the gradient header of each product card
- Positioned on the right side with 40% opacity
- Height: 96px (h-24)
- Automatically scales to maintain aspect ratio

### Order Creation Page (`/firm-order-create`)
- Images appear as a subtle watermark in the bottom-right of product cards
- Opacity: 10%
- Height: 96px (h-24)
- Provides visual context without cluttering the interface

## Adding Images to New Products

### In Code (Mock Data)

When adding a new product to `lib/mockData.ts`, include the `image` property:

```typescript
{
  id: "prod-012",
  firmId: "1",
  name: "Large 25L Water Bottle",
  description: "Extra large bottle for industrial use.",
  price: 40000,
  unit: "bottle",
  volume: "25L",
  image: "/products/bottles/25l.png", // Add this line
  inStock: true,
  stockQuantity: 100,
  minOrder: 1,
  category: "Water",
  createdAt: new Date().toISOString(),
}
```

### Via Form (Future API Integration)

When the product creation form is connected to an API:

1. Add a file upload field to the product form
2. Upload the image to cloud storage (AWS S3, Cloudinary, etc.)
3. Store the image URL in the database
4. The `Product` interface already supports the optional `image` field

## Image Guidelines

### Design Best Practices

1. **Consistency:** All bottle images should have similar style and perspective
2. **Clarity:** Use high-resolution images (at least 512x512px)
3. **Simplicity:** Avoid complex backgrounds, use simple bottle silhouettes
4. **Color:** While images can have color, they'll appear with reduced opacity, so high-contrast designs work best

### Example Image Sources

- **Custom Design:** Create vector illustrations in Figma/Adobe Illustrator
- **Icon Packs:** Use commercial icon packs (Flaticon, Icons8, etc.)
- **3D Renders:** Simple 3D models of bottles
- **Photography:** High-quality product photos with background removed

### Recommended Tools

- **Remove Background:** [remove.bg](https://remove.bg)
- **Vector to PNG:** Adobe Illustrator, Figma
- **Resize/Optimize:** [TinyPNG](https://tinypng.com)
- **Free Icons:** [Flaticon](https://flaticon.com), [Icons8](https://icons8.com)

## Technical Implementation

### Product Interface

The `Product` interface in `types/index.ts` includes:

```typescript
export interface Product {
  id: string;
  firmId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  volume: string;
  image?: string; // Optional image URL/path
  inStock: boolean;
  stockQuantity: number;
  minOrder: number;
  category: "Water" | "Accessories" | "Equipment";
  createdAt: string;
}
```

### Display Logic

Images are conditionally rendered:

```typescript
{product.image && (
  <img
    src={product.image}
    alt={product.name}
    className="h-24 w-auto object-contain opacity-40"
  />
)}
```

This ensures that:
- Products without images still display correctly
- Images enhance the visual experience without being mandatory
- Future products can optionally include images

## Future Enhancements

### Planned Features

1. **Image Upload in CRM**
   - Add file upload to product creation/edit form
   - Integrate with cloud storage (AWS S3, Cloudinary)
   - Image compression and optimization

2. **Multiple Images**
   - Support for product galleries (multiple angles)
   - Thumbnail generation
   - Zoom/lightbox functionality

3. **Image Optimization**
   - Use Next.js Image component for automatic optimization
   - Lazy loading for better performance
   - WebP format support

4. **Responsive Images**
   - Different sizes for mobile/desktop
   - srcset for retina displays

## Troubleshooting

### Images Not Showing

1. **Check File Path:** Ensure images are in `public/products/bottles/`
2. **Check File Names:** Must match exactly (case-sensitive on production)
3. **Check Browser Console:** Look for 404 errors
4. **Clear Cache:** Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Images Too Large

1. **Optimize Files:** Use TinyPNG or similar tools
2. **Resize Images:** 512x512px is sufficient
3. **Check File Format:** PNG should be compressed

### Images Look Distorted

1. **Check Aspect Ratio:** Keep images square or vertical
2. **Use `object-contain`:** Already implemented in code
3. **Maintain Transparency:** Ensure PNG has alpha channel

## Support

For questions or issues with product images, refer to:
- This guide
- `/ARCHITECTURE.md` - Overall CRM architecture
- `/types/index.ts` - Product interface definition
- `/lib/mockData.ts` - Product data examples

---

**Last Updated:** November 2025
**Version:** 1.0
