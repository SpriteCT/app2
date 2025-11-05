-- PostgreSQL DDL for normalized application schema
-- Requires: PostgreSQL 13+
-- All IDs use SERIAL (auto-incrementing INTEGER) instead of UUID

-- ============ ENUM TYPES ============

DO $$ BEGIN
  CREATE TYPE project_type AS ENUM ('Vulnerability Scanning','Penetration Test','Network Scanning','BAS','Web Application Scanning','Compliance Check');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('Active','Planning','On Hold','Completed','Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE priority_type AS ENUM ('Critical','High','Medium','Low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE asset_status AS ENUM ('В эксплуатации','Недоступен','В обслуживании','Выведен из эксплуатации');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vuln_status AS ENUM ('Open','In Progress','Closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('Open','In Progress','Closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TABLES ============

-- Asset Types (reference table)
CREATE TABLE IF NOT EXISTS asset_types (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scanners (reference table)
CREATE TABLE IF NOT EXISTS scanners (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  short_name        TEXT NOT NULL,
  industry          TEXT,
  contract_number   TEXT,
  contract_date     DATE,
  contract_expiry   DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_clients_short_name CHECK (short_name ~ '^[A-Z]{3,4}$')
);

CREATE TABLE IF NOT EXISTS client_contacts (
  id         SERIAL PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT,
  phone      TEXT,
  email      TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client ON client_contacts(client_id);

-- User Accounts (для авторизации: заказчики и исполнители)
-- Создается после clients, так как ссылается на нее
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('client','worker');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS user_accounts (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT, -- Для будущей авторизации
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  user_type     user_type NOT NULL DEFAULT 'worker', -- 'client' или 'worker'
  client_id     INTEGER REFERENCES clients(id) ON DELETE CASCADE, -- Для заказчиков
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_accounts_client CHECK (
    (user_type = 'client' AND client_id IS NOT NULL) OR
    (user_type = 'worker' AND client_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_user_accounts_client ON user_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON user_accounts(username);

CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  type         project_type NOT NULL,
  status       project_status NOT NULL DEFAULT 'Active',
  priority     priority_type NOT NULL DEFAULT 'High',
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  progress     SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_project_dates CHECK (start_date <= end_date),
  CONSTRAINT chk_project_progress CHECK (progress BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);

-- project_deliverables table removed

CREATE TABLE IF NOT EXISTS project_team_members (
  id             SERIAL PRIMARY KEY,
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_account_id INTEGER NOT NULL REFERENCES user_accounts(id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_team_member UNIQUE(project_id, user_account_id)
);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user_account ON project_team_members(user_account_id);

CREATE TABLE IF NOT EXISTS assets (
  id                SERIAL PRIMARY KEY,
  client_id         INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name              TEXT NOT NULL,
  type_id           INTEGER NOT NULL REFERENCES asset_types(id) ON DELETE RESTRICT,
  ip_address        TEXT,
  operating_system  TEXT,
  status            asset_status NOT NULL,
  criticality       priority_type NOT NULL,
  last_scan         TIMESTAMPTZ,
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_client ON assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type_id);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id             SERIAL PRIMARY KEY,
  display_id     TEXT UNIQUE,
  client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  asset_id       INTEGER REFERENCES assets(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  asset_type_id  INTEGER REFERENCES asset_types(id) ON DELETE SET NULL,
  scanner_id     INTEGER REFERENCES scanners(id) ON DELETE SET NULL,
  status         vuln_status NOT NULL,
  criticality    priority_type NOT NULL,
  cvss           NUMERIC CHECK (cvss IS NULL OR (cvss >= 0 AND cvss <= 10)),
  cve            TEXT, 
  discovered     DATE,
  last_modified  DATE,
  is_deleted     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  -- no assignee by design
);

CREATE INDEX IF NOT EXISTS idx_vulns_client ON vulnerabilities(client_id);
CREATE INDEX IF NOT EXISTS idx_vulns_asset ON vulnerabilities(asset_id);
CREATE INDEX IF NOT EXISTS idx_vulns_asset_type ON vulnerabilities(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_vulns_scanner ON vulnerabilities(scanner_id);

-- vulnerability_tags table removed

CREATE TABLE IF NOT EXISTS tickets (
  id           SERIAL PRIMARY KEY,
  display_id   TEXT UNIQUE,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee_id  INTEGER REFERENCES user_accounts(id) ON DELETE SET NULL,
  reporter_id  INTEGER REFERENCES user_accounts(id) ON DELETE SET NULL,
  priority     priority_type NOT NULL,
  status       ticket_status NOT NULL DEFAULT 'Open',
  is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date     DATE,
  resolution   TEXT,
  CONSTRAINT chk_ticket_due CHECK (due_date IS NULL OR due_date >= created_at::date)
);

CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON tickets(reporter_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id  INTEGER REFERENCES user_accounts(id) ON DELETE SET NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now(),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_author ON ticket_messages(author_id);

CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
  ticket_id        INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  vulnerability_id INTEGER NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ticket_id, vulnerability_id)
);

-- gantt header table removed; only gantt_tasks per project

CREATE TABLE IF NOT EXISTS gantt_tasks (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce Gantt tasks within project range via trigger (example, optional)
-- You can implement as a trigger function comparing to projects.start_date/end_date.

CREATE INDEX IF NOT EXISTS idx_gantt_tasks_project ON gantt_tasks(project_id);


