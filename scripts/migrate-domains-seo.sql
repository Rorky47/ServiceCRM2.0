-- Migration script to add domains and seo columns to sites table
-- Run this directly on your PostgreSQL database if the automatic migration doesn't work

-- Add domains column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'domains'
    ) THEN
        ALTER TABLE sites ADD COLUMN domains TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added domains column';
    ELSE
        RAISE NOTICE 'domains column already exists';
    END IF;
END $$;

-- Add seo column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sites' 
        AND column_name = 'seo'
    ) THEN
        ALTER TABLE sites ADD COLUMN seo JSONB;
        RAISE NOTICE 'Added seo column';
    ELSE
        RAISE NOTICE 'seo column already exists';
    END IF;
END $$;

-- Update existing sites to have empty domains array if null
UPDATE sites SET domains = '{}' WHERE domains IS NULL;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'sites' 
AND column_name IN ('domains', 'seo');

