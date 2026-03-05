-- Delete corrupted resources from HAHA formation
-- Run this to clean up the corrupted data

-- First, check what will be deleted
SELECT 
    lr.id,
    lr.title,
    lr.type,
    lr.url,
    c.title as course_title
FROM lesson_resources lr
JOIN lessons l ON lr.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
WHERE c.title = 'HAHA';

-- If the URLs look corrupted (contain jdbc:h2:~/test), run this:
DELETE FROM lesson_resources 
WHERE lesson_id IN (
    SELECT l.id 
    FROM lessons l
    JOIN courses c ON l.course_id = c.id
    WHERE c.title = 'HAHA'
);

-- Verify they're deleted
SELECT COUNT(*) as remaining_resources
FROM lesson_resources lr
JOIN lessons l ON lr.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
WHERE c.title = 'HAHA';
-- Should return 0

-- Now you can re-upload the resources through the UI
