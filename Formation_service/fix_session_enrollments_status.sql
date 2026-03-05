-- Fix pour la colonne status de session_enrollments
-- Le problème: Hibernate attend un ENUM mais la colonne est VARCHAR avec des valeurs différentes

-- Étape 1: Vérifier les valeurs actuelles
SELECT DISTINCT status FROM session_enrollments;

-- Étape 2: Mettre à jour les valeurs pour correspondre à l'ENUM
-- Remplacer 'ACTIVE' par 'ACTIVE' (déjà correct)
-- Si d'autres valeurs existent, les mapper correctement

-- Étape 3: Supprimer la colonne et la recréer (solution simple)
ALTER TABLE session_enrollments DROP COLUMN status;
ALTER TABLE session_enrollments ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Ou si vous préférez garder les données:
-- UPDATE session_enrollments SET status = 'ACTIVE' WHERE status NOT IN ('ACTIVE', 'COMPLETED', 'CANCELED');

-- Étape 4: Vérifier
SELECT * FROM session_enrollments;
