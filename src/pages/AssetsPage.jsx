import React, { useState, useMemo } from 'react'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, Server, Upload, Link2, AlertCircle } from 'lucide-react'
import { 
  mockAssets, 
  assetTypeColors, 
  statusColorsAssets, 
  criticalityColorsAssets,
  assetTypes,
  assetStatuses,
  criticalityLevelsAssets
} from '../data/mockAssets'
import { mockVulnerabilities } from '../data/mockVulnerabilities'
import { mockTickets } from '../data/mockTickets'

const AssetsPage = ({ selectedClient }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCriticality, setSelectedCriticality] = useState('All')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(a => {
      const matchesSearch = a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'All' || a.type === selectedType
      const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus
      const matchesCriticality = selectedCriticality === 'All' || a.criticality === selectedCriticality
      const matchesClient = selectedClient === 'client-all' || a.owner === 'Клиент A' && selectedClient === 'client-a' ||
                            a.owner === 'Клиент B' && selectedClient === 'client-b' ||
                            a.owner === 'Клиент C' && selectedClient === 'client-c' ||
                            a.owner === 'Клиент D' && selectedClient === 'client-d' ||
                            a.owner === 'Клиент E' && selectedClient === 'client-e' ||
                            a.owner === 'Клиент F' && selectedClient === 'client-f'

      return matchesSearch && matchesType && matchesStatus && matchesCriticality && matchesClient
    })
  }, [searchTerm, selectedType, selectedStatus, selectedCriticality, selectedClient])

  const getVulnerabilitiesForAsset = (asset) => {
    return mockVulnerabilities.filter(v => asset.vulnerabilities.includes(v.id))
  }

  const getTicketsForAsset = (asset) => {
    return mockTickets.filter(t => asset.tickets.includes(t.id))
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Управление активами</h1>
            <p className="text-gray-400">Мониторинг и управление IT-активами</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Импорт из CMDB
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить актив
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm">В эксплуатации</span>
              <span className="text-2xl font-bold text-green-400">
                {mockAssets.filter(a => a.status === 'В эксплуатации').length}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm">Недоступен</span>
              <span className="text-2xl font-bold text-red-400">
                {mockAssets.filter(a => a.status === 'Недоступен').length}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-600/20 to-gray-800/20 border border-gray-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Выведен из эксп.</span>
              <span className="text-2xl font-bold text-gray-400">
                {mockAssets.filter(a => a.status === 'Выведен из эксплуатации').length}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm">Всего активов</span>
              <span className="text-2xl font-bold text-blue-400">{mockAssets.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по ID, имени или IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              {assetTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              {assetStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              {criticalityLevelsAssets.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export button */}
      <div className="mb-4 flex justify-end">
        <button className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Экспорт для сканеров (.csv)
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-card border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Критичность</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Владенец</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Уязвимости</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Последнее сканирование</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-dark-card/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-dark-purple-secondary font-medium">{asset.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{asset.name}</div>
                    <div className="text-xs text-gray-400">{asset.operatingSystem}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assetTypeColors[asset.type]
                    } text-white`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {asset.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      criticalityColorsAssets[asset.criticality]
                    } text-white`}>
                      {asset.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColorsAssets[asset.status]
                    } text-white`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {asset.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">{asset.vulnerabilities.length}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {asset.lastScan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded transition-colors"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-dark-card rounded transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-400">
        Найдено: {filteredAssets.length} из {mockAssets.length}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAsset.id}</h2>
                  <p className="text-sm text-gray-400">{selectedAsset.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Тип</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${assetTypeColors[selectedAsset.type]} text-white`}>
                      {selectedAsset.type}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Критичность</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${criticalityColorsAssets[selectedAsset.criticality]} text-white`}>
                      {selectedAsset.criticality}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Статус</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorsAssets[selectedAsset.status]} text-white`}>
                      {selectedAsset.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">IP Адрес</label>
                  <div className="mt-1 text-white">{selectedAsset.ipAddress}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">ОС</label>
                  <div className="mt-1 text-white">{selectedAsset.operatingSystem}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Проект</label>
                  <div className="mt-1 text-white">{selectedAsset.project}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Владелец</label>
                  <div className="mt-1 text-white">{selectedAsset.owner}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Подразделение</label>
                  <div className="mt-1 text-white">{selectedAsset.department}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Последнее сканирование</label>
                  <div className="mt-1 text-white">{selectedAsset.lastScan}</div>
                </div>
              </div>

              {/* Vulnerabilities */}
              {selectedAsset.vulnerabilities.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Связанные уязвимости ({selectedAsset.vulnerabilities.length})
                  </label>
                  <div className="space-y-2">
                    {getVulnerabilitiesForAsset(selectedAsset).map((vuln) => (
                      <div key={vuln.id} className="bg-dark-card border border-dark-border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white font-medium">{vuln.id}</div>
                            <div className="text-xs text-gray-400">{vuln.title}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            vuln.criticality === 'Critical' ? 'bg-red-600' :
                            vuln.criticality === 'High' ? 'bg-orange-600' :
                            vuln.criticality === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                          } text-white`}>
                            {vuln.criticality}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets */}
              {selectedAsset.tickets.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Связанные тикеты ({selectedAsset.tickets.length})
                  </label>
                  <div className="space-y-2">
                    {getTicketsForAsset(selectedAsset).map((ticket) => (
                      <div key={ticket.id} className="bg-dark-card border border-dark-border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white font-medium">{ticket.id}</div>
                            <div className="text-xs text-gray-400">{ticket.title}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            ticket.priority === 'Critical' ? 'bg-red-600' :
                            ticket.priority === 'High' ? 'bg-orange-600' :
                            ticket.priority === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                          } text-white`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Добавить актив</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Имя актива</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="server.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Тип</label>
                  <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    {assetTypes.filter(t => t !== 'All').map(type => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">IP Адрес</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="192.168.1.10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Критичность</label>
                  <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Статус</label>
                  <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>В эксплуатации</option>
                    <option>Недоступен</option>
                    <option>В обслуживании</option>
                    <option>Выведен из эксплуатации</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">ОС</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="Ubuntu 22.04"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Владелец</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="Клиент A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Проект</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="Проект X"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Подразделение</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="IT Infrastructure"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  Добавить актив
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Импорт активов из CMDB</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Источник</label>
                <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                  <option>ServiceNow CMDB</option>
                  <option>Jira Service Management</option>
                  <option>Azure DevOps</option>
                  <option>CSV файл</option>
                  <option>Excel файл</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Загрузите файл</label>
                <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center hover:border-dark-purple-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 mb-2">Перетащите файл сюда или нажмите для выбора</p>
                  <p className="text-xs text-gray-500">Поддерживаемые форматы: .csv, .xlsx, .json</p>
                  <button className="mt-4 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">
                    Выбрать файл
                  </button>
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ При импорте можно автоматически связать активы с найденными уязвимостями
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  Импортировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetsPage

