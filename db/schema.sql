-- PostgreSQL DDL for normalized application schema
-- Requires: PostgreSQL 13+
-- All IDs use SERIAL (auto-incrementing INTEGER) instead of UUID

-- ============ ENUM TYPES ============

DO $$ BEGIN
  CREATE TYPE priority_type AS ENUM ('Critical','High','Medium','Low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('Active','Planning','On Hold','Completed','Cancelled');
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

-- ============ REFERENCE TABLES (must be created first) ============

-- Asset Types (reference table)
CREATE TABLE IF NOT EXISTS asset_types (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scanners (reference table)
CREATE TABLE IF NOT EXISTS scanners (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project Types (reference table)
CREATE TABLE IF NOT EXISTS project_types (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ MAIN TABLES ============

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

-- Users (для авторизации)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  password_hash TEXT,
  email         TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Client Profiles (профили клиентов)
CREATE TABLE IF NOT EXISTS client_profiles (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  client_id     INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contact_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_profiles_client ON client_profiles(client_id);

-- Worker Profiles (профили работников)
CREATE TABLE IF NOT EXISTS worker_profiles (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  type_id      INTEGER NOT NULL REFERENCES project_types(id) ON DELETE RESTRICT,
  status       project_status NOT NULL,
  priority     priority_type NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_project_dates CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- project_deliverables table removed

CREATE TABLE IF NOT EXISTS project_team_members (
  id             SERIAL PRIMARY KEY,
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_team_member UNIQUE(project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user ON project_team_members(user_id);

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
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON assets(criticality);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id             SERIAL PRIMARY KEY,
  display_id     TEXT UNIQUE,
  client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  asset_id       INTEGER REFERENCES assets(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
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
CREATE INDEX IF NOT EXISTS idx_vulns_scanner ON vulnerabilities(scanner_id);
CREATE INDEX IF NOT EXISTS idx_vulns_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulns_criticality ON vulnerabilities(criticality);

-- vulnerability_tags table removed

CREATE TABLE IF NOT EXISTS tickets (
  id           SERIAL PRIMARY KEY,
  display_id   TEXT UNIQUE,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reporter_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  priority     priority_type NOT NULL,
  status       ticket_status NOT NULL,
  is_deleted   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date     DATE,
  resolution   TEXT,
  CONSTRAINT chk_ticket_due CHECK (due_date IS NULL OR due_date >= created_at::date)
);

CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON tickets(reporter_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
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

-- Unique indexes with WHERE clause for soft-deleted reference tables
CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_types_name_active ON asset_types(name) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_scanners_name_active ON scanners(name) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_types_name_active ON project_types(name) WHERE is_deleted = FALSE;


