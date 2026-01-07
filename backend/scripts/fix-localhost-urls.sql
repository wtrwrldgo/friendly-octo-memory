-- Fix localhost URLs in firms table
UPDATE firms
SET logo_url = REPLACE(logo_url, 'http://localhost:3001', 'http://45.92.173.121'),
    home_banner_url = REPLACE(home_banner_url, 'http://localhost:3001', 'http://45.92.173.121'),
    detail_banner_url = REPLACE(detail_banner_url, 'http://localhost:3001', 'http://45.92.173.121')
WHERE logo_url LIKE '%localhost%'
   OR home_banner_url LIKE '%localhost%'
   OR detail_banner_url LIKE '%localhost%';

-- Fix localhost URLs in products table
UPDATE products
SET image_url = REPLACE(image_url, 'http://localhost:3001', 'http://45.92.173.121')
WHERE image_url LIKE '%localhost%';

-- Verify the fix
SELECT id, name, logo_url, home_banner_url, detail_banner_url FROM firms WHERE logo_url IS NOT NULL;
