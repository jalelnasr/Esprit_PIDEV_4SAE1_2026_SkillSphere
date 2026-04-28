-- ===== DONNÉES DE TEST POUR B2BMODULE =====
-- Exécutez ce script après avoir démarré le backend pour avoir des données de test

-- 1. ENTREPRISES
INSERT INTO companies (id, name, email, siret, sector, address, phone, credits_remaining, created_by, created_at, employee_count) VALUES
(1, 'TechCorp Solutions', 'hr@techcorp.fr', '12345678901234', 'Technology & Software', '123 Avenue des Champs-Élysées, 75008 Paris', '+33 1 42 56 78 90', 150, 1, NOW(), 85),
(2, 'InnovSoft Digital', 'recrutement@innovsoft.com', '98765432109876', 'Digital Innovation', '456 Rue de la République, 69002 Lyon', '+33 4 78 90 12 34', 200, 1, NOW(), 45),
(3, 'DataFlow Analytics', 'jobs@dataflow.fr', '11223344556677', 'Data Science & AI', '789 Boulevard Saint-Germain, 75006 Paris', '+33 1 45 67 89 01', 120, 1, NOW(), 60),
(4, 'CloudTech Systems', 'careers@cloudtech.eu', '55667788990011', 'Cloud Computing', '321 Cours Mirabeau, 13100 Aix-en-Provence', '+33 4 42 12 34 56', 180, 1, NOW(), 35),
(5, 'MobileDev Studio', 'team@mobiledev.fr', '99887766554433', 'Mobile Development', '654 Rue Nationale, 59000 Lille', '+33 3 20 78 90 12', 100, 1, NOW(), 25),
(6, 'FinTech Innovations', 'hr@fintech-innov.com', '77889900112233', 'Financial Technology', '987 Avenue de la Liberté, 67000 Strasbourg', '+33 3 88 45 67 89', 250, 1, NOW(), 120);

-- 2. MISSIONS VARIÉES AVEC DIFFÉRENTS NIVEAUX
INSERT INTO missions (id, company_id, title, description, duration_weeks, daily_rate, required_skills, status) VALUES
-- Missions TechCorp Solutions
(1, 1, 'Senior Full Stack Developer - E-commerce Platform', 'Lead the development of a modern e-commerce platform using React and Spring Boot. You will architect scalable solutions, mentor junior developers, and ensure high-quality code delivery. Experience with microservices and cloud deployment is essential.', 12, 650.00, 'React, Spring Boot, MySQL, Docker, Kubernetes, AWS, JavaScript, TypeScript, Microservices', 'OPEN'),

(2, 1, 'DevOps Engineer - Cloud Migration', 'Migrate legacy applications to AWS cloud infrastructure. Design and implement CI/CD pipelines, automate deployment processes, and ensure system reliability. Strong experience with containerization and orchestration required.', 16, 700.00, 'AWS, Docker, Kubernetes, Jenkins, Terraform, Linux, Python, CI/CD, Monitoring', 'OPEN'),

(3, 1, 'Junior Frontend Developer', 'Join our frontend team to develop user interfaces for web applications. You will work with React, learn best practices, and contribute to our component library. Perfect opportunity for career growth in a supportive environment.', 8, 350.00, 'React, JavaScript, HTML, CSS, Git, REST API', 'OPEN'),

-- Missions InnovSoft Digital
(4, 2, 'Mobile App Developer - Flutter Expert', 'Create cross-platform mobile applications using Flutter. Develop innovative features, integrate with backend APIs, and ensure optimal performance across iOS and Android platforms. Experience with state management is crucial.', 10, 550.00, 'Flutter, Dart, Firebase, REST API, Mobile Development, iOS, Android, State Management', 'OPEN'),

(5, 2, 'Backend Architect - Microservices', 'Design and implement microservices architecture for our SaaS platform. Lead technical decisions, establish coding standards, and mentor the development team. Deep knowledge of distributed systems required.', 14, 750.00, 'Java, Spring Boot, Microservices, PostgreSQL, Redis, Kafka, Docker, Architecture, Leadership', 'OPEN'),

(6, 2, 'UI/UX Developer - Design System', 'Build and maintain our design system components. Collaborate with designers to create pixel-perfect interfaces and ensure consistent user experience across all products.', 6, 480.00, 'React, TypeScript, CSS, SASS, Design Systems, Figma, Storybook', 'OPEN'),

-- Missions DataFlow Analytics
(7, 3, 'Senior Data Scientist - Machine Learning', 'Develop advanced machine learning models for predictive analytics. Work with large datasets, implement AI algorithms, and create data visualization dashboards. PhD or equivalent experience preferred.', 20, 800.00, 'Python, Machine Learning, TensorFlow, PyTorch, Pandas, NumPy, SQL, Data Visualization, Statistics', 'OPEN'),

(8, 3, 'Data Engineer - Big Data Pipeline', 'Build and maintain data processing pipelines for real-time analytics. Design ETL processes, optimize database performance, and ensure data quality. Experience with big data technologies essential.', 12, 600.00, 'Python, Apache Spark, Kafka, Elasticsearch, PostgreSQL, ETL, Big Data, Data Pipeline', 'OPEN'),

(9, 3, 'Junior Python Developer - Data Processing', 'Support data processing tasks and learn data engineering best practices. Work with senior team members on data cleaning, transformation, and basic analytics. Great learning opportunity.', 8, 380.00, 'Python, SQL, Pandas, Data Processing, Git, REST API', 'OPEN'),

-- Missions CloudTech Systems
(10, 4, 'Cloud Solutions Architect', 'Design enterprise cloud solutions and migration strategies. Lead client consultations, create technical proposals, and oversee implementation projects. Multiple cloud platform expertise required.', 18, 850.00, 'AWS, Azure, GCP, Cloud Architecture, Terraform, Kubernetes, Enterprise Solutions, Consulting', 'OPEN'),

(11, 4, 'Kubernetes Specialist', 'Implement and manage Kubernetes clusters for containerized applications. Optimize resource utilization, ensure security compliance, and provide technical support to development teams.', 10, 650.00, 'Kubernetes, Docker, Linux, Helm, Monitoring, Security, DevOps', 'OPEN'),

-- Missions MobileDev Studio
(12, 5, 'iOS Developer - Swift Expert', 'Develop native iOS applications with cutting-edge features. Implement complex UI animations, integrate with device capabilities, and ensure App Store compliance. Strong Swift and iOS SDK knowledge required.', 12, 580.00, 'Swift, iOS, Xcode, UIKit, SwiftUI, Core Data, REST API, Mobile Development', 'OPEN'),

(13, 5, 'React Native Developer', 'Build cross-platform mobile apps using React Native. Optimize performance, implement native modules when needed, and maintain code quality. Experience with both iOS and Android deployment required.', 8, 520.00, 'React Native, JavaScript, TypeScript, iOS, Android, Mobile Development, Redux', 'OPEN'),

-- Missions FinTech Innovations
(14, 6, 'Blockchain Developer - DeFi Platform', 'Develop decentralized finance applications using Solidity and Web3 technologies. Implement smart contracts, ensure security best practices, and integrate with blockchain networks.', 16, 900.00, 'Solidity, Blockchain, Web3, Ethereum, Smart Contracts, DeFi, Security, Cryptography', 'OPEN'),

(15, 6, 'Senior Java Developer - Banking System', 'Maintain and enhance core banking software systems. Ensure regulatory compliance, implement security measures, and optimize transaction processing. Financial services experience mandatory.', 14, 720.00, 'Java, Spring Boot, Oracle, Security, Banking, Compliance, Microservices, Performance Optimization', 'OPEN'),

(16, 6, 'Frontend Developer - Trading Platform', 'Create real-time trading interfaces with advanced charting capabilities. Implement WebSocket connections, optimize for low latency, and ensure data accuracy in high-frequency environments.', 10, 600.00, 'React, TypeScript, WebSocket, Real-time, Trading, Charts, Performance Optimization', 'OPEN');

-- 3. CANDIDATS AVEC PROFILS VARIÉS
INSERT INTO candidates (id, title, skills, experience_years, resume_url, is_looking_for_job) VALUES
-- Candidats Senior/Expert
(1, 'Senior Full Stack Developer', 'React, Angular, Vue.js, JavaScript, TypeScript, Node.js, Spring Boot, Java, Python, MySQL, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Git, REST API, GraphQL, Microservices', 8, 'https://linkedin.com/in/senior-fullstack', 1),

(2, 'DevOps Architect', 'AWS, Azure, GCP, Docker, Kubernetes, Terraform, Jenkins, GitLab CI, Ansible, Linux, Python, Bash, Monitoring, Prometheus, Grafana, ELK Stack, Security, Infrastructure as Code', 10, 'https://github.com/devops-expert', 1),

(3, 'Lead Data Scientist', 'Python, R, Machine Learning, Deep Learning, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, SQL, NoSQL, Apache Spark, Kafka, Data Visualization, Statistics, Mathematics, PhD Computer Science', 12, 'https://kaggle.com/data-scientist-lead', 1),

(4, 'Mobile Development Expert', 'Flutter, Dart, React Native, Swift, Kotlin, iOS, Android, Firebase, SQLite, REST API, GraphQL, State Management, Redux, MobX, Performance Optimization, App Store, Google Play', 9, 'https://apps.apple.com/developer/mobile-expert', 1),

(5, 'Cloud Solutions Architect', 'AWS, Azure, Google Cloud, Kubernetes, Docker, Terraform, CloudFormation, Serverless, Lambda, API Gateway, Microservices, Enterprise Architecture, Solution Design, Technical Leadership', 11, 'https://aws.amazon.com/partners/architect', 1),

-- Candidats Confirmés (Mid-level)
(6, 'Full Stack Developer', 'React, JavaScript, TypeScript, Node.js, Express, Spring Boot, Java, MySQL, PostgreSQL, Docker, Git, REST API, Agile, Scrum', 5, 'https://portfolio.dev/fullstack-mid', 1),

(7, 'Backend Developer', 'Java, Spring Boot, Spring Security, Hibernate, MySQL, PostgreSQL, Redis, Kafka, Docker, Microservices, REST API, JUnit, Maven, Git', 4, 'https://github.com/backend-developer', 1),

(8, 'Frontend Developer', 'React, Vue.js, JavaScript, TypeScript, HTML5, CSS3, SASS, Webpack, Babel, Jest, Cypress, Responsive Design, UI/UX, Figma', 4, 'https://codepen.io/frontend-dev', 1),

(9, 'Data Engineer', 'Python, SQL, Apache Spark, Kafka, Elasticsearch, PostgreSQL, MongoDB, ETL, Data Pipeline, Pandas, NumPy, Docker, Linux, Git', 6, 'https://github.com/data-engineer', 1),

(10, 'Mobile Developer', 'Flutter, Dart, Firebase, REST API, SQLite, State Management, Provider, Bloc, iOS, Android, Git, Agile', 3, 'https://play.google.com/store/apps/developer?id=MobileDev', 1),

-- Candidats Junior
(11, 'Junior Frontend Developer', 'React, JavaScript, HTML, CSS, Git, REST API, Bootstrap, Responsive Design, Basic TypeScript', 2, 'https://github.com/junior-frontend', 1),

(12, 'Junior Backend Developer', 'Java, Spring Boot, MySQL, Git, REST API, Basic Docker, JUnit, Maven', 1, 'https://github.com/junior-backend', 1),

(13, 'Junior Data Analyst', 'Python, SQL, Pandas, Excel, Basic Machine Learning, Data Visualization, Matplotlib, Seaborn, Git', 1, 'https://github.com/junior-analyst', 1),

(14, 'Junior Mobile Developer', 'Flutter, Dart, Basic Firebase, REST API, Git, Mobile UI Design', 1, 'https://github.com/junior-mobile', 1),

-- Candidats Spécialisés
(15, 'Blockchain Developer', 'Solidity, Web3, Ethereum, Bitcoin, Smart Contracts, DeFi, Truffle, Hardhat, JavaScript, Node.js, React, Cryptography, Security', 6, 'https://etherscan.io/address/blockchain-dev', 1),

(16, 'iOS Specialist', 'Swift, SwiftUI, UIKit, Xcode, Core Data, Core Animation, ARKit, iOS SDK, App Store, TestFlight, Objective-C, Performance Optimization', 7, 'https://apps.apple.com/developer/ios-specialist', 1),

(17, 'DevOps Engineer', 'Docker, Kubernetes, Jenkins, GitLab CI, AWS, Terraform, Ansible, Linux, Python, Bash, Monitoring, Prometheus, Nginx', 5, 'https://github.com/devops-engineer', 1),

(18, 'UI/UX Developer', 'React, TypeScript, CSS, SASS, Styled Components, Figma, Adobe XD, Design Systems, Storybook, Accessibility, Responsive Design', 4, 'https://dribbble.com/uiux-developer', 1);

-- 4. CANDIDATURES AVEC TAUX VARIÉS POUR TESTER L'AI
INSERT INTO mission_applications (id, mission_id, candidate_id, proposed_rate, status, applied_at) VALUES
-- Applications pour Mission 1 (Senior Full Stack - 650€/jour)
(1, 1, 1, 620.00, 'PENDING', NOW() - INTERVAL 2 DAY), -- Excellent match, taux légèrement inférieur
(2, 1, 6, 650.00, 'PENDING', NOW() - INTERVAL 1 DAY), -- Bon match, taux exact
(3, 1, 11, 400.00, 'PENDING', NOW() - INTERVAL 3 HOUR), -- Junior, taux très inférieur

-- Applications pour Mission 2 (DevOps - 700€/jour)
(4, 2, 2, 680.00, 'ACCEPTED', NOW() - INTERVAL 5 DAY), -- Expert DevOps, excellent match
(5, 2, 17, 720.00, 'PENDING', NOW() - INTERVAL 1 DAY), -- DevOps confirmé, taux légèrement supérieur
(6, 2, 7, 650.00, 'PENDING', NOW() - INTERVAL 2 HOUR), -- Backend dev, compétences partielles

-- Applications pour Mission 7 (Data Scientist - 800€/jour)
(7, 7, 3, 780.00, 'PENDING', NOW() - INTERVAL 3 DAY), -- Expert Data Science, excellent match
(8, 7, 9, 600.00, 'PENDING', NOW() - INTERVAL 1 DAY), -- Data Engineer, compétences connexes
(9, 7, 13, 350.00, 'REJECTED', NOW() - INTERVAL 4 DAY), -- Junior, pas assez d'expérience

-- Applications pour Mission 4 (Flutter - 550€/jour)
(10, 4, 4, 580.00, 'PENDING', NOW() - INTERVAL 2 DAY), -- Expert mobile, excellent match
(11, 4, 10, 520.00, 'ACCEPTED', NOW() - INTERVAL 6 DAY), -- Flutter dev confirmé
(12, 4, 14, 300.00, 'PENDING', NOW() - INTERVAL 1 HOUR), -- Junior Flutter

-- Applications pour Mission 14 (Blockchain - 900€/jour)
(13, 14, 15, 850.00, 'PENDING', NOW() - INTERVAL 1 DAY), -- Spécialiste blockchain, excellent match
(14, 14, 1, 700.00, 'PENDING', NOW() - INTERVAL 3 HOUR), -- Full stack, compétences partielles

-- Applications pour Mission 12 (iOS - 580€/jour)
(15, 12, 16, 600.00, 'PENDING', NOW() - INTERVAL 2 DAY), -- Spécialiste iOS, excellent match
(16, 12, 4, 550.00, 'PENDING', NOW() - INTERVAL 1 DAY), -- Expert mobile multi-plateforme

-- Applications pour Mission 3 (Junior Frontend - 350€/jour)
(17, 3, 11, 320.00, 'ACCEPTED', NOW() - INTERVAL 4 DAY), -- Junior frontend, bon match
(18, 3, 8, 380.00, 'PENDING', NOW() - INTERVAL 2 DAY), -- Frontend confirmé, surqualifié

-- Applications pour Mission 15 (Banking Java - 720€/jour)
(19, 15, 7, 700.00, 'PENDING', NOW() - INTERVAL 1 DAY), -- Backend Java, bon match
(20, 15, 1, 750.00, 'PENDING', NOW() - INTERVAL 3 HOUR); -- Full stack senior, très bon match

-- 5. QUELQUES CONTRATS POUR TESTER
INSERT INTO contracts (id, contract_number, mission_id, candidate_id, company_id, total_amount, start_date, end_date, status, signed_at) VALUES
(1, 'CTR-2024-001', 2, 2, 1, 54400.00, '2024-02-01', '2024-05-31', 'SIGNED', NOW() - INTERVAL 10 DAY),
(2, 'CTR-2024-002', 4, 10, 2, 41600.00, '2024-03-01', '2024-05-10', 'SIGNED', NOW() - INTERVAL 5 DAY),
(3, 'CTR-2024-003', 3, 11, 1, 22400.00, '2024-03-15', '2024-05-10', 'DRAFT', NULL);

-- Vérification des données insérées
SELECT 'RÉSUMÉ DES DONNÉES INSÉRÉES' as info;
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Missions', COUNT(*) FROM missions
UNION ALL
SELECT 'Candidates', COUNT(*) FROM candidates
UNION ALL
SELECT 'Applications', COUNT(*) FROM mission_applications
UNION ALL
SELECT 'Contracts', COUNT(*) FROM contracts;

-- Affichage de quelques exemples
SELECT 'EXEMPLES DE MISSIONS' as info;
SELECT id, title, daily_rate, required_skills FROM missions LIMIT 5;

SELECT 'EXEMPLES DE CANDIDATS' as info;
SELECT id, title, experience_years, skills FROM candidates LIMIT 5;