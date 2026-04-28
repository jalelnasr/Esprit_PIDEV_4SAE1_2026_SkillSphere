-- Script pour corriger la contrainte de contrat
-- Exécutez ce script dans phpMyAdmin ou votre client MySQL

USE b2bmodule;

-- Voir les contraintes actuelles sur la table contracts
SHOW CREATE TABLE contracts;

-- Supprimer la contrainte unique sur mission_id si elle existe
-- Remplacez 'UK_afelobc0p3qfxt1itkkts4biu' par le nom exact de votre contrainte
ALTER TABLE contracts DROP INDEX UK_afelobc0p3qfxt1itkkts4biu;

-- Optionnel: Ajouter une nouvelle contrainte unique sur (mission_id, candidate_id)
-- ALTER TABLE contracts ADD CONSTRAINT UK_mission_candidate UNIQUE (mission_id, candidate_id);

-- Vérifier que la contrainte a été supprimée
SHOW CREATE TABLE contracts;