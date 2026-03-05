-- Add test enrollments for sessions 4, 5, 6, 9

-- First, check what courses these sessions belong to
SELECT s.id as session_id, s.course_id, c.title 
FROM sessions s 
JOIN courses c ON s.course_id = c.id 
WHERE s.id IN (4, 5, 6, 9);

-- Add enrollments for these courses
-- Session 5 (angular) - course_id should be from above query
INSERT INTO enrollments (user_id, course_id, status, completion_percent, enrolled_at, created_at)
SELECT 14, s.course_id, 'ACTIVE', 0, NOW(), NOW()
FROM sessions s 
WHERE s.id = 5
AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = 14 AND course_id = s.course_id);

-- Add more test users for session 5
INSERT INTO enrollments (user_id, course_id, status, completion_percent, enrolled_at, created_at)
SELECT 1, s.course_id, 'ACTIVE', 0, NOW(), NOW()
FROM sessions s 
WHERE s.id = 5
AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = 1 AND course_id = s.course_id);

INSERT INTO enrollments (user_id, course_id, status, completion_percent, enrolled_at, created_at)
SELECT 2, s.course_id, 'ACTIVE', 0, NOW(), NOW()
FROM sessions s 
WHERE s.id = 5
AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = 2 AND course_id = s.course_id);

-- Session 6 (sql)
INSERT INTO enrollments (user_id, course_id, status, completion_percent, enrolled_at, created_at)
SELECT 3, s.course_id, 'ACTIVE', 0, NOW(), NOW()
FROM sessions s 
WHERE s.id = 6
AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = 3 AND course_id = s.course_id);

-- Session 9 (Java BasicsSS)
INSERT INTO enrollments (user_id, course_id, status, completion_percent, enrolled_at, created_at)
SELECT 4, s.course_id, 'ACTIVE', 0, NOW(), NOW()
FROM sessions s 
WHERE s.id = 9
AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = 4 AND course_id = s.course_id);

-- Verify the enrollments
SELECT 
    s.id as session_id,
    c.title as course_title,
    COUNT(e.id) as enrollment_count
FROM sessions s
JOIN courses c ON s.course_id = c.id
LEFT JOIN enrollments e ON e.course_id = s.course_id AND e.status = 'ACTIVE'
WHERE s.id IN (4, 5, 6, 9)
GROUP BY s.id, c.title;

-- Show the participants
SELECT 
    s.id as session_id,
    e.user_id,
    u.username,
    u.email,
    u.phone_number,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    e.enrolled_at
FROM sessions s
JOIN enrollments e ON e.course_id = s.course_id
LEFT JOIN users u ON e.user_id = u.id_user
WHERE s.id = 5
AND e.status = 'ACTIVE';
