-- ============================================
-- Test Data for Instructor Statistics
-- ============================================
-- This script adds test enrollments and progress
-- so you can see real statistics in the dashboard
-- ============================================

-- Assumptions:
-- - You have a FORMATEUR user with ID = 2 (adjust if needed)
-- - You have courses created by this instructor
-- - You have students with IDs 3, 4, 5, 6, 7 (adjust if needed)

-- ============================================
-- Step 1: Create Test Enrollments
-- ============================================

-- Enroll 5 students in course ID 1 (adjust course_id if needed)
INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_percent)
VALUES 
  (3, 1, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 30 DAY), 75),
  (4, 1, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 25 DAY), 50),
  (5, 1, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 20 DAY), 100),
  (6, 1, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 15 DAY), 25),
  (7, 1, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 10 DAY), 0)
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ============================================
-- Step 2: Add Lesson Progress (Optional)
-- ============================================

-- Get the enrollment IDs (adjust based on your data)
-- Assuming enrollments got IDs 1, 2, 3, 4, 5

-- Student 1: 75% complete (3 out of 4 lessons)
INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completion_date, time_spent_minutes, last_accessed_at)
VALUES 
  (1, 1, true, DATE_SUB(NOW(), INTERVAL 28 DAY), 45, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (1, 2, true, DATE_SUB(NOW(), INTERVAL 25 DAY), 60, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (1, 3, true, DATE_SUB(NOW(), INTERVAL 20 DAY), 50, DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (1, 4, false, NULL, 15, DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE completed = VALUES(completed);

-- Student 2: 50% complete (2 out of 4 lessons)
INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completion_date, time_spent_minutes, last_accessed_at)
VALUES 
  (2, 1, true, DATE_SUB(NOW(), INTERVAL 23 DAY), 40, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (2, 2, true, DATE_SUB(NOW(), INTERVAL 20 DAY), 55, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (2, 3, false, NULL, 20, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (2, 4, false, NULL, 0, NULL)
ON DUPLICATE KEY UPDATE completed = VALUES(completed);

-- Student 3: 100% complete (all 4 lessons)
INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completion_date, time_spent_minutes, last_accessed_at)
VALUES 
  (3, 1, true, DATE_SUB(NOW(), INTERVAL 18 DAY), 50, DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (3, 2, true, DATE_SUB(NOW(), INTERVAL 15 DAY), 65, DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (3, 3, true, DATE_SUB(NOW(), INTERVAL 10 DAY), 55, DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (3, 4, true, DATE_SUB(NOW(), INTERVAL 5 DAY), 60, DATE_SUB(NOW(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE completed = VALUES(completed);

-- Student 4: 25% complete (1 out of 4 lessons)
INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completion_date, time_spent_minutes, last_accessed_at)
VALUES 
  (4, 1, true, DATE_SUB(NOW(), INTERVAL 13 DAY), 35, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (4, 2, false, NULL, 10, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (4, 3, false, NULL, 0, NULL),
  (4, 4, false, NULL, 0, NULL)
ON DUPLICATE KEY UPDATE completed = VALUES(completed);

-- Student 5: 0% complete (no lessons started)
-- No lesson progress records needed

-- ============================================
-- Step 3: Update Enrollment Completion Status
-- ============================================

-- Mark student 3 as completed
UPDATE enrollments 
SET status = 'COMPLETED', 
    completed_at = DATE_SUB(NOW(), INTERVAL 5 DAY),
    progress_percent = 100
WHERE id = 3;

-- ============================================
-- Step 4: Verify Data
-- ============================================

-- Check enrollments
SELECT 
  e.id,
  e.user_id,
  e.course_id,
  e.status,
  e.progress_percent,
  e.enrolled_at
FROM enrollments e
WHERE e.course_id IN (SELECT id FROM courses WHERE created_by = 2);

-- Check lesson progress
SELECT 
  lp.enrollment_id,
  lp.lesson_id,
  lp.completed,
  lp.time_spent_minutes,
  lp.last_accessed_at
FROM lesson_progress lp
WHERE lp.enrollment_id IN (
  SELECT id FROM enrollments WHERE course_id IN (
    SELECT id FROM courses WHERE created_by = 2
  )
);

-- ============================================
-- Expected Results After Running This Script:
-- ============================================
-- Dashboard will show:
-- - Total Students: 5
-- - Average Completion: 50% (0 + 25 + 50 + 75 + 100) / 5
-- - Completion Rate: 20% (1 out of 5 completed)
--
-- Student Tracking will show:
-- - 5 students with different progress levels
-- - Progress bars: 0%, 25%, 50%, 75%, 100%
-- - Different enrollment dates
-- - Different last activity dates
-- ============================================

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Adjust user_id values (3, 4, 5, 6, 7) to match your actual student IDs
-- 2. Adjust course_id (1) to match your actual course ID
-- 3. Adjust enrollment_id values (1, 2, 3, 4, 5) if needed
-- 4. Adjust lesson_id values (1, 2, 3, 4) to match your actual lesson IDs
-- 5. Adjust created_by (2) to match your FORMATEUR user ID
-- 6. Make sure the courses table has a course with created_by = 2
-- 7. Make sure the lessons table has lessons for the course
-- ============================================
