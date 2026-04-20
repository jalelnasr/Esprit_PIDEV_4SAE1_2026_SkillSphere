-- Quick diagnostic script to check your database state

-- 1. Check if courses table exists
SHOW TABLES LIKE 'courses';

-- 2. Check table structure (verify access_level column exists)
DESCRIBE courses;

-- 3. Count total courses
SELECT COUNT(*) as total_courses FROM courses;

-- 4. Check courses and their access_level values
SELECT 
    id,
    title,
    level,
    access_level,
    status,
    created_at
FROM courses
ORDER BY id;

-- 5. Check for NULL or empty access_level values
SELECT COUNT(*) as courses_without_access_level 
FROM courses 
WHERE access_level IS NULL OR access_level = '';

-- 6. Check subscription tables exist
SHOW TABLES LIKE 'subscription%';
