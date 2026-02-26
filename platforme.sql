-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 26, 2026 at 03:23 AM
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
-- Database: `platforme`
--

-- --------------------------------------------------------

--
-- Table structure for table `badges`
--

CREATE TABLE `badges` (
  `badge_id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `required_level` int(11) DEFAULT NULL,
  `required_points` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `badges`
--

INSERT INTO `badges` (`badge_id`, `description`, `icon_url`, `name`, `required_level`, `required_points`) VALUES
(30, 'Complete your very first lab step', '/badges/first-blood.png', 'First Blood', 1, 10),
(31, 'Reach 50 points', '/badges/getting-started.png', 'Getting Started', 1, 50),
(32, 'Reach 100 points', '/badges/century-club.png', 'Century Club', 2, 100),
(33, 'Reach 250 points', '/badges/rising-star.png', 'Rising Star', 3, 250),
(34, 'Reach 500 points', '/badges/half-k.png', 'Half K', 6, 500),
(35, 'Reach 1000 points', '/badges/hacker-mind.png', 'Hacker Mind', 11, 1000),
(36, 'Reach 1500 points', '/badges/cyber-warrior.png', 'Cyber Warrior', 16, 1500),
(37, 'Reach 2000 points', '/badges/elite-hacker.png', 'Elite Hacker', 21, 2000),
(38, 'Reach 2500 points', '/badges/grand-master.png', 'Grand Master', 26, 2500),
(39, 'Reach level 5', '/badges/level5.png', 'Level 5', 5, 0),
(40, 'Reach level 10', '/badges/level10.png', 'Level 10', 10, 0),
(41, 'Reach level 20', '/badges/level20.png', 'Level 20', 20, 0);

-- --------------------------------------------------------

--
-- Table structure for table `docker_templates`
--

CREATE TABLE `docker_templates` (
  `docker_template_id` bigint(20) NOT NULL,
  `cpu_limit` double DEFAULT NULL,
  `environment_variables` text DEFAULT NULL,
  `exposed_ports` varchar(255) DEFAULT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `image_version` varchar(255) DEFAULT NULL,
  `memory_limit_mb` int(11) DEFAULT NULL,
  `network_mode` varchar(255) DEFAULT NULL,
  `startup_command` varchar(255) DEFAULT NULL,
  `volume_mounts` varchar(255) DEFAULT NULL,
  `lab_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `docker_templates`
--

INSERT INTO `docker_templates` (`docker_template_id`, `cpu_limit`, `environment_variables`, `exposed_ports`, `image_name`, `image_version`, `memory_limit_mb`, `network_mode`, `startup_command`, `volume_mounts`, `lab_id`) VALUES
(27, 0.5, 'MYSQL_ROOT_PASSWORD=dvwa,DVWA_DATABASE=dvwa', '80', 'vulnerables/web-dvwa', 'latest', 512, 'bridge', NULL, NULL, 32),
(28, 1, 'NODE_ENV=ctf', '3000', 'bkimminich/juice-shop', 'latest', 512, 'bridge', NULL, NULL, 33),
(29, 1, 'WEBGOAT_PORT=8080', '8080', 'webgoat/webgoat', 'latest', 512, 'bridge', NULL, NULL, 34),
(30, 0.3, NULL, '80', 'nginx', 'alpine', 128, 'bridge', NULL, NULL, 35),
(31, 0.3, NULL, '80', 'alpine', 'latest', 128, 'bridge', NULL, NULL, 36),
(32, 0.5, NULL, '80', 'ubuntu', '22.04', 256, 'bridge', NULL, NULL, 37),
(33, 0.3, NULL, '80', 'alpine', 'latest', 128, 'bridge', NULL, NULL, 38),
(34, 0.5, 'USER_PASSWORD=lowpriv123', '22', 'ubuntu', '22.04', 256, 'bridge', NULL, NULL, 39),
(35, 0.5, NULL, '80', 'python', '3.11-slim', 256, 'bridge', NULL, NULL, 40),
(36, 0.5, NULL, '80', 'ubuntu', '22.04', 512, 'bridge', NULL, NULL, 41);

-- --------------------------------------------------------

--
-- Table structure for table `labs`
--

CREATE TABLE `labs` (
  `lab_id` bigint(20) NOT NULL,
  `active` bit(1) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `difficulty` varchar(255) DEFAULT NULL,
  `estimated_duration_minutes` int(11) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `max_runtime_minutes` int(11) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `required_level` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `labs`
--

INSERT INTO `labs` (`lab_id`, `active`, `description`, `difficulty`, `estimated_duration_minutes`, `instructions`, `max_runtime_minutes`, `points`, `required_level`, `title`, `category_id`) VALUES
(32, b'1', 'Practice SQL injection on DVWA (Damn Vulnerable Web Application). Bypass login, extract database data using UNION injection, and dump credentials.', 'EASY', 30, 'Open the lab URL in your browser. Login with admin/password. Go to \'SQL Injection\' module. Set security to \'Low\' in DVWA Security page first.', 60, 100, 1, 'SQL Injection - DVWA', 16),
(33, b'1', 'Exploit the OWASP Juice Shop: find XSS vulnerabilities, bypass authentication, discover hidden API endpoints, and exploit broken access control.', 'MEDIUM', 50, 'Open the lab URL. Explore the Juice Shop application. Check the scoreboard at /#/score-board for challenge list. Use browser DevTools to inspect requests.', 90, 180, 3, 'OWASP Juice Shop - XSS & Auth', 16),
(34, b'1', 'Complete WebGoat lessons: injection flaws, broken authentication, sensitive data exposure, XXE, broken access control, and security misconfiguration.', 'MEDIUM', 45, 'Open the lab URL. Register a new account in WebGoat. Navigate through the lessons in order. Each lesson teaches a different vulnerability class.', 90, 150, 2, 'WebGoat - Web Security Training', 16),
(35, b'1', 'Exploit a misconfigured Nginx web server. Find hidden directories, access restricted files, exploit directory traversal, and discover server information leakage.', 'EASY', 25, 'Open the lab URL. The web server has several misconfigurations. Use browser, curl, and directory brute-forcing to discover hidden content and misconfigs.', 60, 80, 1, 'Web Server Misconfiguration', 16),
(36, b'1', 'Scan a target machine to discover open ports, identify services, detect OS version, and find potential vulnerabilities using Nmap and related tools.', 'EASY', 30, 'Use Nmap to scan the lab\'s assigned port and IP. Try different scan types: -sS (SYN), -sV (version), -O (OS detect), -A (aggressive). Explore the results.', 60, 90, 1, 'Network Scanning with Nmap', 17),
(37, b'1', 'Analyze network traffic from a pre-captured PCAP file. Find cleartext credentials, detect DNS tunneling, extract transferred files, and identify anomalous traffic.', 'MEDIUM', 40, 'Connect to the lab container. PCAP files are in /captures/. Use tshark, tcpdump, or the web-based viewer to analyze traffic and find the hidden flags.', 90, 130, 3, 'Traffic Analysis Challenge', 17),
(38, b'1', 'Master essential Linux commands: file navigation, permissions, process management, text processing, and basic scripting. Find flags hidden across the system.', 'EASY', 20, 'Connect to the container via the web terminal. Flags are hidden in various locations. Use ls, cat, find, grep, ps, and other commands to discover them.', 45, 60, 1, 'Linux Command Line Basics', 18),
(39, b'1', 'Start as a low-privilege user and escalate to root. Exploit SUID binaries, misconfigured cron jobs, writable scripts, and sudo misconfigurations.', 'HARD', 60, 'Connect via web terminal as user \'lowpriv\'. Run enumeration commands: find SUID files, check crontab, run sudo -l. Each escalation vector reveals a flag.', 120, 250, 5, 'Linux Privilege Escalation', 18),
(40, b'1', 'Break classical ciphers and crack password hashes. Solve Caesar, Vigenere, substitution ciphers, and crack MD5/SHA hashes using Python tools.', 'EASY', 25, 'Connect to the container. Encrypted challenges are in /challenges/. Python3 and common crypto tools (hashcat, john) are pre-installed. Crack each challenge.', 60, 70, 1, 'Cipher Cracking Workshop', 19),
(41, b'1', 'Analyze a simulated compromised system. Recover deleted files, examine logs, reconstruct the attack timeline, and find evidence of data exfiltration.', 'MEDIUM', 50, 'Connect to the container. Evidence files are in /evidence/. Use file, strings, binwalk, foremost, and log analysis to investigate the incident.', 120, 160, 4, 'Digital Forensics Investigation', 20);

-- --------------------------------------------------------

--
-- Table structure for table `lab_categories`
--

CREATE TABLE `lab_categories` (
  `category_id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lab_categories`
--

INSERT INTO `lab_categories` (`category_id`, `description`, `icon_url`, `name`) VALUES
(16, 'Find and exploit web vulnerabilities: SQL injection, XSS, CSRF, authentication bypass, SSRF, and more.', '/icons/web-security.png', 'Web Security'),
(17, 'Master network attacks and defense: packet analysis, MITM, scanning, enumeration, and traffic analysis.', '/icons/network-security.png', 'Network Security'),
(18, 'Learn Linux commands and escalation techniques: SUID, cron jobs, sudo misconfig, kernel exploits.', '/icons/linux.png', 'Linux & Privilege Escalation'),
(19, 'Break ciphers and crack hashes: Caesar, Vigenere, MD5, SHA, bcrypt, and encryption algorithms.', '/icons/cryptography.png', 'Cryptography'),
(20, 'Investigate digital crime: disk analysis, memory forensics, file recovery, and timeline reconstruction.', '/icons/forensics.png', 'Digital Forensics');

-- --------------------------------------------------------

--
-- Table structure for table `lab_instances`
--

CREATE TABLE `lab_instances` (
  `instance_id` bigint(20) NOT NULL,
  `access_url` varchar(255) DEFAULT NULL,
  `assigned_port` int(11) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `container_id` varchar(255) DEFAULT NULL,
  `container_name` varchar(255) DEFAULT NULL,
  `error_message` varchar(255) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `stopped_at` datetime(6) DEFAULT NULL,
  `lab_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lab_instances`
--

INSERT INTO `lab_instances` (`instance_id`, `access_url`, `assigned_port`, `completed_at`, `container_id`, `container_name`, `error_message`, `score`, `started_at`, `status`, `stopped_at`, `lab_id`, `user_id`) VALUES
(9, 'http://localhost:9100', 9100, NULL, '730b724d972f3578a8b2f1dfd9b25dec075b1083e2fee1cce2fe00ee6d407b19', 'gamix-lab32-user4-1772071563592', NULL, 0, '2026-02-26 02:07:32.000000', 'RUNNING', NULL, 32, 4),
(10, 'http://localhost:9104', 9104, NULL, '94a98ac3a8c86a6c3112a0e0c868188112f1e2b20d3f000726e64c31e2a605c3', 'gamix-lab32-user4-1772071920814', NULL, 0, '2026-02-26 02:12:02.000000', 'RUNNING', NULL, 32, 4);

-- --------------------------------------------------------

--
-- Table structure for table `lab_reviews`
--

CREATE TABLE `lab_reviews` (
  `review_id` bigint(20) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `lab_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lab_reviews`
--

INSERT INTO `lab_reviews` (`review_id`, `comment`, `created_at`, `rating`, `updated_at`, `lab_id`, `user_id`) VALUES
(1, 'yarh waldin waldikom', '2026-02-26 02:11:38.000000', 5, NULL, 33, 4);

-- --------------------------------------------------------

--
-- Table structure for table `lab_steps`
--

CREATE TABLE `lab_steps` (
  `step_id` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `flag` varchar(255) DEFAULT NULL,
  `hint` varchar(255) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `step_number` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `lab_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lab_steps`
--

INSERT INTO `lab_steps` (`step_id`, `description`, `flag`, `hint`, `points`, `step_number`, `title`, `lab_id`) VALUES
(81, 'The DVWA login page accepts admin/password. Once inside, go to the SQL Injection module (set security to Low). Inject a payload that returns all users from the database.', 'FLAG{sql_login_bypass}', 'Try entering: \' OR \'1\'=\'1 in the User ID field.', 30, 1, 'Bypass Login with SQL Injection', 32),
(82, 'Use UNION SELECT to extract the database version and table names from the information_schema. Find the users table.', 'FLAG{union_select_master}', 'Payload: \' UNION SELECT table_name, 2 FROM information_schema.tables #', 35, 2, 'UNION-Based Data Extraction', 32),
(83, 'Extract all usernames and password hashes from the users table using UNION injection.', 'FLAG{database_dump_complete}', 'Payload: \' UNION SELECT user, password FROM users #', 35, 3, 'Dump User Credentials', 32),
(84, 'The Juice Shop has a hidden score board page. Discover its URL by examining the JavaScript source or brute-forcing routes.', 'FLAG{scoreboard_discovered}', 'Check the main.js file or try /#/score-board in the URL.', 30, 1, 'Find the Score Board', 33),
(85, 'Login as the admin user without knowing the password. The login form is vulnerable to SQL injection.', 'FLAG{admin_login_bypassed}', 'Try: admin\'-- as the email with any password.', 50, 2, 'Admin Login Bypass', 33),
(86, 'Find an input field that reflects user input without sanitization and execute an XSS payload.', 'FLAG{xss_juice_reflected}', 'Try the search function with: <iframe src=\'javascript:alert(1)\'>', 50, 3, 'Reflected XSS Attack', 33),
(87, 'Exploit broken access control to view or modify another user\'s shopping cart via the API.', 'FLAG{broken_access_control}', 'Intercept API requests with DevTools. Change the basket ID in PUT/GET requests to /api/BasketItems/.', 50, 4, 'Access Another User\'s Cart', 33),
(88, 'Navigate to the SQL Injection (intro) lesson in WebGoat and complete all assignments. The flag appears after the final assignment.', 'FLAG{webgoat_sqli_complete}', 'Follow the lesson steps in order. Use \' OR \'1\'=\'1 as a starting point.', 40, 1, 'Complete SQL Injection Lesson', 34),
(89, 'Complete the Cross-Site Scripting lesson. Learn about reflected and stored XSS through WebGoat\'s guided exercises.', 'FLAG{webgoat_xss_complete}', 'Try <script>alert(document.cookie)</script> in the input fields.', 50, 2, 'Complete XSS Lesson', 34),
(90, 'Complete the Authentication Flaws lesson. Exploit authentication bypass, insecure login, and JWT vulnerabilities.', 'FLAG{webgoat_auth_complete}', 'Check the JWT token structure and try modifying the payload.', 60, 3, 'Complete Authentication Bypass', 34),
(91, 'The Nginx server has a hidden directory that wasn\'t meant to be public. Use directory brute-forcing to discover it.', 'FLAG{hidden_directory_found}', 'Try common paths: /admin, /backup, /secret, /.git, /config', 25, 1, 'Find Hidden Directory', 35),
(92, 'Find and read the Nginx configuration file to discover internal routing rules and backend service locations.', 'FLAG{nginx_config_exposed}', 'Try accessing /nginx.conf, /etc/nginx/nginx.conf or use directory traversal: /../../../etc/nginx/nginx.conf', 25, 2, 'Read Server Configuration', 35),
(93, 'The server has an area restricted by IP. Bypass the IP restriction to access the protected resource.', 'FLAG{ip_restriction_bypass}', 'Try adding X-Forwarded-For: 127.0.0.1 or X-Real-IP: 127.0.0.1 header.', 30, 3, 'Access Restricted Area', 35),
(94, 'Scan the target machine to find all open ports. One port is running an unusual service.', 'FLAG{port_scan_complete}', 'Use: nmap -sV -p- <target_ip> for a full port scan with version detection.', 25, 1, 'Port Discovery', 36),
(95, 'Identify the exact version of each service running on the open ports. Find the outdated service with known vulnerabilities.', 'FLAG{service_version_found}', 'Use: nmap -sV -sC <target_ip> for service version and default script scanning.', 30, 2, 'Service Identification', 36),
(96, 'Determine the exact operating system and kernel version of the target machine.', 'FLAG{os_detected}', 'Use: nmap -O <target_ip> or nmap -A <target_ip> for OS detection.', 35, 3, 'OS Fingerprinting', 36),
(97, 'Analyze the PCAP file and find an HTTP login request with credentials sent in cleartext.', 'FLAG{cleartext_password_http}', 'Use: tshark -r capture.pcap -Y \'http.request.method==POST\' -T fields -e http.file_data', 40, 1, 'Find Cleartext Password', 37),
(98, 'Find evidence of DNS tunneling in the capture. Decode the exfiltrated data from DNS query subdomains.', 'FLAG{dns_tunnel_detected}', 'Filter DNS queries: tshark -r capture.pcap -Y dns. Look for unusually long subdomains.', 45, 2, 'Detect DNS Tunneling', 37),
(99, 'A file was transferred over the network. Extract and reconstruct it from the packet capture.', 'FLAG{file_extracted}', 'Use: tshark or Wireshark \'Follow TCP Stream\' to find and extract the file contents.', 45, 3, 'Extract Transferred File', 37),
(100, 'A flag is hidden in a dotfile somewhere in the home directory tree. Use Linux commands to find it.', 'FLAG{hidden_file_found}', 'Use: find / -name \'.*flag*\' 2>/dev/null or ls -la in various directories.', 15, 1, 'Find the Hidden File', 38),
(101, 'A flag file exists but has restricted permissions. Find a way to read it using available tools.', 'FLAG{permissions_understood}', 'Check file permissions with ls -la. Look for SUID binaries or group membership that grants access.', 20, 2, 'Read the Protected File', 38),
(102, 'A process is serving a flag on a local port. Find the process and retrieve the flag.', 'FLAG{process_discovery}', 'Use: ps aux to find processes, netstat -tlnp for listening ports, then curl localhost:PORT.', 25, 3, 'Find the Running Service', 38),
(103, 'Find an SUID binary that can be abused to read files as root. Read /root/flag1.txt.', 'FLAG{suid_binary_exploit}', 'Run: find / -perm -4000 -type f 2>/dev/null. Check GTFOBins for exploitation techniques.', 60, 1, 'SUID Binary Exploit', 39),
(104, 'A cron job runs as root and executes a world-writable script. Modify it to copy the flag.', 'FLAG{cron_job_hijack}', 'Check: cat /etc/crontab and ls -la on scripts it runs. Append a command to read /root/flag2.txt.', 60, 2, 'Cron Job Hijack', 39),
(105, 'Your user has sudo privileges for a specific command. Abuse it to escalate to root.', 'FLAG{sudo_misconfiguration}', 'Run: sudo -l. Check GTFOBins for the allowed command\'s escalation technique.', 65, 3, 'Sudo Misconfiguration', 39),
(106, 'Combine all techniques to get a full root shell and read /root/flag4.txt.', 'FLAG{root_shell_achieved}', 'Use the most reliable escalation vector to spawn a root shell: sudo or SUID.', 65, 4, 'Root Flag', 39),
(107, 'Decrypt the Caesar cipher: \'SYNT{pnrfne_fuvsg_13}\'. The shift is the most common ROT value.', 'FLAG{caesar_shift_13}', 'ROT13 is the most common Caesar shift. Try: echo \'SYNT{pnrfne_fuvsg_13}\' | tr \'A-Za-z\' \'N-ZA-Mn-za-m\'', 20, 1, 'Break Caesar Cipher', 40),
(108, 'Crack this MD5 hash: 5f4dcc3b5aa765d61d8327deb882cf99. It\'s one of the most common passwords.', 'FLAG{md5_cracked_password}', 'Use: echo -n \'password\' | md5sum, or try an online MD5 database, or hashcat -m 0.', 25, 2, 'Crack MD5 Hash', 40),
(109, 'A flag has been encoded with Base64 multiple times. Decode it layer by layer until you get the flag.', 'FLAG{base64_layers_decoded}', 'Use: echo \'<encoded>\' | base64 -d repeatedly until the output is readable.', 25, 3, 'Decode Base64 Chain', 40),
(110, 'A critical evidence file was deleted. Use forensic tools to recover it from the disk image.', 'FLAG{deleted_file_recovered}', 'Use: foremost, scalpel, or photorec to carve files from the disk image in /evidence/.', 50, 1, 'Recover Deleted File', 41),
(111, 'Examine web server and system logs to determine how the attacker gained initial access.', 'FLAG{attack_vector_identified}', 'Check /evidence/logs/. Use grep, awk, sort, uniq to find the attack pattern and source IP.', 55, 2, 'Analyze Log Files', 41),
(112, 'The attacker exfiltrated data. Find evidence of what was stolen and how it was transmitted.', 'FLAG{exfiltration_traced}', 'Check bash_history, browser data, network logs, and look for encoded data or unusual outbound connections.', 55, 3, 'Find Exfiltration Evidence', 41);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(120) NOT NULL,
  `used` bit(1) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` bigint(20) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) NOT NULL,
  `role` enum('ADMIN','FORMATEUR','APPRENANT','RH_ENTREPRISE') NOT NULL,
  `level` int(11) DEFAULT NULL,
  `user_rank` varchar(255) DEFAULT NULL,
  `total_points` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `adresse`, `created_at`, `email`, `is_active`, `nom`, `password_hash`, `phone`, `prenom`, `role`, `level`, `user_rank`, `total_points`) VALUES
(1, NULL, '2026-02-25 01:52:38.000000', 'admin@gmail.com', b'1', 'Root', '$2a$10$kbo4RrGj.lC6/RZHRRqckusGtll0IcQGTbPsQIFNgIuix1zeFZMq6', NULL, 'Admin', 'ADMIN', NULL, NULL, NULL),
(2, 'arina', '2026-02-25 02:41:54.000000', 'uaze@gmail.com', b'1', 'fff', '$2a$10$L5ZgDNoqc5wb1uNJxam.n.n9wIIZtJpY2TMcI1EZ5BJPX4a9bzCzO', '92621394', 'fff', 'APPRENANT', NULL, NULL, NULL),
(3, 'Tunis, Tunisia', '2026-02-25 03:20:20.000000', 'ahmed@gmail.com', b'1', 'Ben Ali', '$2a$10$KUhf3hjTJp48f9CrIk2UDuIJriCIWuMEzQ979rV05C3y6up8003nm', '21698765432', 'Ahmed', 'APPRENANT', 1, 'BEGINNER', 0),
(4, 'Sousse, Tunisia', '2026-02-25 03:20:20.000000', 'sara@gmail.com', b'1', 'Mansouri', '$2a$10$TZywB.ZEoneFyIqGb10.GOxD.UDGvsplG1yQ4OdeEiGCyPm6iznry', '21697654321', 'Sara', 'APPRENANT', 1, 'BEGINNER', 0),
(5, 'Sfax, Tunisia', '2026-02-25 03:20:20.000000', 'yassine@gmail.com', b'1', 'Trabelsi', '$2a$10$QutFN.J6bNIjWoObtFuP/uuvJUpyjtBqCGhv5AZ6B/xt//14xUJi2', '21696543210', 'Yassine', 'APPRENANT', 1, 'BEGINNER', 0),
(6, 'Bizerte, Tunisia', '2026-02-25 03:20:20.000000', 'nour@gmail.com', b'1', 'Hamdi', '$2a$10$7ai6v83IB1g42HxK2vwlVu4u9f5tnRbfv2XR7jYhPSMEju3mx16zK', '21695432109', 'Nour', 'APPRENANT', 1, 'BEGINNER', 0),
(7, 'Nabeul, Tunisia', '2026-02-25 03:20:20.000000', 'karim@gmail.com', b'1', 'Jebali', '$2a$10$Y60IumBd1UxLGCDuIx1IGuTYTCwopslOh16TMiTf0Zbqw1ZY/qEpm', '21694321098', 'Karim', 'APPRENANT', 1, 'BEGINNER', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `user_id` bigint(20) NOT NULL,
  `badge_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_progress`
--

CREATE TABLE `user_progress` (
  `progress_id` bigint(20) NOT NULL,
  `attempts` int(11) DEFAULT NULL,
  `completed` bit(1) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `submitted_flag` varchar(255) DEFAULT NULL,
  `step_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_progress`
--

INSERT INTO `user_progress` (`progress_id`, `attempts`, `completed`, `completed_at`, `submitted_flag`, `step_id`, `user_id`) VALUES
(18, 4, b'0', NULL, '\' OR \'1\'=\'1', 81, 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`badge_id`);

--
-- Indexes for table `docker_templates`
--
ALTER TABLE `docker_templates`
  ADD PRIMARY KEY (`docker_template_id`),
  ADD UNIQUE KEY `UK_pl0r9j5qe0bxr452mqqs3ig3b` (`lab_id`);

--
-- Indexes for table `labs`
--
ALTER TABLE `labs`
  ADD PRIMARY KEY (`lab_id`),
  ADD KEY `FKfojerwinsgriqvp8eai1n8iqf` (`category_id`);

--
-- Indexes for table `lab_categories`
--
ALTER TABLE `lab_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `lab_instances`
--
ALTER TABLE `lab_instances`
  ADD PRIMARY KEY (`instance_id`),
  ADD KEY `FKisey7ie4lvy9bhfd95acoheh` (`lab_id`),
  ADD KEY `FKeau4i7b9paa48wl8i2hcejy9m` (`user_id`);

--
-- Indexes for table `lab_reviews`
--
ALTER TABLE `lab_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `UK7li7224dgkg36lcsfpb8ryft7` (`user_id`,`lab_id`),
  ADD KEY `FKk0l5kf6q2jmvty9wryxujih7` (`lab_id`);

--
-- Indexes for table `lab_steps`
--
ALTER TABLE `lab_steps`
  ADD PRIMARY KEY (`step_id`),
  ADD KEY `FKf38blnsdi7gfvgx4o8lq8v5xq` (`lab_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_71lqwbwtklmljk3qlsugr1mig` (`token`),
  ADD KEY `FKk3ndxg5xp6v7wd4gjyusp15gq` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD KEY `FKk6e00pguaij0uke6xr81gt045` (`badge_id`),
  ADD KEY `FKr46ah81sjymsn035m4ojstn5s` (`user_id`);

--
-- Indexes for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `FK3696ya3o5nqpo6642gi4v32r` (`step_id`),
  ADD KEY `FKrt37sneeps21829cuqetjm5ye` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `badges`
--
ALTER TABLE `badges`
  MODIFY `badge_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `docker_templates`
--
ALTER TABLE `docker_templates`
  MODIFY `docker_template_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `labs`
--
ALTER TABLE `labs`
  MODIFY `lab_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `lab_categories`
--
ALTER TABLE `lab_categories`
  MODIFY `category_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `lab_instances`
--
ALTER TABLE `lab_instances`
  MODIFY `instance_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lab_reviews`
--
ALTER TABLE `lab_reviews`
  MODIFY `review_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lab_steps`
--
ALTER TABLE `lab_steps`
  MODIFY `step_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_progress`
--
ALTER TABLE `user_progress`
  MODIFY `progress_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `docker_templates`
--
ALTER TABLE `docker_templates`
  ADD CONSTRAINT `FK6ki1rasehruoha646fx9d4m68` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`lab_id`);

--
-- Constraints for table `labs`
--
ALTER TABLE `labs`
  ADD CONSTRAINT `FKfojerwinsgriqvp8eai1n8iqf` FOREIGN KEY (`category_id`) REFERENCES `lab_categories` (`category_id`);

--
-- Constraints for table `lab_instances`
--
ALTER TABLE `lab_instances`
  ADD CONSTRAINT `FKeau4i7b9paa48wl8i2hcejy9m` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `FKisey7ie4lvy9bhfd95acoheh` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`lab_id`);

--
-- Constraints for table `lab_reviews`
--
ALTER TABLE `lab_reviews`
  ADD CONSTRAINT `FKk0l5kf6q2jmvty9wryxujih7` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`lab_id`),
  ADD CONSTRAINT `FKs5ku4i7ahfhix5i8jpccwaju3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `lab_steps`
--
ALTER TABLE `lab_steps`
  ADD CONSTRAINT `FKf38blnsdi7gfvgx4o8lq8v5xq` FOREIGN KEY (`lab_id`) REFERENCES `labs` (`lab_id`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `FKk6e00pguaij0uke6xr81gt045` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`badge_id`),
  ADD CONSTRAINT `FKr46ah81sjymsn035m4ojstn5s` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD CONSTRAINT `FK3696ya3o5nqpo6642gi4v32r` FOREIGN KEY (`step_id`) REFERENCES `lab_steps` (`step_id`),
  ADD CONSTRAINT `FKrt37sneeps21829cuqetjm5ye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
