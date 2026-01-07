/**
 * Image Mapping Utility
 * Maps products and firms to local asset images
 */

// Define firm logos as constants (ensures Metro bundles them)
const AQUA_LOGO = require('../assets/firms/aquawater-logo.png');
const OCEAN_LOGO = require('../assets/firms/oceanwater-logo.png');
const ZAMZAM_LOGO = require('../assets/firms/zamzam-logo.png');
const CRYSTAL_LOGO = require('../assets/firms/crystal-logo.png');

// Firm logos mapping (for backward compatibility)
export const FIRM_LOGOS: Record<string, any> = {
  'aquawater': AQUA_LOGO,
  'oceanwater': OCEAN_LOGO,
  'zamzamwater': ZAMZAM_LOGO,
  'crystalwater': CRYSTAL_LOGO,
};

// Product images by firm and volume - include key variations
const AQUA_PRODUCTS = {
  '0.5L': require('../assets/products/aqua-0.5l.png'),
  '5L': require('../assets/products/aqua-5l.png'),
  '10L': require('../assets/products/aqua-10l.png'),
  '19L': require('../assets/products/aqua-19l.png'),
};
const OCEAN_PRODUCTS = {
  '0.5L': require('../assets/products/ocean-0.5l.png'),
  '5L': require('../assets/products/ocean-5l.png'),
  '10L': require('../assets/products/ocean-10l.png'),
  '19L': require('../assets/products/ocean-19l.png'),
};
const ZAMZAM_PRODUCTS = {
  '0.5L': require('../assets/products/zamzam-0.5l.png'),
  '5L': require('../assets/products/zamzam-5l.png'),
  '10L': require('../assets/products/zamzam-10l.png'),
  '19L': require('../assets/products/zamzam-19l.png'),
};
const CRYSTAL_PRODUCTS = {
  '0.5L': require('../assets/products/crystal-19l.png'),
  '5L': require('../assets/products/crystal-19l.png'),
  '10L': require('../assets/products/crystal-19l.png'),
  '19L': require('../assets/products/crystal-19l.png'),
};

export const PRODUCT_IMAGES: Record<string, Record<string, any>> = {
  'aquawater': AQUA_PRODUCTS,
  'aqua': AQUA_PRODUCTS,
  'oceanwater': OCEAN_PRODUCTS,
  'ocean': OCEAN_PRODUCTS,
  'zamzamwater': ZAMZAM_PRODUCTS,
  'zamzam': ZAMZAM_PRODUCTS,
  'crystalwater': CRYSTAL_PRODUCTS,
  'crystal': CRYSTAL_PRODUCTS,
};

// Default fallback image
const DEFAULT_PRODUCT_IMAGE = require('../assets/products/aqua-19l.png');
const DEFAULT_LOGO = null; // Will show letter initial

/**
 * Get firm logo from firm name
 */
export function getFirmLogo(firmName: string): any {
  if (!firmName) return DEFAULT_LOGO;

  const name = firmName.toLowerCase();

  // Return logo constants directly (ensures Metro bundles them)
  if (name.includes('aqua')) return AQUA_LOGO;
  if (name.includes('ocean')) return OCEAN_LOGO;
  if (name.includes('zam')) return ZAMZAM_LOGO;
  if (name.includes('crystal')) return CRYSTAL_LOGO;

  return DEFAULT_LOGO;
}

/**
 * Get product image from firm name and volume
 */
export function getProductImage(firmName: string, volume: string): any {
  const key = firmName.toLowerCase().replace(/\s+/g, '');
  const firmImages = PRODUCT_IMAGES[key];

  if (firmImages && firmImages[volume]) {
    return firmImages[volume];
  }

  // Fallback: try to find any image for this firm
  if (firmImages) {
    return firmImages['19L'] || firmImages['10L'] || firmImages['5L'] || DEFAULT_PRODUCT_IMAGE;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Get product image by product name (extracts firm and volume from name)
 */
export function getProductImageByName(productName: string, volume?: string): any {
  const name = productName.toLowerCase();

  // Detect firm from product name
  let firmKey = '';
  if (name.includes('aqua')) firmKey = 'aquawater';
  else if (name.includes('ocean')) firmKey = 'oceanwater';
  else if (name.includes('zam')) firmKey = 'zamzamwater';
  else if (name.includes('crystal')) firmKey = 'crystalwater';

  // Use provided volume or extract from name
  const vol = volume || extractVolume(productName);

  if (firmKey && vol) {
    return getProductImage(firmKey, vol);
  }

  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Extract volume from product name (e.g., "Aqua 19L" -> "19L")
 */
function extractVolume(name: string): string {
  const match = name.match(/(\d+\.?\d*L)/i);
  return match ? match[1].toUpperCase() : '19L';
}

// Mapping from server static paths to local assets
const STATIC_PATH_TO_ASSET: Record<string, any> = {
  // Firm logos
  '/static/firms/aquawater-logo.png': require('../assets/firms/aquawater-logo.png'),
  '/static/firms/oceanwater-logo.png': require('../assets/firms/oceanwater-logo.png'),
  '/static/firms/zamzam-logo.png': require('../assets/firms/zamzam-logo.png'),
  '/static/firms/crystal-logo.png': require('../assets/firms/crystal-logo.png'),
  // Product images
  '/static/products/aqua-0.5l.png': require('../assets/products/aqua-0.5l.png'),
  '/static/products/aqua-5l.png': require('../assets/products/aqua-5l.png'),
  '/static/products/aqua-10l.png': require('../assets/products/aqua-10l.png'),
  '/static/products/aqua-19l.png': require('../assets/products/aqua-19l.png'),
  '/static/products/ocean-0.5l.png': require('../assets/products/ocean-0.5l.png'),
  '/static/products/ocean-5l.png': require('../assets/products/ocean-5l.png'),
  '/static/products/ocean-10l.png': require('../assets/products/ocean-10l.png'),
  '/static/products/ocean-19l.png': require('../assets/products/ocean-19l.png'),
  '/static/products/zamzam-0.5l.png': require('../assets/products/zamzam-0.5l.png'),
  '/static/products/zamzam-5l.png': require('../assets/products/zamzam-5l.png'),
  '/static/products/zamzam-10l.png': require('../assets/products/zamzam-10l.png'),
  '/static/products/zamzam-19l.png': require('../assets/products/zamzam-19l.png'),
  '/static/products/crystal-19l.png': require('../assets/products/crystal-19l.png'),
};

/**
 * Map a server static path to a local bundled asset
 * @param serverPath - Path like "/static/products/aqua-19l.png"
 * @returns Local asset (number from require()) or undefined
 */
export function mapServerPathToLocalAsset(serverPath: string | null | undefined): number | undefined {
  if (!serverPath) return undefined;

  // Try exact match first
  const exactMatch = STATIC_PATH_TO_ASSET[serverPath];
  if (exactMatch) return exactMatch;

  // Try with lowercase
  const lowerPath = serverPath.toLowerCase();
  const lowerMatch = STATIC_PATH_TO_ASSET[lowerPath];
  if (lowerMatch) return lowerMatch;

  // Try extracting info from path and using helper functions
  const pathParts = serverPath.split('/');
  const fileName = pathParts[pathParts.length - 1]?.replace('.png', '').replace('.jpg', '');

  if (serverPath.includes('/firms/') || serverPath.includes('logo')) {
    // Try to match firm logo
    const firmKey = fileName?.replace('-logo', '').replace('_logo', '');
    if (firmKey) {
      const firmLogo = getFirmLogo(firmKey);
      if (firmLogo) return firmLogo;
    }
  }

  if (serverPath.includes('/products/')) {
    // Try to match product image
    if (fileName) {
      const productImage = getProductImageByName(fileName);
      if (productImage) return productImage;
    }
  }

  return undefined;
}
