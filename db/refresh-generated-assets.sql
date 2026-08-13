UPDATE products
SET image_url = replace(image_url, '.jpg', '.png'),
    gallery_json = replace(gallery_json, '.jpg', '.png'),
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  'amour-bleu',
  'pastel-poetry',
  'morning-mist',
  'garden-whisper',
  'spring-lullaby',
  'blue-sonata',
  'romance-deep',
  'sunlit-joy'
);
