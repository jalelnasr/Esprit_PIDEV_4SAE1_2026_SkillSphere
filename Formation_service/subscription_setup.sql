-- ============================================
-- Phase 1: Subscription System Database Setup
-- ============================================

-- 1. Create subscription_plans table
CREATE TABLE subscription_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'DT',
    monthly_enrollment_limit INT,
    access_level ENUM('BASIC', 'PLUS', 'PREMIUM') NOT NULL,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create user_subscriptions table
CREATE TABLE user_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_end_date (end_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create subscription_payments table
CREATE TABLE subscription_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'DT',
    payment_method VARCHAR(50) DEFAULT 'MANUAL',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
    INDEX idx_user_payments (user_id),
    INDEX idx_status (payment_status),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Add access_level column to courses table
ALTER TABLE courses 
ADD COLUMN access_level ENUM('BASIC', 'PLUS', 'PREMIUM') DEFAULT 'BASIC' AFTER difficulty;

-- 5. Update existing courses with access_level based on difficulty
UPDATE courses SET access_level = 'BASIC' WHERE difficulty = 'BEGINNER';
UPDATE courses SET access_level = 'PLUS' WHERE difficulty = 'INTERMEDIATE';
UPDATE courses SET access_level = 'PREMIUM' WHERE difficulty = 'ADVANCED';

-- 6. Insert default subscription plans
INSERT INTO subscription_plans (name, slug, price_monthly, monthly_enrollment_limit, access_level, features) VALUES
(
    'Basic',
    'basic',
    25.00,
    5,
    'BASIC',
    '["Accès aux cours débutants", "Certificats basiques", "Ressources téléchargeables", "Support par email", "Accès au forum communautaire"]'
),
(
    'Plus',
    'plus',
    45.00,
    15,
    'PLUS',
    '["Accès aux cours débutants et intermédiaires", "Certificats professionnels", "Ressources téléchargeables", "Sessions en direct", "Support prioritaire", "Accès complet au forum"]'
),
(
    'Premium',
    'premium',
    75.00,
    NULL,
    'PREMIUM',
    '["Accès à tous les cours", "Inscriptions illimitées", "Certificats professionnels", "Sessions en direct", "Support prioritaire", "Recommandations de parcours", "Analyses de progression", "Accès anticipé aux nouveaux cours"]'
);

-- ============================================
-- Migration Complete
-- ============================================
