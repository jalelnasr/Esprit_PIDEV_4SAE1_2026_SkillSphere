-- Update existing courses to set access_level based on their difficulty level
-- This script should be run once to migrate existing data

-- First, check if access_level column exists, if not add it
-- (Hibernate should have already added it, but just in case)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'BASIC';

-- Update courses based on their level (difficulty)
-- BEGINNER courses → BASIC access
UPDATE courses 
SET access_level = 'BASIC' 
WHERE level = 'BEGINNER' AND (access_level IS NULL OR access_level = '');

-- INTERMEDIATE courses → PLUS access
UPDATE courses 
SET access_level = 'PLUS' 
WHERE level = 'INTERMEDIATE' AND (access_level IS NULL OR access_level = '');

-- ADVANCED courses → PREMIUM access
UPDATE courses 
SET access_level = 'PREMIUM' 
WHERE level = 'ADVANCED' AND (access_level IS NULL OR access_level = '');

-- Set default BASIC for any remaining NULL values
UPDATE courses 
SET access_level = 'BASIC' 
WHERE access_level IS NULL OR access_level = '';

-- Verify the update
SELECT 
    id,
    title,
    level,
    access_level,
    status
FROM courses
ORDER BY id;
