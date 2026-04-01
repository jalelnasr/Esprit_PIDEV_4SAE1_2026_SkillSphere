-- ============================================
-- Ajouter les colonnes de localisation
-- à la table competitions
-- ============================================

ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS location_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS location_address VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS latitude DOUBLE NULL,
ADD COLUMN IF NOT EXISTS longitude DOUBLE NULL;

-- Vérification
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'competitions' 
AND COLUMN_NAME IN ('location_name', 'location_address', 'latitude', 'longitude');
