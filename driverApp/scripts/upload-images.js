/**
 * Script to upload images to Supabase Storage and update database
 * Run: node scripts/upload-images.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://yhciganaoehjezkdazvt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloY2lnYW5hb2VoamV6a2RhenZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjgxMjEsImV4cCI6MjA3NzUwNDEyMX0.tIShZ44NJm3Wgdcwsstp9KOKbvEcYzPy_uB7-SbiLGs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Image paths from clientApp
const ASSETS_BASE = path.join(__dirname, '../../clientApp/assets');

// Firm logo mappings
const firmLogos = {
  'Aquawater': 'firms/aquawater-logo.png',
  'OceanWater': 'firms/oceanwater-logo.png',
  'ZamZamWater': 'firms/zamzam-logo.png',
  'CrystalWater': 'firms/crystal-logo.png',
};

// Product image mappings (name pattern -> local file)
const productImages = {
  'Aqua 19L': 'products/aqua-19l.png',
  'Aqua 10L': 'products/aqua-10l.png',
  'Aqua 5L': 'products/aqua-5l.png',
  'Aquawater 19L': 'products/aqua-19l.png',
  'Ocean 19L': 'products/ocean-19l.png',
  'Ocean 10L': 'products/ocean-10l.png',
  'Ocean 5L': 'products/ocean-5l.png',
  'ZamZam 19L': 'products/zamzam-19l.png',
  'ZamZam 10L': 'products/zamzam-10l.png',
  'ZamZam 5L': 'products/zamzam-5l.png',
  'Crystal 19L': 'products/crystal-19l.png',
  'Crystal 5L': 'products/crystal-19l.png', // Use 19L for 5L if no specific file
};

async function uploadImage(localPath, storagePath) {
  const fullPath = path.join(ASSETS_BASE, localPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  File not found: ${fullPath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const contentType = 'image/png';

  const { data, error } = await supabase.storage
    .from('images')
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.log(`  Upload error for ${storagePath}:`, error.message);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(storagePath);

  return publicUrl;
}

async function updateFirmLogos() {
  console.log('\n=== Updating Firm Logos ===');

  // Get all firms
  const { data: firms, error } = await supabase
    .from('firms')
    .select('id, name, logo_url');

  if (error) {
    console.error('Error fetching firms:', error);
    return;
  }

  for (const firm of firms) {
    const localFile = firmLogos[firm.name];
    if (!localFile) {
      console.log(`No logo mapping for firm: ${firm.name}`);
      continue;
    }

    console.log(`Uploading logo for ${firm.name}...`);
    const storagePath = `firms/${firm.name.toLowerCase().replace(/\s/g, '-')}-logo.png`;
    const publicUrl = await uploadImage(localFile, storagePath);

    if (publicUrl) {
      const { error: updateError } = await supabase
        .from('firms')
        .update({ logo_url: publicUrl })
        .eq('id', firm.id);

      if (updateError) {
        console.log(`  Error updating ${firm.name}:`, updateError.message);
      } else {
        console.log(`  Updated ${firm.name}: ${publicUrl}`);
      }
    }
  }
}

async function updateProductImages() {
  console.log('\n=== Updating Product Images ===');

  // Get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  for (const product of products) {
    const localFile = productImages[product.name];
    if (!localFile) {
      console.log(`No image mapping for product: ${product.name}`);
      continue;
    }

    console.log(`Uploading image for ${product.name}...`);
    const storagePath = `products/${product.name.toLowerCase().replace(/\s/g, '-')}.png`;
    const publicUrl = await uploadImage(localFile, storagePath);

    if (publicUrl) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', product.id);

      if (updateError) {
        console.log(`  Error updating ${product.name}:`, updateError.message);
      } else {
        console.log(`  Updated ${product.name}: ${publicUrl}`);
      }
    }
  }
}

async function main() {
  console.log('Starting image upload process...');
  console.log('Supabase URL:', SUPABASE_URL);

  // First check if storage bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    console.log('\nNote: You may need to create a public storage bucket named "images" in Supabase Dashboard.');
    console.log('Go to: Storage > New bucket > Name: "images" > Public: true');
  } else {
    console.log('Available buckets:', buckets?.map(b => b.name) || 'none');

    const imagesBucket = buckets?.find(b => b.name === 'images');
    if (!imagesBucket) {
      console.log('\nCreating "images" bucket...');
      const { error: createError } = await supabase.storage.createBucket('images', {
        public: true,
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
        console.log('Please create the bucket manually in Supabase Dashboard.');
        return;
      }
    }
  }

  await updateFirmLogos();
  await updateProductImages();

  console.log('\n=== Done! ===');
}

main().catch(console.error);
