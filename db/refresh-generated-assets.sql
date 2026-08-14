UPDATE products
SET image_url = replace(replace(replace(image_url, '.jpeg', '.webp'), '.jpg', '.webp'), '.png', '.webp'),
    gallery_json = replace(replace(replace(gallery_json, '.jpeg', '.webp'), '.jpg', '.webp'), '.png', '.webp'),
    updated_at = CURRENT_TIMESTAMP
WHERE active = 1
  AND (
    image_url LIKE '/products/%.jpeg'
    OR image_url LIKE '/products/%.jpg'
    OR image_url LIKE '/products/%.png'
  );
