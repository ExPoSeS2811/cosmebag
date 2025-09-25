-- Create bag_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS bag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id UUID NOT NULL REFERENCES cosmetic_bags(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('owned', 'wishlist')),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  purchase_date DATE,
  expiry_date DATE,
  usage_context TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 1,
  price_alert_threshold NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bag_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bag_items_bag_id ON bag_items(bag_id);
CREATE INDEX IF NOT EXISTS idx_bag_items_product_id ON bag_items(product_id);
CREATE INDEX IF NOT EXISTS idx_bag_items_status ON bag_items(status);
CREATE INDEX IF NOT EXISTS idx_bag_items_product_data ON bag_items USING GIN(product_data);

-- Enable Row Level Security
ALTER TABLE bag_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bag items"
  ON bag_items FOR SELECT
  USING (
    bag_id IN (
      SELECT id FROM cosmetic_bags WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own bag items"
  ON bag_items FOR INSERT
  WITH CHECK (
    bag_id IN (
      SELECT id FROM cosmetic_bags WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own bag items"
  ON bag_items FOR UPDATE
  USING (
    bag_id IN (
      SELECT id FROM cosmetic_bags WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own bag items"
  ON bag_items FOR DELETE
  USING (
    bag_id IN (
      SELECT id FROM cosmetic_bags WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_bag_items_updated_at ON bag_items;
CREATE TRIGGER update_bag_items_updated_at
  BEFORE UPDATE ON bag_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();