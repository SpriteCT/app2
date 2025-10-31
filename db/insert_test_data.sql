-- Insert test data for Vulnerability Management System
-- Run after schema.sql

-- ============ WORKERS ============
INSERT INTO workers (id, full_name, email, phone) VALUES
(1, 'Иванов И.И.', 'ivanov@company.ru', '+7 (495) 111-11-11'),
(2, 'Петров П.П.', 'petrov@company.ru', '+7 (495) 111-11-12'),
(3, 'Сидоров С.С.', 'sidorov@company.ru', '+7 (495) 111-11-13'),
(4, 'Козлов К.К.', 'kozlov@company.ru', '+7 (495) 111-11-14'),
(5, 'Морозов М.М.', 'morozov@company.ru', '+7 (495) 111-11-15'),
(6, 'Волков В.В.', 'volkov@company.ru', '+7 (495) 111-11-16'),
(7, 'Соколов С.С.', 'sokolov@company.ru', '+7 (495) 111-11-17'),
(8, 'Лебедев Л.Л.', 'lebedev@company.ru', '+7 (495) 111-11-18');

-- ============ ASSET TYPES ============
INSERT INTO asset_types (id, name, description) VALUES
(1, 'Web Server', 'Веб-сервер'),
(2, 'Application Server', 'Сервер приложений'),
(3, 'Database Server', 'Сервер базы данных'),
(4, 'File Server', 'Файловый сервер'),
(5, 'Web Application', 'Веб-приложение'),
(6, 'API Server', 'API сервер'),
(7, 'Linux Server', 'Linux сервер'),
(8, 'Backup Server', 'Сервер резервного копирования');

-- ============ SCANNERS ============
INSERT INTO scanners (id, name, description) VALUES
(1, 'Nessus', 'Nessus Vulnerability Scanner'),
(2, 'OpenVAS', 'Open Vulnerability Assessment Scanner'),
(3, 'Penetration Test', 'Ручной пентест'),
(4, 'Metasploit', 'Metasploit Framework'),
(5, 'Burp Suite', 'Burp Suite Professional'),
(6, 'Qualys', 'Qualys VMDR');

-- ============ CLIENTS ============
INSERT INTO clients (id, name, short_name, industry, contact_person, position, phone, email, sla, security_level, contract_number, contract_date, contract_expiry, billing_cycle, infra_cloud, infra_on_prem, notes, is_default) VALUES
(1, 'ООО "ТехноСервис"', 'TSV', 'IT-инфраструктура', 'Иванов Иван Иванович', 'Директор по безопасности', '+7 (495) 123-45-67', 'ivanov@technoservice.ru', 'Premium', 'Critical', 'TS-2024-001', '2024-01-15', '2025-01-15', 'Monthly', TRUE, TRUE, 'Крупный IT-интегратор с критической инфраструктурой. Требует постоянного мониторинга.', FALSE),
(2, 'АО "ФинансХост"', 'FNH', 'Финансовые услуги', 'Петров Петр Петрович', 'Руководитель информационной безопасности', '+7 (495) 234-56-78', 'petrov@finhost.ru', 'Standard', 'Critical', 'FH-2024-015', '2024-01-10', '2025-01-10', 'Quarterly', FALSE, TRUE, 'Финансовая организация. Особое внимание к комплаенсу и безопасности данных.', FALSE),
(3, 'ООО "МедиаДиджитал"', 'MDD', 'Медиа', 'Сидоров С.С.', NULL, '+7 (495) 345-67-89', 'sidorov@mediadigital.ru', 'Basic', 'High', 'MD-2024-008', NULL, NULL, 'Monthly', FALSE, FALSE, NULL, FALSE),
(4, 'ИП Козлов К.К.', 'KZL', 'Консалтинг', 'Козлов К.К.', NULL, '+7 (495) 456-78-90', 'kozlov@example.ru', 'Basic', 'High', 'KZ-2024-003', NULL, NULL, 'Monthly', FALSE, FALSE, NULL, FALSE),
(5, 'ООО "РозницаПро"', 'RZP', 'Розничная торговля', 'Морозов М.М.', NULL, '+7 (495) 567-89-01', 'morozov@retailpro.ru', 'Standard', 'High', 'RT-2024-022', NULL, NULL, 'Monthly', FALSE, FALSE, NULL, FALSE),
(6, 'ЗАО "ВолковГрупп"', 'VGP', 'Промышленность', 'Волков В.В.', NULL, '+7 (495) 678-90-12', 'volkov@volkovgrp.ru', 'Premium', 'High', 'VG-2024-005', NULL, NULL, 'Monthly', FALSE, FALSE, NULL, FALSE);

-- ============ CLIENT ADDITIONAL CONTACTS ============
INSERT INTO client_additional_contacts (id, client_id, name, role, phone, email) VALUES
(1, 1, 'Петров Петр Петрович', 'IT-директор', '+7 (495) 123-45-68', 'petrov@technoservice.ru'),
(2, 2, 'Сидоров Сидор Сидорович', 'Network Admin', '+7 (495) 234-56-79', 'sidorov@finhost.ru');

-- ============ PROJECTS ============
INSERT INTO projects (id, client_id, name, description, type, status, priority, start_date, end_date, budget, progress) VALUES
(1, 1, 'Безопасность инфраструктуры', 'Регулярное сканирование инфраструктуры на уязвимости с ежемесячными отчетами', 'Vulnerability Scanning', 'Active', 'High', '2024-01-15', '2024-12-31', 1500000, 45),
(2, 1, 'Breach and Attack Simulation', 'Симуляция атак на инфраструктуру для проверки эффективности защиты', 'BAS', 'Planning', 'High', '2024-02-01', '2024-05-01', 1200000, 0),
(3, 2, 'Аудит безопасности', 'Глубокий пентест с фокусом на финансовые системы и базы данных', 'Penetration Test', 'Active', 'Critical', '2024-01-08', '2024-03-08', 800000, 60),
(4, 3, 'Сканирование сетевое', 'Непрерывное сканирование сети на открытые порты и сетевое оборудование', 'Network Scanning', 'Active', 'Medium', '2024-01-05', '2024-06-05', 500000, 30),
(5, 5, 'Web Security Audit', 'Сканирование веб-приложений на SQL Injection, XSS и другие уязвимости', 'Web Application Scanning', 'Active', 'Medium', '2024-01-14', '2024-04-14', 600000, 70),
(6, 6, 'Compliance Check', 'Проверка соответствия стандартам ISO 27001, GDPR', 'Compliance Check', 'Active', 'High', '2024-01-08', '2024-03-08', 900000, 55);

-- ============ PROJECT TEAM MEMBERS ============
INSERT INTO project_team_members (id, project_id, worker_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 2, 2),
(5, 2, 3),
(6, 3, 6),
(7, 3, 7),
(8, 4, 4),
(9, 4, 8),
(10, 5, 5),
(11, 6, 6),
(12, 6, 7);

-- ============ ASSETS ============
INSERT INTO assets (id, client_id, name, type_id, ip_address, operating_system, status, criticality, last_scan) VALUES
(1, 1, 'web-01.example.com', 1, '192.168.1.10', 'Ubuntu 22.04', 'В эксплуатации', 'Critical', '2024-01-20 10:00:00+00'),
(2, 1, 'app-server-02.local', 2, '192.168.1.20', 'Windows Server 2022', 'В эксплуатации', 'High', '2024-01-22 14:00:00+00'),
(3, 3, 'db-server-01.internal', 3, '192.168.2.10', 'CentOS 8', 'В эксплуатации', 'Critical', '2024-01-18 09:00:00+00'),
(4, 4, 'file-server-01.local', 4, '192.168.2.50', 'Windows Server 2019', 'В эксплуатации', 'High', '2024-01-19 11:00:00+00'),
(5, 5, 'web-app.example.com', 5, '192.168.1.100', 'Docker Container', 'В эксплуатации', 'Medium', '2024-01-21 13:00:00+00'),
(6, 6, 'api.example.com', 6, '192.168.1.200', 'Ubuntu 20.04', 'В эксплуатации', 'Critical', '2024-01-20 15:00:00+00'),
(7, 2, 'app.example.com', 5, '192.168.1.150', 'Docker Container', 'В эксплуатации', 'High', '2024-01-17 12:00:00+00'),
(8, 3, 'linux-server-01', 7, '192.168.3.10', 'Debian 11', 'В эксплуатации', 'Medium', '2024-01-19 10:00:00+00'),
(9, 1, 'backup-server-01.internal', 8, '192.168.3.20', 'Ubuntu 20.04', 'Недоступен', 'Medium', '2024-01-05 08:00:00+00'),
(10, 1, 'old-web-server.legacy', 1, '192.168.1.255', 'CentOS 6', 'Выведен из эксплуатации', 'Low', '2023-06-15 16:00:00+00');

-- ============ VULNERABILITIES ============
INSERT INTO vulnerabilities (id, client_id, asset_id, title, description, asset_type_id, scanner_id, status, criticality, cvss, cve, discovered, last_modified) VALUES
(1, 1, 1, 'SQL Injection в параметре поиска', 'Обнаружена уязвимость SQL Injection в параметре поиска', 1, 1, 'Open', 'Critical', 9.8, 'CVE-2023-1234', '2024-01-15', '2024-01-20'),
(2, 1, 2, 'Устаревшая версия Apache Tomcat', 'Используется Apache Tomcat версии 8.5.29, уязвимая к CVE-2023-45133', 2, 2, 'In Progress', 'High', 7.5, 'CVE-2023-45133', '2024-01-10', '2024-01-22'),
(3, 3, 3, 'Слабая политика паролей', 'Обнаружены слабые пароли у нескольких учетных записей', 3, 3, 'Fixed', 'Medium', 5.3, NULL, '2024-01-05', '2024-01-18'),
(4, 4, 4, 'Открытые порты 445/139 (SMB)', 'SMB порты доступны из внешней сети', 4, 1, 'Open', 'High', 8.8, NULL, '2024-01-12', '2024-01-19'),
(5, 5, 5, 'Missing Security Headers', 'Отсутствуют заголовки безопасности X-Frame-Options, CSP', 5, 2, 'Open', 'Low', 2.5, NULL, '2024-01-14', '2024-01-21'),
(6, 6, 6, 'Уязвимость в библиотеке Log4j', 'Log4j версия 2.14.0 уязвима к CVE-2021-44228', 6, 1, 'Open', 'Critical', 10.0, 'CVE-2021-44228', '2024-01-08', '2024-01-20'),
(7, 2, 7, 'SSRF в функционале загрузки', 'Обнаружена Server-Side Request Forgery уязвимость', 5, 3, 'Verified', 'High', 7.8, NULL, '2024-01-11', '2024-01-17'),
(8, 3, 8, 'Несвоевременное обновление системных компонентов', 'Накоплено 15 критических обновлений', 7, 2, 'Open', 'Medium', 4.5, NULL, '2024-01-13', '2024-01-19');

-- ============ TICKETS ============
INSERT INTO tickets (id, client_id, title, description, assignee_id, reporter_id, priority, status, due_date, resolution) VALUES
(1, 1, 'SQL Injection на web-01.example.com', 'Необходимо устранить уязвимость SQL Injection на сервере web-01.example.com', 1, NULL, 'Critical', 'Open', '2024-01-22', NULL),
(2, 1, 'Устаревшая версия Apache Tomcat', 'Обновление Apache Tomcat до актуальной версии для устранения CVE-2023-45133', 2, NULL, 'High', 'In Progress', '2024-01-25', NULL),
(3, 6, 'Лог4дж уязвимость', 'Критическая уязвимость Log4j требует немедленного обновления', 6, NULL, 'Critical', 'Open', '2024-01-21', NULL),
(4, 4, 'Открытые SMB порты', 'SMB порты доступны извне. Требуется закрыть доступ или настроить VPN', 4, NULL, 'High', 'Open', '2024-01-26', NULL),
(5, 5, 'Security Headers отсутствуют', 'Добавить заголовки безопасности X-Frame-Options и Content-Security-Policy', 5, NULL, 'Low', 'Open', '2024-01-30', NULL),
(6, 2, 'SSRF уязвимость', 'Обнаружена SSRF уязвимость при пентесте. Требуется устранение', 7, NULL, 'High', 'Verified', '2024-01-18', 'Уязвимость устранена. Добавлена валидация URL'),
(7, 3, 'Множественные проблемы с паролями', 'Усиление политики паролей и смена слабых паролей', 3, NULL, 'Medium', 'Fixed', '2024-01-20', 'Внедрена новая политика паролей. Все слабые пароли изменены');

-- ============ TICKET MESSAGES ============
INSERT INTO ticket_messages (id, ticket_id, author_id, timestamp, message) VALUES
(1, 1, 1, '2024-01-15 10:30:00+00', 'Начинаю анализ уязвимости'),
(2, 1, NULL, '2024-01-15 11:00:00+00', 'Приоритет: Critical. Требуется срочное устранение'),
(3, 2, 2, '2024-01-12 14:00:00+00', 'Обновление запланировано на 24.01.2024'),
(4, 2, NULL, '2024-01-12 14:30:00+00', 'Ок, согласовано. Необходимо предупредить клиента о даунтайме'),
(5, 3, 6, '2024-01-08 09:00:00+00', 'Действительно критично. Начинаю работу'),
(6, 4, 4, '2024-01-13 08:30:00+00', 'Проверяю конфигурацию файрвола'),
(7, 6, 7, '2024-01-11 15:00:00+00', 'Начинаю исправление'),
(8, 6, 7, '2024-01-17 12:00:00+00', 'Уязвимость устранена. Требуется верификация'),
(9, 6, NULL, '2024-01-17 16:00:00+00', 'Верифицировано. Уязвимость закрыта'),
(10, 7, 3, '2024-01-06 10:00:00+00', 'Обновляю политику паролей'),
(11, 7, NULL, '2024-01-18 14:00:00+00', 'Политика внедрена. Все пароли обновлены');

-- ============ TICKET VULNERABILITIES (Many-to-Many) ============
INSERT INTO ticket_vulnerabilities (ticket_id, vulnerability_id) VALUES
(1, 1),
(2, 2),
(3, 6),
(4, 4),
(5, 5),
(6, 7),
(7, 3);

-- ============ GANTT TASKS (Optional - пример для проекта) ============
INSERT INTO gantt_tasks (id, project_id, name, start_date, end_date) VALUES
(1, 1, 'Подготовка инфраструктуры сканирования', '2024-01-15', '2024-01-25'),
(2, 1, 'Настройка расписания сканирований', '2024-01-26', '2024-02-05'),
(3, 1, 'Ежемесячное сканирование (февраль)', '2024-02-01', '2024-02-07'),
(4, 3, 'Разведка инфраструктуры', '2024-01-08', '2024-01-15'),
(5, 3, 'Пентест веб-приложений', '2024-01-16', '2024-02-15'),
(6, 3, 'Пентест баз данных', '2024-02-16', '2024-02-28'),
(7, 3, 'Подготовка отчета', '2024-03-01', '2024-03-08');
