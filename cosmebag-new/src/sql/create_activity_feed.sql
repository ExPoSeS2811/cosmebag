-- Создаем таблицу для ленты активности
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bag_id UUID REFERENCES cosmetic_bags(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'added_product', 'removed_product', 'wishlist_to_bag', etc.
  product_info JSONB, -- Информация о продукте
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT activity_feed_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Индекс для быстрого поиска активности по косметичке
CREATE INDEX IF NOT EXISTS idx_activity_feed_bag_id ON activity_feed(bag_id);

-- Индекс для быстрого поиска активности по времени
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);

-- RLS политики
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть активность косметичек, на которые подписаны
CREATE POLICY "Users can view activity from bags they follow" ON activity_feed
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM bag_subscriptions bs
      WHERE bs.follower_id = auth.uid()
      AND bs.following_bag_id = activity_feed.bag_id
    )
    OR user_id = auth.uid() -- Пользователь может видеть свою активность
  );

-- Пользователь может создавать активность только для своей косметички
CREATE POLICY "Users can create activity for their own bags" ON activity_feed
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Функция для автоматической записи активности при добавлении товара
CREATE OR REPLACE FUNCTION log_product_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (user_id, bag_id, action_type, product_info)
    VALUES (
      (SELECT user_id FROM cosmetic_bags WHERE id = NEW.bag_id),
      NEW.bag_id,
      'added_product',
      jsonb_build_object(
        'product_id', NEW.product_id,
        'product_name', NEW.product_name,
        'product_brand', NEW.product_brand,
        'product_image', NEW.product_image_url,
        'status', NEW.status
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_feed (user_id, bag_id, action_type, product_info)
    VALUES (
      (SELECT user_id FROM cosmetic_bags WHERE id = OLD.bag_id),
      OLD.bag_id,
      'removed_product',
      jsonb_build_object(
        'product_id', OLD.product_id,
        'product_name', OLD.product_name,
        'product_brand', OLD.product_brand
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO activity_feed (user_id, bag_id, action_type, product_info)
    VALUES (
      (SELECT user_id FROM cosmetic_bags WHERE id = NEW.bag_id),
      NEW.bag_id,
      CASE
        WHEN NEW.status = 'owned' AND OLD.status = 'wishlist' THEN 'wishlist_to_bag'
        WHEN NEW.status = 'wishlist' AND OLD.status = 'owned' THEN 'bag_to_wishlist'
        ELSE 'status_changed'
      END,
      jsonb_build_object(
        'product_id', NEW.product_id,
        'product_name', NEW.product_name,
        'product_brand', NEW.product_brand,
        'product_image', NEW.product_image_url,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для логирования активности
DROP TRIGGER IF EXISTS log_bag_items_activity ON bag_items;
CREATE TRIGGER log_bag_items_activity
AFTER INSERT OR DELETE OR UPDATE ON bag_items
FOR EACH ROW
EXECUTE FUNCTION log_product_activity();