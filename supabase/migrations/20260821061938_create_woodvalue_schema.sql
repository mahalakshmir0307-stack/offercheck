/*
# WoodValue Core Schema

## Overview
Creates the core database tables for the WoodValue sawmill wood-reuse management app.

## New Tables
1. `wood_pieces` — Records of leftover wood pieces entered by the sawmill owner
   - id (uuid, primary key)
   - user_id (uuid, owner of the piece, defaults to auth.uid())
   - wood_type (text, e.g. Oak, Pine, Teak)
   - length_cm, width_cm, thickness_cm (numeric, dimensions in centimeters)
   - quantity (integer, number of pieces)
   - status (text: available, reused, discarded, reserved)
   - notes (text, optional)
   - created_at, updated_at (timestamps)

2. `products` — Records of products created from reused leftover wood
   - id (uuid, primary key)
   - user_id (uuid, owner)
   - wood_piece_id (uuid, FK to wood_pieces, nullable)
   - name, product_type (text)
   - quantity (integer)
   - estimated_value (numeric, estimated revenue)
   - created_at, updated_at (timestamps)

3. `activity_logs` — Recent activity for the dashboard feed
   - id (uuid, primary key)
   - user_id (uuid, owner)
   - action, entity_type, entity_id, description (text)
   - created_at (timestamp)

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD policies (TO authenticated, using auth.uid() = user_id).
- user_id columns default to auth.uid().

## Important Notes
1. All tables are owner-scoped — each sawmill owner only sees their own data.
2. user_id defaults to auth.uid() so frontend inserts that omit user_id will succeed.
3. Status values validated via CHECK constraint.
*/

-- ============================================================
-- WOOD PIECES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS wood_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  wood_type text NOT NULL,
  length_cm numeric NOT NULL CHECK (length_cm > 0),
  width_cm numeric NOT NULL CHECK (width_cm > 0),
  thickness_cm numeric NOT NULL CHECK (thickness_cm > 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reused', 'discarded', 'reserved')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wood_pieces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wood_pieces" ON wood_pieces;
CREATE POLICY "select_own_wood_pieces" ON wood_pieces FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wood_pieces" ON wood_pieces;
CREATE POLICY "insert_own_wood_pieces" ON wood_pieces FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_wood_pieces" ON wood_pieces;
CREATE POLICY "update_own_wood_pieces" ON wood_pieces FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wood_pieces" ON wood_pieces;
CREATE POLICY "delete_own_wood_pieces" ON wood_pieces FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  wood_piece_id uuid REFERENCES wood_pieces(id) ON DELETE SET NULL,
  name text NOT NULL,
  product_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  estimated_value numeric NOT NULL DEFAULT 0 CHECK (estimated_value >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_products" ON products;
CREATE POLICY "select_own_products" ON products FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ACTIVITY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activity_logs" ON activity_logs;
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activity_logs" ON activity_logs;
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activity_logs" ON activity_logs;
CREATE POLICY "delete_own_activity_logs" ON activity_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wood_pieces_user_id ON wood_pieces(user_id);
CREATE INDEX IF NOT EXISTS idx_wood_pieces_status ON wood_pieces(status);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wood_pieces_updated_at ON wood_pieces;
CREATE TRIGGER trigger_wood_pieces_updated_at BEFORE UPDATE ON wood_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
