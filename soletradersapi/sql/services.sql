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
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) UNSIGNED NOT NULL,
  `trader_id` int(11) UNSIGNED NOT NULL,
  `title` varchar(80) NOT NULL,
  `description` text DEFAULT NULL,
  `pricing_type` enum('hourly','fixed') NOT NULL,
  `base_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `trader_id`, `title`, `description`, `pricing_type`, `base_price`) VALUES
(15, 20, 'Light installation', 'I do light works !!', 'hourly', 10.00),
(18, 24, 'Fridge repairs', 'I fix fridges', 'fixed', 50.00),
(19, 19, 'Full & Partial Rewiring', 'Professional rewiring for kitchens or whole houses. Safe, efficient, and minimal disruption.', 'hourly', 12.00),
(25, 25, 'Fuse problems', 'Expert in fuse issues', 'hourly', 9.00),
(26, 42, 'Wood worker', 'I can do any kind of wood work', 'hourly', 10.00),
(33, 47, 'Framing', 'Best frames ever', 'hourly', 12.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `service_trader_fk` (`trader_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `service_trader_fk` FOREIGN KEY (`trader_id`) REFERENCES `traders` (`trader_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
