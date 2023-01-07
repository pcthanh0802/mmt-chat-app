-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 07, 2023 at 08:17 AM
-- Server version: 5.7.36
-- PHP Version: 7.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mmt-chat-app-db`
--

DELIMITER $$
--
-- Functions
--
DROP FUNCTION IF EXISTS `getFriendStatus`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `getFriendStatus` (`myId` CHAR(10), `theirId` CHAR(10)) RETURNS INT(11) BEGIN
	DECLARE status INT;
    
	IF (SELECT COUNT(*) FROM friendrequest WHERE senderId = myId AND receiverId = theirId) = 1 THEN SET status = 1;
    ELSEIF (SELECT COUNT(*) FROM friendrequest WHERE senderId = theirId AND receiverId = myId) = 1 THEN SET status = 2;
    ELSEIF (SELECT COUNT(*) FROM friend WHERE (user1Id = myId AND user2Id = theirId) OR (user2Id = myId AND user1Id = theirId)) = 1 THEN SET status = 3;
    ELSE SET status = 0;
    END IF;
    RETURN status;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `friend`
--

DROP TABLE IF EXISTS `friend`;
CREATE TABLE IF NOT EXISTS `friend` (
  `user1Id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user2Id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user1Id`,`user2Id`),
  KEY `friend_ibfk_2` (`user2Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `friend`
--

INSERT INTO `friend` (`user1Id`, `user2Id`) VALUES
('6b86237d2a', '07e177b364'),
('6b86237d2a', '215f29cbac'),
('95f2346570', '215f29cbac'),
('efcb184e0a', '65a982e3f5'),
('65a982e3f5', '6b86237d2a'),
('07e177b364', '95f2346570'),
('6b86237d2a', '95f2346570'),
('07e177b364', 'efcb184e0a'),
('95f2346570', 'efcb184e0a'),
('6b86237d2a', 'f669039d68');

-- --------------------------------------------------------

--
-- Table structure for table `friendrequest`
--

DROP TABLE IF EXISTS `friendrequest`;
CREATE TABLE IF NOT EXISTS `friendrequest` (
  `senderId` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiverId` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`senderId`,`receiverId`),
  KEY `friendRequest_ibfk_2` (`receiverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refreshtoken`
--

DROP TABLE IF EXISTS `refreshtoken`;
CREATE TABLE IF NOT EXISTS `refreshtoken` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` date NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `createdAt`, `image`) VALUES
('07e177b364', 'testing5', 'test5@gmail.com', '$2b$10$ix9b9tv0Z4/gdHiPZU1gJudQXFYssTA1aDjp3t1cXUZKev.rLBfIO', '2022-12-12', NULL),
('215f29cbac', 'naruto0123', 'uzumakinaruto@gmail.com', '$2b$10$SuIMIXNFegQYUH7dPaR8VeEbFDWQFx98X6tG0YeA1o8j4T5UNAEJS', '2022-12-18', NULL),
('2a01feb46b', 'sasukeUchiha', 'sasuke@konoha.com', '$2b$10$WT6jEv..Q1EJSRymkRzrAOpeG7SmDZx5mYgQJTs.gR3fozJg4Gq/W', '2022-12-18', NULL),
('65a982e3f5', 'testing4', 'test4@yahoo.com', '$2b$10$BUY4PnOj.q3SRNERrIQYsO/ppxyDtEWDoSuFhAK7.MYt7YoqawLh2', '2022-12-12', NULL),
('6b86237d2a', 'testing', 'test@gmail.com', '$2b$10$o/CDxPu/Jd/KK1NQSX1AYuJQas8F0TvpQr2zxaPaPB2iN.18Ygmru', '2022-12-10', NULL),
('95f2346570', 'testing2', 'test2@gmail.com', '$2b$10$uKyk0isECbq0KRQs9EBQSu62yLMQEyc5GQ/d4vwrKpflVeOHkwRMu', '2022-12-11', NULL),
('efcb184e0a', 'testing3', 'test3@gmail.com', '$2b$10$tG0E10W5TY27UPle37v3EOSoqaZ8nk5lyoGZSvL0HzO55UJLlbWO.', '2022-12-12', NULL),
('f669039d68', 'testing6', 'test6@yahoo.com', '$2b$10$LMVd9n32bD2KFSDUpmQ73eZHeKfV6WblO7o0kH3yJlxC7d5Pj2RAK', '2022-12-12', NULL);

--
-- Triggers `user`
--
DROP TRIGGER IF EXISTS `userCreatedAtDate`;
DELIMITER $$
CREATE TRIGGER `userCreatedAtDate` BEFORE INSERT ON `user` FOR EACH ROW SET NEW.createdAt = CURRENT_DATE
$$
DELIMITER ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `friend`
--
ALTER TABLE `friend`
  ADD CONSTRAINT `friend_ibfk_1` FOREIGN KEY (`user1Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `friend_ibfk_2` FOREIGN KEY (`user2Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `friendrequest`
--
ALTER TABLE `friendrequest`
  ADD CONSTRAINT `friendRequest_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `friendRequest_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;



-- CREATE TABLE IF NOT EXISTS `user`(
-- 	id CHAR(10) PRIMARY KEY,
--     username VARCHAR(20) UNIQUE NOT NULL,
--     email VARCHAR(50) UNIQUE NOT NULL,
--     password TEXT NOT NULL,
--     createdAt DATE NOT NULL,
--     image TEXT DEFAULT NULL
-- ) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- create trigger to insert current date to createdAt field 
-- CREATE TRIGGER userCreatedAtDate BEFORE INSERT ON `user`
-- FOR EACH ROW SET NEW.createdAt = CURRENT_DATE;

-- CREATE TABLE IF NOT EXISTS refreshToken(
-- 	id INT AUTO_INCREMENT PRIMARY KEY,
--     token TEXT NOT NULL
-- ) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE `friend` (
--   `user1Id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
--   `user2Id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
--   PRIMARY KEY (`user1Id`,`user2Id`),
--   CONSTRAINT `friend_ibfk_1` FOREIGN KEY (`user1Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
--   CONSTRAINT `friend_ibfk_2` FOREIGN KEY (`user2Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE `friendRequest` (
--   `senderId` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
--   `receiverId` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
--   PRIMARY KEY (`senderId`,`receiverId`),
--   CONSTRAINT `friend_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
--   CONSTRAINT `friend_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DELIMITER $$
-- CREATE FUNCTION getFriendStatus(IN myId CHAR(10), IN theirId CHAR(10)) RETURNS INT
-- BEGIN
-- 	DECLARE status INT;
    
-- 	IF (SELECT COUNT(*) FROM friendrequest WHERE senderId = myId AND receiverId = theirId) = 1 THEN SET status = 1;
--     ELSEIF (SELECT COUNT(*) FROM friendrequest WHERE senderId = theirId AND receiverId = myId) = 1 THEN SET status = 2;
--     ELSEIF (SELECT COUNT(*) FROM friend WHERE (user1Id = myId AND user2Id = theirId) OR (user2Id = myId AND user1Id = theirId)) = 1 THEN SET status = 3;
--     ELSE SET status = 0;
--     END IF;
--     RETURN status;
-- END$$
-- DELIMITER ;