-- ============================================
-- DONNÉES DE TEST - FORMATIONS ET SESSIONS
-- ============================================
-- Base de données: formation_db
-- Exécuter ce script pour avoir des données de test
-- ============================================

USE formation_db;

-- ============================================
-- 1. FORMATIONS DE TEST
-- ============================================

-- Formations FREE (accessibles à tous)
INSERT INTO courses (title, description, category, level, duration, image_url, access_level, is_active, created_at, updated_at) VALUES
('Introduction au HTML/CSS', 'Apprenez les bases du développement web avec HTML5 et CSS3. Créez votre première page web responsive.', 'Web Development', 'Beginner', 15, 'https://via.placeholder.com/400x300/667eea/ffffff?text=HTML+CSS', 'FREE', true, NOW(), NOW()),
('Git et GitHub pour Débutants', 'Maîtrisez les bases du contrôle de version avec Git et collaborez sur GitHub.', 'DevOps', 'Beginner', 10, 'https://via.placeholder.com/400x300/764ba2/ffffff?text=Git+GitHub', 'FREE', true, NOW(), NOW()),
('Bases de la Programmation', 'Découvrez les concepts fondamentaux de la programmation: variables, boucles, conditions.', 'Programming', 'Beginner', 20, 'https://via.placeholder.com/400x300/f093fb/ffffff?text=Programming', 'FREE', true, NOW(), NOW());

-- Formations BASIC
INSERT INTO courses (title, description, category, level, duration, image_url, access_level, is_active, created_at, updated_at) VALUES
('JavaScript Moderne (ES6+)', 'Maîtrisez JavaScript moderne avec ES6+: arrow functions, promises, async/await, modules.', 'Web Development', 'Intermediate', 30, 'https://via.placeholder.com/400x300/f7b731/ffffff?text=JavaScript', 'BASIC', true, NOW(), NOW()),
('Python pour Débutants', 'Apprenez Python de zéro: syntaxe, structures de données, fonctions, POO.', 'Programming', 'Beginner', 25, 'https://via.placeholder.com/400x300/20bf6b/ffffff?text=Python', 'BASIC', true, NOW(), NOW()),
('SQL et Bases de Données', 'Maîtrisez SQL: requêtes, jointures, sous-requêtes, optimisation. MySQL et PostgreSQL.', 'Database', 'Intermediate', 20, 'https://via.placeholder.com/400x300/0fb9b1/ffffff?text=SQL', 'BASIC', true, NOW(), NOW());

-- Formations PLUS
INSERT INTO courses (title, description, category, level, duration, image_url, access_level, is_active, created_at, updated_at) VALUES
('React.js Complet', 'Développez des applications web modernes avec React: hooks, context, Redux, routing.', 'Web Development', 'Intermediate', 40, 'https://via.placeholder.com/400x300/61dafb/ffffff?text=React', 'PLUS', true, NOW(), NOW()),
('Node.js et Express', 'Créez des APIs REST avec Node.js et Express. MongoDB, authentification JWT, sécurité.', 'Backend', 'Intermediate', 35, 'https://via.placeholder.com/400x300/68a063/ffffff?text=Node.js', 'PLUS', true, NOW(), NOW()),
('Docker et Kubernetes', 'Containerisez vos applications avec Docker et orchestrez avec Kubernetes.', 'DevOps', 'Advanced', 30, 'https://via.placeholder.com/400x300/0db7ed/ffffff?text=Docker', 'PLUS', true, NOW(), NOW()),
('TypeScript Avancé', 'Maîtrisez TypeScript: types avancés, generics, decorators, patterns.', 'Programming', 'Advanced', 25, 'https://via.placeholder.com/400x300/3178c6/ffffff?text=TypeScript', 'PLUS', true, NOW(), NOW());

-- Formations PREMIUM
INSERT INTO courses (title, description, category, level, duration, image_url, access_level, is_active, created_at, updated_at) VALUES
('Angular Complet (v18)', 'Maîtrisez Angular 18: components, services, routing, RxJS, NgRx, SSR.', 'Web Development', 'Advanced', 50, 'https://via.placeholder.com/400x300/dd0031/ffffff?text=Angular', 'PREMIUM', true, NOW(), NOW()),
('Spring Boot Microservices', 'Architecture microservices avec Spring Boot, Eureka, Gateway, Config Server.', 'Backend', 'Advanced', 45, 'https://via.placeholder.com/400x300/6db33f/ffffff?text=Spring', 'PREMIUM', true, NOW(), NOW()),
('AWS Cloud Architect', 'Devenez architecte cloud AWS: EC2, S3, Lambda, RDS, CloudFormation, sécurité.', 'Cloud', 'Advanced', 60, 'https://via.placeholder.com/400x300/ff9900/ffffff?text=AWS', 'PREMIUM', true, NOW(), NOW()),
('Machine Learning avec Python', 'IA et ML avec Python: scikit-learn, TensorFlow, réseaux de neurones, deep learning.', 'AI/ML', 'Advanced', 55, 'https://via.placeholder.com/400x300/ff6f00/ffffff?text=ML', 'PREMIUM', true, NOW(), NOW()),
('Architecture Logicielle', 'Patterns de conception, SOLID, Clean Architecture, DDD, microservices.', 'Software Engineering', 'Advanced', 40, 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=Architecture', 'PREMIUM', true, NOW(), NOW());

-- ============================================
-- 2. SESSIONS DE TEST
-- ============================================

-- Sessions pour formations FREE
INSERT INTO training_sessions (course_id, title, description, start_date, end_date, location, max_capacity, current_enrollment, status, created_at) VALUES
(1, 'HTML/CSS - Session Mars 2026', 'Session intensive de 3 jours pour apprendre HTML et CSS', '2026-03-15 09:00:00', '2026-03-17 17:00:00', 'Tunis - Centre de Formation', 30, 0, 'PLANNED', NOW()),
(2, 'Git/GitHub - Session Avril 2026', 'Atelier pratique Git et GitHub', '2026-04-10 14:00:00', '2026-04-11 18:00:00', 'En ligne (Zoom)', 50, 0, 'PLANNED', NOW()),
(3, 'Programmation - Session Mai 2026', 'Bootcamp programmation pour débutants', '2026-05-05 09:00:00', '2026-05-09 17:00:00', 'Tunis - Centre de Formation', 25, 0, 'PLANNED', NOW());

-- Sessions pour formations BASIC
INSERT INTO training_sessions (course_id, title, description, start_date, end_date, location, max_capacity, current_enrollment, status, created_at) VALUES
(4, 'JavaScript ES6+ - Session Mars 2026', 'Formation intensive JavaScript moderne', '2026-03-20 09:00:00', '2026-03-27 17:00:00', 'Tunis - Centre de Formation', 20, 0, 'PLANNED', NOW()),
(5, 'Python - Session Avril 2026', 'Apprenez Python en 5 jours', '2026-04-15 09:00:00', '2026-04-19 17:00:00', 'Sousse - Centre Tech', 25, 0, 'PLANNED', NOW()),
(6, 'SQL - Session Mai 2026', 'Maîtrisez les bases de données SQL', '2026-05-12 14:00:00', '2026-05-16 18:00:00', 'En ligne (Zoom)', 40, 0, 'PLANNED', NOW());

-- Sessions pour formations PLUS
INSERT INTO training_sessions (course_id, title, description, start_date, end_date, location, max_capacity, current_enrollment, status, created_at) VALUES
(7, 'React.js - Session Avril 2026', 'Bootcamp React intensif de 2 semaines', '2026-04-01 09:00:00', '2026-04-12 17:00:00', 'Tunis - Centre de Formation', 15, 0, 'PLANNED', NOW()),
(8, 'Node.js - Session Mai 2026', 'Développement backend avec Node.js', '2026-05-20 09:00:00', '2026-05-29 17:00:00', 'Sfax - Tech Hub', 20, 0, 'PLANNED', NOW()),
(9, 'Docker/K8s - Session Juin 2026', 'Containerisation et orchestration', '2026-06-02 09:00:00', '2026-06-06 17:00:00', 'En ligne (Zoom)', 30, 0, 'PLANNED', NOW()),
(10, 'TypeScript - Session Avril 2026', 'TypeScript avancé pour développeurs', '2026-04-22 14:00:00', '2026-04-26 18:00:00', 'Tunis - Centre de Formation', 18, 0, 'PLANNED', NOW());

-- Sessions pour formations PREMIUM
INSERT INTO training_sessions (course_id, title, description, start_date, end_date, location, max_capacity, current_enrollment, status, created_at) VALUES
(11, 'Angular 18 - Session Mars 2026', 'Formation complète Angular 18 - 3 semaines', '2026-03-25 09:00:00', '2026-04-15 17:00:00', 'Tunis - Centre de Formation', 12, 0, 'PLANNED', NOW()),
(12, 'Spring Boot - Session Avril 2026', 'Microservices avec Spring Boot', '2026-04-20 09:00:00', '2026-05-08 17:00:00', 'Tunis - Centre de Formation', 15, 0, 'PLANNED', NOW()),
(13, 'AWS Cloud - Session Mai 2026', 'Certification AWS Solutions Architect', '2026-05-15 09:00:00', '2026-06-12 17:00:00', 'En ligne (Zoom)', 25, 0, 'PLANNED', NOW()),
(14, 'Machine Learning - Session Juin 2026', 'IA et ML avec Python - Formation intensive', '2026-06-10 09:00:00', '2026-07-05 17:00:00', 'Tunis - AI Lab', 10, 0, 'PLANNED', NOW()),
(15, 'Architecture - Session Juillet 2026', 'Architecture logicielle avancée', '2026-07-01 09:00:00', '2026-07-12 17:00:00', 'Tunis - Centre de Formation', 12, 0, 'PLANNED', NOW());

-- Sessions passées (pour tester l'historique)
INSERT INTO training_sessions (course_id, title, description, start_date, end_date, location, max_capacity, current_enrollment, status, created_at) VALUES
(1, 'HTML/CSS - Session Février 2026', 'Session terminée avec succès', '2026-02-10 09:00:00', '2026-02-12 17:00:00', 'Tunis - Centre de Formation', 30, 28, 'COMPLETED', NOW()),
(4, 'JavaScript - Session Février 2026', 'Session terminée', '2026-02-15 09:00:00', '2026-02-22 17:00:00', 'Tunis - Centre de Formation', 20, 18, 'COMPLETED', NOW());

-- ============================================
-- RÉSUMÉ DES DONNÉES INSÉRÉES
-- ============================================
-- Formations:
--   - 3 FREE (HTML/CSS, Git, Programmation)
--   - 3 BASIC (JavaScript, Python, SQL)
--   - 4 PLUS (React, Node.js, Docker, TypeScript)
--   - 5 PREMIUM (Angular, Spring Boot, AWS, ML, Architecture)
--   TOTAL: 15 formations
--
-- Sessions:
--   - 17 sessions planifiées (Mars-Juillet 2026)
--   - 2 sessions terminées (Février 2026)
--   TOTAL: 19 sessions
-- ============================================

SELECT 'Données de test insérées avec succès!' as message;
SELECT COUNT(*) as total_formations FROM courses;
SELECT COUNT(*) as total_sessions FROM training_sessions;
