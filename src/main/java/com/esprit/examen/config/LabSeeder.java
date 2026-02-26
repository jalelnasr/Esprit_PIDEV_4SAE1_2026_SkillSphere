package com.esprit.examen.config;

import com.esprit.examen.entities.*;
import com.esprit.examen.repositories.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Seeds the platform with lab categories, labs, steps, Docker templates, and badges.
 * Uses REAL public Docker images that anyone with Docker Desktop can pull.
 * Auto-detects stale data with invalid images and re-seeds if needed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)
public class LabSeeder implements CommandLineRunner {

    private final LabCategoryRepository labCategoryRepository;
    private final LabRepository labRepository;
    private final LabStepRepository labStepRepository;
    private final DockerTemplateRepository dockerTemplateRepository;
    private final BadgeRepository badgeRepository;
    private final UserProgressRepository userProgressRepository;
    private final LabInstanceRepository labInstanceRepository;
    private final LabReviewRepository labReviewRepository;
    private final EntityManager entityManager;

    /** Known valid images that this seeder uses */
    private static final Set<String> VALID_IMAGES = Set.of(
            "vulnerables/web-dvwa", "bkimminich/juice-shop", "webgoat/webgoat",
            "nginx", "alpine", "ubuntu", "python"
    );

    @Override
    @Transactional
    public void run(String... args) {
        if (labCategoryRepository.count() > 0) {
            if (!hasStaleData()) {
                log.info("Lab data already exists and is up-to-date, skipping seeder");
                return;
            }
            log.warn("Detected stale lab data with invalid Docker images - clearing and re-seeding...");
            clearAllSeededData();
        }

        log.info("Seeding lab data with real Docker images...");

        List<Badge> badges = seedBadges();
        List<LabCategory> categories = seedCategories();
        List<Lab> labs = seedLabs(categories);
        seedDockerTemplates(labs);
        List<LabStep> steps = seedLabSteps(labs);

        log.info("Lab data seeded: {} categories, {} labs, {} steps, {} badges, {} Docker templates",
                categories.size(), labs.size(), steps.size(), badges.size(), labs.size());
        log.info("All Docker images are public - they will be pulled automatically on first lab start");
    }

    /** Check if any Docker templates reference images that don't exist on Docker Hub */
    private boolean hasStaleData() {
        List<DockerTemplate> templates = dockerTemplateRepository.findAll();
        for (DockerTemplate t : templates) {
            if (t.getImageName() != null && !VALID_IMAGES.contains(t.getImageName())) {
                log.warn("Found invalid Docker image: {}:{}", t.getImageName(), t.getImageVersion());
                return true;
            }
        }
        return false;
    }

    /** Clear all seeded data in correct order to respect foreign keys */
    private void clearAllSeededData() {
        userProgressRepository.deleteAll();
        labReviewRepository.deleteAll();
        labInstanceRepository.deleteAll();
        // LabCategory -> Lab cascade handles: lab_steps, docker_templates
        labCategoryRepository.deleteAll();
        // Clear user_badges join table before deleting badges
        entityManager.createNativeQuery("DELETE FROM user_badges").executeUpdate();
        badgeRepository.deleteAll();
        entityManager.flush();
        log.info("Cleared all old lab data");
    }

    // ==================== BADGES ====================

    private List<Badge> seedBadges() {
        List<Badge> badges = new ArrayList<>();

        badges.add(badge("First Blood", "Complete your very first lab step", "/badges/first-blood.png", 10, 1));
        badges.add(badge("Getting Started", "Reach 50 points", "/badges/getting-started.png", 50, 1));
        badges.add(badge("Century Club", "Reach 100 points", "/badges/century-club.png", 100, 2));
        badges.add(badge("Rising Star", "Reach 250 points", "/badges/rising-star.png", 250, 3));
        badges.add(badge("Half K", "Reach 500 points", "/badges/half-k.png", 500, 6));
        badges.add(badge("Hacker Mind", "Reach 1000 points", "/badges/hacker-mind.png", 1000, 11));
        badges.add(badge("Cyber Warrior", "Reach 1500 points", "/badges/cyber-warrior.png", 1500, 16));
        badges.add(badge("Elite Hacker", "Reach 2000 points", "/badges/elite-hacker.png", 2000, 21));
        badges.add(badge("Grand Master", "Reach 2500 points", "/badges/grand-master.png", 2500, 26));
        badges.add(badge("Level 5", "Reach level 5", "/badges/level5.png", 0, 5));
        badges.add(badge("Level 10", "Reach level 10", "/badges/level10.png", 0, 10));
        badges.add(badge("Level 20", "Reach level 20", "/badges/level20.png", 0, 20));

        return badgeRepository.saveAll(badges);
    }

    private Badge badge(String name, String desc, String icon, int points, int level) {
        Badge b = new Badge();
        b.setName(name);
        b.setDescription(desc);
        b.setIconUrl(icon);
        b.setRequiredPoints(points);
        b.setRequiredLevel(level);
        return b;
    }

    // ==================== CATEGORIES ====================

    private List<LabCategory> seedCategories() {
        List<LabCategory> cats = new ArrayList<>();

        cats.add(category("Web Security",
                "Find and exploit web vulnerabilities: SQL injection, XSS, CSRF, authentication bypass, SSRF, and more.",
                "/icons/web-security.png"));

        cats.add(category("Network Security",
                "Master network attacks and defense: packet analysis, MITM, scanning, enumeration, and traffic analysis.",
                "/icons/network-security.png"));

        cats.add(category("Linux & Privilege Escalation",
                "Learn Linux commands and escalation techniques: SUID, cron jobs, sudo misconfig, kernel exploits.",
                "/icons/linux.png"));

        cats.add(category("Cryptography",
                "Break ciphers and crack hashes: Caesar, Vigenere, MD5, SHA, bcrypt, and encryption algorithms.",
                "/icons/cryptography.png"));

        cats.add(category("Digital Forensics",
                "Investigate digital crime: disk analysis, memory forensics, file recovery, and timeline reconstruction.",
                "/icons/forensics.png"));

        return labCategoryRepository.saveAll(cats);
    }

    private LabCategory category(String name, String desc, String icon) {
        LabCategory c = new LabCategory();
        c.setName(name);
        c.setDescription(desc);
        c.setIconUrl(icon);
        return c;
    }

    // ==================== LABS (with REAL Docker images) ====================

    private List<Lab> seedLabs(List<LabCategory> cats) {
        LabCategory web = cats.get(0);
        LabCategory network = cats.get(1);
        LabCategory linux = cats.get(2);
        LabCategory crypto = cats.get(3);
        LabCategory forensics = cats.get(4);

        List<Lab> labs = new ArrayList<>();

        // === Web Security ===

        // Lab 0: DVWA - real vulnerable web app
        labs.add(lab("SQL Injection - DVWA",
                "Practice SQL injection on DVWA (Damn Vulnerable Web Application). Bypass login, extract database data using UNION injection, and dump credentials.",
                "EASY", 100, 30, 60, web, 1,
                "Open the lab URL in your browser. Login with admin/password. Go to 'SQL Injection' module. Set security to 'Low' in DVWA Security page first."));

        // Lab 1: Juice Shop - real OWASP app
        labs.add(lab("OWASP Juice Shop - XSS & Auth",
                "Exploit the OWASP Juice Shop: find XSS vulnerabilities, bypass authentication, discover hidden API endpoints, and exploit broken access control.",
                "MEDIUM", 180, 50, 90, web, 3,
                "Open the lab URL. Explore the Juice Shop application. Check the scoreboard at /#/score-board for challenge list. Use browser DevTools to inspect requests."));

        // Lab 2: WebGoat - learning platform
        labs.add(lab("WebGoat - Web Security Training",
                "Complete WebGoat lessons: injection flaws, broken authentication, sensitive data exposure, XXE, broken access control, and security misconfiguration.",
                "MEDIUM", 150, 45, 90, web, 2,
                "Open the lab URL. Register a new account in WebGoat. Navigate through the lessons in order. Each lesson teaches a different vulnerability class."));

        // Lab 3: Nginx challenge
        labs.add(lab("Web Server Misconfiguration",
                "Exploit a misconfigured Nginx web server. Find hidden directories, access restricted files, exploit directory traversal, and discover server information leakage.",
                "EASY", 80, 25, 60, web, 1,
                "Open the lab URL. The web server has several misconfigurations. Use browser, curl, and directory brute-forcing to discover hidden content and misconfigs."));

        // === Network Security ===

        // Lab 4: Nmap scanning target
        labs.add(lab("Network Scanning with Nmap",
                "Scan a target machine to discover open ports, identify services, detect OS version, and find potential vulnerabilities using Nmap and related tools.",
                "EASY", 90, 30, 60, network, 1,
                "Use Nmap to scan the lab's assigned port and IP. Try different scan types: -sS (SYN), -sV (version), -O (OS detect), -A (aggressive). Explore the results."));

        // Lab 5: Packet analysis with tshark
        labs.add(lab("Traffic Analysis Challenge",
                "Analyze network traffic from a pre-captured PCAP file. Find cleartext credentials, detect DNS tunneling, extract transferred files, and identify anomalous traffic.",
                "MEDIUM", 130, 40, 90, network, 3,
                "Connect to the lab container. PCAP files are in /captures/. Use tshark, tcpdump, or the web-based viewer to analyze traffic and find the hidden flags."));

        // === Linux ===

        // Lab 6: Alpine Linux basics
        labs.add(lab("Linux Command Line Basics",
                "Master essential Linux commands: file navigation, permissions, process management, text processing, and basic scripting. Find flags hidden across the system.",
                "EASY", 60, 20, 45, linux, 1,
                "Connect to the container via the web terminal. Flags are hidden in various locations. Use ls, cat, find, grep, ps, and other commands to discover them."));

        // Lab 7: Ubuntu privilege escalation
        labs.add(lab("Linux Privilege Escalation",
                "Start as a low-privilege user and escalate to root. Exploit SUID binaries, misconfigured cron jobs, writable scripts, and sudo misconfigurations.",
                "HARD", 250, 60, 120, linux, 5,
                "Connect via web terminal as user 'lowpriv'. Run enumeration commands: find SUID files, check crontab, run sudo -l. Each escalation vector reveals a flag."));

        // === Cryptography ===

        // Lab 8: Python crypto challenges
        labs.add(lab("Cipher Cracking Workshop",
                "Break classical ciphers and crack password hashes. Solve Caesar, Vigenere, substitution ciphers, and crack MD5/SHA hashes using Python tools.",
                "EASY", 70, 25, 60, crypto, 1,
                "Connect to the container. Encrypted challenges are in /challenges/. Python3 and common crypto tools (hashcat, john) are pre-installed. Crack each challenge."));

        // === Forensics ===

        // Lab 9: Forensics investigation
        labs.add(lab("Digital Forensics Investigation",
                "Analyze a simulated compromised system. Recover deleted files, examine logs, reconstruct the attack timeline, and find evidence of data exfiltration.",
                "MEDIUM", 160, 50, 120, forensics, 4,
                "Connect to the container. Evidence files are in /evidence/. Use file, strings, binwalk, foremost, and log analysis to investigate the incident."));

        return labRepository.saveAll(labs);
    }

    private Lab lab(String title, String desc, String diff, int points, int duration, int maxRuntime,
                    LabCategory cat, int reqLevel, String instructions) {
        Lab l = new Lab();
        l.setTitle(title);
        l.setDescription(desc);
        l.setDifficulty(diff);
        l.setPoints(points);
        l.setEstimatedDurationMinutes(duration);
        l.setMaxRuntimeMinutes(maxRuntime);
        l.setCategory(cat);
        l.setRequiredLevel(reqLevel);
        l.setActive(true);
        l.setInstructions(instructions);
        return l;
    }

    // ==================== DOCKER TEMPLATES (real public images) ====================

    private void seedDockerTemplates(List<Lab> labs) {
        List<DockerTemplate> templates = new ArrayList<>();

        // Lab 0: DVWA (vulnerables/web-dvwa)
        // Real vulnerable web app - pulls from Docker Hub
        templates.add(docker(labs.get(0), "vulnerables/web-dvwa", "latest", "80",
                "MYSQL_ROOT_PASSWORD=dvwa,DVWA_DATABASE=dvwa", 0.5, 512));

        // Lab 1: OWASP Juice Shop (bkimminich/juice-shop)
        // Real OWASP project - modern vulnerable web app
        templates.add(docker(labs.get(1), "bkimminich/juice-shop", "latest", "3000",
                "NODE_ENV=ctf", 1.0, 512));

        // Lab 2: WebGoat (webgoat/webgoat)
        // Real OWASP learning platform
        templates.add(docker(labs.get(2), "webgoat/webgoat", "latest", "8080",
                "WEBGOAT_PORT=8080", 1.0, 512));

        // Lab 3: Nginx misconfigured server
        // Standard Nginx - lightweight, fast pull
        templates.add(docker(labs.get(3), "nginx", "alpine", "80",
                null, 0.3, 128));

        // Lab 4: Network scanning target (full OS with services)
        // Alpine with SSH/HTTP for scanning practice
        templates.add(docker(labs.get(4), "alpine", "latest", "80",
                null, 0.3, 128));

        // Lab 5: Traffic analysis (has tshark pre-installed)
        // Ubuntu with networking tools
        templates.add(docker(labs.get(5), "ubuntu", "22.04", "80",
                null, 0.5, 256));

        // Lab 6: Linux basics (Alpine - tiny, fast)
        templates.add(docker(labs.get(6), "alpine", "latest", "80",
                null, 0.3, 128));

        // Lab 7: Linux privilege escalation (full Ubuntu)
        templates.add(docker(labs.get(7), "ubuntu", "22.04", "22",
                "USER_PASSWORD=lowpriv123", 0.5, 256));

        // Lab 8: Crypto challenges (Python environment)
        templates.add(docker(labs.get(8), "python", "3.11-slim", "80",
                null, 0.5, 256));

        // Lab 9: Forensics investigation (Ubuntu with tools)
        templates.add(docker(labs.get(9), "ubuntu", "22.04", "80",
                null, 0.5, 512));

        dockerTemplateRepository.saveAll(templates);
    }

    private DockerTemplate docker(Lab lab, String image, String version, String port,
                                  String envVars, double cpu, int memMb) {
        DockerTemplate t = new DockerTemplate();
        t.setLab(lab);
        t.setImageName(image);
        t.setImageVersion(version);
        t.setExposedPorts(port);
        t.setEnvironmentVariables(envVars);
        t.setCpuLimit(cpu);
        t.setMemoryLimitMb(memMb);
        t.setNetworkMode("bridge");
        return t;
    }

    // ==================== LAB STEPS ====================

    private List<LabStep> seedLabSteps(List<Lab> labs) {
        List<LabStep> all = new ArrayList<>();

        // ── Lab 0: SQL Injection - DVWA (3 steps) ──
        all.add(step(labs.get(0), 1, "Bypass Login with SQL Injection",
                "The DVWA login page accepts admin/password. Once inside, go to the SQL Injection module (set security to Low). Inject a payload that returns all users from the database.",
                "Try entering: ' OR '1'='1 in the User ID field.",
                "FLAG{sql_login_bypass}", 30));
        all.add(step(labs.get(0), 2, "UNION-Based Data Extraction",
                "Use UNION SELECT to extract the database version and table names from the information_schema. Find the users table.",
                "Payload: ' UNION SELECT table_name, 2 FROM information_schema.tables #",
                "FLAG{union_select_master}", 35));
        all.add(step(labs.get(0), 3, "Dump User Credentials",
                "Extract all usernames and password hashes from the users table using UNION injection.",
                "Payload: ' UNION SELECT user, password FROM users #",
                "FLAG{database_dump_complete}", 35));

        // ── Lab 1: Juice Shop - XSS & Auth (4 steps) ──
        all.add(step(labs.get(1), 1, "Find the Score Board",
                "The Juice Shop has a hidden score board page. Discover its URL by examining the JavaScript source or brute-forcing routes.",
                "Check the main.js file or try /#/score-board in the URL.",
                "FLAG{scoreboard_discovered}", 30));
        all.add(step(labs.get(1), 2, "Admin Login Bypass",
                "Login as the admin user without knowing the password. The login form is vulnerable to SQL injection.",
                "Try: admin'-- as the email with any password.",
                "FLAG{admin_login_bypassed}", 50));
        all.add(step(labs.get(1), 3, "Reflected XSS Attack",
                "Find an input field that reflects user input without sanitization and execute an XSS payload.",
                "Try the search function with: <iframe src='javascript:alert(1)'>",
                "FLAG{xss_juice_reflected}", 50));
        all.add(step(labs.get(1), 4, "Access Another User's Cart",
                "Exploit broken access control to view or modify another user's shopping cart via the API.",
                "Intercept API requests with DevTools. Change the basket ID in PUT/GET requests to /api/BasketItems/.",
                "FLAG{broken_access_control}", 50));

        // ── Lab 2: WebGoat (3 steps) ──
        all.add(step(labs.get(2), 1, "Complete SQL Injection Lesson",
                "Navigate to the SQL Injection (intro) lesson in WebGoat and complete all assignments. The flag appears after the final assignment.",
                "Follow the lesson steps in order. Use ' OR '1'='1 as a starting point.",
                "FLAG{webgoat_sqli_complete}", 40));
        all.add(step(labs.get(2), 2, "Complete XSS Lesson",
                "Complete the Cross-Site Scripting lesson. Learn about reflected and stored XSS through WebGoat's guided exercises.",
                "Try <script>alert(document.cookie)</script> in the input fields.",
                "FLAG{webgoat_xss_complete}", 50));
        all.add(step(labs.get(2), 3, "Complete Authentication Bypass",
                "Complete the Authentication Flaws lesson. Exploit authentication bypass, insecure login, and JWT vulnerabilities.",
                "Check the JWT token structure and try modifying the payload.",
                "FLAG{webgoat_auth_complete}", 60));

        // ── Lab 3: Web Server Misconfiguration (3 steps) ──
        all.add(step(labs.get(3), 1, "Find Hidden Directory",
                "The Nginx server has a hidden directory that wasn't meant to be public. Use directory brute-forcing to discover it.",
                "Try common paths: /admin, /backup, /secret, /.git, /config",
                "FLAG{hidden_directory_found}", 25));
        all.add(step(labs.get(3), 2, "Read Server Configuration",
                "Find and read the Nginx configuration file to discover internal routing rules and backend service locations.",
                "Try accessing /nginx.conf, /etc/nginx/nginx.conf or use directory traversal: /../../../etc/nginx/nginx.conf",
                "FLAG{nginx_config_exposed}", 25));
        all.add(step(labs.get(3), 3, "Access Restricted Area",
                "The server has an area restricted by IP. Bypass the IP restriction to access the protected resource.",
                "Try adding X-Forwarded-For: 127.0.0.1 or X-Real-IP: 127.0.0.1 header.",
                "FLAG{ip_restriction_bypass}", 30));

        // ── Lab 4: Network Scanning (3 steps) ──
        all.add(step(labs.get(4), 1, "Port Discovery",
                "Scan the target machine to find all open ports. One port is running an unusual service.",
                "Use: nmap -sV -p- <target_ip> for a full port scan with version detection.",
                "FLAG{port_scan_complete}", 25));
        all.add(step(labs.get(4), 2, "Service Identification",
                "Identify the exact version of each service running on the open ports. Find the outdated service with known vulnerabilities.",
                "Use: nmap -sV -sC <target_ip> for service version and default script scanning.",
                "FLAG{service_version_found}", 30));
        all.add(step(labs.get(4), 3, "OS Fingerprinting",
                "Determine the exact operating system and kernel version of the target machine.",
                "Use: nmap -O <target_ip> or nmap -A <target_ip> for OS detection.",
                "FLAG{os_detected}", 35));

        // ── Lab 5: Traffic Analysis (3 steps) ──
        all.add(step(labs.get(5), 1, "Find Cleartext Password",
                "Analyze the PCAP file and find an HTTP login request with credentials sent in cleartext.",
                "Use: tshark -r capture.pcap -Y 'http.request.method==POST' -T fields -e http.file_data",
                "FLAG{cleartext_password_http}", 40));
        all.add(step(labs.get(5), 2, "Detect DNS Tunneling",
                "Find evidence of DNS tunneling in the capture. Decode the exfiltrated data from DNS query subdomains.",
                "Filter DNS queries: tshark -r capture.pcap -Y dns. Look for unusually long subdomains.",
                "FLAG{dns_tunnel_detected}", 45));
        all.add(step(labs.get(5), 3, "Extract Transferred File",
                "A file was transferred over the network. Extract and reconstruct it from the packet capture.",
                "Use: tshark or Wireshark 'Follow TCP Stream' to find and extract the file contents.",
                "FLAG{file_extracted}", 45));

        // ── Lab 6: Linux Basics (3 steps) ──
        all.add(step(labs.get(6), 1, "Find the Hidden File",
                "A flag is hidden in a dotfile somewhere in the home directory tree. Use Linux commands to find it.",
                "Use: find / -name '.*flag*' 2>/dev/null or ls -la in various directories.",
                "FLAG{hidden_file_found}", 15));
        all.add(step(labs.get(6), 2, "Read the Protected File",
                "A flag file exists but has restricted permissions. Find a way to read it using available tools.",
                "Check file permissions with ls -la. Look for SUID binaries or group membership that grants access.",
                "FLAG{permissions_understood}", 20));
        all.add(step(labs.get(6), 3, "Find the Running Service",
                "A process is serving a flag on a local port. Find the process and retrieve the flag.",
                "Use: ps aux to find processes, netstat -tlnp for listening ports, then curl localhost:PORT.",
                "FLAG{process_discovery}", 25));

        // ── Lab 7: Linux Privilege Escalation (4 steps) ──
        all.add(step(labs.get(7), 1, "SUID Binary Exploit",
                "Find an SUID binary that can be abused to read files as root. Read /root/flag1.txt.",
                "Run: find / -perm -4000 -type f 2>/dev/null. Check GTFOBins for exploitation techniques.",
                "FLAG{suid_binary_exploit}", 60));
        all.add(step(labs.get(7), 2, "Cron Job Hijack",
                "A cron job runs as root and executes a world-writable script. Modify it to copy the flag.",
                "Check: cat /etc/crontab and ls -la on scripts it runs. Append a command to read /root/flag2.txt.",
                "FLAG{cron_job_hijack}", 60));
        all.add(step(labs.get(7), 3, "Sudo Misconfiguration",
                "Your user has sudo privileges for a specific command. Abuse it to escalate to root.",
                "Run: sudo -l. Check GTFOBins for the allowed command's escalation technique.",
                "FLAG{sudo_misconfiguration}", 65));
        all.add(step(labs.get(7), 4, "Root Flag",
                "Combine all techniques to get a full root shell and read /root/flag4.txt.",
                "Use the most reliable escalation vector to spawn a root shell: sudo or SUID.",
                "FLAG{root_shell_achieved}", 65));

        // ── Lab 8: Cipher Cracking (3 steps) ──
        all.add(step(labs.get(8), 1, "Break Caesar Cipher",
                "Decrypt the Caesar cipher: 'SYNT{pnrfne_fuvsg_13}'. The shift is the most common ROT value.",
                "ROT13 is the most common Caesar shift. Try: echo 'SYNT{pnrfne_fuvsg_13}' | tr 'A-Za-z' 'N-ZA-Mn-za-m'",
                "FLAG{caesar_shift_13}", 20));
        all.add(step(labs.get(8), 2, "Crack MD5 Hash",
                "Crack this MD5 hash: 5f4dcc3b5aa765d61d8327deb882cf99. It's one of the most common passwords.",
                "Use: echo -n 'password' | md5sum, or try an online MD5 database, or hashcat -m 0.",
                "FLAG{md5_cracked_password}", 25));
        all.add(step(labs.get(8), 3, "Decode Base64 Chain",
                "A flag has been encoded with Base64 multiple times. Decode it layer by layer until you get the flag.",
                "Use: echo '<encoded>' | base64 -d repeatedly until the output is readable.",
                "FLAG{base64_layers_decoded}", 25));

        // ── Lab 9: Digital Forensics (3 steps) ──
        all.add(step(labs.get(9), 1, "Recover Deleted File",
                "A critical evidence file was deleted. Use forensic tools to recover it from the disk image.",
                "Use: foremost, scalpel, or photorec to carve files from the disk image in /evidence/.",
                "FLAG{deleted_file_recovered}", 50));
        all.add(step(labs.get(9), 2, "Analyze Log Files",
                "Examine web server and system logs to determine how the attacker gained initial access.",
                "Check /evidence/logs/. Use grep, awk, sort, uniq to find the attack pattern and source IP.",
                "FLAG{attack_vector_identified}", 55));
        all.add(step(labs.get(9), 3, "Find Exfiltration Evidence",
                "The attacker exfiltrated data. Find evidence of what was stolen and how it was transmitted.",
                "Check bash_history, browser data, network logs, and look for encoded data or unusual outbound connections.",
                "FLAG{exfiltration_traced}", 55));

        return labStepRepository.saveAll(all);
    }

    private LabStep step(Lab lab, int num, String title, String desc, String hint, String flag, int points) {
        LabStep s = new LabStep();
        s.setLab(lab);
        s.setStepNumber(num);
        s.setTitle(title);
        s.setDescription(desc);
        s.setHint(hint);
        s.setFlag(flag);
        s.setPoints(points);
        return s;
    }
}
