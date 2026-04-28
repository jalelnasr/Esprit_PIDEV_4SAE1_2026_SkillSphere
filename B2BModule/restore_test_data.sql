-- Script pour recréer des données de test dans la base B2BModule
-- Exécutez ce script après avoir redémarré le backend pour recréer les tables

-- 1. Insérer des entreprises de test
INSERT INTO companies (id, name, email, siret, sector, address, phone, credits_remaining, created_by, created_at, employee_count) VALUES
(1, 'TechCorp', 'contact@techcorp.com', '12345678901234', 'Technology', '123 Tech Street, Paris', '+33123456789', 100, 1, NOW(), 50),
(2, 'InnovSoft', 'hr@innovsoft.fr', '98765432109876', 'Software Development', '456 Innovation Ave, Lyon', '+33987654321', 150, 1, NOW(), 30),
(3, 'DataSolutions', 'jobs@datasolutions.com', '11223344556677', 'Data Analytics', '789 Data Boulevard, Marseille', '+33112233445', 200, 1, NOW(), 75);

-- 2. Insérer des missions de test
INSERT INTO missions (id, company_id, title, description, duration_weeks, daily_rate, required_skills, status) VALUES
(1, 1, 'Développeur Full Stack React/Spring', 'Développement d\'une application web moderne avec React et Spring Boot. Vous travaillerez sur une plateforme e-commerce innovante.', 8, 500.00, 'React, Spring Boot, MySQL, Docker', 'OPEN'),
(2, 1, 'Expert DevOps', 'Mise en place d\'une infrastructure cloud et automatisation des déploiements. Expérience avec AWS et Kubernetes requise.', 12, 600.00, 'AWS, Kubernetes, Docker, Jenkins, Terraform', 'OPEN'),
(3, 2, 'Développeur Mobile Flutter', 'Création d\'une application mobile cross-platform avec Flutter. Interface moderne et performante.', 6, 450.00, 'Flutter, Dart, Firebase, REST API', 'OPEN'),
(4, 2, 'Architecte Solution', 'Conception de l\'architecture technique pour une plateforme SaaS. Leadership technique requis.', 10, 700.00, 'Architecture, Microservices, Java, Spring, PostgreSQL', 'OPEN'),
(5, 3, 'Data Scientist', 'Analyse de données et création de modèles prédictifs. Expérience en machine learning nécessaire.', 16, 550.00, 'Python, Machine Learning, TensorFlow, SQL, Pandas', 'OPEN'),
(6, 3, 'Développeur Backend Python', 'Développement d\'APIs robustes et scalables avec Python/Django. Intégration avec des services tiers.', 8, 480.00, 'Python, Django, PostgreSQL, Redis, API REST', 'OPEN');

-- 3. Insérer des candidats de test
INSERT INTO candidates (id, title, skills, experience_years, resume_url, is_looking_for_job) VALUES
(1, 'Développeur Full Stack Senior', 'React, Angular, Spring Boot, MySQL, Docker, JavaScript, TypeScript', 5, 'https://example.com/resume1.pdf', 1),
(2, 'Expert DevOps & Cloud', 'AWS, Azure, Kubernetes, Docker, Jenkins, Terraform, Linux, Python', 7, 'https://example.com/resume2.pdf', 1),
(3, 'Développeur Mobile', 'Flutter, React Native, Swift, Kotlin, Firebase, REST API', 4, 'https://example.com/resume3.pdf', 1),
(4, 'Data Scientist', 'Python, R, Machine Learning, TensorFlow, PyTorch, SQL, Pandas, NumPy', 6, 'https://example.com/resume4.pdf', 1),
(5, 'Architecte Solution', 'Java, Spring, Microservices, PostgreSQL, MongoDB, Architecture, Leadership', 8, 'https://example.com/resume5.pdf', 1);

-- 4. Insérer quelques candidatures de test
INSERT INTO mission_applications (id, mission_id, candidate_id, proposed_rate, status, applied_at) VALUES
(1, 1, 1, 480.00, 'PENDING', NOW()),
(2, 2, 2, 580.00, 'ACCEPTED', NOW()),
(3, 3, 3, 450.00, 'PENDING', NOW()),
(4, 5, 4, 550.00, 'ACCEPTED', NOW()),
(5, 4, 5, 680.00, 'PENDING', NOW());

-- 5. Insérer quelques contrats de test
INSERT INTO contracts (id, contract_number, mission_id, candidate_id, company_id, total_amount, start_date, end_date, status, signed_at) VALUES
(1, 'CTR-1001', 2, 2, 1, 41760.00, '2024-01-15', '2024-04-15', 'SIGNED', NOW()),
(2, 'CTR-1002', 5, 4, 3, 70400.00, '2024-02-01', '2024-05-31', 'DRAFT', NULL);

-- Vérification des données insérées
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Missions', COUNT(*) FROM missions
UNION ALL
SELECT 'Candidates', COUNT(*) FROM candidates
UNION ALL
SELECT 'Applications', COUNT(*) FROM mission_applications
UNION ALL
SELECT 'Contracts', COUNT(*) FROM contracts;