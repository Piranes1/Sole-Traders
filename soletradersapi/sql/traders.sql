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
-- Table structure for table `traders`
--

CREATE TABLE `traders` (
  `trader_id` int(11) UNSIGNED NOT NULL,
  `trader_name` varchar(100) NOT NULL,
  `trader_email` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `trade_type` varchar(80) NOT NULL,
  `region` varchar(150) NOT NULL,
  `availability` enum('available','soon','unavailable') NOT NULL DEFAULT 'available',
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `traders`
--

INSERT INTO `traders` (`trader_id`, `trader_name`, `trader_email`, `username`, `password_hash`, `trade_type`, `region`, `availability`, `bio`, `created_at`) VALUES
(19, 'Mario Builder', 'mario@gmail.com', 'mario', '$2b$12$bRSaIHuQYXL88kxnuFIAzuEIUrDv56J4BsN7gfkwtpYJ.W/lW8ka2', 'Carpenter', 'Armagh', 'unavailable', 'I used to be an electrician but now I\'m a carpenter.', '2026-02-16 19:11:02'),
(20, 'Jane Janet', 'jane@hotmail.com', 'jane15', '$2b$12$fhf1dE.KGbbeohuAxsDt9ebLXtvn.W2jc.nLSwkEziJOLYkZYSpz2', 'Electrician', 'Omagh', 'available', 'I\'m a motivated and friendly electrician', '2026-02-24 21:08:38'),
(21, 'Jeff Johnson', 'jeff@gmail.com', 'jeff14', '$2b$12$LSrP3.XwpjRqp.IcuJt2N.2.bICjQIWtpCzrYhqT08n6wohumNHxC', 'Builder', 'Belfast', 'available', 'I\'m a master of my trader', '2026-02-24 21:47:46'),
(24, 'Jimbo Harris', 'jimbo@hotmail.com', 'jimbo18', '$2b$12$nlw7sXaL.dKXx9D2m56jh.RG6D8V6Iwi29fB5glNgl5YqyCtPgk7.', 'Carpenter', 'Strabane', 'unavailable', 'Repairs and custom work', '2026-02-24 22:14:17'),
(25, 'John Trader', 'john19@hotmail.com', 'john_19', '$2b$12$PIz6bUs4KiMY7kRShqiVv.OA6JU/1g97utKnlRdBn7caX3OBIYPqC', 'Electrician', 'Strabane', 'unavailable', 'Right now I\'m not available, leave me alone.', '2026-03-04 19:01:23'),
(26, 'Mary Trader', 'mary19@hotmail.com', 'mary19', '$2b$12$.Fb6p1CIsAa8SfRu4TpxSenKDNeTtXSPlQqYihddXwvNQ2MgFfrVS', 'Carpenter', 'Strabane', 'available', 'Hey there I\'m Mary', '2026-03-04 19:38:24'),
(41, 'Mary New', 'mary20@hotmail.com', 'mary20', '$2b$12$CCwrSZJHx7ZjLjhim2kZWuLjeI6g2K7H8tpvvUkGqfa2QU1PLKd.W', 'Carpenter', 'Strabane', 'available', '', '2026-03-04 22:38:06'),
(42, 'Trader Three', 'trader3@hotmail.com', 'trader3', '$2b$12$.3BbV99YxvQlM.vbdEUhT.yuZ3876tG9cxM8MWSmVM6sTflPUl5My', 'Carpenter', 'Belfast', 'available', '', '2026-03-04 23:02:20'),
(43, 'Trader Four', 'trader4@hotmail.com', 'trader4', '$2b$12$XnULX2QuDKKFhjurs22o0eVvgPhiRacd.53l/Tz5ehYvsRnhdiFYG', 'Builder', 'Belfast', 'available', '', '2026-03-04 23:20:04'),
(44, 'Joe Builder', 'joe19@hotmail.com', 'joe19', '$2b$12$wCZ9FGmNClczYHCepiXmw.xRYEfdzCGYkk3KLb2UrTirsqHU5sJiG', 'Carpenter', 'Strabane', 'available', '', '2026-03-06 19:01:08'),
(47, 'Giovanni Rana', 'gio2000@hotmail.com', 'gio2000', '$2b$12$wdc3zWa9LWOtfK8TYRHTC.WTgBxiwBgV.SuVdo//Noc.EzHbHiflS', 'Carpenter', 'Belfast', 'available', 'Hey', '2026-03-06 23:26:31'),
(49, 'Jaime Turbett', 'jaime2003@hotmail.com', 'jaime2003', '$2b$12$FvnN6ZJ.uQeF06P5DkuaWeaLzKzYg5d38t8LsY4SmD2phTLw2e/Ua', 'Electrician', 'Strabane', 'available', 'Hey there', '2026-03-09 15:52:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `traders`
--
ALTER TABLE `traders`
  ADD PRIMARY KEY (`trader_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `trader_email` (`trader_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `traders`
--
ALTER TABLE `traders`
  MODIFY `trader_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
