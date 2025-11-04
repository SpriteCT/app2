import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, AlertTriangle, Ticket, Info } from 'lucide-react'
import { criticalityColors, statusColors } from '../data/mockVulnerabilities'
import { vulnerabilitiesApi, assetsApi, referenceApi, clientsApi, ticketsApi, workersApi } from '../services/api'
import { transformVulnerability, transformAsset, transformTicket, transformVulnerabilityToBackend, transformWorker } from '../utils/dataTransform'
import VulnerabilityDetailModal from '../components/VulnerabilityDetailModal'
import CreateTicketModal from '../components/CreateTicketModal'
import TicketDetailModal from '../components/TicketDetailModal'

const VulnerabilitiesPage = ({ selectedClient }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCriticality, setSelectedCriticality] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedVulnerability, setSelectedVulnerability] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editVuln, setEditVuln] = useState(null)
  const [vulns, setVulns] = useState([])
  const [assets, setAssets] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [scanners, setScanners] = useState([])
  const [clients, setClients] = useState([])
  const [tickets, setTickets] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assetSearch, setAssetSearch] = useState('')
  const [createClientId, setCreateClientId] = useState('')
  const [newVuln, setNewVuln] = useState({
    title: '',
    clientId: '',
    assetId: null,
    scannerId: null,
    criticality: 'High',
    status: 'Open',
    cvss: null,
    cve: '',
    description: '',
  })
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false)
  const [ticketFromVuln, setTicketFromVuln] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [vulnToDelete, setVulnToDelete] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newMessage, setNewMessage] = useState('')

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [vulnsData, assetsData, assetTypesData, scannersData, clientsData, ticketsData, workersData] = await Promise.all([
          vulnerabilitiesApi.getAll(),
          assetsApi.getAll(),
          referenceApi.getAssetTypes(),
          referenceApi.getScanners(),
          clientsApi.getAll(),
          ticketsApi.getAll(),
          workersApi.getAll(),
        ])
        setVulns(vulnsData.map(transformVulnerability))
        setAssets(assetsData.map(transformAsset))
        setAssetTypes(assetTypesData)
        setScanners(scannersData)
        setClients(clientsData.map(c => ({ id: c.id, name: c.name, shortName: c.short_name })))
        setTickets(ticketsData.map(transformTicket))
        setWorkers(workersData.map(transformWorker))
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  const filteredAssets = useMemo(() => {
    const term = assetSearch.toLowerCase()
    const clientIdForFilter = showAddModal ? newVuln.clientId : createClientId
    return assets.filter(a => {
      const matchesTerm = a.name.toLowerCase().includes(term)
      const matchesClient = !clientIdForFilter || String(a.clientId) === String(clientIdForFilter)
      return matchesTerm && matchesClient
    })
  }, [assetSearch, assets, createClientId, newVuln.clientId, showAddModal])

  const filteredVulnerabilities = useMemo(() => {
    return vulns.filter(v => {
      const assetName = assets.find(a => a.id === v.assetId)?.name || ''
      const matchesSearch = String(v.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assetName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCriticality = selectedCriticality === 'All' || v.criticality === selectedCriticality
      const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus
      const matchesClient = selectedClient === 'client-all' || String(v.clientId) === String(selectedClient)

      return matchesSearch && matchesCriticality && matchesStatus && matchesClient
    })
  }, [searchTerm, selectedCriticality, selectedStatus, selectedClient, vulns, assets])

  const criticalityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    const filtered = selectedClient === 'client-all' 
      ? vulns 
      : vulns.filter(v => String(v.clientId) === String(selectedClient))
    filtered.forEach(v => {
      if (counts.hasOwnProperty(v.criticality)) {
        counts[v.criticality]++
      }
    })
    return counts
  }, [selectedClient, vulns])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

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
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-orange-400 text-sm">Высокие</span>
              <span className="text-2xl font-bold text-orange-400">{criticalityCounts.High}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 text-sm">Средние</span>
              <span className="text-2xl font-bold text-yellow-400">{criticalityCounts.Medium}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm">Низкие</span>
              <span className="text-2xl font-bold text-blue-400">{criticalityCounts.Low}</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CVE</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredVulnerabilities.map((v) => (
                <tr key={v.id} className="hover:bg-dark-card/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-dark-purple-secondary font-medium">{v.displayId || v.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{v.title}</div>
                    <div className="text-xs text-gray-400">
                      {scanners.find(s => s.id === v.scannerId)?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">
                      {assets.find(a => a.id === v.assetId)?.name || '-'}
                    </span>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{v.cve || '-'}</td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {v.discovered ? new Date(v.discovered).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
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
                        onClick={() => {
                          setVulnToDelete(v)
                          setShowDeleteConfirm(true)
                        }}
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
        Найдено: {filteredVulnerabilities.length} из {vulns.length}
      </div>

      {/* Vulnerability Detail Modal */}
      <VulnerabilityDetailModal
        vulnerability={selectedVulnerability}
        onClose={() => setSelectedVulnerability(null)}
        assets={assets}
        assetTypes={assetTypes}
        scanners={scanners}
        tickets={tickets}
        onCreateTicket={() => {
          setTicketFromVuln(selectedVulnerability)
          setShowCreateTicketModal(true)
          setSelectedVulnerability(null)
        }}
        onViewTicket={(ticket) => {
          setSelectedVulnerability(null)
          setSelectedTicket(ticket)
        }}
      />

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
                  value={newVuln.title}
                  onChange={(e) => setNewVuln({ ...newVuln, title: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Введите название уязвимости"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Клиент</label>
                  <select 
                    value={newVuln.clientId} 
                    onChange={(e) => setNewVuln({ ...newVuln, clientId: e.target.value ? parseInt(e.target.value) : '' })}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border text-white rounded"
                  >
                    <option value="">— выберите клиента —</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Актив</label>
                  <div className="space-y-2">
                    <input type="text" value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Поиск по активу..." className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" />
                    <select 
                      value={newVuln.assetId || ''} 
                      onChange={(e) => setNewVuln({ ...newVuln, assetId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 bg-dark-card border border-dark-border text-white rounded"
                    >
                      <option value="">— выберите актив —</option>
                      {filteredAssets.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Критичность</label>
                  <select 
                    value={newVuln.criticality}
                    onChange={(e) => setNewVuln({ ...newVuln, criticality: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  >
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
                    value={newVuln.cvss || ''}
                    onChange={(e) => setNewVuln({ ...newVuln, cvss: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    placeholder="7.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">CVE</label>
                <input 
                  type="text" 
                  value={newVuln.cve}
                  onChange={(e) => setNewVuln({ ...newVuln, cve: e.target.value })}
                  placeholder="CVE-2021-44228" 
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
                />
              </div>

              <div>

                <label className="text-sm text-gray-400 mb-2 block">Сканер</label>
                <select 
                  value={newVuln.scannerId || ''}
                  onChange={(e) => setNewVuln({ ...newVuln, scannerId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                >
                  <option value="">— выберите сканер —</option>
                  {scanners.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea
                  rows="4"
                  value={newVuln.description}
                  onChange={(e) => setNewVuln({ ...newVuln, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Подробное описание уязвимости..."
                />
              </div>

              {/* assignee removed in add form */}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    // Validation
                    if (!newVuln.title || !newVuln.title.trim()) {
                      alert('Пожалуйста, укажите название уязвимости')
                      return
                    }
                    if (!newVuln.clientId) {
                      alert('Пожалуйста, выберите клиента')
                      return
                    }
                    
                    // Валидация CVSS
                    if (newVuln.cvss !== null && newVuln.cvss !== undefined && newVuln.cvss !== '') {
                      const cvssValue = parseFloat(newVuln.cvss)
                      if (isNaN(cvssValue) || cvssValue < 0 || cvssValue > 10) {
                        alert('CVSS должен быть числом от 0 до 10')
                        return
                      }
                    }
                    
                    try {
                      const backendData = transformVulnerabilityToBackend(newVuln)
                      console.log('Sending vulnerability data:', backendData)
                      const created = await vulnerabilitiesApi.create(backendData)
                      const transformed = transformVulnerability(created)
                      setVulns(prev => [transformed, ...prev])
                      setShowAddModal(false)
                      setNewVuln({
                        title: '',
                        clientId: '',
                        assetId: null,
                        scannerId: null,
                        criticality: 'High',
                        status: 'Open',
                        cvss: null,
                        cve: '',
                        description: '',
                      })
                    } catch (error) {
                      console.error('Failed to create vulnerability:', error)
                      alert(`Ошибка при создании уязвимости: ${error.message}`)
                    }
                  }}
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
                  <select 
                    value={editVuln.assetId || ''} 
                    onChange={(e) => setEditVuln({ ...editVuln, assetId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  >
                    <option value="">— выберите актив —</option>
                    {assets.filter(a => !editVuln.clientId || String(a.clientId) === String(editVuln.clientId)).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
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
                  <input type="number" min="0" max="10" step="0.1" value={editVuln.cvss} onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val >= 0 && val <= 10) {
                      setEditVuln({ ...editVuln, cvss: val })
                    } else if (e.target.value === '') {
                      setEditVuln({ ...editVuln, cvss: '' })
                    }
                  }} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">CVE</label>
                <input type="text" value={editVuln.cve || ''} onChange={(e) => setEditVuln({ ...editVuln, cve: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Статус</label>
                  <select value={editVuln.status} onChange={(e) => setEditVuln({ ...editVuln, status: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Сканер</label>
                  <select 
                    value={editVuln.scannerId || ''} 
                    onChange={(e) => setEditVuln({ ...editVuln, scannerId: e.target.value ? parseInt(e.target.value) : null })} 
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  >
                    <option value="">— выберите сканер —</option>
                    {scanners.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
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
              {/* assignee removed in edit form */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea rows="4" value={editVuln.description} onChange={(e) => setEditVuln({ ...editVuln, description: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">Отмена</button>
                <button onClick={async () => {
                  try {
                    const backendData = transformVulnerabilityToBackend(editVuln)
                    const updated = await vulnerabilitiesApi.update(editVuln.id, backendData)
                    const transformed = transformVulnerability(updated)
                    setVulns(prev => prev.map(x => x.id === transformed.id ? transformed : x))
                    setShowEditModal(false)
                  } catch (error) {
                    console.error('Failed to update vulnerability:', error)
                    alert('Ошибка при обновлении уязвимости')
                  }
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

      {/* Create Ticket from Vulnerability Modal */}
      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateTicketModal && !!ticketFromVuln}
        onClose={() => {
          setShowCreateTicketModal(false)
          setTicketFromVuln(null)
        }}
        onCreate={(ticket) => {
          setTickets(prev => [ticket, ...prev])
        }}
        ticketFromVuln={ticketFromVuln}
        vulnerabilities={vulns}
        clients={clients}
        assets={assets}
        workers={workers}
        tickets={tickets}
        initialClientId={ticketFromVuln?.clientId}
        initialVulnIds={ticketFromVuln ? [ticketFromVuln.id] : []}
      />


      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && vulnToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-md w-full">
            <div className="border-b border-dark-border px-6 py-4">
              <h2 className="text-xl font-bold text-white">Подтверждение удаления</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Вы уверены, что хотите удалить уязвимость <span className="font-semibold text-white">{vulnToDelete.displayId || vulnToDelete.id}</span>?
              </p>
              <p className="text-sm text-gray-400 mb-6">Это действие нельзя отменить.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setVulnToDelete(null)
                  }}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    try {
                      await vulnerabilitiesApi.delete(vulnToDelete.id)
                      setVulns(prev => prev.filter(vuln => vuln.id !== vulnToDelete.id))
                      if (selectedVulnerability && selectedVulnerability.id === vulnToDelete.id) {
                        setSelectedVulnerability(null)
                      }
                      setShowDeleteConfirm(false)
                      setVulnToDelete(null)
                    } catch (error) {
                      console.error('Failed to delete vulnerability:', error)
                      const errorMessage = error.message || 'Неизвестная ошибка'
                      // Проверяем, не связана ли уязвимость с тикетами
                      if (errorMessage.includes('linked to') || errorMessage.includes('ticket')) {
                        alert('Нельзя удалить уязвимость: она привязана к одному или нескольким тикетам. Сначала удалите или отвяжите уязвимость от всех тикетов.')
                      } else {
                        alert('Ошибка при удалении уязвимости: ' + errorMessage)
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        workers={workers}
        clients={clients}
        vulnerabilities={vulns}
        onViewVulnerability={(vuln) => {
          setSelectedTicket(null)
          setSelectedVulnerability(vuln)
        }}
        onSendMessage={async (ticketId, message) => {
          try {
            await ticketsApi.addMessage(ticketId, { message })
            // Обновляем список тикетов
            const updatedTickets = await ticketsApi.getAll()
            setTickets(updatedTickets.map(transformTicket))
            // Обновляем выбранный тикет
            const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id)
            if (updatedTicket) {
              setSelectedTicket(transformTicket(updatedTicket))
            }
          } catch (error) {
            console.error('Failed to send message:', error)
            alert('Ошибка при отправке сообщения: ' + (error.message || 'Неизвестная ошибка'))
          }
        }}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  )
}

export default VulnerabilitiesPage
