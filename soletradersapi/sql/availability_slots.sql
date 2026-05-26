-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2026 at 08:43 PM
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
-- Table structure for table `availability_slots`
--

CREATE TABLE `availability_slots` (
  `slot_id` int(11) UNSIGNED NOT NULL,
  `trader_id` int(11) UNSIGNED NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `availability_slots`
--

INSERT INTO `availability_slots` (`slot_id`, `trader_id`, `day_of_week`, `start_time`, `end_time`) VALUES
(71, 20, 'Monday', '09:00:00', '17:00:00'),
(72, 20, 'Wednesday', '09:00:00', '17:00:00'),
(73, 20, 'Friday', '09:00:00', '17:00:00'),
(117, 24, 'Monday', '09:00:00', '17:00:00'),
(118, 24, 'Wednesday', '09:00:00', '17:00:00'),
(119, 24, 'Thursday', '09:00:00', '17:00:00'),
(150, 25, 'Monday', '09:00:00', '17:00:00'),
(151, 25, 'Tuesday', '09:00:00', '17:00:00'),
(152, 25, 'Wednesday', '09:00:00', '17:00:00'),
(153, 25, 'Thursday', '09:00:00', '17:00:00'),
(154, 25, 'Friday', '09:00:00', '17:00:00'),
(163, 26, 'Monday', '09:00:00', '17:00:00'),
(164, 26, 'Thursday', '09:00:00', '17:00:00'),
(200, 41, 'Monday', '09:00:00', '17:00:00'),
(201, 41, 'Tuesday', '09:00:00', '17:00:00'),
(202, 41, 'Wednesday', '09:00:00', '17:00:00'),
(203, 41, 'Thursday', '09:00:00', '17:00:00'),
(204, 41, 'Friday', '09:00:00', '17:00:00'),
(205, 42, 'Monday', '09:00:00', '17:00:00'),
(206, 42, 'Tuesday', '09:00:00', '17:00:00'),
(207, 42, 'Wednesday', '09:00:00', '17:00:00'),
(208, 42, 'Thursday', '09:00:00', '17:00:00'),
(209, 42, 'Friday', '09:00:00', '17:00:00'),
(213, 43, 'Monday', '09:00:00', '17:00:00'),
(214, 43, 'Tuesday', '09:00:00', '17:00:00'),
(215, 43, 'Wednesday', '09:00:00', '17:00:00'),
(357, 49, 'Monday', '09:00:00', '17:00:00'),
(358, 49, 'Tuesday', '09:00:00', '17:00:00'),
(359, 49, 'Wednesday', '09:00:00', '17:00:00'),
(360, 49, 'Thursday', '09:00:00', '17:00:00'),
(361, 49, 'Friday', '09:00:00', '17:00:00'),
(362, 47, 'Monday', '09:00:00', '17:00:00'),
(363, 47, 'Tuesday', '09:00:00', '17:00:00'),
(364, 47, 'Wednesday', '09:00:00', '17:00:00'),
(365, 47, 'Thursday', '09:00:00', '17:00:00'),
(366, 47, 'Friday', '09:00:00', '17:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `availability_slots`
--
ALTER TABLE `availability_slots`
  ADD PRIMARY KEY (`slot_id`),
  ADD KEY `availability_trader_fk` (`trader_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `availability_slots`
--
ALTER TABLE `availability_slots`
  MODIFY `slot_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=367;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `availability_slots`
--
ALTER TABLE `availability_slots`
  ADD CONSTRAINT `availability_trader_fk` FOREIGN KEY (`trader_id`) REFERENCES `traders` (`trader_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
