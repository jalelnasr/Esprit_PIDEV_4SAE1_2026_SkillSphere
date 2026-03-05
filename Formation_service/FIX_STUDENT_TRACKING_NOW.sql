-- ============================================
-- FIX: Afficher les Étudiants dans "Mes Étudiants"
-- ============================================
-- Ce script crée des inscriptions aux formations
-- pour les étudiants inscrits aux sessions
-- ============================================

-- IMPORTANT: Remplacez "2" par votre ID de FORMATEUR
-- Pour trouver votre ID:
-- SELECT id_user, username, role FROM users WHERE role = 'FORMATEUR';

-- ============================================
-- Étape 1: Vérifier le problème
-- ============================================
SELECT 
    'AVANT LA CORRECTION' as etape,
    COUNT(*) as nombre_etudiants
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE c.created_by = 2;  -- Changez 2 par votre ID

-- ============================================
-- Étape 2: Créer les inscriptions manquantes
-- ============================================
-- Crée une inscription à la formation pour chaque
-- étudiant inscrit à une session

INSERT INTO enrollments (user_id, course_id, status, inscription_date, completion_percent)
SELECT DISTINCT
    se.user_id,
    s.course_id,
    'ACTIVE',
    se.enrolled_at,
    0
FROM session_enrollments se
JOIN sessions s ON se.session_id = s.id
JOIN courses c ON s.course_id = c.id
WHERE c.created_by = 2  -- Changez 2 par votre ID de FORMATEUR
  AND se.status = 'ENROLLED'
  AND NOT EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = se.user_id
        AND e.course_id = s.course_id
  );

-- ============================================
-- Étape 3: Vérifier la correction
-- ============================================
SELECT 
    'APRES LA CORRECTION' as etape,
    COUNT(*) as nombre_etudiants
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE c.created_by = 2;  -- Changez 2 par votre ID

-- ============================================
-- Étape 4: Voir les détails des étudiants
-- ============================================
SELECT 
    e.id as enrollment_id,
    e.user_id,
    c.id as course_id,
    c.title as formation,
    e.status,
    e.completion_percent as progression,
    e.inscription_date
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE c.created_by = 2  -- Changez 2 par votre ID
ORDER BY e.inscription_date DESC;

-- ============================================
-- RÉSULTAT ATTENDU:
-- ============================================
-- AVANT: 0 étudiants
-- APRES: 1+ étudiants
-- 
-- Maintenant, rafraîchissez la page "Mes Étudiants"
-- Vous devriez voir vos étudiants!
-- ============================================
