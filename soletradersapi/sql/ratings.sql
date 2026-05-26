-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2026 at 08:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `soletraders`
--

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` int(11) UNSIGNED NOT NULL,
  `trader_id` int(11) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`rating_id`, `trader_id`, `rating`, `created_at`) VALUES
(1, 19, 5, '2026-02-20 15:10:39'),
(2, 19, 3, '2026-02-20 15:11:02'),
(3, 19, 1, '2026-02-20 15:12:04'),
(4, 19, 2, '2026-02-20 15:12:07'),
(5, 19, 5, '2026-02-20 15:12:10'),
(6, 19, 5, '2026-02-20 16:16:24'),
(11, 20, 5, '2026-02-24 21:21:07'),
(12, 20, 1, '2026-02-24 21:21:10'),
(13, 20, 4, '2026-02-24 21:21:12'),
(14, 20, 5, '2026-03-01 22:19:56'),
(15, 20, 5, '2026-03-01 22:24:16'),
(16, 20, 3, '2026-03-01 23:15:31'),
(17, 19, 5, '2026-03-02 21:36:09'),
(18, 19, 5, '2026-03-02 22:05:57'),
(20, 19, 1, '2026-03-02 22:20:59'),
(22, 19, 5, '2026-03-02 22:21:55'),
(24, 19, 5, '2026-03-03 00:13:02'),
(25, 21, 5, '2026-03-04 17:59:14'),
(26, 21, 3, '2026-03-04 17:59:18'),
(27, 21, 2, '2026-03-04 17:59:20'),
(28, 21, 1, '2026-03-04 17:59:22'),
(32, 24, 5, '2026-03-04 17:59:58'),
(33, 24, 5, '2026-03-04 18:00:01'),
(34, 42, 5, '2026-03-04 23:13:30'),
(35, 42, 1, '2026-03-04 23:13:34'),
(36, 42, 2, '2026-03-04 23:13:37'),
(37, 42, 5, '2026-03-04 23:13:38'),
(38, 21, 3, '2026-03-04 23:42:14'),
(39, 19, 5, '2026-03-05 00:03:31'),
(40, 19, 5, '2026-03-05 00:08:18'),
(41, 19, 5, '2026-03-05 00:19:06'),
(42, 19, 4, '2026-03-05 00:22:40'),
(43, 19, 4, '2026-03-05 00:24:33'),
(44, 19, 5, '2026-03-05 00:29:03'),
(45, 19, 3, '2026-03-05 00:35:44'),
(46, 19, 3, '2026-03-05 00:39:53'),
(47, 19, 3, '2026-03-05 00:43:25'),
(48, 19, 3, '2026-03-05 00:45:59'),
(49, 19, 3, '2026-03-05 01:02:46'),
(50, 25, 5, '2026-03-05 01:10:25'),
(51, 25, 3, '2026-03-05 01:10:26'),
(52, 25, 1, '2026-03-05 01:10:27'),
(53, 25, 4, '2026-03-05 01:10:28'),
(54, 25, 5, '2026-03-05 01:10:30'),
(55, 26, 5, '2026-03-05 01:10:40'),
(56, 26, 2, '2026-03-05 01:10:42'),
(57, 41, 5, '2026-03-05 01:10:49'),
(58, 41, 4, '2026-03-05 01:10:50'),
(59, 26, 1, '2026-03-05 01:11:16'),
(60, 26, 1, '2026-03-05 01:11:17'),
(61, 26, 1, '2026-03-05 01:11:18'),
(67, 19, 1, '2026-03-06 14:06:08'),
(68, 19, 5, '2026-03-06 14:08:08'),
(69, 19, 1, '2026-03-06 14:08:12'),
(71, 19, 3, '2026-03-06 14:58:23'),
(73, 19, 5, '2026-03-06 14:58:30'),
(80, 19, 5, '2026-03-06 16:29:38'),
(81, 19, 1, '2026-03-06 16:34:31'),
(89, 19, 3, '2026-03-07 01:32:49'),
(90, 19, 3, '2026-03-07 01:37:40'),
(91, 19, 3, '2026-03-07 01:40:55'),
(92, 19, 2, '2026-03-07 01:48:10'),
(93, 19, 5, '2026-03-07 02:02:42'),
(99, 19, 5, '2026-03-09 22:33:21'),
(100, 19, 5, '2026-03-09 22:33:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD KEY `rating_trader_fk` (`trader_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `rating_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `rating_trader_fk` FOREIGN KEY (`trader_id`) REFERENCES `traders` (`trader_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
