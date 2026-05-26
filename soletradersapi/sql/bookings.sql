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
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) UNSIGNED NOT NULL,
  `service_id` int(11) UNSIGNED NOT NULL,
  `client_name` varchar(100) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `requested_date` date NOT NULL,
  `requested_start_time` time NOT NULL,
  `job_description` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `service_id`, `client_name`, `client_email`, `requested_date`, `requested_start_time`, `job_description`, `status`, `created_at`) VALUES
(20, 15, 'Happy Customer', 'customer@gmail.com', '2026-02-27', '09:30:00', 'I need lights installed please', 'rejected', '2026-02-24 21:27:38'),
(21, 15, 'Second Customer', 'customer2@gmail.com', '2026-02-27', '13:35:00', 'I need help too', 'rejected', '2026-02-24 21:32:53'),
(22, 15, 'John Jay', 'johnjay@hotmail.com', '2026-02-27', '09:35:00', '', 'accepted', '2026-02-26 17:36:53'),
(23, 15, 'Jane Joe', 'jane@hotmail.com', '2026-02-27', '13:02:00', '', 'accepted', '2026-02-26 17:37:34'),
(24, 19, 'John Jay', 'jubby@gmail.com', '2026-03-30', '10:09:00', 'Hey', 'accepted', '2026-03-02 16:09:25'),
(26, 19, 'Happy Customer', 'customer@gmail.com', '2026-03-04', '11:26:00', 'We require a professional plumber for an urgent installation of new copper piping throughout a ground floor extension. The job involves extending the existing central heating system to two new radiators and installing the primary supply lines for a small utility sink and washing machine. All work must be pressure tested to ensure there are no leaks before the flooring is laid. The pipework should be neatly clipped', 'rejected', '2026-03-02 20:27:47'),
(31, 19, 'Happy Customer', 'johnjay@hotmail.com', '2026-03-26', '09:00:00', '', 'rejected', '2026-03-06 14:55:20'),
(41, 33, 'Overlap Overlap', 'overlap@hotmail.com', '2026-03-16', '09:00:00', 'Overlap', 'rejected', '2026-03-07 02:10:20'),
(42, 33, 'Jerry Watts', 'jwatts@gmail.com', '2026-03-16', '10:15:00', '', 'accepted', '2026-03-07 02:15:56'),
(43, 33, 'Booker One', 'customer6@gmail.com', '2026-03-20', '10:30:00', 'Help please', 'rejected', '2026-03-07 02:33:19'),
(44, 33, 'Booker Two', 'sadsa@hotmail.com', '2026-03-24', '11:00:00', 'I need a frame', 'accepted', '2026-03-07 02:33:56'),
(45, 33, 'Booker Three', 'customer11@gmail.com', '2026-03-31', '12:00:00', 'Hi Giovanni', 'accepted', '2026-03-07 02:34:31'),
(46, 33, 'Jerry Watts', 'jwatts@gmail.com', '2026-03-30', '13:00:00', 'I need help sir', 'pending', '2026-03-09 22:34:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `booking_service_fk` (`service_id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `booking_service_fk` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
