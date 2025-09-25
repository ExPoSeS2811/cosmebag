-- Добавляем колонку following_count если её еще нет
ALTER TABLE cosmetic_bags
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Создаем или заменяем функцию для обновления счетчиков
CREATE OR REPLACE FUNCTION update_bag_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Увеличиваем счетчик подписчиков у косметички, на которую подписались
    UPDATE cosmetic_bags
    SET followers_count = COALESCE(followers_count, 0) + 1
    WHERE id = NEW.following_bag_id;

    -- Увеличиваем счетчик подписок у пользователя через его косметичку
    UPDATE cosmetic_bags
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE user_id = NEW.follower_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Уменьшаем счетчик подписчиков
    UPDATE cosmetic_bags
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
    WHERE id = OLD.following_bag_id;

    -- Уменьшаем счетчик подписок
    UPDATE cosmetic_bags
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE user_id = OLD.follower_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS update_bag_subscription_counts_trigger ON bag_subscriptions;

-- Создаем новый триггер
CREATE TRIGGER update_bag_subscription_counts_trigger
AFTER INSERT OR DELETE ON bag_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_bag_follower_counts();

-- Пересчитываем текущие счетчики для всех косметичек
UPDATE cosmetic_bags cb
SET
  followers_count = (
    SELECT COUNT(*)
    FROM bag_subscriptions
    WHERE following_bag_id = cb.id
  ),
  following_count = (
    SELECT COUNT(*)
    FROM bag_subscriptions
    WHERE follower_id = cb.user_id
  );