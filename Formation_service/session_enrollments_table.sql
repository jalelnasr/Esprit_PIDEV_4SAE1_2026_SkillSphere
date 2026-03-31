-- Create session_enrollments table
CREATE TABLE IF NOT EXISTS session_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ENROLLED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_user (session_id, user_id),
    
    -- Prevent duplicate enrollments
    UNIQUE KEY unique_session_user (session_id, user_id)
);

-- Insert some test data for existing sessions
-- Session 1 (Java Fundamentals - March 10-14)
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status) VALUES
(1, 1, '2026-03-01 10:00:00', 'ENROLLED'),
(1, 2, '2026-03-01 14:30:00', 'ENROLLED'),
(1, 3, '2026-03-02 09:15:00', 'ENROLLED');

-- Session 2 (Spring Boot - March 17-21)
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status) VALUES
(2, 1, '2026-03-02 11:00:00', 'ENROLLED'),
(2, 4, '2026-03-03 08:45:00', 'ENROLLED');

-- Session 3 (Angular - March 24-28)
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status) VALUES
(3, 2, '2026-03-01 16:20:00', 'ENROLLED'),
(3, 3, '2026-03-02 13:10:00', 'ENROLLED'),
(3, 5, '2026-03-03 10:30:00', 'ENROLLED');

-- Session 18 (Completed - February 10-14)
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status) VALUES
(18, 1, '2026-02-01 09:00:00', 'COMPLETED'),
(18, 2, '2026-02-01 10:30:00', 'COMPLETED'),
(18, 3, '2026-02-02 14:00:00', 'COMPLETED'),
(18, 4, '2026-02-03 11:15:00', 'COMPLETED');

-- Session 19 (Completed - February 17-21)
INSERT INTO session_enrollments (session_id, user_id, enrolled_at, status) VALUES
(19, 2, '2026-02-05 09:30:00', 'COMPLETED'),
(19, 5, '2026-02-06 15:45:00', 'COMPLETED');
