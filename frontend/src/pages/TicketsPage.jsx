import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, Ticket, MessageCircle, Clock, User, Shield, Server, Info } from 'lucide-react'
import { priorityColors, statusColorsTickets } from '../data/mockTickets'
import { ticketsApi, workersApi, vulnerabilitiesApi, clientsApi, assetsApi, referenceApi } from '../services/api'
import { transformTicket, transformWorker, transformVulnerability, transformTicketToBackend, transformAsset } from '../utils/dataTransform'
import TicketDetailModal from '../components/TicketDetailModal'
import VulnerabilityDetailModal from '../components/VulnerabilityDetailModal'
import CreateTicketModal from '../components/CreateTicketModal'
import EditTicketModal from '../components/EditTicketModal'

const TicketsPage = ({ selectedClient }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [vulnSearchTerm, setVulnSearchTerm] = useState('')
  const [vulnFilterCriticality, setVulnFilterCriticality] = useState('All')
  const [vulnFilterStatus, setVulnFilterStatus] = useState('All')
  const [selectedVulns, setSelectedVulns] = useState([])
  const [tickets, setTickets] = useState([])
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [workers, setWorkers] = useState([])
  const [clients, setClients] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditTicketModal, setShowEditTicketModal] = useState(false)
  const [editTicket, setEditTicket] = useState(null)
  const [autoTitle, setAutoTitle] = useState('')
  const [createPriority, setCreatePriority] = useState('High')
  const [createDescription, setCreateDescription] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState(null)

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [ticketsData, vulnsData, workersData, clientsData, assetsData, assetTypesData, scannersData] = await Promise.all([
          ticketsApi.getAll(),
          vulnerabilitiesApi.getAll(),
          workersApi.getAll(),
          clientsApi.getAll(),
          assetsApi.getAll(),
          referenceApi.getAssetTypes(),
          referenceApi.getScanners(),
        ])
        const transformedTickets = ticketsData.map(transformTicket).filter(t => t !== null)
        setTickets(transformedTickets)
        setVulnerabilities(vulnsData.map(transformVulnerability))
        setWorkers(workersData.map(transformWorker))
        setClients(clientsData.map(c => ({ id: c.id, name: c.name, shortName: c.short_name })))
        setAssets(assetsData.map(transformAsset))
        setAssetsForModal(assetsData.map(transformAsset))
        setAssetTypesForModal(assetTypesData.map(at => ({ id: at.id, name: at.name })))
        setScannersForModal(scannersData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter(t => {
      if (!t) return false
      const clientName = clients.find(c => String(c.id) === String(t.clientId))?.name || ''
      const matchesSearch = String(t.displayId || t.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority
      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus
      const matchesClient = selectedClient === 'client-all' || String(t.clientId) === String(selectedClient)

      return matchesSearch && matchesPriority && matchesStatus && matchesClient
    })
    return filtered
  }, [searchTerm, selectedPriority, selectedStatus, selectedClient, tickets, clients])

  const priorityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    const filtered = selectedClient === 'client-all' 
      ? tickets 
      : tickets.filter(t => String(t.clientId) === String(selectedClient))
    filtered.forEach(t => {
      if (counts.hasOwnProperty(t.priority)) {
        counts[t.priority]++
      }
    })
    return counts
  }, [selectedClient, tickets])

  const statusCounts = useMemo(() => {
    const counts = { Open: 0, 'In Progress': 0, Fixed: 0 }
    const filtered = selectedClient === 'client-all' 
      ? tickets 
      : tickets.filter(t => String(t.clientId) === String(selectedClient))
    filtered.forEach(t => {
      if (counts.hasOwnProperty(t.status)) {
        counts[t.status]++
      }
    })
    return counts
  }, [selectedClient, tickets])

  const getVulnerabilitiesForTicket = (ticket) => {
    if (!ticket || !ticket.vulnerabilities) return []
    return ticket.vulnerabilities.map(v => transformVulnerability(v))
  }

  // Load full ticket data when editing
  useEffect(() => {
    if (showEditTicketModal && editTicket) {
      const loadFullTicket = async () => {
        try {
          const fullTicket = await ticketsApi.getById(editTicket.id)
          const transformed = transformTicket(fullTicket)
          setEditTicket(transformed)
        } catch (error) {
          console.error('Failed to load ticket:', error)
        }
      }
      loadFullTicket()
    }
  }, [showEditTicketModal, editTicket?.id])
  const [viewVuln, setViewVuln] = useState(null)
  const [assetsForModal, setAssetsForModal] = useState([])
  const [assetTypesForModal, setAssetTypesForModal] = useState([])
  const [scannersForModal, setScannersForModal] = useState([])

  const handleSendMessage = async (ticketId) => {
    if (!newMessage.trim()) return
    
    try {
      // Отправляем сообщение через API
      const messageData = {
        message: newMessage.trim(),
        author_id: null // Можно добавить автора позже
      }
      await ticketsApi.addMessage(ticketId, messageData)
      
      // Обновляем тикет, чтобы получить обновленный список сообщений
      const updatedTicket = await ticketsApi.getById(ticketId)
      const transformed = transformTicket(updatedTicket)
      
      // Обновляем выбранный тикет и список тикетов
      setSelectedTicket(transformed)
      setTickets(prev => prev.map(t => t.id === ticketId ? transformed : t))
      
    setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Ошибка при отправке сообщения: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Определяем допустимого клиента для создаваемого тикета:
  // - если в фильтре выбран конкретный клиент, используем его
  // - иначе берём клиента из первой выбранной уязвимости
  const allowedClientForTicket = useMemo(() => {
    if (selectedClient && selectedClient !== 'client-all') return String(selectedClient)
    if (selectedVulns.length > 0) {
      const first = vulnerabilities.find(v => v.id === selectedVulns[0])
      return first ? String(first.clientId) : null
    }
    return null
  }, [selectedClient, selectedVulns, vulnerabilities])

  const allowedClientName = useMemo(() => {
    const client = clients.find(c => String(c.id) === String(allowedClientForTicket))
    if (!client) return ''
    return client.name
  }, [allowedClientForTicket, clients])

  const filteredVulnerabilitiesForTicket = useMemo(() => {
    return vulnerabilities.filter(v => {
      const assetName = assets.find(a => a.id === v.assetId)?.name || ''
      const matchesSearch = String(v.displayId || v.id).toLowerCase().includes(vulnSearchTerm.toLowerCase()) ||
                          v.title.toLowerCase().includes(vulnSearchTerm.toLowerCase()) ||
                          assetName.toLowerCase().includes(vulnSearchTerm.toLowerCase())
      const matchesCriticality = vulnFilterCriticality === 'All' || v.criticality === vulnFilterCriticality
      const matchesStatus = vulnFilterStatus === 'All' || v.status === vulnFilterStatus
      const matchesClientScope = allowedClientForTicket
        ? String(v.clientId) === String(allowedClientForTicket)
        : true
      return matchesSearch && matchesCriticality && matchesStatus && matchesClientScope
    })
  }, [vulnSearchTerm, vulnFilterCriticality, vulnFilterStatus, allowedClientForTicket, vulnerabilities, assets])

  // Автогенерация названия тикета от клиента
  const recomputeAutoTitle = () => {
    if (allowedClientName) {
      setAutoTitle(`Тикет для клиента: ${allowedClientName}`)
    } else {
      setAutoTitle('')
    }
  }

  React.useEffect(() => {
    recomputeAutoTitle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedClientName])

  const handleVulnToggle = (vulnId) => {
    const vuln = vulnerabilities.find(v => v.id === vulnId)
    if (!vuln) return
    // Если уже определён допустимый клиент, не позволяем выбирать уязвимости другого клиента
    if (allowedClientForTicket && String(vuln.clientId) !== String(allowedClientForTicket)) {
      return
    }
    setSelectedVulns(prev => (
      prev.includes(vulnId) 
        ? prev.filter(id => id !== vulnId)
        : [...prev, vulnId]
    ))
  }

  const isVulnDisabled = (v) => {
    return Boolean(allowedClientForTicket && String(v.clientId) !== String(allowedClientForTicket))
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Управление тикетами</h1>
            <p className="text-gray-400">Создание и отслеживание тикетов по уязвимостям</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать тикет
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm">Critical</span>
              <span className="text-2xl font-bold text-red-400">{priorityCounts.Critical}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-sm">High</span>
              <span className="text-2xl font-bold text-orange-400">{priorityCounts.High}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-sm">Medium</span>
              <span className="text-2xl font-bold text-yellow-400">{priorityCounts.Medium}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm">Low</span>
              <span className="text-2xl font-bold text-blue-400">{priorityCounts.Low}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm">Всего</span>
              <span className="text-2xl font-bold text-purple-400">{tickets.length}</span>
            </div>
          </div>
        </div>

        {/* Status Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Открыто</div>
            <div className="text-2xl font-bold text-purple-400">{statusCounts.Open}</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">В работе</div>
            <div className="text-2xl font-bold text-blue-400">{statusCounts['In Progress']}</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Исправлено</div>
            <div className="text-2xl font-bold text-green-400">{statusCounts.Fixed}</div>
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
                placeholder="Поиск по ID, названию или клиенту..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              <option value="All">Все приоритеты</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Уязвимости</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Приоритет</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Назначен</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Срок</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredTickets.map((ticket) => {
                const daysUntil = getDaysUntilDue(ticket.dueDate)
                const isOverdue = daysUntil !== null && daysUntil < 0
                return (
                  <tr key={ticket.id} className="hover:bg-dark-card/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-dark-purple-secondary font-medium">{ticket.displayId || ticket.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">{ticket.vulnerabilities.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        priorityColors[ticket.priority]
                      } text-white`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColorsTickets[ticket.status]
                      } text-white`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{ticket.assigneeName || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.dueDate ? (
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-400' : daysUntil <= 3 ? 'text-yellow-400' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isOverdue ? 'text-red-400' : daysUntil <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>
                            {new Date(ticket.dueDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-400">Срок не установлен</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded transition-colors"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditTicket({ ...ticket }); setShowEditTicketModal(true) }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-dark-card rounded transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setTicketToDelete(ticket)
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-400">
        Найдено: {filteredTickets.length} из {tickets.length}
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        workers={workers}
        clients={clients}
        vulnerabilities={vulnerabilities}
        onViewVulnerability={(vuln) => {
          setViewVuln(vuln)
          setSelectedTicket(null)
        }}
        onSendMessage={handleSendMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />

      {/* View Vulnerability from Ticket */}
      <VulnerabilityDetailModal
        vulnerability={viewVuln}
        onClose={() => setViewVuln(null)}
        assets={assetsForModal}
        assetTypes={assetTypesForModal}
        scanners={scannersForModal}
        tickets={tickets}
        onViewTicket={(ticket) => {
          setViewVuln(null)
          setSelectedTicket(ticket)
        }}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(ticket) => {
          setTickets(prev => [...prev, ticket])
        }}
        vulnerabilities={vulnerabilities}
        clients={clients}
        workers={workers}
        assets={assets}
        tickets={tickets}
      />

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={showEditTicketModal}
        onClose={() => setShowEditTicketModal(false)}
        onUpdate={(transformed) => {
          setTickets(prev => prev.map(t => t.id === transformed.id ? transformed : t))
        }}
        ticket={editTicket}
        workers={workers}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && ticketToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-md w-full">
            <div className="border-b border-dark-border px-6 py-4">
              <h2 className="text-xl font-bold text-white">Подтверждение удаления</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">
                Вы уверены, что хотите удалить тикет <span className="font-semibold text-white">{ticketToDelete.displayId || ticketToDelete.id}</span>?
              </p>
              <p className="text-sm text-gray-400 mb-6">Это действие нельзя отменить.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setTicketToDelete(null)
                  }}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    try {
                      await ticketsApi.delete(ticketToDelete.id)
                      setTickets(prev => prev.filter(t => t.id !== ticketToDelete.id))
                      if (selectedTicket && selectedTicket.id === ticketToDelete.id) {
                        setSelectedTicket(null)
                      }
                      setShowDeleteConfirm(false)
                      setTicketToDelete(null)
                    } catch (error) {
                      console.error('Failed to delete ticket:', error)
                      alert('Ошибка при удалении тикета: ' + (error.message || 'Неизвестная ошибка'))
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

export default TicketsPage

