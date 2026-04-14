-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: platforme
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(120) NOT NULL,
  `used` bit(1) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_71lqwbwtklmljk3qlsugr1mig` (`token`),
  KEY `FKk3ndxg5xp6v7wd4gjyusp15gq` (`user_id`),
  CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,'2026-02-23 07:13:06.000000','0e60866b-6bfa-48ab-a2e7-bc1c8fe473be','',14),(2,'2026-02-23 07:19:07.000000','c3d96969-8927-49b0-902f-53f8b9438171','\0',17),(3,'2026-02-23 07:20:12.000000','0b611eb1-471c-46c3-bd70-3741693a67f8','\0',5),(4,'2026-02-23 07:20:34.000000','86f4f5d5-e8b8-458f-9004-19b5f4836ec0','',19),(5,'2026-02-23 07:56:23.000000','5ff91b07-255b-49af-b276-192f7aeac6a6','',19),(6,'2026-02-23 07:57:27.000000','d6b977d1-4e36-453a-8f20-b00c1f7fb42f','',19),(7,'2026-02-23 08:45:47.000000','205d9914-faf0-445e-bee3-c67f4c0e0627','',14),(8,'2026-02-23 08:45:50.000000','c4a78746-31d5-468b-999d-b7dbf3fe2ff1','',14),(9,'2026-02-23 08:45:55.000000','c66bed91-5a29-4ef0-a873-92c835e3fd43','\0',14);
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id_user` bigint(20) NOT NULL AUTO_INCREMENT,
  `adresse` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) NOT NULL,
  `role` enum('ADMIN','FORMATEUR','APPRENANT','RH_ENTREPRISE') NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'GBEes','2026-02-19 04:26:53.000000','hazem@gmail.com','','cheref','$2a$10$NN.T1vy1oGMOE.lj3.FdBOVx.h5gOzSxcx6to8ADrizbAVGFWE4BO','12345678','hazem','RH_ENTREPRISE'),(8,'Tunis','2026-02-22 03:36:32.000000','aziz@test.com','','Aziz','$2a$10$PfIb9KChCtaTZRR3xMCEHujOCFSgPUcB50AYrVvAS4FCZulJVD65e','12345678','AZIZ','FORMATEUR'),(9,'fsd','2026-02-22 05:04:20.000000','gdz@gmail.com','','yhsa','$2a$10$YnmqtTVCet5rXksD/TfNgOMXukP2cyfm.pfVy4qk2RjOguGYPH8Xu','gfdzs','gfzer','APPRENANT'),(10,'hudfg','2026-02-22 05:05:40.000000','io@gmail','','hzhz','$2a$10$VHfuAzXswNsFuhYmmOaKmuGUNotmnA1XyUmYZSKPKINxT3IB8hehK','dshfuifh²','haha','APPRENANT'),(11,'tunis','2026-02-22 05:10:26.000000','jj@gmail.com','','jjfd','$2a$10$jOG7cGbMIPzLkaCK6EpRw.WsWqgxioDKG1aCH67Uu9pgKF4XJw2Oq','12345678','jjre','APPRENANT'),(12,NULL,'2026-02-22 05:44:46.000000','ugvhzedasighl@esprit.tn','','uygdsgyu²','$2a$10$OdUwnBa.NX3puQTz7PDmdOilCKTzQH7p7QwUoxkfyGKPUYJFTm4/a',NULL,'daqszr-tèsyudza','APPRENANT'),(13,'tunis','2026-02-22 14:41:16.000000','ddd@gmail.com','','dddd','$2a$10$yoE8mXlY3lIlBNK2bOWpaOutAs6aH3Mv8GinUbC/BYqTFgq8SqtZ2','gdefg','ddd','APPRENANT'),(14,'tunis','2026-02-22 16:06:49.000000','bedis@gmail.com','','bedis','$2a$10$a6LbuY8m9jE5Zyhkhi86BeaiUB9.7q2H2Rzg7LQLqMdiPrD/VimNu','12345678','bedis','APPRENANT'),(16,NULL,'2026-02-22 21:40:18.000000','admin@gmail.com','','Root','$2a$10$Tvq48J1.QnpRrtT.sg7gTOZMEeuSK5TQl86r2fljwXqqEm4Fhv7Y.',NULL,'Admin','ADMIN'),(17,'TUNIS','2026-02-22 23:00:51.000000','sahar@gmail.com','','sahar','$2a$10$//F6CVqvjKUfwJPs11DvcOdPynwO0fP7xPf/h2BFxTVJstuYrrrvC','12345667','khyari','APPRENANT'),(18,'ZETYH','2026-02-22 23:03:04.000000','YALA@gmail.com','','YALA','$2a$10$O3DEFvsh1RbdaCqqw8a9PeruKD3QSvLhoohk7dpvM0f9.HMsGL4mu','12345678','BINA','RH_ENTREPRISE'),(19,'tunis','2026-02-23 02:24:51.000000','iheb@gmail.com','','iheb','$2a$10$H9xMgUJvChgzZCLIqsEPROBD3/nlQxl4JZ02ihedtCMU1FJCuZrNi','12345678','jbir','ADMIN'),(24,'tunis','2026-03-03 05:35:33.000000','dali@gmail.com','','dali','$2a$10$WWrJEf6AjUHPGVEuEkXqQ.O3kr8TksoBqohPBkGPcm1prKrnkA89i','26512108','chrayta','FORMATEUR'),(25,'Tunis','2026-03-03 20:58:08.000000','nouha.chine21@gmail.com','','Chine','$2a$10$IeNU6onTL9Khd3.9crkW6efSUOikG8oN6oo198xXquPKXSF2SJYTO','52715672','Nouha','APPRENANT');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-13  0:10:17
