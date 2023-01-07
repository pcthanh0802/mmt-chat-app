CREATE TABLE IF NOT EXISTS `user`(
	id CHAR(10) PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATE NOT NULL,
    image TEXT DEFAULT NULL
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- create trigger to insert current date to createdAt field 
CREATE TRIGGER userCreatedAtDate BEFORE INSERT ON `user`
FOR EACH ROW SET NEW.createdAt = CURRENT_DATE;

CREATE TABLE IF NOT EXISTS refreshToken(
	id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friend` (
  `user1Id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user2Id` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user1Id`,`user2Id`),
  CONSTRAINT `friend_ibfk_1` FOREIGN KEY (`user1Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `friend_ibfk_2` FOREIGN KEY (`user2Id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friendRequest` (
  `senderId` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiverId` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`senderId`,`receiverId`),
  CONSTRAINT `friend_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `friend_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE FUNCTION getFriendStatus(IN myId CHAR(10), IN theirId CHAR(10)) RETURNS INT
BEGIN
	DECLARE status INT;
    
	IF (SELECT COUNT(*) FROM friendrequest WHERE senderId = myId AND receiverId = theirId) = 1 THEN SET status = 1;
    ELSEIF (SELECT COUNT(*) FROM friendrequest WHERE senderId = theirId AND receiverId = myId) = 1 THEN SET status = 2;
    ELSEIF (SELECT COUNT(*) FROM friend WHERE (user1Id = myId AND user2Id = theirId) OR (user2Id = myId AND user1Id = theirId)) = 1 THEN SET status = 3;
    ELSE SET status = 0;
    END IF;
    RETURN status;
END$$
DELIMITER ;