# Анализ соответствия Mock данных схеме БД

## ✅ Что соответствует

### mockWorkers.js
- Все поля соответствуют схеме БД

### mockAssetTypes.js
- Все поля соответствуют схеме БД

### mockScanners.js
- Все поля соответствуют схеме БД

### mockClients.js

**Замечания (не критично):**
- ⚠️ `code` - нет в БД, но можно использовать как алиас для `short_name`
- ⚠️ `infrastructure` (объект) - это вычисляемые данные из assets, не хранится в БД
- ✅ `additionalContacts` - соответствует структуре `client_additional_contacts`
- ✅ Остальные поля соответствуют (camelCase в mock данных нормально)

### mockProjects.js

**Замечания (не критично):**
- ⚠️ `clientName` - денормализованное поле, в БД получать через JOIN с clients
- ⚠️ `deliverables`, `team` - массивы в mock, в БД это junction таблицы (`project_deliverables`, `project_team_members`)
- ⚠️ `vulnerabilities`, `tickets`, `assets` - массивы в mock, но это не прямые связи с projects в БД
- ✅ Остальные поля соответствуют (camelCase в mock данных нормально, фронтенд конвертирует)

**Ожидаемая структура в БД:**
```javascript
{
  id: 'uuid',
  client_id: 'uuid',  // FK к clients
  name: 'Безопасность инфраструктуры',
  description: '...',
  type: 'Vulnerability Scanning',
  status: 'Active',
  priority: 'High',
  start_date: '2024-01-15',
  end_date: '2024-12-31',
  budget: 1500000,
  progress: 45,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// deliverables → project_deliverables:
{ id: 'uuid', project_id: 'uuid', title: 'Ежемесячные отчеты...' }

// team → project_team_members:
{ id: 'uuid', project_id: 'uuid', worker_id: 'uuid' }
```

---

## ❌ Несоответствия (требуют исправления)

### 1. mockAssets.js

**Проблемы:**
- ❌ `project` - поля нет в БД (проекты не связаны с активами напрямую)
- ❌ `department` - поля нет в БД (убрали ранее)
- ❌ `type` (текст) - должно быть `type_id` (UUID, FK к `asset_types.id`)
- ❌ `vulnerabilities` (массив ID) - это связь через junction таблицу, но для mock данных можно оставить
- ❌ `tickets` (массив ID) - это связь через junction таблицу, но для mock данных можно оставить

**Ожидаемая структура (после миграции на БД):**
```javascript
{
  id: 'uuid',
  client_id: 'uuid',  // FK к clients
  name: 'web-01.example.com',
  type_id: 'uuid',  // FK к asset_types (не текст!)
  ip_address: '192.168.1.10',
  operating_system: 'Ubuntu 22.04',
  status: 'В эксплуатации',
  criticality: 'Critical',
  last_scan: '2024-01-20T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}
```

**Что нужно изменить:**
1. Удалить `project` и `department` из всех записей
2. Заменить `type: 'Web Server'` на `type_id: 'at-1'` (ссылка на mockAssetTypes)
3. Добавить `client_id` вместо использования `owner`

---

### 2. mockVulnerabilities.js

**Проблемы:**
- ❌ `project` - поля нет в БД
- ❌ `tags` (массив) - таблицу `vulnerability_tags` убрали
- ❌ `asset` (текст) - должно быть `asset_id` (UUID, FK к `assets.id`)
- ❌ `assetType` (текст) - должно быть `asset_type_id` (UUID, FK к `asset_types.id`)
- ❌ `scanner` (текст) - должно быть `scanner_id` (UUID, FK к `scanners.id`)
- ✅ `client` - можно оставить для фильтрации, но в БД это `client_id` (UUID)

**Ожидаемая структура (после миграции на БД):**
```javascript
{
  id: 'uuid',
  client_id: 'uuid',  // FK к clients
  asset_id: 'uuid',  // FK к assets (nullable)
  title: 'SQL Injection в параметре поиска',
  description: '...',
  asset_type_id: 'uuid',  // FK к asset_types (nullable)
  scanner_id: 'uuid',  // FK к scanners (nullable)
  status: 'Open',
  criticality: 'Critical',
  cvss: 9.8,
  cve: 'CVE-2023-1234',  // или null
  discovered: '2024-01-15',
  last_modified: '2024-01-20',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-20T00:00:00Z'
}
```

**Что нужно изменить:**
1. Удалить `project` из всех записей
2. Удалить `tags` из всех записей
3. Заменить `asset: 'web-01.example.com'` на `asset_id: 'A-TSV-001'` (ID из mockAssets)
4. Заменить `assetType: 'Web Server'` на `asset_type_id: 'at-1'` (ID из mockAssetTypes)
5. Заменить `scanner: 'Nessus'` на `scanner_id: 'sc-1'` (ID из mockScanners)
6. Заменить `client: '1'` на `client_id: '1'` (для согласованности)

---

### 3. mockTickets.js

**Проблемы:**
- ❌ `project` - поля нет в БД
- ❌ `assignee` (текст) - должно быть `assignee_id` (UUID, FK к `workers.id`)
- ❌ `reporter` (текст) - должно быть `reporter_id` (UUID, FK к `workers.id`)
- ❌ `client` - должно быть `client_id` (UUID, FK к `clients.id`)
- ❌ `chatMessages` (массив) - должно быть в отдельной таблице `ticket_messages`, и `author` должно быть `author_id` (FK к workers)
- ❌ `vulnerabilities` (массив ID) - это связь через `ticket_vulnerabilities`, но для mock данных можно оставить
- ✅ `createdAt` / `updatedAt` - в БД это `created_at` / `updated_at` (snake_case)

**Ожидаемая структура (после миграции на БД):**
```javascript
{
  id: 'uuid',
  client_id: 'uuid',  // FK к clients
  title: 'SQL Injection на web-01.example.com',
  description: '...',
  assignee_id: 'uuid',  // FK к workers (nullable)
  reporter_id: 'uuid',  // FK к workers (nullable)
  priority: 'Critical',
  status: 'Open',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-20T00:00:00Z',
  due_date: '2024-01-22',
  resolution: ''  // или null
}

// Отдельно для chatMessages → ticket_messages:
{
  id: 'uuid',
  ticket_id: 'uuid',  // FK к tickets
  author_id: 'uuid',  // FK к workers (не текст!)
  timestamp: '2024-01-15T10:30:00Z',
  message: 'Начинаю анализ уязвимости',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z'
}
```

**Что нужно изменить:**
1. Удалить `project` из всех записей
2. Заменить `assignee: 'Иванов И.И.'` на `assignee_id: 'worker-1'` (ID из mockWorkers)
3. Заменить `reporter: 'Security Team'` на `reporter_id: 'worker-X'` (или null, если reporter не worker)
4. Заменить `client: '1'` на `client_id: '1'`
5. В `chatMessages` заменить `author` (текст) на `author_id` (UUID из mockWorkers)
6. Переименовать `createdAt` → `created_at`, `updatedAt` → `updated_at`, `dueDate` → `due_date`

---

## 📋 Сводка изменений

### Общие проблемы:
1. **Текстовые ссылки вместо FK** - везде где есть ссылки на другие сущности, нужно использовать ID
2. **Поля `project`** - удалить из assets, vulnerabilities, tickets (не связаны с проектами напрямую)
3. **Поля `department`** - удалить из assets
4. **Поле `tags`** - удалить из vulnerabilities
5. **Согласование имен полей** - использовать snake_case в mock данных для соответствия БД

### Порядок исправления:
1. ✅ Обновить mockAssets.js (убрать project, department, заменить type на type_id)
2. ✅ Обновить mockVulnerabilities.js (убрать project, tags, заменить asset/assetType/scanner на FK)
3. ✅ Обновить mockTickets.js (убрать project, заменить assignee/reporter на FK, обновить chatMessages)

---

## 🔄 Связи между таблицами (для справки)

### assets:
- `client_id` → `clients.id`
- `type_id` → `asset_types.id`

### vulnerabilities:
- `client_id` → `clients.id`
- `asset_id` → `assets.id` (nullable)
- `asset_type_id` → `asset_types.id` (nullable)
- `scanner_id` → `scanners.id` (nullable)

### tickets:
- `client_id` → `clients.id`
- `assignee_id` → `workers.id` (nullable)
- `reporter_id` → `workers.id` (nullable)

### ticket_messages:
- `ticket_id` → `tickets.id`
- `author_id` → `workers.id` (nullable)

### projects:
- `client_id` → `clients.id`

### project_team_members:
- `project_id` → `projects.id`
- `worker_id` → `workers.id`
- UNIQUE(project_id, worker_id)

### ticket_vulnerabilities (junction):
- `ticket_id` → `tickets.id`
- `vulnerability_id` → `vulnerabilities.id`
- PRIMARY KEY (ticket_id, vulnerability_id)

