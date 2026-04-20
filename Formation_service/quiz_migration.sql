-- ============================================
-- Quiz System Migration
-- formation_db
-- ============================================

CREATE TABLE IF NOT EXISTS quizzes (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id      BIGINT NOT NULL UNIQUE,
    title          VARCHAR(255) NOT NULL,
    pass_threshold INT NOT NULL DEFAULT 70,
    is_blocking    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id     BIGINT NOT NULL,
    text        TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answer_options (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    text        TEXT NOT NULL,
    is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id       BIGINT NOT NULL,
    user_id       BIGINT NOT NULL,
    enrollment_id BIGINT NOT NULL,
    score         INT NOT NULL,
    passed        BOOLEAN NOT NULL,
    answers_json  TEXT NOT NULL,
    attempted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_quiz_user (quiz_id, user_id),
    INDEX idx_enrollment (enrollment_id)
);
