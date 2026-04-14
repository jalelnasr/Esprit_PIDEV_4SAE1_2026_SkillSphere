-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 11 avr. 2026 à 17:24
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `platforme`
--

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id_user` bigint(20) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) NOT NULL,
  `role` enum('ADMIN','FORMATEUR','APPRENANT','RH_ENTREPRISE') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `adresse`, `created_at`, `email`, `is_active`, `nom`, `password_hash`, `phone`, `prenom`, `role`) VALUES
(1, NULL, '2026-02-23 23:01:34.000000', 'admin@gmail.com', b'1', 'Root', '$2a$10$HuxrfIomzIghuPVnVZpgb.foNNeUUtjToL3PaiAeUb.hSIK3uSuVO', NULL, 'Admin', 'ADMIN'),
(8, 'ariana', '2026-02-25 22:17:40.000000', 'aziz@gmail.com', b'1', 'aziz', '$2a$10$sv55.DreZykeISJ8XP15BOmHhCM4YcCVWVLpWXQNww8a3E3kk5Q7K', '+21629374521', 'aziz', 'FORMATEUR'),
(11, 'Tunis', '2026-03-03 21:14:44.000000', 'ahmed.benali@email.com', b'1', 'Ben Ali', '$2a$10$kfLP8k0NbHnQnirRfkcsh.wiHfeBg.ABFNgRFCK1kbhV2nLLPiGTS', '22114587', 'Ahmed', 'APPRENANT'),
(12, 'Sfax', '2026-03-03 21:15:49.000000', 'sara.trabelsi@email.com', b'1', 'Trabelsi', '$2a$10$rp4FSkauqg1BOUbX0ueyG.OplYazCAn7gidvoTcSPAbKAtfB60eF.', '25478963', 'Sara', 'APPRENANT'),
(13, 'Sousse', '2026-03-03 21:17:42.000000', 'youssef.mansour@email.com', b'1', 'Mansour', '$2a$10$EoQLiLRuFo55pcYNUb5boOCn8bj8PI8QdhxQK1zIxtSTpvcNjRK.y', '29234561', 'Youssef', 'APPRENANT'),
(14, 'Ariana', '2026-03-03 21:19:24.000000', 'lina.khelifi@email.com', b'1', 'Khelifi', '$2a$10$G6XCK6JJxjwktbCtW4brzuWLNyGgqacNctY/3BM7rxzC0V/xKCGLO', '21456789', 'Lina', 'APPRENANT'),
(15, 'Bizerte', '2026-03-03 21:21:06.000000', 'karim.gharbi@email.com', b'1', 'Gharbi', '$2a$10$cdwLovr/G4Br4Ga7xQvd6OaXa1aJy211dJ09oyM6QGOkpLGLPI5/C', '26321478', 'Karim', 'APPRENANT'),
(16, 'Monastir', '2026-03-03 21:21:51.000000', 'nour.hamdi@email.com', b'1', 'Hamdi', '$2a$10$DPbpbUNVFdkUSRHNS3gIM.3um23OU1rmBMey0iEOExNXzNl.Lgg86', '27548963', 'Nour', 'APPRENANT'),
(17, 'Nabeul', '2026-03-03 21:22:39.000000', 'sami.chatti@email.com', b'1', 'Chatti', '$2a$10$VV3Q0C7tccg0ci3mj7WsweSsoZYFzl6L1yTFtAgxsYbAXUnXdWCfy', '23456781', 'Sami', 'APPRENANT'),
(18, 'Gabes', '2026-03-03 21:23:29.000000', 'amal.jaziri@email.com', b'1', 'Jaziri', '$2a$10$sqCybZFSUYmYhBrwkYGWWuv4b4gd4ccNobicWkQAhKQtYCcJ2EAv.', '20147896', 'Amal', 'APPRENANT'),
(19, 'Kairouan', '2026-03-03 21:24:07.000000', 'hatem.saidi@email.com', b'1', 'Saidi', '$2a$10$glz7nwRgddR8/aISjHp3ZeJX45wL/CISAltFn6d16j3s6e9B7uBZa', '29874563', 'Hatem', 'APPRENANT'),
(20, 'Mahdia', '2026-03-03 21:25:09.000000', 'mariem.zouari@email.com', b'1', 'Zouari', '$2a$10$ZBkpVuWFaESylbf3ZxwwJeZ5VVWkOwJQcNc8/R/cKMAoTy58SNpjO', '21369874', 'Mariem', 'APPRENANT'),
(21, 'Tataouine', '2026-03-03 21:25:52.000000', 'walid.fakhfakh@email.com', b'1', 'Fakhfakh', '$2a$10$bCHaqpdkEviJevVhAsNCQO1WXpc2m2q.IZlfO62eYllVx3KEoCPqC', '28963214', 'Mariem@123', 'APPRENANT'),
(22, 'Djerba', '2026-03-03 21:26:49.000000', 'rania.abid@email.com', b'1', 'Abid', '$2a$10$0vMimO7KBw8jstpmvZCx3eYuNyYdMyNZKDgWoN0.3HQ2C/sDeQ7vK', '24569871', 'Rania', 'APPRENANT');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
