-- Fix 400 Bad Request when enrolling in sessions

-- 1. Check current session status
SELECT id, course_id, status, capacity, enrolled_count, start_at, end_at
FROM sessions
WHERE id = 9;

-- 2. Open the session if it's not already open
UPDATE sessions 
SET status = 'OPEN' 
WHERE id = 9 AND status != 'OPEN';

-- 3. Check if user is already enrolled in the course
SELECT * FROM enrollments 
WHERE user_id = 14 AND course_id = (SELECT course_id FROM sessions WHERE id = 9);

-- 4. Check if user is already enrolled in the session
SELECT * FROM session_enrollments 
WHERE user_id = 14 AND session_id = 9;

-- 5. Check the course status
SELECT c.id, c.title, c.status, c.access_level
FROM courses c
JOIN sessions s ON c.id = s.course_id
WHERE s.id = 9;

-- 6. Make sure the course is published
UPDATE courses c
JOIN sessions s ON c.id = s.course_id
SET c.status = 'PUBLISHED'
WHERE s.id = 9 AND c.status != 'PUBLISHED';

-- 7. Check user subscription (if access control is enabled)
SELECT * FROM user_subscriptions 
WHERE user_id = 14 AND status = 'ACTIVE';

-- Final verification
SELECT 
    s.id as session_id,
    s.status as session_status,
    c.title as course_title,
    c.status as course_status,
    c.access_level,
    s.capacity,
    s.enrolled_count,
    (SELECT COUNT(*) FROM enrollments WHERE user_id = 14 AND course_id = c.id) as already_enrolled_in_course,
    (SELECT COUNT(*) FROM session_enrollments WHERE user_id = 14 AND session_id = s.id) as already_enrolled_in_session
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.id = 9;
