-- ============================================
-- FIX: Colonne created_at Manquante
-- ============================================
-- Erreur: Unknown column 's1_0.created_at' in 'field list'
-- ============================================

-- Ajouter la colonne created_at à la table sessions
ALTER TABLE sessions 
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Vérifier que la colonne a été ajoutée
DESCRIBE sessions;

-- Mettre à jour les sessions existantes avec leur date de début
UPDATE sessions 
SET created_at = start_at 
WHERE created_at IS NULL OR created_at = '0000-00-00 00:00:00';

-- Vérifier les données
SELECT id, course_id, start_at, created_at, status 
FROM sessions 
ORDER BY id DESC 
LIMIT 10;

-- ============================================
-- RÉSULTAT ATTENDU:
-- ============================================
-- La colonne created_at doit maintenant exister
-- Toutes les sessions doivent avoir une valeur created_at
-- ============================================
