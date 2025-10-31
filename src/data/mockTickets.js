// Mock data для тикетов
export const mockTickets = [
  {
    id: 'T-TSV-001',
    clientId: '1',
    title: 'SQL Injection на web-01.example.com',
    vulnerabilities: ['V-TSV-001'],
    priority: 'Critical',
    status: 'Open',
    assigneeId: 'w-1', // Иванов И.И.
    reporterId: null, // Security Team - не worker
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    dueDate: '2024-01-22',
    description: 'Необходимо устранить уязвимость SQL Injection на сервере web-01.example.com',
    resolution: '',
    chatMessages: [
      {
        id: 'msg-1',
        authorId: 'w-1', // Иванов И.И.
        timestamp: '2024-01-15 10:30',
        message: 'Начинаю анализ уязвимости',
      },
      {
        id: 'msg-2',
        authorId: null, // Security Team - не worker
        timestamp: '2024-01-15 11:00',
        message: 'Приоритет: Critical. Требуется срочное устранение',
      },
    ],
  },
  {
    id: 'T-TSV-002',
    clientId: '1',
    title: 'Устаревшая версия Apache Tomcat',
    vulnerabilities: ['V-TSV-002'],
    priority: 'High',
    status: 'In Progress',
    assigneeId: 'w-2', // Петров П.П.
    reporterId: null, // OpenVAS Scanner - не worker
    createdAt: '2024-01-10',
    updatedAt: '2024-01-22',
    dueDate: '2024-01-25',
    description: 'Обновление Apache Tomcat до актуальной версии для устранения CVE-2023-45133',
    resolution: '',
    chatMessages: [
      {
        id: 'msg-3',
        authorId: 'w-2', // Петров П.П.
        timestamp: '2024-01-12 14:00',
        message: 'Обновление запланировано на 24.01.2024',
      },
      {
        id: 'msg-4',
        authorId: null, // Менеджер проекта - не worker
        timestamp: '2024-01-12 14:30',
        message: 'Ок, согласовано. Необходимо предупредить клиента о даунтайме',
      },
    ],
  },
  {
    id: 'T-VGP-001',
    clientId: '6',
    title: 'Лог4дж уязвимость',
    vulnerabilities: ['V-VGP-001'],
    priority: 'Critical',
    status: 'Open',
    assigneeId: 'w-6', // Волков В.В.
    reporterId: null, // Nessus Scanner - не worker
    createdAt: '2024-01-08',
    updatedAt: '2024-01-20',
    dueDate: '2024-01-21',
    description: 'Критическая уязвимость Log4j требует немедленного обновления',
    resolution: '',
    chatMessages: [
      {
        id: 'msg-5',
        authorId: 'w-6', // Волков В.В.
        timestamp: '2024-01-08 09:00',
        message: 'Действительно критично. Начинаю работу',
      },
    ],
  },
  {
    id: 'T-MDD-001',
    clientId: '4',
    title: 'Открытые SMB порты',
    vulnerabilities: ['V-MDD-002'],
    priority: 'High',
    status: 'Open',
    assigneeId: 'w-4', // Козлов К.К.
    reporterId: null, // Security Team - не worker
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
    dueDate: '2024-01-26',
    description: 'SMB порты доступны извне. Требуется закрыть доступ или настроить VPN',
    resolution: '',
    chatMessages: [
      {
        id: 'msg-6',
        authorId: 'w-4', // Козлов К.К.
        timestamp: '2024-01-13 08:30',
        message: 'Проверяю конфигурацию файрвола',
      },
    ],
  },
  {
    id: 'T-RZP-001',
    clientId: '5',
    title: 'Security Headers отсутствуют',
    vulnerabilities: ['V-MDD-003'],
    priority: 'Low',
    status: 'Open',
    assigneeId: 'w-5', // Морозов М.М.
    reporterId: null, // OpenVAS Scanner - не worker
    createdAt: '2024-01-14',
    updatedAt: '2024-01-21',
    dueDate: '2024-01-30',
    description: 'Добавить заголовки безопасности X-Frame-Options и Content-Security-Policy',
    resolution: '',
    chatMessages: [],
  },
  {
    id: 'T-FNH-001',
    clientId: '2',
    title: 'SSRF уязвимость',
    vulnerabilities: ['V-FNH-001'],
    priority: 'High',
    status: 'Verified',
    assigneeId: 'w-7', // Соколов С.С.
    reporterId: null, // PenTest Team - не worker
    createdAt: '2024-01-11',
    updatedAt: '2024-01-17',
    dueDate: '2024-01-18',
    description: 'Обнаружена SSRF уязвимость при пентесте. Требуется устранение',
    resolution: 'Уязвимость устранена. Добавлена валидация URL',
    chatMessages: [
      {
        id: 'msg-7',
        authorId: 'w-7', // Соколов С.С.
        timestamp: '2024-01-11 15:00',
        message: 'Начинаю исправление',
      },
      {
        id: 'msg-8',
        authorId: 'w-7', // Соколов С.С.
        timestamp: '2024-01-17 12:00',
        message: 'Уязвимость устранена. Требуется верификация',
      },
      {
        id: 'msg-9',
        authorId: null, // QA Team - не worker
        timestamp: '2024-01-17 16:00',
        message: 'Верифицировано. Уязвимость закрыта',
      },
    ],
  },
  {
    id: 'T-MDD-002',
    clientId: '3',
    title: 'Множественные проблемы с паролями',
    vulnerabilities: ['V-MDD-001'],
    priority: 'Medium',
    status: 'Fixed',
    assigneeId: 'w-3', // Сидоров С.С.
    reporterId: null, // Security Audit - не worker
    createdAt: '2024-01-05',
    updatedAt: '2024-01-18',
    dueDate: '2024-01-20',
    description: 'Усиление политики паролей и смена слабых паролей',
    resolution: 'Внедрена новая политика паролей. Все слабые пароли изменены',
    chatMessages: [
      {
        id: 'msg-10',
        authorId: 'w-3', // Сидоров С.С.
        timestamp: '2024-01-06 10:00',
        message: 'Обновляю политику паролей',
      },
      {
        id: 'msg-11',
        authorId: null, // Администратор - не worker
        timestamp: '2024-01-18 14:00',
        message: 'Политика внедрена. Все пароли обновлены',
      },
    ],
  },
]

export const priorityColors = {
  Critical: 'bg-red-600',
  High: 'bg-orange-600',
  Medium: 'bg-yellow-600',
  Low: 'bg-blue-600',
}

export const statusColorsTickets = {
  Open: 'bg-purple-600',
  'In Progress': 'bg-blue-600',
  Fixed: 'bg-green-600',
  Verified: 'bg-teal-600',
  Closed: 'bg-gray-600',
}

export const priorityLevels = ['All', 'Critical', 'High', 'Medium', 'Low']

export const statusesTickets = ['All', 'Open', 'In Progress', 'Fixed', 'Verified', 'Closed']

