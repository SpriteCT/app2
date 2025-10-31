// Mock data для активов
export const mockAssets = [
  {
    id: 'A-TSV-001',
    clientId: '1',
    name: 'web-01.example.com',
    typeId: 'at-1', // Web Server
    criticality: 'Critical',
    status: 'В эксплуатации',
    ipAddress: '192.168.1.10',
    operatingSystem: 'Ubuntu 22.04',
    lastScan: '2024-01-20',
    vulnerabilities: ['V-TSV-001'],
    tickets: ['T-TSV-001'],
  },
  {
    id: 'A-TSV-002',
    clientId: '1',
    name: 'app-server-02.local',
    typeId: 'at-2', // Application Server
    criticality: 'High',
    status: 'В эксплуатации',
    ipAddress: '192.168.1.20',
    operatingSystem: 'Windows Server 2022',
    lastScan: '2024-01-22',
    vulnerabilities: ['V-TSV-002'],
    tickets: ['T-TSV-002'],
  },
  {
    id: 'A-MDD-001',
    clientId: '3',
    name: 'db-server-01.internal',
    typeId: 'at-3', // Database Server
    criticality: 'Critical',
    status: 'В эксплуатации',
    ipAddress: '192.168.2.10',
    operatingSystem: 'CentOS 8',
    lastScan: '2024-01-18',
    vulnerabilities: ['V-MDD-001'],
    tickets: ['T-MDD-002'],
  },
  {
    id: 'A-MDD-002',
    clientId: '4',
    name: 'file-server-01.local',
    typeId: 'at-4', // File Server
    criticality: 'High',
    status: 'В эксплуатации',
    ipAddress: '192.168.2.50',
    operatingSystem: 'Windows Server 2019',
    lastScan: '2024-01-19',
    vulnerabilities: ['V-MDD-002'],
    tickets: ['T-MDD-001'],
  },
  {
    id: 'A-RZP-001',
    clientId: '5',
    name: 'web-app.example.com',
    typeId: 'at-5', // Web Application
    criticality: 'Medium',
    status: 'В эксплуатации',
    ipAddress: '192.168.1.100',
    operatingSystem: 'Docker Container',
    lastScan: '2024-01-21',
    vulnerabilities: ['V-MDD-003'],
    tickets: ['T-RZP-001'],
  },
  {
    id: 'A-VGP-001',
    clientId: '6',
    name: 'api.example.com',
    typeId: 'at-6', // API Server
    criticality: 'Critical',
    status: 'В эксплуатации',
    ipAddress: '192.168.1.200',
    operatingSystem: 'Ubuntu 20.04',
    lastScan: '2024-01-20',
    vulnerabilities: ['V-VGP-001'],
    tickets: ['T-VGP-001'],
  },
  {
    id: 'A-FNH-001',
    clientId: '2',
    name: 'app.example.com',
    typeId: 'at-5', // Web Application
    criticality: 'High',
    status: 'В эксплуатации',
    ipAddress: '192.168.1.150',
    operatingSystem: 'Docker Container',
    lastScan: '2024-01-17',
    vulnerabilities: ['V-FNH-001'],
    tickets: ['T-FNH-001'],
  },
  {
    id: 'A-MDD-003',
    clientId: '3',
    name: 'linux-server-01',
    typeId: 'at-7', // Linux Server
    criticality: 'Medium',
    status: 'В эксплуатации',
    ipAddress: '192.168.3.10',
    operatingSystem: 'Debian 11',
    lastScan: '2024-01-19',
    vulnerabilities: ['V-MDD-004'],
    tickets: [],
  },
  {
    id: 'A-TSV-003',
    clientId: '1',
    name: 'backup-server-01.internal',
    typeId: 'at-8', // Backup Server
    criticality: 'Medium',
    status: 'Недоступен',
    ipAddress: '192.168.3.20',
    operatingSystem: 'Ubuntu 20.04',
    lastScan: '2024-01-05',
    vulnerabilities: [],
    tickets: [],
  },
  {
    id: 'A-TSV-004',
    clientId: '1',
    name: 'old-web-server.legacy',
    typeId: 'at-1', // Web Server
    criticality: 'Low',
    status: 'Выведен из эксплуатации',
    ipAddress: '192.168.1.255',
    operatingSystem: 'CentOS 6',
    lastScan: '2023-06-15',
    vulnerabilities: [],
    tickets: [],
  },
]

export const assetTypeColors = {
  'Web Server': 'bg-blue-600',
  'Application Server': 'bg-purple-600',
  'Database Server': 'bg-red-600',
  'File Server': 'bg-green-600',
  'Web Application': 'bg-cyan-600',
  'API Server': 'bg-indigo-600',
  'Linux Server': 'bg-yellow-600',
  'Backup Server': 'bg-gray-600',
}

export const statusColorsAssets = {
  'В эксплуатации': 'bg-green-600',
  'Недоступен': 'bg-red-600',
  'Выведен из эксплуатации': 'bg-gray-600',
  'В обслуживании': 'bg-yellow-600',
}

export const criticalityColorsAssets = {
  Critical: 'bg-red-600',
  High: 'bg-orange-600',
  Medium: 'bg-yellow-600',
  Low: 'bg-blue-600',
}

export const assetTypes = ['All', 'Web Server', 'Application Server', 'Database Server', 'File Server', 'Web Application', 'API Server', 'Linux Server', 'Backup Server']

export const assetStatuses = ['All', 'В эксплуатации', 'Недоступен', 'Выведен из эксплуатации', 'В обслуживании']

export const criticalityLevelsAssets = ['All', 'Critical', 'High', 'Medium', 'Low']
