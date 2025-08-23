  /*
  Navicat Premium Dump SQL

  Source Server         : MYSQL_Local
  Source Server Type    : MySQL
  Source Server Version : 80042 (8.0.42)
  Source Host           : localhost:3306
  Source Schema         : user

  Target Server Type    : MySQL
  Target Server Version : 80042 (8.0.42)
  File Encoding         : 65001

  Date: 19/08/2025 19:16:29
  */

  SET NAMES utf8mb4;
  SET FOREIGN_KEY_CHECKS = 0;

  -- ----------------------------
  -- Table structure for _prisma_migrations
  -- ----------------------------

  -- ----------------------------
  -- Table structure for friend
  -- ----------------------------
  DROP TABLE IF EXISTS `friend`;
  CREATE TABLE `friend` (
    `user_phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `friend_phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `status` enum('no','pending','accepted','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `last_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `last_message_date` datetime DEFAULT NULL,
    `unread_count_user` int DEFAULT NULL,
    `unread_count_friend` int DEFAULT NULL,
    PRIMARY KEY (`user_phone`,`friend_phone`) USING BTREE,
    KEY `Friend_friend_phone_idx` (`friend_phone`) USING BTREE,
    CONSTRAINT `Friend_friend_phone_fkey` FOREIGN KEY (`friend_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Friend_user_phone_fkey` FOREIGN KEY (`user_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

  -- ----------------------------
  -- Table structure for group
  -- ----------------------------
  DROP TABLE IF EXISTS `group`;
  CREATE TABLE `group` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `owner_phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `last_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `last_message_date` datetime DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `Group_owner_phone_fkey` (`owner_phone`) USING BTREE,
    CONSTRAINT `Group_owner_phone_fkey` FOREIGN KEY (`owner_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

  -- ----------------------------
  -- Table structure for groupmember
  -- ----------------------------
  DROP TABLE IF EXISTS `groupmember`;
  CREATE TABLE `groupmember` (
    `group_id` bigint NOT NULL,
    `user_phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `role` enum('member','admin','owner') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'member',
    `joined_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `status` tinyint(1) NOT NULL DEFAULT '1',
    `unread_count` int DEFAULT NULL,
    PRIMARY KEY (`group_id`,`user_phone`) USING BTREE,
    KEY `GroupMember_user_phone_idx` (`user_phone`) USING BTREE,
    CONSTRAINT `GroupMember_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `GroupMember_user_phone_fkey` FOREIGN KEY (`user_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

  -- ----------------------------
  -- Table structure for report
  -- ----------------------------
  DROP TABLE IF EXISTS `report`;
  CREATE TABLE `report` (
    `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
    `reported_phone` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    `reporter_phone` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
    `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
    `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `fk_report_reported_user` (`reported_phone`),
    KEY `fk_report_reporter_user` (`reporter_phone`),
    CONSTRAINT `fk_report_reported_user` FOREIGN KEY (`reported_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_report_reporter_user` FOREIGN KEY (`reporter_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  -- ----------------------------
  -- Table structure for token
  -- ----------------------------
  DROP TABLE IF EXISTS `token`;
  CREATE TABLE `token` (
    `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `userPhone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `refreshToken` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `accessToken` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `expiresAt` datetime(3) NOT NULL,
    `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` datetime(3) NOT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    KEY `Token_userPhone_fkey` (`userPhone`) USING BTREE,
    CONSTRAINT `Token_userPhone_fkey` FOREIGN KEY (`userPhone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

  -- ----------------------------
  -- Table structure for user
  -- ----------------------------
  DROP TABLE IF EXISTS `user`;
  CREATE TABLE `user` (
    `phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `password_hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NOTBLOCK',
    `avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    `createdAt` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
    `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
    PRIMARY KEY (`phone`) USING BTREE,
    UNIQUE KEY `User_email_key` (`email`) USING BTREE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

  SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_phone` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_phone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `group_id` bigint DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_type` enum('text','image','video','file') COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Message_sender_fkey` (`sender_phone`),
  KEY `Message_receiver_fkey` (`receiver_phone`),
  KEY `Message_group_fkey` (`group_id`),
  CONSTRAINT `Message_sender_fkey` FOREIGN KEY (`sender_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Message_receiver_fkey` FOREIGN KEY (`receiver_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Message_group_fkey` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for notification
-- ----------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_phone` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('unread','read') COLLATE utf8mb4_unicode_ci DEFAULT 'unread',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_user_fkey` (`user_phone`),
  CONSTRAINT `Notification_user_fkey` FOREIGN KEY (`user_phone`) REFERENCES `user` (`phone`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
