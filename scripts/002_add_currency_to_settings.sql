-- Add currency setting for price display
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'CAD';

-- Backfill any existing nulls (defensive)
UPDATE settings
SET currency = 'CAD'
WHERE currency IS NULL;
