-- Script pour permettre plusieurs contrats par mission
-- Exécutez ce script dans phpMyAdmin pour votre base de données

-- 1. Supprimer l'ancienne contrainte unique sur mission_id (si elle existe)
ALTER TABLE contracts DROP INDEX IF EXISTS UK_afelobc0p3qfxt1itkkts4biu;
ALTER TABLE contracts DROP INDEX IF EXISTS mission_id;

-- 2. Vérifier s'il y a une colonne mission_id (ancienne) et la renommer si nécessaire
-- Si vous avez déjà des données, cette étape peut nécessiter une sauvegarde
-- ALTER TABLE contracts CHANGE COLUMN mission_id mission_ref_id BIGINT;

-- 3. Créer la nouvelle contrainte unique sur (mission_ref_id, candidate_id)
-- Cela permet plusieurs contrats par mission, mais un seul contrat par candidat par mission
ALTER TABLE contracts 
ADD CONSTRAINT UK_mission_candidate UNIQUE (mission_ref_id, candidate_id);

-- 4. Vérifier la structure de la table
DESCRIBE contracts;

-- 5. Afficher les contraintes existantes
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'contracts' 
AND TABLE_SCHEMA = DATABASE();
