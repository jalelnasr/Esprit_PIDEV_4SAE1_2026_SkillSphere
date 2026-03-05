-- Check which tables have created_at column
USE skillsphere;

-- Check courses table
DESCRIBE courses;

-- Check sessions table  
DESCRIBE sessions;

-- Check if created_at exists in courses
SHOW COLUMNS FROM courses LIKE 'created_at';

-- Check if created_at exists in sessions
SHOW COLUMNS FROM sessions LIKE 'created_at';
