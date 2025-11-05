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

-- ============ REFERENCE TABLES ============
-- Project Types
INSERT INTO project_types (id, name) VALUES
(1, 'Vulnerability Scanning'),
(2, 'Penetration Test'),
(3, 'Network Scanning'),
(4, 'BAS'),
(5, 'Web Application Scanning'),
(6, 'Compliance Check');

-- ============ CLIENTS ============
INSERT INTO clients (id, name, short_name, industry, contract_number, contract_date, contract_expiry, notes) VALUES
(1, 'ООО "ТехноСервис"', 'TSV', 'IT-инфраструктура', 'TS-2025-001', '2025-10-01', '2026-10-01', 'Крупный IT-интегратор с критической инфраструктурой. Требует постоянного мониторинга.'),
(2, 'АО "ФинансХост"', 'FNH', 'Финансовые услуги', 'FH-2025-015', '2025-09-15', '2026-09-15', 'Финансовая организация. Особое внимание к комплаенсу и безопасности данных.'),
(3, 'ООО "МедиаДиджитал"', 'MDD', 'Медиа', 'MD-2025-008', '2025-10-10', '2026-10-10', 'Медиа-компания с веб-платформами');

-- Пользователи заказчиков
-- Вставляем ПОСЛЕ клиентов, так как есть внешний ключ на clients.id
INSERT INTO users (id, password_hash, email) VALUES
(9, NULL, 'smirnov@technoservice.ru'),
(10, NULL, 'kuznetsov@finhost.ru'),
(11, NULL, 'popov@mediadigital.ru');

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
(11, 3, 'Попов П.П.');

-- ============ CLIENT CONTACTS ============
INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
-- Основные контакты (is_primary = TRUE)
(1, 1, 'Иванов Иван Иванович', 'Директор по безопасности', '+7 (495) 123-45-67', 'ivanov@technoservice.ru', TRUE),
(2, 2, 'Петров Петр Петрович', 'Руководитель информационной безопасности', '+7 (495) 234-56-78', 'petrov@finhost.ru', TRUE),
(3, 3, 'Сидоров Сидор Сидорович', 'Директор по IT', '+7 (495) 345-67-89', 'sidorov@mediadigital.ru', TRUE),
-- Дополнительные контакты (is_primary = FALSE)
(4, 1, 'Петров Петр Петрович', 'IT-директор', '+7 (495) 123-45-68', 'petrov@technoservice.ru', FALSE),
(5, 2, 'Сидоров Сидор Сидорович', 'Network Admin', '+7 (495) 234-56-79', 'sidorov@finhost.ru', FALSE);

-- ============ PROJECTS ============
INSERT INTO projects (id, client_id, name, description, type_id, status, priority, start_date, end_date) VALUES
(1, 1, 'Безопасность инфраструктуры', 'Регулярное сканирование инфраструктуры на уязвимости с ежемесячными отчетами', 1, 'Active', 'High', '2025-10-01', '2025-12-31'),
(2, 1, 'Breach and Attack Simulation', 'Симуляция атак на инфраструктуру для проверки эффективности защиты', 4, 'Active', 'High', '2025-10-15', '2025-11-30'),
(3, 1, 'Web Application Scanning', 'Сканирование веб-приложений на SQL Injection, XSS и другие уязвимости', 5, 'Active', 'Critical', '2025-09-20', '2025-11-15'),
(4, 2, 'Аудит безопасности', 'Глубокий пентест с фокусом на финансовые системы и базы данных', 2, 'Active', 'Critical', '2025-09-15', '2025-11-15'),
(5, 3, 'Сканирование сетевое', 'Непрерывное сканирование сети на открытые порты и сетевое оборудование', 3, 'Active', 'Medium', '2025-10-10', '2025-12-10');

-- ============ PROJECT TEAM MEMBERS ============
INSERT INTO project_team_members (id, project_id, user_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 2, 2),
(5, 2, 3),
(6, 3, 1),
(7, 3, 2),
(8, 4, 6),
(9, 4, 7),
(10, 5, 4),
(11, 5, 8);

-- ============ ASSETS ============
INSERT INTO assets (id, client_id, name, type_id, ip_address, operating_system, status, criticality, last_scan) VALUES
(1, 1, 'web-01.example.com', 1, '192.168.1.10', 'Ubuntu 22.04', 'В эксплуатации', 'Critical', '2025-11-01 10:00:00+00'),
(2, 1, 'app-server-02.local', 2, '192.168.1.20', 'Windows Server 2022', 'В эксплуатации', 'High', '2025-11-02 14:00:00+00'),
(3, 1, 'db-server-01.internal', 3, '192.168.1.30', 'CentOS 8', 'В эксплуатации', 'Critical', '2025-10-28 09:00:00+00'),
(4, 1, 'api-server-01.internal', 6, '192.168.1.40', 'Ubuntu 20.04', 'В эксплуатации', 'High', '2025-10-30 15:00:00+00'),
(5, 1, 'backup-server-01.internal', 8, '192.168.3.20', 'Ubuntu 20.04', 'В эксплуатации', 'Medium', '2025-10-25 08:00:00+00'),
(6, 2, 'app.example.com', 5, '192.168.1.150', 'Docker Container', 'В эксплуатации', 'High', '2025-10-27 12:00:00+00'),
(7, 2, 'db-finhost.internal', 3, '192.168.2.20', 'PostgreSQL 15', 'В эксплуатации', 'Critical', '2025-10-29 11:00:00+00'),
(8, 3, 'linux-server-01', 7, '192.168.3.10', 'Debian 11', 'В эксплуатации', 'Medium', '2025-10-26 10:00:00+00'),
(9, 3, 'web-media.example.com', 5, '192.168.1.200', 'Docker Container', 'В эксплуатации', 'Medium', '2025-10-28 13:00:00+00');

-- ============ VULNERABILITIES ============
-- Для первого клиента (TSV) - в 3 раза больше уязвимостей
-- Распределены на неделю: 28.10 - 04.11.2025
INSERT INTO vulnerabilities (id, display_id, client_id, asset_id, title, description, scanner_id, status, criticality, cvss, cve, discovered, last_modified, is_deleted) VALUES
-- Клиент 1 (TSV) - 6 уязвимостей, распределены на неделю
(1, 'V-TSV-1', 1, 1, 'SQL Injection в параметре поиска', 'Обнаружена уязвимость SQL Injection в параметре поиска', 1, 'Open', 'Critical', 9.8, 'CVE-2023-1234', '2025-10-28', '2025-11-04', FALSE),
(2, 'V-TSV-2', 1, 2, 'Устаревшая версия Apache Tomcat', 'Используется Apache Tomcat версии 8.5.29, уязвимая к CVE-2023-45133', 2, 'In Progress', 'High', 7.5, 'CVE-2023-45133', '2025-10-29', '2025-11-04', FALSE),
(3, 'V-TSV-3', 1, 3, 'Уязвимость в библиотеке Log4j', 'Log4j версия 2.14.0 уязвима к CVE-2021-44228', 1, 'Open', 'Critical', 10.0, 'CVE-2021-44228', '2025-10-30', '2025-11-04', FALSE),
(4, 'V-TSV-4', 1, 4, 'SSRF в API endpoint', 'Server-Side Request Forgery в /api/v1/upload endpoint', 3, 'Open', 'High', 8.1, 'CVE-2024-5678', '2025-10-31', '2025-11-04', FALSE),
(5, 'V-TSV-5', 1, 1, 'Missing Security Headers', 'Отсутствуют заголовки безопасности X-Frame-Options, CSP', 2, 'Open', 'Medium', 5.2, NULL, '2025-11-01', '2025-11-04', FALSE),
(6, 'V-TSV-6', 1, 2, 'Weak TLS Configuration', 'Используется устаревший TLS 1.0 протокол', 1, 'In Progress', 'High', 6.8, NULL, '2025-11-02', '2025-11-04', FALSE),
-- Клиент 2 (FNH) - 2 уязвимости, распределены на неделю
(7, 'V-FNH-1', 2, 6, 'SSRF в функционале загрузки', 'Обнаружена Server-Side Request Forgery уязвимость', 3, 'Closed', 'High', 7.8, NULL, '2025-10-28', '2025-11-03', FALSE),
(8, 'V-FNH-2', 2, 7, 'Слабая политика паролей БД', 'Обнаружены слабые пароли у учетных записей базы данных', 2, 'Open', 'Medium', 5.5, NULL, '2025-10-30', '2025-11-04', FALSE),
-- Клиент 3 (MDD) - 2 уязвимости, распределены на неделю
(9, 'V-MDD-1', 3, 8, 'Несвоевременное обновление системных компонентов', 'Накоплено 15 критических обновлений', 2, 'Open', 'Medium', 4.5, NULL, '2025-10-29', '2025-11-04', FALSE),
(10, 'V-MDD-2', 3, 9, 'Открытые порты 445/139 (SMB)', 'SMB порты доступны из внешней сети', 1, 'Open', 'High', 8.8, NULL, '2025-11-01', '2025-11-04', FALSE);

-- ============ TICKETS ============
-- Для первого клиента (TSV) - в 3 раза больше тикетов (6 вместо 2)
-- Распределены на неделю: 28.10 - 04.11.2025
-- Note: created_at and updated_at will be set automatically, but we'll set them explicitly for consistency
INSERT INTO tickets (id, display_id, client_id, title, description, assignee_id, reporter_id, priority, status, created_at, updated_at, due_date, resolution, is_deleted) VALUES
-- Клиент 1 (TSV) - 6 тикетов, распределены на неделю
(1, 'T-TSV-1', 1, 'SQL Injection на web-01.example.com', 'Необходимо устранить уязвимость SQL Injection на сервере web-01.example.com', 1, NULL, 'Critical', 'Open', '2025-10-28 10:00:00+00', '2025-10-28 10:00:00+00', '2025-11-05', NULL, FALSE),
(2, 'T-TSV-2', 1, 'Устаревшая версия Apache Tomcat', 'Обновление Apache Tomcat до актуальной версии для устранения CVE-2023-45133', 2, NULL, 'High', 'In Progress', '2025-10-29 14:00:00+00', '2025-10-29 14:00:00+00', '2025-11-06', NULL, FALSE),
(3, 'T-TSV-3', 1, 'Критическая уязвимость Log4j', 'Log4j версия 2.14.0 уязвима к CVE-2021-44228. Требуется немедленное обновление', 1, NULL, 'Critical', 'Open', '2025-10-30 09:00:00+00', '2025-10-30 09:00:00+00', '2025-11-04', NULL, FALSE),
(4, 'T-TSV-4', 1, 'SSRF в API endpoint', 'Устранение Server-Side Request Forgery уязвимости в /api/v1/upload', 2, NULL, 'High', 'Open', '2025-10-31 08:00:00+00', '2025-10-31 08:00:00+00', '2025-11-07', NULL, FALSE),
(5, 'T-TSV-5', 1, 'Добавление Security Headers', 'Добавить заголовки безопасности X-Frame-Options и Content-Security-Policy', 3, NULL, 'Medium', 'Open', '2025-11-01 11:00:00+00', '2025-11-01 11:00:00+00', '2025-11-08', NULL, FALSE),
(6, 'T-TSV-6', 1, 'Обновление TLS конфигурации', 'Отключить поддержку устаревшего TLS 1.0 и TLS 1.1', 2, NULL, 'High', 'In Progress', '2025-11-02 15:00:00+00', '2025-11-02 15:00:00+00', '2025-11-06', NULL, FALSE),
-- Клиент 2 (FNH) - 2 тикета, распределены на неделю
(7, 'T-FNH-1', 2, 'SSRF уязвимость', 'Обнаружена SSRF уязвимость при пентесте. Требуется устранение', 7, NULL, 'High', 'Closed', '2025-10-28 15:00:00+00', '2025-11-03 12:00:00+00', NULL, 'Уязвимость устранена. Добавлена валидация URL', FALSE),
(8, 'T-FNH-2', 2, 'Усиление политики паролей БД', 'Усиление политики паролей для учетных записей базы данных', 6, NULL, 'Medium', 'Open', '2025-10-30 10:00:00+00', '2025-10-30 10:00:00+00', '2025-11-09', NULL, FALSE),
-- Клиент 3 (MDD) - 2 тикета, распределены на неделю
(9, 'T-MDD-1', 3, 'Обновление системных компонентов', 'Необходимо установить накопленные критические обновления', 4, NULL, 'Medium', 'Open', '2025-10-29 10:00:00+00', '2025-10-29 10:00:00+00', '2025-11-10', NULL, FALSE),
(10, 'T-MDD-2', 3, 'Закрытие SMB портов', 'SMB порты доступны извне. Требуется закрыть доступ или настроить VPN', 8, NULL, 'High', 'Open', '2025-11-01 14:00:00+00', '2025-11-01 14:00:00+00', '2025-11-07', NULL, FALSE);

-- ============ TICKET MESSAGES ============
-- Только сообщения от пользователей (author_id не NULL)
-- Системные сообщения создаются автоматически при изменении тикета
-- Распределены на неделю: 28.10 - 04.11.2025
INSERT INTO ticket_messages (id, ticket_id, author_id, timestamp, message) VALUES
(1, 1, 1, '2025-10-28 10:30:00+00', 'Начинаю анализ уязвимости'),
(2, 2, 2, '2025-10-29 14:00:00+00', 'Обновление запланировано на 06.11.2025'),
(3, 3, 1, '2025-10-30 09:00:00+00', 'Действительно критично. Начинаю работу'),
(4, 4, 2, '2025-10-31 08:30:00+00', 'Анализирую код endpoint'),
(5, 5, 3, '2025-11-01 11:00:00+00', 'Изучаю документацию по Security Headers'),
(6, 6, 2, '2025-11-02 15:00:00+00', 'Обновляю конфигурацию TLS'),
(7, 7, 7, '2025-10-28 15:00:00+00', 'Начинаю исправление'),
(8, 7, 7, '2025-11-03 12:00:00+00', 'Уязвимость устранена. Требуется верификация'),
(9, 8, 6, '2025-10-30 10:00:00+00', 'Обновляю политику паролей БД'),
(10, 9, 4, '2025-10-29 10:00:00+00', 'Начинаю установку обновлений'),
(11, 10, 8, '2025-11-01 14:00:00+00', 'Проверяю конфигурацию файрвола');

-- ============ TICKET VULNERABILITIES (Many-to-Many) ============
INSERT INTO ticket_vulnerabilities (ticket_id, vulnerability_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- ============ GANTT TASKS (Optional - пример для проекта) ============
INSERT INTO gantt_tasks (id, project_id, name, start_date, end_date) VALUES
(1, 1, 'Подготовка инфраструктуры сканирования', '2025-10-01', '2025-10-10'),
(2, 1, 'Настройка расписания сканирований', '2025-10-11', '2025-10-20'),
(3, 1, 'Ежемесячное сканирование (октябрь)', '2025-10-21', '2025-10-31'),
(4, 2, 'Подготовка к BAS', '2025-10-15', '2025-10-25'),
(5, 2, 'Проведение BAS тестов', '2025-10-26', '2025-11-15'),
(6, 3, 'Сканирование веб-приложений', '2025-09-20', '2025-10-10'),
(7, 3, 'Анализ результатов', '2025-10-11', '2025-11-15'),
(8, 4, 'Разведка инфраструктуры', '2025-09-15', '2025-09-25'),
(9, 4, 'Пентест веб-приложений', '2025-09-26', '2025-10-20'),
(10, 4, 'Пентест баз данных', '2025-10-21', '2025-11-05'),
(11, 4, 'Подготовка отчета', '2025-11-06', '2025-11-15'),
(12, 5, 'Настройка сетевого сканирования', '2025-10-10', '2025-10-20'),
(13, 5, 'Еженедельное сканирование', '2025-10-21', '2025-12-10');

-- Установка паролей по умолчанию для всех пользователей
-- Пароль: password123 (хранится в чистом виде, без хеширования)
UPDATE users SET password_hash = 'password123' WHERE password_hash IS NULL;

-- Fix sequences after inserting data with explicit IDs
-- This ensures that new records get correct auto-incrementing IDs
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval('asset_types_id_seq', COALESCE((SELECT MAX(id) FROM asset_types), 1), true);
SELECT setval('scanners_id_seq', COALESCE((SELECT MAX(id) FROM scanners), 1), true);
SELECT setval('project_types_id_seq', COALESCE((SELECT MAX(id) FROM project_types), 1), true);
-- Status and priority sequences removed (using ENUMs now)
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
