-- ============================================
-- Créer la table competition_streams
-- ============================================

CREATE TABLE IF NOT EXISTS competition_streams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    competition_id BIGINT NOT NULL,
    stream_url VARCHAR(500) NOT NULL,
    platform VARCHAR(50),
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'OFFLINE',
    created_by BIGINT,
    started_at DATETIME,
    stopped_at DATETIME,
    created_at DATETIME,
    auto_expire_hours INT,
    UNIQUE KEY uk_competition_stream (competition_id)
);
