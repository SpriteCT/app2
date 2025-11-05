import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, Server, Upload, Link2, AlertCircle } from 'lucide-react'
import { 
  assetTypeColors, 
  statusColorsAssets, 
  criticalityColorsAssets,
  assetStatuses,
  criticalityLevelsAssets
} from '../config/colors'
import { criticalityColors, statusColors } from '../config/colors'
import { priorityColors, statusColorsTickets } from '../config/colors'
import { assetsApi, vulnerabilitiesApi, ticketsApi, clientsApi, referenceApi } from '../services/api'
import { transformAsset, transformAssetToBackend, transformVulnerability, transformTicket } from '../utils/dataTransform'
import { formatDate } from '../utils/dateUtils'
import VulnerabilityDetailModal from '../components/VulnerabilityDetailModal'
import TicketDetailModal from '../components/TicketDetailModal'
import AddAssetModal from '../components/AddAssetModal'
import EditAssetModal from '../components/EditAssetModal'

const AssetsPage = ({ selectedClient }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCriticality, setSelectedCriticality] = useState('All')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [assets, setAssets] = useState([])
  const [showEditAssetModal, setShowEditAssetModal] = useState(false)
  const [editAsset, setEditAsset] = useState(null)
  const [selectedVulnerability, setSelectedVulnerability] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [tickets, setTickets] = useState([])
  const [clients, setClients] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [scanners, setScanners] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState(null)
  const [showClosedVulns, setShowClosedVulns] = useState(false)
  const [showClosedTickets, setShowClosedTickets] = useState(false)
  

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [assetsData, vulnsData, ticketsData, clientsData, assetTypesData, scannersData] = await Promise.all([
          assetsApi.getAll(),
          vulnerabilitiesApi.getAll(),
          ticketsApi.getAll(),
          clientsApi.getAll(),
          referenceApi.getAssetTypes(),
          referenceApi.getScanners(),
        ])
        setAssets(assetsData.map(transformAsset))
        setVulnerabilities(vulnsData.map(transformVulnerability))
        setTickets(ticketsData.map(transformTicket))
        setClients(clientsData.map(c => ({ id: c.id, name: c.name, shortName: c.short_name })))
        setAssetTypes(assetTypesData)
        setScanners(scannersData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = String(a.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.ipAddress && a.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()))
      const assetType = assetTypes.find(at => at.id === a.typeId)
      const matchesType = selectedType === 'All' || (assetType && assetType.name === selectedType)
      const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus
      const matchesCriticality = selectedCriticality === 'All' || a.criticality === selectedCriticality
      const matchesClient = selectedClient === 'client-all' || (a.clientId && String(a.clientId) === String(selectedClient))

      return matchesSearch && matchesType && matchesStatus && matchesCriticality && matchesClient
    })
  }, [searchTerm, selectedType, selectedStatus, selectedCriticality, selectedClient, assets, assetTypes])

  const getVulnerabilitiesForAsset = (asset) => {
    if (!asset || !asset.id) return []
    return vulnerabilities.filter(v => {
      if (v.assetId !== asset.id) return false
      if (!showClosedVulns && v.status === 'Closed') return false
      return true
    })
  }

  const getTicketsForAsset = (asset) => {
    if (!asset || !asset.id) return []
    // Find tickets that have vulnerabilities linked to this asset
    return tickets.filter(t => {
      if (!t.vulnerabilities || !Array.isArray(t.vulnerabilities)) return false
      const hasVulnForAsset = t.vulnerabilities.some(v => v.assetId === asset.id)
      if (!hasVulnForAsset) return false
      if (!showClosedTickets && t.status === 'Closed') return false
      return true
    })
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
        {(() => {
          const filtered = selectedClient === 'client-all' 
            ? assets 
            : assets.filter(a => String(a.clientId) === String(selectedClient))
          return (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm">В эксплуатации</span>
                  <span className="text-2xl font-bold text-green-400">
                    {filtered.filter(a => a.status === 'В эксплуатации').length}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 text-sm">Недоступен</span>
                  <span className="text-2xl font-bold text-red-400">
                    {filtered.filter(a => a.status === 'Недоступен').length}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-600/20 to-gray-800/20 border border-gray-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Выведен из эксп.</span>
                  <span className="text-2xl font-bold text-gray-400">
                    {filtered.filter(a => a.status === 'Выведен из эксплуатации').length}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 text-sm">Всего активов</span>
                  <span className="text-2xl font-bold text-blue-400">{filtered.length}</span>
                </div>
              </div>
            </div>
          )
        })()}
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
              <option value="All">Все типы</option>
              {assetTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Критичность</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Уязвимости</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Последнее сканирование</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Загрузка...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Активы не найдены
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-dark-card/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{asset.name}</div>
                    <div className="text-xs text-gray-400">{asset.operatingSystem}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const assetType = assetTypes.find(at => at.id === asset.typeId)
                      const typeName = assetType?.name || '-'
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assetTypeColors[typeName] || 'bg-gray-600'
                        } text-white`}>
                          {typeName}
                        </span>
                      )
                    })()}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">{getVulnerabilitiesForAsset(asset).length}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(asset.lastScan, { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                        onClick={() => { setEditAsset({ ...asset }); setShowEditAssetModal(true) }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAssetToDelete(asset)
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
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-400">
        Найдено: {filteredAssets.length} из {assets.length}
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
                    {(() => {
                      const assetType = assetTypes.find(at => at.id === selectedAsset.typeId)
                      const typeName = assetType?.name || '-'
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${assetTypeColors[typeName] || 'bg-gray-600'} text-white`}>
                          {typeName}
                        </span>
                      )
                    })()}
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
                {/* Project removed by schema alignment */}
                {/* Department removed by schema alignment */}
                <div>
                  <label className="text-sm text-gray-400">Последнее сканирование</label>
                  <div className="mt-1 text-white">{selectedAsset.lastScan ? new Date(selectedAsset.lastScan).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</div>
                </div>
              </div>

              {/* Vulnerabilities */}
                <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 block flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Связанные уязвимости ({getVulnerabilitiesForAsset(selectedAsset).length})
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showClosedVulns}
                      onChange={(e) => setShowClosedVulns(e.target.checked)}
                      className="w-4 h-4 accent-dark-purple-primary"
                    />
                    <span>Показывать закрытые</span>
                  </label>
                </div>
                {getVulnerabilitiesForAsset(selectedAsset).length > 0 ? (
                  <div className="space-y-2">
                    {getVulnerabilitiesForAsset(selectedAsset).map((vuln) => (
                      <div 
                        key={vuln.id} 
                        className="bg-dark-card border border-dark-border rounded p-3 cursor-pointer hover:border-dark-purple-primary transition-colors"
                        onClick={() => setSelectedVulnerability(vuln)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white font-medium">{vuln.displayId || vuln.id}</div>
                            <div className="text-xs text-gray-400">{vuln.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            vuln.criticality === 'Critical' ? 'bg-red-600' :
                            vuln.criticality === 'High' ? 'bg-orange-600' :
                            vuln.criticality === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                          } text-white`}>
                            {vuln.criticality}
                          </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              statusColors[vuln.status] || 'bg-gray-600'
                            } text-white`}>
                              {vuln.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    {showClosedVulns ? 'Нет уязвимостей' : 'Нет открытых уязвимостей'}
                </div>
              )}
              </div>

              {/* Tickets */}
                <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 block flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Связанные тикеты ({getTicketsForAsset(selectedAsset).length})
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showClosedTickets}
                      onChange={(e) => setShowClosedTickets(e.target.checked)}
                      className="w-4 h-4 accent-dark-purple-primary"
                    />
                    <span>Показывать закрытые</span>
                  </label>
                </div>
                {getTicketsForAsset(selectedAsset).length > 0 ? (
                  <div className="space-y-2">
                    {getTicketsForAsset(selectedAsset).map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="bg-dark-card border border-dark-border rounded p-3 cursor-pointer hover:border-dark-purple-primary transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white font-medium">{ticket.displayId || ticket.id}</div>
                            <div className="text-xs text-gray-400">{ticket.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                              priorityColors[ticket.priority] || 'bg-gray-600'
                          } text-white`}>
                            {ticket.priority}
                          </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              statusColorsTickets[ticket.status] || 'bg-gray-600'
                            } text-white`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    {showClosedTickets ? 'Нет тикетов' : 'Нет открытых тикетов'}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={(transformed) => {
                      setAssets(prev => [...prev, transformed])
        }}
        clients={clients}
        assetTypes={assetTypes}
      />

      {/* Edit Asset Modal */}
      <EditAssetModal
        isOpen={showEditAssetModal}
        onClose={() => setShowEditAssetModal(false)}
        onUpdate={(transformed) => {
          setAssets(prev => prev.map(a => a.id === transformed.id ? transformed : a))
        }}
        asset={editAsset}
        assetTypes={assetTypes}
      />

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

      {/* Vulnerability Detail Modal */}
      <VulnerabilityDetailModal
        vulnerability={selectedVulnerability}
        onClose={() => setSelectedVulnerability(null)}
        assets={assets}
        assetTypes={assetTypes}
        scanners={scanners}
        tickets={tickets}
        onViewTicket={(ticket) => {
          setSelectedVulnerability(null)
          setSelectedTicket(ticket)
        }}
      />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        workers={[]}
        clients={clients}
        vulnerabilities={vulnerabilities}
        onViewVulnerability={(vuln) => {
          setSelectedTicket(null)
          setSelectedVulnerability(vuln)
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && assetToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-md w-full">
            <div className="border-b border-dark-border px-6 py-4">
              <h2 className="text-xl font-bold text-white">Подтверждение удаления</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Вы уверены, что хотите удалить актив <span className="font-semibold text-white">{assetToDelete.id}</span>?
              </p>
              <p className="text-sm text-gray-400 mb-6">Это действие нельзя отменить.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setAssetToDelete(null)
                  }}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    try {
                      await assetsApi.delete(assetToDelete.id)
                      setAssets(prev => prev.filter(asset => asset.id !== assetToDelete.id))
                      if (selectedAsset && selectedAsset.id === assetToDelete.id) {
                        setSelectedAsset(null)
                      }
                      setShowDeleteConfirm(false)
                      setAssetToDelete(null)
                    } catch (error) {
                      console.error('Failed to delete asset:', error)
                      const errorMessage = error.message || 'Неизвестная ошибка'
                      // Проверяем, не связан ли актив с тикетами через уязвимости
                      if (errorMessage.includes('ticket') || errorMessage.includes('linked to')) {
                        alert('Нельзя удалить актив: его уязвимости привязаны к одному или нескольким тикетам.')
                      } else {
                        alert('Ошибка при удалении актива: ' + errorMessage)
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
    </div>
  )
}

export default AssetsPage

