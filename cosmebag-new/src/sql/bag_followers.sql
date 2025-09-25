-- Создаем таблицу для подписчиков косметичек
CREATE TABLE IF NOT EXISTS bag_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_bag_id UUID NOT NULL REFERENCES cosmetic_bags(id) ON DELETE CASCADE,
  following_bag_id UUID NOT NULL REFERENCES cosmetic_bags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Уникальное ограничение чтобы нельзя было подписаться дважды
  UNIQUE(follower_bag_id, following_bag_id),

  -- Нельзя подписаться на свою же косметичку
  CHECK (follower_bag_id != following_bag_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_bag_followers_follower ON bag_followers(follower_bag_id);
CREATE INDEX IF NOT EXISTS idx_bag_followers_following ON bag_followers(following_bag_id);

-- RLS политики
ALTER TABLE bag_followers ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра подписчиков (все могут видеть)
CREATE POLICY "Anyone can view followers" ON bag_followers
  FOR SELECT USING (true);

-- Политика для создания подписок (только владелец follower_bag_id может подписываться)
CREATE POLICY "Users can follow bags" ON bag_followers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cosmetic_bags
      WHERE cosmetic_bags.id = follower_bag_id
      AND cosmetic_bags.user_id = auth.uid()
    )
  );

-- Политика для отписки (только владелец follower_bag_id может отписываться)
CREATE POLICY "Users can unfollow bags" ON bag_followers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cosmetic_bags
      WHERE cosmetic_bags.id = follower_bag_id
      AND cosmetic_bags.user_id = auth.uid()
    )
  );

-- Триггер для обновления счетчиков подписчиков
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Увеличиваем счетчик подписчиков у того, на кого подписались
    UPDATE cosmetic_bags
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_bag_id;

    -- Увеличиваем счетчик подписок у того, кто подписался
    UPDATE cosmetic_bags
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE id = NEW.follower_bag_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Уменьшаем счетчик подписчиков у того, от кого отписались
    UPDATE cosmetic_bags
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.following_bag_id;

    -- Уменьшаем счетчик подписок у того, кто отписался
    UPDATE cosmetic_bags
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE id = OLD.follower_bag_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
CREATE TRIGGER update_follower_counts_trigger
AFTER INSERT OR DELETE ON bag_followers
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();