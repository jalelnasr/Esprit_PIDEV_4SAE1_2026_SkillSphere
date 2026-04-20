-- ============================================
-- Ajouter Toutes les Colonnes Manquantes
-- ============================================
-- Ce script ajoute toutes les colonnes nécessaires
-- pour les fonctionnalités de statistiques
-- ============================================

USE skillsphere;

-- ============================================
-- 1. Ajouter created_at à la table sessions
-- ============================================
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Mettre à jour les sessions existantes
UPDATE sessions 
SET created_at = start_at 
WHERE created_at IS NULL OR created_at = '0000-00-00 00:00:00';

-- ============================================
-- 2. Ajouter time_spent_minutes à lesson_progress
-- ============================================
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS time_spent_minutes INT NOT NULL DEFAULT 0;

-- ============================================
-- 3. Ajouter last_accessed_at à lesson_progress
-- ============================================
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP NULL;

-- Mettre à jour avec la date de complétion pour les leçons complétées
UPDATE lesson_progress 
SET last_accessed_at = completion_date 
WHERE completed = true AND last_accessed_at IS NULL;

-- ============================================
-- Vérifications
-- ============================================

-- Vérifier la structure de sessions
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'skillsphere' 
  AND TABLE_NAME = 'sessions'
  AND COLUMN_NAME IN ('created_at');

-- Vérifier la structure de lesson_progress
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'skillsphere' 
  AND TABLE_NAME = 'lesson_progress'
  AND COLUMN_NAME IN ('time_spent_minutes', 'last_accessed_at');

-- Vérifier les données
SELECT 
    'sessions' as table_name,
    COUNT(*) as total_rows,
    COUNT(created_at) as rows_with_created_at
FROM sessions
UNION ALL
SELECT 
    'lesson_progress' as table_name,
    COUNT(*) as total_rows,
    COUNT(last_accessed_at) as rows_with_last_accessed_at
FROM lesson_progress;

-- ============================================
-- RÉSULTAT ATTENDU:
-- ============================================
-- sessions.created_at: existe, NOT NULL
-- lesson_progress.time_spent_minutes: existe, NOT NULL, DEFAULT 0
-- lesson_progress.last_accessed_at: existe, NULL
-- ============================================

SELECT '✅ Migration terminée avec succès!' as status;
