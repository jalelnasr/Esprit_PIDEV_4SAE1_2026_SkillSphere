-- Migration: Ajout du champ location à la table sessions
-- Date: 2024-12-XX
-- Description: Ajoute une colonne location pour stocker le lieu de la session (physique ou URL visio)

USE formation_db;

-- Ajouter la colonne location
ALTER TABLE sessions 
ADD COLUMN location VARCHAR(500) NULL AFTER timezone;

-- Mettre à jour les sessions existantes avec une valeur par défaut
UPDATE sessions 
SET location = 'À définir' 
WHERE location IS NULL;

-- Vérifier la modification
DESCRIBE sessions;

-- Afficher quelques sessions pour vérifier
SELECT id, course_id, start_at, timezone, location, capacity, status 
FROM sessions 
LIMIT 5;
