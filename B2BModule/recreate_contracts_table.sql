-- Script pour recréer la table contracts avec la bonne structure
-- ATTENTION : Cela supprimera tous les contrats existants !
-- Exécutez ce script dans phpMyAdmin

-- 1. Sauvegarder les données existantes (optionnel)
-- CREATE TABLE contracts_backup AS SELECT * FROM contracts;

-- 2. Supprimer la table contracts
DROP TABLE IF EXISTS contracts;

-- 3. Redémarrez votre application Spring Boot
-- Hibernate recréera automatiquement la table avec la bonne structure
-- La nouvelle table aura la contrainte UNIQUE sur (mission_ref_id, candidate_id)
-- au lieu de juste mission_id

-- 4. Si vous aviez des données à restaurer (après avoir vérifié la structure) :
-- INSERT INTO contracts SELECT * FROM contracts_backup;
-- DROP TABLE contracts_backup;
