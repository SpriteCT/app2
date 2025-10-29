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
  CONSTRAINT chk_clients_short_name CHECK (short_name ~ '^[A-Z]{3,4}$')
);

CREATE TABLE IF NOT EXISTS client_additional_contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT,
  phone      TEXT,
  email      TEXT
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
  CONSTRAINT chk_project_dates CHECK (start_date <= end_date),
  CONSTRAINT chk_project_progress CHECK (progress BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);

CREATE TABLE IF NOT EXISTS project_deliverables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_project ON project_deliverables(project_id);

CREATE TABLE IF NOT EXISTS project_team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);

CREATE TABLE IF NOT EXISTS assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL,
  ip_address        TEXT,
  operating_system  TEXT,
  department        TEXT,
  owner             TEXT,
  status            asset_status NOT NULL,
  criticality       priority_type NOT NULL,
  last_scan         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assets_client ON assets(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON assets(project_id);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  asset_id       UUID REFERENCES assets(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  asset_type     TEXT,
  scanner        TEXT,
  status         vuln_status NOT NULL,
  criticality    priority_type NOT NULL,
  cvss           NUMERIC,
  discovered     DATE,
  last_modified  DATE,
  assignee       TEXT
);

CREATE INDEX IF NOT EXISTS idx_vulns_client ON vulnerabilities(client_id);
CREATE INDEX IF NOT EXISTS idx_vulns_project ON vulnerabilities(project_id);
CREATE INDEX IF NOT EXISTS idx_vulns_asset ON vulnerabilities(asset_id);

CREATE TABLE IF NOT EXISTS vulnerability_tags (
  vulnerability_id  UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  tag               TEXT NOT NULL,
  PRIMARY KEY (vulnerability_id, tag)
);

CREATE TABLE IF NOT EXISTS tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee     TEXT,
  reporter     TEXT,
  priority     priority_type NOT NULL,
  status       ticket_status NOT NULL DEFAULT 'Open',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date     DATE,
  resolution   TEXT,
  CONSTRAINT chk_ticket_due CHECK (due_date IS NULL OR due_date >= created_at::date)
);

CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT now(),
  message    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

CREATE TABLE IF NOT EXISTS ticket_vulnerabilities (
  ticket_id        UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, vulnerability_id)
);

CREATE TABLE IF NOT EXISTS gantt (
  project_id  UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gantt_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL
);

-- Enforce Gantt tasks within project range via trigger (example, optional)
-- You can implement as a trigger function comparing to projects.start_date/end_date.

CREATE INDEX IF NOT EXISTS idx_gantt_tasks_project ON gantt_tasks(project_id);


