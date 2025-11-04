// Mock data для уязвимостей
export const mockVulnerabilities = [
  {
    id: 'V-TSV-001',
    clientId: '1',
    assetId: 'A-TSV-001',
    title: 'SQL Injection в параметре поиска',
    assetTypeId: 'at-1', // Web Server
    criticality: 'Critical',
    status: 'Open',
    cvss: 9.8,
    cve: 'CVE-2023-1234',
    description: 'Обнаружена уязвимость SQL Injection в параметре поиска',
    scannerId: 'sc-1', // Nessus
    discovered: '2024-01-15',
    lastModified: '2024-01-20',
  },
  {
    id: 'V-TSV-002',
    clientId: '1',
    assetId: 'A-TSV-002',
    title: 'Устаревшая версия Apache Tomcat',
    assetTypeId: 'at-2', // Application Server
    criticality: 'High',
    status: 'In Progress',
    cvss: 7.5,
    cve: 'CVE-2023-45133',
    description: 'Используется Apache Tomcat версии 8.5.29, уязвимая к CVE-2023-45133',
    scannerId: 'sc-2', // OpenVAS
    discovered: '2024-01-10',
    lastModified: '2024-01-22',
  },
  {
    id: 'V-MDD-001',
    clientId: '3',
    assetId: 'A-MDD-001',
    title: 'Слабая политика паролей',
    assetTypeId: 'at-3', // Database Server
    criticality: 'Medium',
    status: 'Fixed',
    cvss: 5.3,
    description: 'Обнаружены слабые пароли у нескольких учетных записей',
    scannerId: 'sc-3', // Penetration Test
    discovered: '2024-01-05',
    lastModified: '2024-01-18',
  },
  {
    id: 'V-MDD-002',
    clientId: '4',
    assetId: 'A-MDD-002',
    title: 'Открытые порты 445/139 (SMB)',
    assetTypeId: 'at-4', // File Server
    criticality: 'High',
    status: 'Open',
    cvss: 8.8,
    description: 'SMB порты доступны из внешней сети',
    scannerId: 'sc-1', // Nessus
    discovered: '2024-01-12',
    lastModified: '2024-01-19',
  },
  {
    id: 'V-MDD-003',
    clientId: '5',
    assetId: 'A-RZP-001',
    title: 'Missing Security Headers',
    assetTypeId: 'at-5', // Web Application
    criticality: 'Low',
    status: 'Open',
    cvss: 2.5,
    description: 'Отсутствуют заголовки безопасности X-Frame-Options, CSP',
    scannerId: 'sc-2', // OpenVAS
    discovered: '2024-01-14',
    lastModified: '2024-01-21',
  },
  {
    id: 'V-VGP-001',
    clientId: '6',
    assetId: 'A-VGP-001',
    title: 'Уязвимость в библиотеке Log4j',
    assetTypeId: 'at-6', // API Server
    criticality: 'Critical',
    status: 'Open',
    cvss: 10.0,
    cve: 'CVE-2021-44228',
    description: 'Log4j версия 2.14.0 уязвима к CVE-2021-44228',
    scannerId: 'sc-1', // Nessus
    discovered: '2024-01-08',
    lastModified: '2024-01-20',
  },
  {
    id: 'V-FNH-001',
    clientId: '2',
    assetId: 'A-FNH-001',
    title: 'SSRF в функционале загрузки',
    assetTypeId: 'at-5', // Web Application
    criticality: 'High',
    status: 'Verified',
    cvss: 7.8,
    description: 'Обнаружена Server-Side Request Forgery уязвимость',
    scannerId: 'sc-3', // Penetration Test
    discovered: '2024-01-11',
    lastModified: '2024-01-17',
  },
  {
    id: 'V-MDD-004',
    clientId: '3',
    assetId: 'A-MDD-003',
    title: 'Несвоевременное обновление системных компонентов',
    assetTypeId: 'at-7', // Linux Server
    criticality: 'Medium',
    status: 'Open',
    cvss: 4.5,
    description: 'Накоплено 15 критических обновлений',
    scannerId: 'sc-2', // OpenVAS
    discovered: '2024-01-13',
    lastModified: '2024-01-19',
  },
]

export const criticalityColors = {
  Critical: 'bg-red-600',
  High: 'bg-orange-600',
  Medium: 'bg-yellow-600',
  Low: 'bg-blue-600',
}

export const statusColors = {
  Open: 'bg-purple-600',
  'In Progress': 'bg-blue-600',
  Fixed: 'bg-green-600',
  Verified: 'bg-teal-600',
}

export const assetTypes = ['All', 'Web Server', 'Application Server', 'Database Server', 'File Server', 'Web Application', 'API Server', 'Linux Server']

export const criticalityLevels = ['All', 'Critical', 'High', 'Medium', 'Low']

export const statuses = ['All', 'Open', 'In Progress', 'Fixed', 'Verified']

