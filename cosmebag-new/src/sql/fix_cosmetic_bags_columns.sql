-- Добавляем недостающие колонки в таблицу cosmetic_bags, если их еще нет

-- image_url для изображения косметички
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- bio для описания косметички
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS bio TEXT;

-- display_name для отображаемого имени косметички
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- followers_count для счетчика подписчиков
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- following_count для счетчика подписок
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- products_count для счетчика продуктов
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS products_count INTEGER DEFAULT 0;

-- Обновляем display_name из name если он пустой
UPDATE cosmetic_bags
SET display_name = name
WHERE display_name IS NULL AND name IS NOT NULL;

-- Пересчитываем количество продуктов
UPDATE cosmetic_bags cb
SET products_count = (
  SELECT COUNT(*)
  FROM bag_items
  WHERE bag_id = cb.id AND status = 'owned'
);