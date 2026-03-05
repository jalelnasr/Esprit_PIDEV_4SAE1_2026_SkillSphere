-- Create session_enrollments table to track which users are enrolled in which sessions
CREATE TABLE IF NOT EXISTS session_enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE KEY unique_user_session (user_id, session_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_session_enrollments_user_id ON session_enrollments(user_id);
CREATE INDEX idx_session_enrollments_session_id ON session_enrollments(session_id);
CREATE INDEX idx_session_enrollments_status ON session_enrollments(status);

-- Note: This table tracks session-specific enrollments
-- The enrollments table tracks course-level enrollments
-- When a user enrolls in a session:
--   1. A course enrollment is created (if not exists)
--   2. A session enrollment is created
--   3. The session's enrolledCount is incremented
