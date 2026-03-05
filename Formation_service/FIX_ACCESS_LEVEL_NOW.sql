-- URGENT FIX: Set access_level for all existing courses
-- Run this script in your MySQL database NOW

-- Step 1: Add column if it doesn't exist (safe to run multiple times)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS access_level VARCHAR(20);

-- Step 2: Update all courses based on their level
UPDATE courses 
SET access_level = CASE 
    WHEN level = 'BEGINNER' THEN 'BASIC'
    WHEN level = 'INTERMEDIATE' THEN 'PLUS'
    WHEN level = 'ADVANCED' THEN 'PREMIUM'
    ELSE 'BASIC'
END
WHERE access_level IS NULL OR access_level = '';

-- Step 3: Set default for any remaining NULL values
UPDATE courses 
SET access_level = 'BASIC' 
WHERE access_level IS NULL OR access_level = '';

-- Step 4: CRITICAL - Ensure courses are PUBLISHED
UPDATE courses 
SET status = 'PUBLISHED' 
WHERE status IS NULL OR status = '' OR status = 'DRAFT';

-- Step 5: Verify the fix
SELECT 
    id,
    title,
    level,
    access_level,
    status
FROM courses
ORDER BY id;

-- You should see access_level populated and status = 'PUBLISHED' for all courses
