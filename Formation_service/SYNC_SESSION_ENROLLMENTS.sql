-- This script syncs session_enrollments with existing enrollments data
-- It creates session_enrollment records based on course enrollments

-- First, let's see what we have
SELECT 'Current sessions with enrolled_count > 0:' as info;
SELECT id, course_id, enrolled_count, status 
FROM sessions 
WHERE enrolled_count > 0;

SELECT 'Current enrollments:' as info;
SELECT id, user_id, course_id, status 
FROM enrollments;

-- Now let's create session_enrollments based on course enrollments
-- For each active enrollment, create a session_enrollment for the most recent OPEN session of that course

INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status, created_at)
SELECT 
    s.id as session_id,
    e.user_id,
    e.created_at as enrolled_at,
    'ENROLLED' as status,
    NOW() as created_at
FROM enrollments e
JOIN sessions s ON s.course_id = e.course_id
WHERE e.status = 'ACTIVE'
  AND s.status = 'OPEN'
  AND NOT EXISTS (
      SELECT 1 FROM session_enrollments se 
      WHERE se.session_id = s.id AND se.user_id = e.user_id
  )
ORDER BY e.created_at;

-- Verify the results
SELECT 'Session enrollments after sync:' as info;
SELECT se.id, se.session_id, se.user_id, se.status, s.course_id, c.title
FROM session_enrollments se
JOIN sessions s ON se.session_id = s.id
JOIN courses c ON s.course_id = c.id
ORDER BY se.session_id, se.user_id;

-- Update enrolled_count to match actual enrollments
UPDATE sessions s
SET enrolled_count = (
    SELECT COUNT(*) 
    FROM session_enrollments se 
    WHERE se.session_id = s.id
)
WHERE s.id IN (SELECT DISTINCT session_id FROM session_enrollments);

-- Show final counts
SELECT 'Final session counts:' as info;
SELECT s.id, c.title, s.enrolled_count, 
       (SELECT COUNT(*) FROM session_enrollments se WHERE se.session_id = s.id) as actual_count
FROM sessions s
JOIN courses c ON s.course_id = c.id
WHERE s.enrolled_count > 0 OR EXISTS (SELECT 1 FROM session_enrollments se WHERE se.session_id = s.id);
