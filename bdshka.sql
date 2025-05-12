-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: bd
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `boards`
--

DROP TABLE IF EXISTS `boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `short_name` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_hidden` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `short_name` (`short_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boards`
--

LOCK TABLES `boards` WRITE;
/*!40000 ALTER TABLE `boards` DISABLE KEYS */;
INSERT INTO `boards` VALUES (1,'b','Бред','Обсуждение всего подряд','2025-04-28 09:40:42',0),(2,'vg','Видеоигры','Обсуждение игр и консолей','2025-04-28 09:40:42',0),(3,'news','Новости','Актуальные новости со всего мира','2025-04-28 09:40:42',0),(4,'a','Аниме','Обсуждение аниме и манги','2025-04-28 09:40:42',0),(5,'mu','Музыка','Обсуждение музыки и исполнителей','2025-04-28 09:40:42',0);
/*!40000 ALTER TABLE `boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderators`
--

DROP TABLE IF EXISTS `moderators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `role` enum('admin','moderator') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderators`
--

LOCK TABLES `moderators` WRITE;
/*!40000 ALTER TABLE `moderators` DISABLE KEYS */;
INSERT INTO `moderators` VALUES (1,'admin','admin','2025-04-28 09:40:42','admin'),(2,'mod_b','moderator','2025-04-28 09:40:42','moder'),(3,'mod_vg','moderator','2025-04-28 09:40:42','moder'),(4,'puq','moderator','2025-04-28 09:40:42','moder'),(5,'eblo','moderator','2025-05-07 19:25:31','eblo');
/*!40000 ALTER TABLE `moderators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thread_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `is_op` tinyint(1) DEFAULT '0',
  `name` varchar(50) DEFAULT 'Аноним',
  `subject` varchar(200) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('accepted','onquerry','declined') NOT NULL DEFAULT 'onquerry',
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_posts_thread` (`thread_id`),
  KEY `idx_posts_created` (`created_at`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,NULL,1,'Аноним','Почему трава зеленая?','Вот сижу думаю, почему трава зеленая?','2025-04-28 09:40:42','accepted'),(2,2,NULL,1,'Философ','Философский тред','Давайте обсудим смысл жизни','2025-04-28 09:40:42','declined'),(3,3,NULL,1,'Геймер','Обсуждение Elden Ring','Кто прошел Elden Ring?','2025-04-28 09:40:42','onquerry'),(4,4,NULL,1,'Критик','Лучшие игры 2023 года','Какие игры вам понравились?','2025-04-28 09:40:42','onquerry'),(5,5,NULL,1,'Редактор','Главные новости сегодня','Сегодня произошло важное событие...','2025-04-28 09:40:42','onquerry'),(6,6,NULL,1,'Отаку','Какое аниме посмотреть?','Посоветуйте хорошее аниме','2025-04-28 09:40:42','onquerry'),(7,1,NULL,0,'Биолог',NULL,'Трава зеленая из-за хлорофилла','2025-04-28 09:40:42','onquerry'),(8,1,NULL,0,'Аноним',NULL,'А мне кажется, это заговор','2025-04-28 09:40:42','onquerry'),(9,2,NULL,0,'Мудрец',NULL,'Смысл жизни в 42','2025-04-28 09:40:42','onquerry'),(10,2,NULL,0,'Скептик',NULL,'Жизнь не имеет смысла','2025-04-28 09:40:42','onquerry'),(11,3,NULL,0,'Хардкорщик',NULL,'Elden Ring - шедевр!','2025-04-28 09:40:42','onquerry'),(12,3,NULL,0,'Новичок',NULL,'Слишком сложно для меня','2025-04-28 09:40:42','onquerry'),(13,6,NULL,0,'Анимешник',NULL,'Советую Attack on Titan','2025-04-28 09:40:42','onquerry'),(14,6,NULL,0,'Аноним',NULL,'Demon Slayer тоже хорош','2025-04-28 09:40:42','onquerry');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `threads`
--

DROP TABLE IF EXISTS `threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `threads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_closed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `post_count` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_threads_board` (`board_id`),
  CONSTRAINT `threads_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `threads`
--

LOCK TABLES `threads` WRITE;
/*!40000 ALTER TABLE `threads` DISABLE KEYS */;
INSERT INTO `threads` VALUES (1,1,'Почему трава зеленая?',0,0,'2025-04-28 09:40:42','2025-04-28 09:40:42',3),(2,1,'Философский тред',1,0,'2025-04-28 09:40:42','2025-04-28 09:40:42',5),(3,2,'Обсуждение Elden Ring',0,0,'2025-04-28 09:40:42','2025-04-28 09:40:42',8),(4,2,'Лучшие игры 2023 года',0,1,'2025-04-28 09:40:42','2025-04-28 09:40:42',1),(5,3,'Главные новости сегодня',1,0,'2025-04-28 09:40:42','2025-04-28 09:40:42',1),(6,4,'Какое аниме посмотреть?',0,0,'2025-04-28 09:40:42','2025-04-28 09:40:42',4);
/*!40000 ALTER TABLE `threads` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-08  1:40:19
