-- PostgreSQL DDL for normalized application schema
-- Requires: PostgreSQL 13+

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- ============ ENUM TYPES ============
DO $$ BEGIN
  CREATE TYPE sla_type AS ENUM ('Premium','Standard','Basic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE security_level_type AS ENUM ('Critical','High');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle_type AS ENUM ('Monthly','Quarterly','Yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
  CREATE TYPE vuln_status AS ENUM ('Open','In Progress','Fixed','Verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('Open','In Progress','Fixed','Verified','Closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TABLES ============

-- Workers (executors/assignees)
CREATE TABLE IF NOT EXISTS workers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asset Types (reference table)
CREATE TABLE IF NOT EXISTS asset_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scanners (reference table)
CREATE TABLE IF NOT EXISTS scanners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  short_name        TEXT NOT NULL,
  industry          TEXT,
  contact_person    TEXT,
  position          TEXT,
  phone             TEXT,
  email             TEXT,
  sla               sla_type NOT NULL DEFAULT 'Standard',
  security_level    security_level_type NOT NULL DEFAULT 'High',
  contract_number   TEXT,
  contract_date     DATE,
  contract_expiry   DATE,
  billing_cycle     billing_cycle_type NOT NULL DEFAULT 'Monthly',
  infra_cloud       BOOLEAN NOT NULL DEFAULT TRUE,
  infra_on_prem     BOOLEAN NOT NULL DEFAULT TRUE,
  notes             TEXT,
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_clients_short_name CHECK (short_name ~ '^[A-Z]{3,4}$')
);

CREATE TABLE IF NOT EXISTS client_additional_contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT,
  phone      TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_additional_contacts_client ON client_additional_contacts(client_id);

CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  type         project_type NOT NULL,
  status       project_status NOT NULL DEFAULT 'Active',
  priority     priority_type NOT NULL DEFAULT 'High',
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  budget       NUMERIC,
  progress     SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_project_dates CHECK (start_date <= end_date),
  CONSTRAINT chk_project_progress CHECK (progress BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);

-- project_deliverables table removed

CREATE TABLE IF NOT EXISTS project_team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id   UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_team_member UNIQUE(project_id, worker_id)
);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_worker ON project_team_members(worker_id);

CREATE TABLE IF NOT EXISTS assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name              TEXT NOT NULL,
  type_id           UUID NOT NULL REFERENCES asset_types(id) ON DELETE RESTRICT,
  ip_address        TEXT,
  operating_system  TEXT,
  status            asset_status NOT NULL,
  criticality       priority_type NOT NULL,
  last_scan         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_client ON assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type_id);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  asset_id       UUID REFERENCES assets(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  asset_type_id  UUID REFERENCES asset_types(id) ON DELETE SET NULL,
  scanner_id     UUID REFERENCES scanners(id) ON DELETE SET NULL,
  status         vuln_status NOT NULL,
  criticality    priority_type NOT NULL,
  cvss           NUMERIC CHECK (cvss IS NULL OR (cvss >= 0 AND cvss <= 10)),
  cve            TEXT, 
  discovered     DATE,
  last_modified  DATE,
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
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee_id  UUID REFERENCES workers(id) ON DELETE SET NULL,
  reporter_id  UUID REFERENCES workers(id) ON DELETE SET NULL,
  priority     priority_type NOT NULL,
  status       ticket_status NOT NULL DEFAULT 'Open',
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
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES workers(id) ON DELETE SET NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now(),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_author ON ticket_messages(author_id);

CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
  ticket_id        UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ticket_id, vulnerability_id)
);

-- gantt header table removed; only gantt_tasks per project

CREATE TABLE IF NOT EXISTS gantt_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce Gantt tasks within project range via trigger (example, optional)
-- You can implement as a trigger function comparing to projects.start_date/end_date.

CREATE INDEX IF NOT EXISTS idx_gantt_tasks_project ON gantt_tasks(project_id);


