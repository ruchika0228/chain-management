-- ============================================================
--  Migration: Update holidays table to track created_by
-- ============================================================
USE it_crms;

-- Add created_by column to holidays table if it doesn't exist
ALTER TABLE holidays 
ADD COLUMN IF NOT EXISTS created_by INT NOT NULL DEFAULT 1 AFTER holiday_date;

-- Add foreign key constraint if it doesn't exist
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE table_schema = 'it_crms'
    AND table_name = 'holidays'
    AND constraint_name = 'holidays_ibfk_1'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE holidays ADD CONSTRAINT holidays_ibfk_1 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for created_by if it doesn't exist
ALTER TABLE holidays ADD INDEX IF NOT EXISTS idx_created_by (created_by);