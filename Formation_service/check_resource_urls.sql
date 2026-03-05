-- Check what URLs are stored for your resources
SELECT 
    lr.id,
    lr.title,
    lr.type,
    lr.url,
    l.title as lesson_title,
    c.title as course_title
FROM lesson_resources lr
JOIN lessons l ON lr.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
WHERE c.title = 'HAHA'
ORDER BY lr.id;

-- Check if files exist in the uploads directory
-- You need to manually check these paths on your file system:
-- Formation_service/src/main/resources/static/uploads/videos/
-- Formation_service/src/main/resources/static/uploads/pdfs/
-- Formation_service/src/main/resources/static/uploads/images/
