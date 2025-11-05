-- Insert test data for Vulnerability Management System
-- Run after schema.sql

-- ============ USERS (для авторизации) ============
-- Исполнители
INSERT INTO users (id, password_hash, email) VALUES
(1, NULL, 'ivanov@company.ru'),
(2, NULL, 'petrov@company.ru'),
(3, NULL, 'sidorov@company.ru'),
(4, NULL, 'kozlov@company.ru'),
(5, NULL, 'morozov@company.ru'),
(6, NULL, 'volkov@company.ru'),
(7, NULL, 'sokolov@company.ru'),
(8, NULL, 'lebedev@company.ru');

-- ============ ASSET TYPES ============
INSERT INTO asset_types (id, name) VALUES
(1, 'Web Server'),
(2, 'Application Server'),
(3, 'Database Server'),
(4, 'File Server'),
(5, 'Web Application'),
(6, 'API Server'),
(7, 'Linux Server'),
(8, 'Backup Server');

-- ============ SCANNERS ============
INSERT INTO scanners (id, name) VALUES
(1, 'Nessus'),
(2, 'OpenVAS'),
(3, 'Penetration Test'),
(4, 'Metasploit'),
(5, 'Burp Suite'),
(6, 'Qualys');

-- ============ REFERENCE TABLES (replacing ENUMs) ============
-- Project Types
INSERT INTO project_types (id, name) VALUES
(1, 'Vulnerability Scanning'),
(2, 'Penetration Test'),
(3, 'Network Scanning'),
(4, 'BAS'),
(5, 'Web Application Scanning'),
(6, 'Compliance Check');

-- Project Statuses
INSERT INTO project_statuses (id, name) VALUES
(1, 'Active'),
(2, 'Planning'),
(3, 'On Hold'),
(4, 'Completed'),
(5, 'Cancelled');

-- Priority Levels
INSERT INTO priority_levels (id, name) VALUES
(1, 'Critical'),
(2, 'High'),
(3, 'Medium'),
(4, 'Low');

-- Asset Statuses
INSERT INTO asset_statuses (id, name) VALUES
(1, 'В эксплуатации'),
(2, 'Недоступен'),
(3, 'В обслуживании'),
(4, 'Выведен из эксплуатации');

-- Vulnerability Statuses
INSERT INTO vuln_statuses (id, name) VALUES
(1, 'Open'),
(2, 'In Progress'),
(3, 'Closed');

-- Ticket Statuses
INSERT INTO ticket_statuses (id, name) VALUES
(1, 'Open'),
(2, 'In Progress'),
(3, 'Closed');

-- ============ CLIENTS ============
INSERT INTO clients (id, name, short_name, industry, contract_number, contract_date, contract_expiry, notes) VALUES
(1, 'ООО "ТехноСервис"', 'TSV', 'IT-инфраструктура', 'TS-2024-001', '2024-01-15', '2025-01-15', 'Крупный IT-интегратор с критической инфраструктурой. Требует постоянного мониторинга.'),
(2, 'АО "ФинансХост"', 'FNH', 'Финансовые услуги', 'FH-2024-015', '2024-01-10', '2025-01-10', 'Финансовая организация. Особое внимание к комплаенсу и безопасности данных.'),
(3, 'ООО "МедиаДиджитал"', 'MDD', 'Медиа', 'MD-2024-008', NULL, NULL, NULL),
(4, 'ИП Козлов К.К.', 'KZL', 'Консалтинг', 'KZ-2024-003', NULL, NULL, NULL),
(5, 'ООО "РозницаПро"', 'RZP', 'Розничная торговля', 'RT-2024-022', NULL, NULL, NULL),
(6, 'ЗАО "ВолковГрупп"', 'VGP', 'Промышленность', 'VG-2024-005', NULL, NULL, NULL);

-- Пользователи заказчиков
-- Вставляем ПОСЛЕ клиентов, так как есть внешний ключ на clients.id
INSERT INTO users (id, password_hash, email) VALUES
(9, NULL, 'smirnov@technoservice.ru'),
(10, NULL, 'kuznetsov@finhost.ru'),
(11, NULL, 'popov@mediadigital.ru'),
(12, NULL, 'vasiliev@example.ru'),
(13, NULL, 'novikov@retailpro.ru'),
(14, NULL, 'fedorov@volkovgrp.ru');

-- ============ WORKER PROFILES ============
INSERT INTO worker_profiles (user_id, full_name) VALUES
(1, 'Иванов И.И.'),
(2, 'Петров П.П.'),
(3, 'Сидоров С.С.'),
(4, 'Козлов К.К.'),
(5, 'Морозов М.М.'),
(6, 'Волков В.В.'),
(7, 'Соколов С.С.'),
(8, 'Лебедев Л.Л.');

-- ============ CLIENT PROFILES ============
-- Вставляем ПОСЛЕ клиентов
INSERT INTO client_profiles (user_id, client_id, contact_name) VALUES
(9, 1, 'Смирнов С.С.'),
(10, 2, 'Кузнецов К.К.'),
(11, 3, 'Попов П.П.'),
(12, 4, 'Васильев В.В.'),
(13, 5, 'Новиков Н.Н.'),
(14, 6, 'Федоров Ф.Ф.');

-- ============ CLIENT CONTACTS ============
INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
-- Основные контакты (is_primary = TRUE)
(1, 1, 'Иванов Иван Иванович', 'Директор по безопасности', '+7 (495) 123-45-67', 'ivanov@technoservice.ru', TRUE),
(2, 2, 'Петров Петр Петрович', 'Руководитель информационной безопасности', '+7 (495) 234-56-78', 'petrov@finhost.ru', TRUE),
(3, 3, 'Сидоров Сидор Сидорович', NULL, '+7 (495) 345-67-89', 'sidorov@mediadigital.ru', TRUE),
(4, 4, 'Козлов Константин Константинович', NULL, '+7 (495) 456-78-90', 'kozlov@example.ru', TRUE),
(5, 5, 'Морозов Михаил Михайлович', NULL, '+7 (495) 567-89-01', 'morozov@retailpro.ru', TRUE),
(6, 6, 'Волков Владимир Владимирович', NULL, '+7 (495) 678-90-12', 'volkov@volkovgrp.ru', TRUE),
-- Дополнительные контакты (is_primary = FALSE)
(7, 1, 'Петров Петр Петрович', 'IT-директор', '+7 (495) 123-45-68', 'petrov@technoservice.ru', FALSE),
(8, 2, 'Сидоров Сидор Сидорович', 'Network Admin', '+7 (495) 234-56-79', 'sidorov@finhost.ru', FALSE);

-- ============ PROJECTS ============
INSERT INTO projects (id, client_id, name, description, type_id, status_id, priority_id, start_date, end_date) VALUES
(1, 1, 'Безопасность инфраструктуры', 'Регулярное сканирование инфраструктуры на уязвимости с ежемесячными отчетами', 1, 1, 2, '2024-01-15', '2024-12-31'),
(2, 1, 'Breach and Attack Simulation', 'Симуляция атак на инфраструктуру для проверки эффективности защиты', 4, 2, 2, '2024-02-01', '2024-05-01'),
(3, 2, 'Аудит безопасности', 'Глубокий пентест с фокусом на финансовые системы и базы данных', 2, 1, 1, '2024-01-08', '2024-03-08'),
(4, 3, 'Сканирование сетевое', 'Непрерывное сканирование сети на открытые порты и сетевое оборудование', 3, 1, 3, '2024-01-05', '2024-06-05'),
(5, 5, 'Web Security Audit', 'Сканирование веб-приложений на SQL Injection, XSS и другие уязвимости', 5, 1, 3, '2024-01-14', '2024-04-14'),
(6, 6, 'Compliance Check', 'Проверка соответствия стандартам ISO 27001, GDPR', 6, 1, 2, '2024-01-08', '2024-03-08');

-- ============ PROJECT TEAM MEMBERS ============
INSERT INTO project_team_members (id, project_id, user_id) VALUES
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
INSERT INTO assets (id, client_id, name, type_id, ip_address, operating_system, status_id, criticality_id, last_scan) VALUES
(1, 1, 'web-01.example.com', 1, '192.168.1.10', 'Ubuntu 22.04', 1, 1, '2024-01-20 10:00:00+00'),
(2, 1, 'app-server-02.local', 2, '192.168.1.20', 'Windows Server 2022', 1, 2, '2024-01-22 14:00:00+00'),
(3, 3, 'db-server-01.internal', 3, '192.168.2.10', 'CentOS 8', 1, 1, '2024-01-18 09:00:00+00'),
(4, 4, 'file-server-01.local', 4, '192.168.2.50', 'Windows Server 2019', 1, 2, '2024-01-19 11:00:00+00'),
(5, 5, 'web-app.example.com', 5, '192.168.1.100', 'Docker Container', 1, 3, '2024-01-21 13:00:00+00'),
(6, 6, 'api.example.com', 6, '192.168.1.200', 'Ubuntu 20.04', 1, 1, '2024-01-20 15:00:00+00'),
(7, 2, 'app.example.com', 5, '192.168.1.150', 'Docker Container', 1, 2, '2024-01-17 12:00:00+00'),
(8, 3, 'linux-server-01', 7, '192.168.3.10', 'Debian 11', 1, 3, '2024-01-19 10:00:00+00'),
(9, 1, 'backup-server-01.internal', 8, '192.168.3.20', 'Ubuntu 20.04', 2, 3, '2024-01-05 08:00:00+00'),
(10, 1, 'old-web-server.legacy', 1, '192.168.1.255', 'CentOS 6', 4, 4, '2023-06-15 16:00:00+00');

-- ============ VULNERABILITIES ============
INSERT INTO vulnerabilities (id, display_id, client_id, asset_id, title, description, scanner_id, status_id, criticality_id, cvss, cve, discovered, last_modified, is_deleted) VALUES
(1, 'V-TSV-1', 1, 1, 'SQL Injection в параметре поиска', 'Обнаружена уязвимость SQL Injection в параметре поиска', 1, 1, 1, 9.8, 'CVE-2023-1234', '2024-01-15', '2024-01-20', FALSE),
(2, 'V-TSV-2', 1, 2, 'Устаревшая версия Apache Tomcat', 'Используется Apache Tomcat версии 8.5.29, уязвимая к CVE-2023-45133', 2, 2, 2, 7.5, 'CVE-2023-45133', '2024-01-10', '2024-01-22', FALSE),
(3, 'V-MDD-1', 3, 3, 'Слабая политика паролей', 'Обнаружены слабые пароли у нескольких учетных записей', 3, 3, 3, 5.3, NULL, '2024-01-05', '2024-01-18', FALSE),
(4, 'V-KZL-1', 4, 4, 'Открытые порты 445/139 (SMB)', 'SMB порты доступны из внешней сети', 1, 1, 2, 8.8, NULL, '2024-01-12', '2024-01-19', FALSE),
(5, 'V-RZP-1', 5, 5, 'Missing Security Headers', 'Отсутствуют заголовки безопасности X-Frame-Options, CSP', 2, 1, 4, 2.5, NULL, '2024-01-14', '2024-01-21', FALSE),
(6, 'V-VGP-1', 6, 6, 'Уязвимость в библиотеке Log4j', 'Log4j версия 2.14.0 уязвима к CVE-2021-44228', 1, 1, 1, 10.0, 'CVE-2021-44228', '2024-01-08', '2024-01-20', FALSE),
(7, 'V-FNH-1', 2, 7, 'SSRF в функционале загрузки', 'Обнаружена Server-Side Request Forgery уязвимость', 3, 3, 2, 7.8, NULL, '2024-01-11', '2024-01-17', FALSE),
(8, 'V-MDD-2', 3, 8, 'Несвоевременное обновление системных компонентов', 'Накоплено 15 критических обновлений', 2, 1, 3, 4.5, NULL, '2024-01-13', '2024-01-19', FALSE);

-- ============ TICKETS ============
-- Note: due_date must be >= created_at (current date), so we use future dates
INSERT INTO tickets (id, display_id, client_id, title, description, assignee_id, reporter_id, priority_id, status_id, due_date, resolution, is_deleted) VALUES
(1, 'T-TSV-1', 1, 'SQL Injection на web-01.example.com', 'Необходимо устранить уязвимость SQL Injection на сервере web-01.example.com', 1, NULL, 1, 1, (CURRENT_DATE + INTERVAL '7 days'), NULL, FALSE),
(2, 'T-TSV-2', 1, 'Устаревшая версия Apache Tomcat', 'Обновление Apache Tomcat до актуальной версии для устранения CVE-2023-45133', 2, NULL, 2, 2, (CURRENT_DATE + INTERVAL '10 days'), NULL, FALSE),
(3, 'T-VGP-1', 6, 'Лог4дж уязвимость', 'Критическая уязвимость Log4j требует немедленного обновления', 6, NULL, 1, 1, (CURRENT_DATE + INTERVAL '5 days'), NULL, FALSE),
(4, 'T-KZL-1', 4, 'Открытые SMB порты', 'SMB порты доступны извне. Требуется закрыть доступ или настроить VPN', 4, NULL, 2, 1, (CURRENT_DATE + INTERVAL '14 days'), NULL, FALSE),
(5, 'T-RZP-1', 5, 'Security Headers отсутствуют', 'Добавить заголовки безопасности X-Frame-Options и Content-Security-Policy', 5, NULL, 4, 1, (CURRENT_DATE + INTERVAL '30 days'), NULL, FALSE),
(6, 'T-FNH-1', 2, 'SSRF уязвимость', 'Обнаружена SSRF уязвимость при пентесте. Требуется устранение', 7, NULL, 2, 3, NULL, 'Уязвимость устранена. Добавлена валидация URL', FALSE),
(7, 'T-MDD-1', 3, 'Множественные проблемы с паролями', 'Усиление политики паролей и смена слабых паролей', 3, NULL, 3, 3, NULL, 'Внедрена новая политика паролей. Все слабые пароли изменены', FALSE);

-- ============ TICKET MESSAGES ============
-- Только сообщения от пользователей (author_id не NULL)
-- Системные сообщения создаются автоматически при изменении тикета
INSERT INTO ticket_messages (id, ticket_id, author_id, timestamp, message) VALUES
(1, 1, 1, '2024-01-15 10:30:00+00', 'Начинаю анализ уязвимости'),
(2, 2, 2, '2024-01-12 14:00:00+00', 'Обновление запланировано на 24.01.2024'),
(3, 3, 6, '2024-01-08 09:00:00+00', 'Действительно критично. Начинаю работу'),
(4, 4, 4, '2024-01-13 08:30:00+00', 'Проверяю конфигурацию файрвола'),
(5, 6, 7, '2024-01-11 15:00:00+00', 'Начинаю исправление'),
(6, 6, 7, '2024-01-17 12:00:00+00', 'Уязвимость устранена. Требуется верификация'),
(7, 7, 3, '2024-01-06 10:00:00+00', 'Обновляю политику паролей');

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

-- Установка паролей по умолчанию для всех пользователей
-- Пароль: password123 (хранится в чистом виде, без хеширования)
UPDATE users SET password_hash = 'password123' WHERE password_hash IS NULL;

-- Fix sequences after inserting data with explicit IDs
-- This ensures that new records get correct auto-incrementing IDs
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval('asset_types_id_seq', COALESCE((SELECT MAX(id) FROM asset_types), 1), true);
SELECT setval('scanners_id_seq', COALESCE((SELECT MAX(id) FROM scanners), 1), true);
SELECT setval('project_types_id_seq', COALESCE((SELECT MAX(id) FROM project_types), 1), true);
SELECT setval('project_statuses_id_seq', COALESCE((SELECT MAX(id) FROM project_statuses), 1), true);
SELECT setval('priority_levels_id_seq', COALESCE((SELECT MAX(id) FROM priority_levels), 1), true);
SELECT setval('asset_statuses_id_seq', COALESCE((SELECT MAX(id) FROM asset_statuses), 1), true);
SELECT setval('vuln_statuses_id_seq', COALESCE((SELECT MAX(id) FROM vuln_statuses), 1), true);
SELECT setval('ticket_statuses_id_seq', COALESCE((SELECT MAX(id) FROM ticket_statuses), 1), true);
SELECT setval('clients_id_seq', COALESCE((SELECT MAX(id) FROM clients), 1), true);
SELECT setval('client_contacts_id_seq', COALESCE((SELECT MAX(id) FROM client_contacts), 1), true);
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1), true);
SELECT setval('project_team_members_id_seq', COALESCE((SELECT MAX(id) FROM project_team_members), 1), true);
SELECT setval('assets_id_seq', COALESCE((SELECT MAX(id) FROM assets), 1), true);
SELECT setval('vulnerabilities_id_seq', COALESCE((SELECT MAX(id) FROM vulnerabilities), 1), true);
SELECT setval('tickets_id_seq', COALESCE((SELECT MAX(id) FROM tickets), 1), true);
SELECT setval('ticket_messages_id_seq', COALESCE((SELECT MAX(id) FROM ticket_messages), 1), true);
SELECT setval('gantt_tasks_id_seq', COALESCE((SELECT MAX(id) FROM gantt_tasks), 1), true);

-- Update existing records with display_id if they don't have one
-- This handles the case when display_id is not set in initial INSERT statements
DO $$
DECLARE
    r RECORD;
    client_short_name TEXT;
    vuln_count INTEGER;
    ticket_count INTEGER;
BEGIN

    -- Update vulnerabilities display_id
    FOR r IN SELECT id, client_id FROM vulnerabilities WHERE display_id IS NULL ORDER BY id LOOP
        SELECT short_name INTO client_short_name FROM clients WHERE id = r.client_id;
        SELECT COUNT(*) INTO vuln_count FROM vulnerabilities WHERE client_id = r.client_id AND id <= r.id;
        UPDATE vulnerabilities SET display_id = 'V-' || client_short_name || '-' || vuln_count WHERE id = r.id;
    END LOOP;

    -- Update tickets display_id
    FOR r IN SELECT id, client_id FROM tickets WHERE display_id IS NULL ORDER BY id LOOP
        SELECT short_name INTO client_short_name FROM clients WHERE id = r.client_id;
        SELECT COUNT(*) INTO ticket_count FROM tickets WHERE client_id = r.client_id AND id <= r.id;
        UPDATE tickets SET display_id = 'T-' || client_short_name || '-' || ticket_count WHERE id = r.id;
    END LOOP;
END $$;
