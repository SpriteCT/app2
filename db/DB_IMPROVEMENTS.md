# Рекомендации по улучшению структуры БД

## 🔴 Критичные изменения (нужно исправить)

### 1. **Аудит и отслеживание изменений**
**Проблема:** Отсутствуют поля `created_at` и `updated_at` для большинства таблиц.
**Решение:** Добавить timestamps для аудита:
```sql
-- Добавить во все основные таблицы:
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

**Таблицы для обновления:**
- `workers` - отслеживание создания/изменения сотрудников
- `clients` - история изменений клиентов
- `projects` - отслеживание жизненного цикла проектов
- `assets` - история изменений активов
- `vulnerabilities` - важна для аудита безопасности
- `tickets` - уже есть `created_at`, но нет `updated_at`
- `asset_types`, `scanners` - для управления справочниками

### 2. **Нормализация полей авторов**
**Проблема:** `tickets.reporter` и `ticket_messages.author` - текстовые поля вместо FK.
**Решение:** 
```sql
-- В tickets:
reporter_id UUID REFERENCES workers(id) ON DELETE SET NULL
-- Убрать: reporter TEXT

-- В ticket_messages:
author_id UUID REFERENCES workers(id) ON DELETE SET NULL
-- Убрать: author TEXT
```

### 3. **Уникальность в junction таблицах**
**Проблема:** Один worker может быть добавлен в проект дважды.
**Решение:**
```sql
-- В project_team_members:
UNIQUE(project_id, worker_id)
```

### 4. **Несоответствие в mock данных**
**Проблема:** В mock данных остались поля `project`, `department`, `tags`, которые не в БД.
**Решение:** Удалить из mock данных:
- `mockAssets.js`: поля `project`, `department`
- `mockVulnerabilities.js`: поля `project`, `tags`
- `mockTickets.js`: поле `project`

## ⚠️ Важные улучшения (рекомендуется)

### 5. **Дополнительные индексы для производительности**
```sql
-- Для поиска критичных уязвимостей:
CREATE INDEX idx_vulns_cvss ON vulnerabilities(cvss) WHERE cvss >= 7.0;
CREATE INDEX idx_vulns_status_criticality ON vulnerabilities(status, criticality);

-- Для фильтрации тикетов:
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_status_priority ON tickets(status, priority);

-- Для фильтрации активов:
CREATE INDEX idx_assets_status_criticality ON assets(status, criticality);

-- Для поиска по датам:
CREATE INDEX idx_vulns_discovered ON vulnerabilities(discovered DESC);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

### 6. **Ограничения для Gantt задач**
**Проблема:** Только комментарий о проверке дат задач в пределах проекта.
**Решение:** Добавить триггер или CHECK:
```sql
CREATE OR REPLACE FUNCTION check_gantt_task_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = NEW.project_id
    AND (NEW.start_date < p.start_date OR NEW.end_date > p.end_date)
  ) THEN
    RAISE EXCEPTION 'Gantt task dates must be within project dates';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_gantt_dates
BEFORE INSERT OR UPDATE ON gantt_tasks
FOR EACH ROW EXECUTE FUNCTION check_gantt_task_dates();
```

### 7. **Улучшение Gantt задач**
**Проблема:** Нет порядка задач, описания, статуса.
**Решение:**
```sql
ALTER TABLE gantt_tasks ADD COLUMN task_order INTEGER;
ALTER TABLE gantt_tasks ADD COLUMN description TEXT;
ALTER TABLE gantt_tasks ADD COLUMN status TEXT DEFAULT 'Planned';
-- Добавить CHECK для дат:
ALTER TABLE gantt_tasks ADD CONSTRAINT chk_gantt_dates CHECK (start_date <= end_date);
```

### 8. **Валидация email и уникальность**
```sql
-- Валидация email (базовая):
ALTER TABLE workers ADD CONSTRAINT chk_workers_email 
  CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE clients ADD CONSTRAINT chk_clients_email 
  CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Уникальность email (опционально):
CREATE UNIQUE INDEX idx_workers_email_unique ON workers(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_clients_email_unique ON clients(email) WHERE email IS NOT NULL;
```

## 💡 Полезные дополнения (опционально)

### 9. **Soft delete**
Для критичных данных можно добавить:
```sql
-- В основные таблицы:
deleted_at TIMESTAMPTZ
-- Позволит восстанавливать удаленные записи
```

### 10. **История изменений**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES workers(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 11. **Версионирование для справочников**
```sql
-- Для asset_types и scanners:
is_active BOOLEAN NOT NULL DEFAULT TRUE
-- Позволит отключать устаревшие типы без удаления
```

### 12. **Дополнительные поля для активов**
```sql
-- Может быть полезно:
ALTER TABLE assets ADD COLUMN hostname TEXT;
ALTER TABLE assets ADD COLUMN fqdn TEXT;
ALTER TABLE assets ADD COLUMN mac_address TEXT;
ALTER TABLE assets ADD COLUMN notes TEXT;
```

### 13. **Приоритеты для уязвимостей**
**Проблема:** Есть `criticality`, но можно добавить поле для внутреннего приоритета обработки.
```sql
-- Уже есть criticality, но можно добавить:
processing_priority INTEGER DEFAULT 0 -- для сортировки внутри одного уровня criticality
```

### 14. **Связь уязвимостей с CVE базой**
```sql
-- Расширение для CVE:
ALTER TABLE vulnerabilities ADD COLUMN cve_description TEXT;
ALTER TABLE vulnerabilities ADD COLUMN remediation_steps TEXT;
ALTER TABLE vulnerabilities ADD COLUMN references_urls TEXT[]; -- массив URL
```

## 📊 Статистика и аналитика

### 15. **Вычисляемые поля через VIEW**
```sql
CREATE VIEW client_statistics AS
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT a.id) as asset_count,
  COUNT(DISTINCT v.id) as vuln_count,
  COUNT(DISTINCT CASE WHEN v.status = 'Open' THEN v.id END) as open_vuln_count,
  COUNT(DISTINCT t.id) as ticket_count,
  COUNT(DISTINCT p.id) as project_count
FROM clients c
LEFT JOIN assets a ON a.client_id = c.id
LEFT JOIN vulnerabilities v ON v.client_id = c.id
LEFT JOIN tickets t ON t.client_id = c.id
LEFT JOIN projects p ON p.client_id = c.id
GROUP BY c.id, c.name;
```

## 🔒 Безопасность

### 16. **Ограничения доступа на уровне БД**
```sql
-- Ограничение на количество проектов одного типа для клиента:
-- (если нужно бизнес-правило)
```

### 17. **Валидация CVSS версии**
```sql
-- Уточнить формат CVE:
ALTER TABLE vulnerabilities ADD CONSTRAINT chk_cve_format
  CHECK (cve IS NULL OR cve ~ '^CVE-\d{4}-\d{4,}$');
```

## ✅ Приоритет внедрения

**Высокий приоритет (сделать сразу):**
1. Добавить `created_at`, `updated_at` в основные таблицы
2. Заменить `reporter` и `author` на FK к `workers`
3. Добавить UNIQUE constraint в `project_team_members`
4. Удалить неиспользуемые поля из mock данных

**Средний приоритет (в ближайшее время):**
5. Добавить недостающие индексы
6. Реализовать триггер для Gantt задач
7. Улучшить структуру Gantt задач

**Низкий приоритет (по необходимости):**
8-17. Остальные улучшения в зависимости от требований

