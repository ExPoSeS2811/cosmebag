-- Функция для проверки, что пользователь не подписывается на свою косметичку
CREATE OR REPLACE FUNCTION check_not_self_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, что follower_id и владелец following_bag_id - это разные пользователи
  IF NEW.follower_id = (
    SELECT user_id
    FROM cosmetic_bags
    WHERE id = NEW.following_bag_id
  ) THEN
    RAISE EXCEPTION 'Вы не можете подписаться на свою косметичку';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS prevent_self_subscription ON bag_subscriptions;

-- Создаем триггер
CREATE TRIGGER prevent_self_subscription
BEFORE INSERT ON bag_subscriptions
FOR EACH ROW
EXECUTE FUNCTION check_not_self_subscription();

-- Удаляем существующие самоподписки если есть
DELETE FROM bag_subscriptions bs
USING cosmetic_bags cb
WHERE bs.following_bag_id = cb.id
  AND bs.follower_id = cb.user_id;