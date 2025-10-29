import React, { useState, useMemo } from 'react'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { mockVulnerabilities, criticalityColors, statusColors } from '../data/mockVulnerabilities'
import { mockAssets } from '../data/mockAssets'

const VulnerabilitiesPage = ({ selectedClient }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCriticality, setSelectedCriticality] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedVulnerability, setSelectedVulnerability] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editVuln, setEditVuln] = useState(null)
  const [vulns, setVulns] = useState(mockVulnerabilities)
  const [assetSearch, setAssetSearch] = useState('')
  const [createClientId, setCreateClientId] = useState('')
  const filteredAssets = useMemo(() => {
    const term = assetSearch.toLowerCase()
    const ownerByClient = (id) => (
      id === '1' ? 'Клиент A' :
      id === '2' ? 'Клиент B' :
      id === '3' ? 'Клиент C' :
      id === '4' ? 'Клиент D' :
      id === '5' ? 'Клиент E' :
      id === '6' ? 'Клиент F' : null
    )
    return mockAssets.filter(a => {
      const matchesTerm = a.name.toLowerCase().includes(term)
      const matchesClient = createClientId ? (a.owner === ownerByClient(createClientId)) : true
      return matchesTerm && matchesClient
    })
  }, [assetSearch, createClientId])

  const filteredVulnerabilities = useMemo(() => {
    return vulns.filter(v => {
      const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.asset.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCriticality = selectedCriticality === 'All' || v.criticality === selectedCriticality
      const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus
      const matchesClient = selectedClient === 'client-all' || v.client === selectedClient

      return matchesSearch && matchesCriticality && matchesStatus && matchesClient
    })
  }, [searchTerm, selectedCriticality, selectedStatus, selectedClient, vulns])

  const criticalityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    const filtered = selectedClient === 'client-all' 
      ? mockVulnerabilities 
      : mockVulnerabilities.filter(v => v.client === selectedClient)
    filtered.forEach(v => {
      if (counts.hasOwnProperty(v.criticality)) {
        counts[v.criticality]++
      }
    })
    return counts
  }, [selectedClient])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Управление уязвимостями</h1>
            <p className="text-gray-400">Мониторинг и управление выявленными уязвимостями</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Импорт из сканера
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить уязвимость
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm">Критические</span>
              <span className="text-2xl font-bold text-red-400">{criticalityCounts.Critical}</span>
            </div>
            <div className="h-1 bg-red-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-sm">Высокие</span>
              <span className="text-2xl font-bold text-orange-400">{criticalityCounts.High}</span>
            </div>
            <div className="h-1 bg-orange-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-sm">Средние</span>
              <span className="text-2xl font-bold text-yellow-400">{criticalityCounts.Medium}</span>
            </div>
            <div className="h-1 bg-yellow-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm">Низкие</span>
              <span className="text-2xl font-bold text-blue-400">{criticalityCounts.Low}</span>
            </div>
            <div className="h-1 bg-blue-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
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
                placeholder="Поиск по ID, названию или активу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              <option value="All">Все уровни</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              <option value="All">Все статусы</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Fixed">Fixed</option>
              <option value="Verified">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-card border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Актив</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Критичность</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CVSS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ответственный</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredVulnerabilities.map((v) => (
                <tr key={v.id} className="hover:bg-dark-card/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-dark-purple-secondary font-medium">{v.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{v.title}</div>
                    <div className="text-xs text-gray-400">{v.scanner}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{v.asset}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      criticalityColors[v.criticality]
                    } text-white`}>
                      {v.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[v.status]
                    } text-white`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{v.cvss}</span>
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            v.cvss >= 9 ? 'bg-red-500' :
                            v.cvss >= 7 ? 'bg-orange-500' :
                            v.cvss >= 4 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${v.cvss * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {v.assignee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {v.discovered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedVulnerability(v)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded transition-colors"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditVuln({ ...v }); setShowEditModal(true) }}
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
        Найдено: {filteredVulnerabilities.length} из {mockVulnerabilities.length}
      </div>

      {/* Modal */}
      {selectedVulnerability && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">Детали уязвимости</h2>
              </div>
              <button
                onClick={() => setSelectedVulnerability(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">ID</label>
                  <div className="mt-1 text-white font-medium">{selectedVulnerability.id}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Название</label>
                  <div className="mt-1 text-white">{selectedVulnerability.title}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Актив</label>
                  <div className="mt-1 text-white">{selectedVulnerability.asset}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Тип актива</label>
                  <div className="mt-1 text-white">{selectedVulnerability.assetType}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Критичность</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      criticalityColors[selectedVulnerability.criticality]
                    } text-white`}>
                      {selectedVulnerability.criticality}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Статус</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedVulnerability.status]
                    } text-white`}>
                      {selectedVulnerability.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CVSS</label>
                  <div className="mt-1 text-white font-semibold">{selectedVulnerability.cvss}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Сканер</label>
                  <div className="mt-1 text-white">{selectedVulnerability.scanner}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Обнаружена</label>
                  <div className="mt-1 text-white">{selectedVulnerability.discovered}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Изменена</label>
                  <div className="mt-1 text-white">{selectedVulnerability.lastModified}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Ответственный</label>
                  <div className="mt-1 text-white">{selectedVulnerability.assignee}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Проект</label>
                  <div className="mt-1 text-white">{selectedVulnerability.project}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Описание</label>
                <div className="mt-1 text-white bg-dark-card p-3 rounded border border-dark-border">
                  {selectedVulnerability.description}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Теги</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedVulnerability.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-dark-card border border-dark-border text-xs text-white rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vulnerability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Добавить уязвимость вручную</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Название</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Введите название уязвимости"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Актив</label>
                  <div className="space-y-2">
                    <input type="text" value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Поиск по активу..." className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" />
                    <select className="w-full px-3 py-2 bg-dark-card border border-dark-border text-white rounded">
                      {filteredAssets.map(a => (
                        <option key={a.id} value={a.name}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Тип актива</label>
                  <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Web Server</option>
                    <option>Application Server</option>
                    <option>Database Server</option>
                    <option>File Server</option>
                    <option>Web Application</option>
                    <option>API Server</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Клиент</label>
                <select value={createClientId} onChange={(e) => setCreateClientId(e.target.value)} className="w-full px-3 py-2 bg-dark-card border border-dark-border text-white rounded">
                  <option value="">— выберите клиента —</option>
                  <option value="1">ООО "ТехноСервис"</option>
                  <option value="2">АО "ФинансХост"</option>
                  <option value="3">ООО "МедиаДиджитал"</option>
                  <option value="4">ИП Козлов К.К.</option>
                  <option value="5">ООО "РозницаПро"</option>
                  <option value="6">ЗАО "ВолковГрупп"</option>
                </select>
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
                  <label className="text-sm text-gray-400 mb-2 block">CVSS</label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    min="0"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="7.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Источник обнаружения</label>
                <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                  <option>Penetration Test</option>
                  <option>Ручной ввод</option>
                  <option>Nessus</option>
                  <option>OpenVAS</option>
                  <option>Metasploit</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Подробное описание уязвимости..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ответственный</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Иванов И.И."
                />
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
                  Добавить уязвимость
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vulnerability Modal */}
      {showEditModal && editVuln && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Редактировать уязвимость</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Название</label>
                <input type="text" value={editVuln.title} onChange={(e) => setEditVuln({ ...editVuln, title: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Актив</label>
                  <input type="text" value={editVuln.asset} onChange={(e) => setEditVuln({ ...editVuln, asset: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Тип актива</label>
                  <input type="text" value={editVuln.assetType} onChange={(e) => setEditVuln({ ...editVuln, assetType: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Критичность</label>
                  <select value={editVuln.criticality} onChange={(e) => setEditVuln({ ...editVuln, criticality: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">CVSS</label>
                  <input type="number" min="0" max="10" step="0.1" value={editVuln.cvss} onChange={(e) => setEditVuln({ ...editVuln, cvss: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Статус</label>
                  <select value={editVuln.status} onChange={(e) => setEditVuln({ ...editVuln, status: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Fixed</option>
                    <option>Verified</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Сканер</label>
                  <input type="text" value={editVuln.scanner} onChange={(e) => setEditVuln({ ...editVuln, scanner: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Обнаружена</label>
                  <input type="date" value={editVuln.discovered} onChange={(e) => setEditVuln({ ...editVuln, discovered: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Изменена</label>
                  <input type="date" value={editVuln.lastModified} onChange={(e) => setEditVuln({ ...editVuln, lastModified: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ответственный</label>
                <input type="text" value={editVuln.assignee} onChange={(e) => setEditVuln({ ...editVuln, assignee: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea rows="4" value={editVuln.description} onChange={(e) => setEditVuln({ ...editVuln, description: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">Отмена</button>
                <button onClick={() => {
                  setVulns(prev => prev.map(x => x.id === editVuln.id ? { ...x, ...editVuln } : x))
                  setShowEditModal(false)
                }} className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors">Сохранить</button>
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
              <h2 className="text-xl font-bold text-white">Импорт результатов сканирования</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Выберите сканер</label>
                <select className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                  <option>Nessus (.csv, .xml)</option>
                  <option>OpenVAS (.xml)</option>
                  <option>Qualys (.csv)</option>
                  <option>Metasploit (.xml)</option>
                  <option>Burp Suite (.xml, .json)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Загрузите файл</label>
                <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center hover:border-dark-purple-primary transition-colors cursor-pointer">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 mb-2">Перетащите файл сюда или нажмите для выбора</p>
                  <p className="text-xs text-gray-500">Поддерживаемые форматы: .csv, .xml, .json</p>
                  <button className="mt-4 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">
                    Выбрать файл
                  </button>
                </div>
              </div>

              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ При импорте будут автоматически созданы тикеты для всех обнаруженных критических и высоких уязвимостей
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

export default VulnerabilitiesPage
