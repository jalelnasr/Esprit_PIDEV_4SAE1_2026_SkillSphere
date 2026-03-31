-- Add test participants for the sessions shown in your screenshot
-- This assumes you have users with IDs 1, 2, 3, 4, 5 in your users table

-- First, clear any existing test data to avoid duplicates
DELETE FROM session_enrollments WHERE session_id IN (4, 5, 6, 7, 8, 9);

-- Session 4 (Sprong boot) - 0 participants (leave empty)

-- Session 5 (angular) - 1 participant
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status, created_at) VALUES
(5, 1, '2026-03-01 10:00:00', 'ENROLLED', NOW());

-- Session 6 (sql) - 1 participant  
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status, created_at) VALUES
(6, 2, '2026-03-01 11:00:00', 'ENROLLED', NOW());

-- Session 7 (javaFx) - 0 participants (leave empty)

-- Session 8 (javaFx) - 0 participants (leave empty)

-- Session 9 (Java BasicsSS) - 1 participant
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status, created_at) VALUES
(9, 3, '2026-03-01 12:00:00', 'ENROLLED', NOW());

-- Verify the data
SELECT 'Participants added:' as info;
SELECT se.session_id, se.user_id, se.enrolled_at, se.status
FROM session_enrollments se
WHERE se.session_id IN (4, 5, 6, 7, 8, 9)
ORDER BY se.session_id;

-- Update the enrolled_count in sessions table to match
UPDATE sessions SET enrolled_count = 0 WHERE id IN (4, 7, 8);
UPDATE sessions SET enrolled_count = 1 WHERE id IN (5, 6, 9);

-- Show final result
SELECT 'Final session data:' as info;
SELECT s.id, s.course_id, s.enrolled_count, 
       (SELECT COUNT(*) FROM session_enrollments se WHERE se.session_id = s.id) as actual_enrollments
FROM sessions s
WHERE s.id IN (4, 5, 6, 7, 8, 9)
ORDER BY s.id;
