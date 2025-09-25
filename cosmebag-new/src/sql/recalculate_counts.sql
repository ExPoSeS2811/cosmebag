-- Пересчитываем счетчики подписчиков и подписок для всех косметичек
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

-- Проверяем результаты
SELECT
  cb.id,
  cb.display_name,
  cb.user_id,
  cb.followers_count,
  cb.following_count,
  (SELECT COUNT(*) FROM bag_subscriptions WHERE following_bag_id = cb.id) as actual_followers,
  (SELECT COUNT(*) FROM bag_subscriptions WHERE follower_id = cb.user_id) as actual_following
FROM cosmetic_bags cb
ORDER BY cb.created_at DESC;