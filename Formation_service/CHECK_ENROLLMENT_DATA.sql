-- Check what's in the sessions table
SELECT id, course_id, enrolled_count, status, start_at 
FROM sessions 
WHERE id IN (4, 5, 6, 9)
ORDER BY id;

-- Check if session_enrollments table exists and has data
SELECT * FROM session_enrollments;

-- Check the old enrollments table
SELECT id, user_id, course_id, status, created_at 
FROM enrollments 
LIMIT 10;

-- See which courses these sessions belong to
SELECT s.id as session_id, s.course_id, c.title, s.enrolled_count
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.id IN (4, 5, 6, 9);
