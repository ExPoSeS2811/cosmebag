-- Function to add product to bag
CREATE OR REPLACE FUNCTION add_product_to_bag(
  p_product_id TEXT,
  p_product_data JSONB,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_bag_id UUID;
  v_result JSONB;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get or create user's bag
  SELECT id INTO v_bag_id
  FROM cosmetic_bags
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_bag_id IS NULL THEN
    -- Create default bag for user
    INSERT INTO cosmetic_bags (user_id, name, emoji)
    VALUES (v_user_id, 'Моя косметичка', '💄')
    RETURNING id INTO v_bag_id;
  END IF;

  -- Insert or update bag item
  INSERT INTO bag_items (
    bag_id,
    product_id,
    product_data,
    status,
    notes,
    added_at
  ) VALUES (
    v_bag_id,
    p_product_id,
    p_product_data,
    'owned',
    p_notes,
    NOW()
  )
  ON CONFLICT (bag_id, product_id)
  DO UPDATE SET
    product_data = EXCLUDED.product_data,
    notes = COALESCE(EXCLUDED.notes, bag_items.notes),
    updated_at = NOW()
  RETURNING jsonb_build_object(
    'id', id,
    'product_id', product_id,
    'status', status
  ) INTO v_result;

  -- Update products count
  UPDATE cosmetic_bags
  SET products_count = (
    SELECT COUNT(*)
    FROM bag_items
    WHERE bag_id = v_bag_id AND status = 'owned'
  )
  WHERE id = v_bag_id;

  -- Log activity
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    v_user_id,
    'product_added',
    'bag_item',
    (v_result->>'id')::UUID,
    jsonb_build_object(
      'product_name', p_product_data->>'name',
      'brand', p_product_data->>'brand',
      'bag_id', v_bag_id
    )
  );

  RETURN v_result;
END;
$$;

-- Function to add product to wishlist
CREATE OR REPLACE FUNCTION add_to_wishlist(
  p_product_id TEXT,
  p_product_data JSONB,
  p_priority INTEGER DEFAULT 1,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_bag_id UUID;
  v_result JSONB;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get or create user's bag
  SELECT id INTO v_bag_id
  FROM cosmetic_bags
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_bag_id IS NULL THEN
    -- Create default bag for user
    INSERT INTO cosmetic_bags (user_id, name, emoji)
    VALUES (v_user_id, 'Моя косметичка', '💄')
    RETURNING id INTO v_bag_id;
  END IF;

  -- Insert or update wishlist item
  INSERT INTO bag_items (
    bag_id,
    product_id,
    product_data,
    status,
    priority,
    notes,
    added_at
  ) VALUES (
    v_bag_id,
    p_product_id,
    p_product_data,
    'wishlist',
    p_priority,
    p_notes,
    NOW()
  )
  ON CONFLICT (bag_id, product_id)
  DO UPDATE SET
    product_data = EXCLUDED.product_data,
    priority = EXCLUDED.priority,
    notes = COALESCE(EXCLUDED.notes, bag_items.notes),
    updated_at = NOW()
  RETURNING jsonb_build_object(
    'id', id,
    'product_id', product_id,
    'status', status
  ) INTO v_result;

  -- Log activity
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    v_user_id,
    'wishlist_added',
    'bag_item',
    (v_result->>'id')::UUID,
    jsonb_build_object(
      'product_name', p_product_data->>'name',
      'brand', p_product_data->>'brand',
      'bag_id', v_bag_id
    )
  );

  RETURN v_result;
END;
$$;

-- Function to move product from wishlist to owned
CREATE OR REPLACE FUNCTION move_to_owned(
  p_product_id TEXT,
  p_purchase_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_bag_id UUID;
  v_result JSONB;
  v_product_data JSONB;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's bag
  SELECT id INTO v_bag_id
  FROM cosmetic_bags
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_bag_id IS NULL THEN
    RAISE EXCEPTION 'User bag not found';
  END IF;

  -- Get product data
  SELECT product_data INTO v_product_data
  FROM bag_items
  WHERE bag_id = v_bag_id AND product_id = p_product_id;

  -- Update status to owned
  UPDATE bag_items
  SET
    status = 'owned',
    purchase_date = p_purchase_date,
    updated_at = NOW()
  WHERE bag_id = v_bag_id AND product_id = p_product_id
  RETURNING jsonb_build_object(
    'id', id,
    'product_id', product_id,
    'status', status
  ) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Product not found in bag';
  END IF;

  -- Update products count
  UPDATE cosmetic_bags
  SET products_count = (
    SELECT COUNT(*)
    FROM bag_items
    WHERE bag_id = v_bag_id AND status = 'owned'
  )
  WHERE id = v_bag_id;

  -- Log activity
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    v_user_id,
    'product_purchased',
    'bag_item',
    (v_result->>'id')::UUID,
    jsonb_build_object(
      'product_name', v_product_data->>'name',
      'brand', v_product_data->>'brand',
      'bag_id', v_bag_id,
      'purchase_date', p_purchase_date
    )
  );

  RETURN v_result;
END;
$$;

-- Function to get user's bag
CREATE OR REPLACE FUNCTION get_user_bag()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  emoji TEXT,
  products_count INTEGER,
  followers_count INTEGER,
  is_public BOOLEAN,
  share_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    cb.id,
    cb.name,
    cb.description,
    cb.emoji,
    cb.products_count,
    cb.followers_count,
    cb.is_public,
    cb.share_token
  FROM cosmetic_bags cb
  WHERE cb.user_id = v_user_id
  LIMIT 1;
END;
$$;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_bag_id UUID;
  v_stats JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_bag_id
  FROM cosmetic_bags
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_bag_id IS NULL THEN
    RETURN jsonb_build_object(
      'total_products', 0,
      'wishlist_count', 0,
      'favorites_count', 0,
      'categories_count', 0
    );
  END IF;

  SELECT jsonb_build_object(
    'total_products', COUNT(CASE WHEN status = 'owned' THEN 1 END),
    'wishlist_count', COUNT(CASE WHEN status = 'wishlist' THEN 1 END),
    'favorites_count', COUNT(CASE WHEN is_favorite = true THEN 1 END),
    'categories_count', COUNT(DISTINCT product_data->>'category')
  ) INTO v_stats
  FROM bag_items
  WHERE bag_id = v_bag_id;

  RETURN v_stats;
END;
$$;