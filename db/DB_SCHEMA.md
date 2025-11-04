# Database Schema (Normalized)

Goal: 3NF-ish normalization, no multi-valued fields embedded, no denormalized duplicates, junction tables for many-to-many.

Field types are illustrative. Use UUIDs (string) or database-native IDs as preferred. Add created_at/updated_at fields where needed.

## Core Tables

workers
- id (pk)
- full_name (text)
- email (text)
- phone (text)
- created_at (timestamptz)
- updated_at (timestamptz)

asset_types
- id (pk)
- name (text, unique)
- created_at (timestamptz)
- updated_at (timestamptz)

scanners
- id (pk)
- name (text, unique)
- created_at (timestamptz)
- updated_at (timestamptz)

clients
- id (pk)
- name (text)
- short_name (text, 3–4 uppercase letters, e.g., NSV)  // CHECK ^[A-Z]{3,4}$
- industry (text)
- contact_person (text)
- position (text)
- phone (text)
- email (text)
- sla (enum: Premium|Standard|Basic)
- security_level (enum: Critical|High)
- contract_number (text)
- contract_date (date)
- contract_expiry (date)
- billing_cycle (enum: Monthly|Quarterly|Yearly)
- infra_cloud (boolean)            // cloudServices
- infra_on_prem (boolean)         // onPremise
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)

client_additional_contacts
- id (pk)
- client_id (fk -> clients.id on delete cascade)
- name (text)
- role (text)
- phone (text)
- email (text)
- created_at (timestamptz)
- updated_at (timestamptz)

projects
- id (pk)
- client_id (fk -> clients.id on delete cascade)
- name (text)
- description (text)
- type (enum: Vulnerability Scanning|Penetration Test|Network Scanning|BAS|Web Application Scanning|Compliance Check)
- status (enum: Active|Planning|On Hold|Completed|Cancelled)
- priority (enum: Critical|High|Medium|Low)
- start_date (date)
- end_date (date)
- budget (numeric)
- created_at (timestamptz)
- updated_at (timestamptz)

-- project_deliverables table removed

project_team_members
- id (pk)
- project_id (fk -> projects.id on delete cascade)
- worker_id (fk -> workers.id on delete restrict)
- created_at (timestamptz)
- updated_at (timestamptz)
- UNIQUE(project_id, worker_id)

assets
- id (pk)
- client_id (fk -> clients.id on delete restrict)
- name (text)
- type_id (fk -> asset_types.id on delete restrict)
- ip_address (text)
- operating_system (text)
- status (enum: В эксплуатации|Недоступен|В обслуживании|Выведен из эксплуатации)
- criticality (enum: Critical|High|Medium|Low)
- last_scan (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)

vulnerabilities
- id (pk)
- client_id (fk -> clients.id on delete restrict)
- asset_id (fk -> assets.id on delete set null)
- title (text)
- description (text)
- scanner_id (fk -> scanners.id on delete set null)
- status (enum: Open|In Progress|Fixed|Verified)
- criticality (enum: Critical|High|Medium|Low)
- cvss (numeric, CHECK: 0 <= cvss <= 10)
- cve (text, nullable)
- discovered (date)
- last_modified (date)
- created_at (timestamptz)
- updated_at (timestamptz)

-- vulnerability_tags removed

tickets
- id (pk)
- client_id (fk -> clients.id on delete restrict)
- title (text)
- description (text)
- assignee_id (fk -> workers.id on delete set null)
- reporter_id (fk -> workers.id on delete set null)
- priority (enum: Critical|High|Medium|Low)
- status (enum: Open|In Progress|Fixed|Verified|Closed)
- created_at (timestamptz)
- updated_at (timestamptz)
- due_date (date)
- resolution (text nullable)

ticket_messages
- id (pk)
- ticket_id (fk -> tickets.id on delete cascade)
- author_id (fk -> workers.id on delete set null)
- timestamp (timestamptz)
- message (text)
- created_at (timestamptz)
- updated_at (timestamptz)

ticket_vulnerabilities   // junction: Ticket N..N Vulnerability
- ticket_id (fk -> tickets.id on delete cascade)
- vulnerability_id (fk -> vulnerabilities.id on delete cascade)
- created_at (timestamptz)
- pk: (ticket_id, vulnerability_id)

-- gantt header removed; only task rows

gantt_tasks
- id (pk)
- project_id (fk -> projects.id on delete cascade)
- name (text)
- start_date (date)
- end_date (date)
- created_at (timestamptz)
- updated_at (timestamptz)

## Normalization Notes
- Arrays/lists moved into separate tables: client_additional_contacts, project_team_members, ticket_messages, ticket_vulnerabilities, vulnerability_tags, gantt_tasks.
- Removed denormalized project.clientName; obtain via join with clients.
- Infrastructure numeric counts are not stored on clients; compute via `assets` aggregates.
- All many-to-many represented via junctions; all one-to-many via foreign keys with appropriate on-delete actions.

## Indexing (recommended)
- projects(client_id), assets(client_id), vulnerabilities(client_id), tickets(client_id)
- ticket_vulnerabilities(ticket_id), ticket_vulnerabilities(vulnerability_id)
-- vulnerability_tags removed
- tickets(status, priority), vulnerabilities(status, criticality)

## Constraints
- CHECK (projects.start_date <= projects.end_date)
- CHECK (gantt_tasks.start_date >= projects.start_date AND gantt_tasks.end_date <= projects.end_date) via trigger or generated constraint
- CHECK (tickets.due_date IS NULL OR tickets.due_date >= tickets.created_at::date)

## Migration Guidance
- If starting from mock data: map arrays to the new join tables; replace any embedded names with ids (e.g., vulnerabilities.asset -> asset_id, tickets.client -> client_id).

