/*
# Add Product Tracking Columns

## Overview
Enhances the `products` table to support full product performance tracking:
production status, estimated cost, estimated profit, wood type source,
material volume used, and actual sale revenue.

## Modified Tables
1. `products` — adds columns:
   - `status` (text: planned, in_production, completed, sold; defaults to 'planned')
   - `estimated_cost` (numeric, defaults to 0)
   - `estimated_profit` (numeric, defaults to 0)
   - `wood_type` (text, nullable — type of wood used)
   - `material_volume_cm3` (numeric, nullable — volume of material consumed)
   - `actual_revenue` (numeric, nullable — actual sale price when sold)

## Security
- No RLS policy changes. Existing owner-scoped CRUD policies remain in effect.
- New columns inherit existing RLS policies automatically.

## Important Notes
1. All new columns use `IF NOT EXISTS` checks to be safe for re-runs.
2. `status` has a CHECK constraint to ensure valid values only.
3. Existing product rows get 'planned' status and 0 cost/profit defaults.
4. No data is lost — only additive columns.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products ADD COLUMN status text NOT NULL DEFAULT 'planned'
      CHECK (status IN ('planned', 'in_production', 'completed', 'sold'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'estimated_cost'
  ) THEN
    ALTER TABLE products ADD COLUMN estimated_cost numeric NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'estimated_profit'
  ) THEN
    ALTER TABLE products ADD COLUMN estimated_profit numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'wood_type'
  ) THEN
    ALTER TABLE products ADD COLUMN wood_type text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'material_volume_cm3'
  ) THEN
    ALTER TABLE products ADD COLUMN material_volume_cm3 numeric;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'actual_revenue'
  ) THEN
    ALTER TABLE products ADD COLUMN actual_revenue numeric CHECK (actual_revenue >= 0);
  END IF;
END $$;
