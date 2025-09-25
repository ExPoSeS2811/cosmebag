-- Этот SQL отключает подтверждение email для всех новых пользователей
-- Выполните его в Supabase SQL Editor

-- Создаем триггер для автоматического подтверждения email при регистрации
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_confirm_email();

-- Подтверждаем email для всех существующих пользователей
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;