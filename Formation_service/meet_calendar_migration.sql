-- ============================================
-- Meet & Calendar Migration
-- formation_db
-- ============================================

-- Table: session_meets
CREATE TABLE IF NOT EXISTS session_meets (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id       BIGINT NOT NULL,
    formateur_id     BIGINT NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    scheduled_at     DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    meet_token       VARCHAR(100) NOT NULL UNIQUE,
    meet_link        VARCHAR(500) NOT NULL,
    status           ENUM('SCHEDULED','LIVE','ENDED','CANCELLED') DEFAULT 'SCHEDULED',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_formateur (formateur_id),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: meet_joins (simplified - no invitation workflow, just track join time)
CREATE TABLE IF NOT EXISTS meet_joins (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    meet_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    joined_at  DATETIME NOT NULL,
    FOREIGN KEY (meet_id) REFERENCES session_meets(id) ON DELETE CASCADE,
    UNIQUE KEY uq_meet_user (meet_id, user_id),
    INDEX idx_meet (meet_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
