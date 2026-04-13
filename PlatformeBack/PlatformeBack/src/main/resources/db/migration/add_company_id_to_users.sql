-- ============================================================
-- Script SQL : Migration table users — Module B2B (Corporate)
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : Ajouter la colonne company_id (si pas déjà fait)
-- ============================================================
-- Vérifier d'abord si la colonne existe :
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'company_id';

ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id BIGINT NULL;

-- Index pour optimiser les requêtes de filtrage par entreprise
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- (Optionnel) Clé étrangère si la table companies existe déjà
-- ALTER TABLE users ADD CONSTRAINT fk_users_company
--     FOREIGN KEY (company_id) REFERENCES companies(id)
--     ON DELETE SET NULL;

-- ============================================================
-- ÉTAPE 2 : Ajouter MANAGER à la colonne role
-- ============================================================
-- Si la colonne role est de type ENUM MySQL, exécuter :
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'FORMATEUR', 'APPRENANT', 'RH_ENTREPRISE', 'MANAGER') NOT NULL;

-- Si la colonne role est de type VARCHAR (EnumType.STRING avec Hibernate),
-- aucune modification n'est nécessaire : Hibernate écrira directement 'MANAGER'.
-- Vous pouvez vérifier le type avec :
-- SHOW COLUMNS FROM users LIKE 'role';

-- ============================================================
-- NOTE : Avec spring.jpa.hibernate.ddl-auto=update, Hibernate
-- gère automatiquement les colonnes VARCHAR. Ce script est
-- fourni pour les cas où la colonne est un vrai ENUM MySQL
-- ou pour les déploiements en production.
-- ============================================================


