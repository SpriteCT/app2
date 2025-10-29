import React, { useState, useMemo } from 'react'
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, Ticket, MessageCircle, Clock, User, Shield, Server, Info } from 'lucide-react'
import { mockTickets, priorityColors, statusColorsTickets } from '../data/mockTickets'
import { mockVulnerabilities } from '../data/mockVulnerabilities'
import { mockClients } from '../data/mockClients'

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
  const [tickets, setTickets] = useState(mockTickets)
  const [showEditTicketModal, setShowEditTicketModal] = useState(false)
  const [editTicket, setEditTicket] = useState(null)
  const [autoTitle, setAutoTitle] = useState('')
  const [createPriority, setCreatePriority] = useState('High')
  const [createDescription, setCreateDescription] = useState('')

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.client.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority
      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus
      const matchesClient = selectedClient === 'client-all' || t.client === selectedClient

      return matchesSearch && matchesPriority && matchesStatus && matchesClient
    })
  }, [searchTerm, selectedPriority, selectedStatus, selectedClient, tickets])

  const priorityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    const filtered = selectedClient === 'client-all' 
      ? tickets 
      : tickets.filter(t => t.client === selectedClient)
    filtered.forEach(t => {
      if (counts.hasOwnProperty(t.priority)) {
        counts[t.priority]++
      }
    })
    return counts
  }, [selectedClient])

  const statusCounts = useMemo(() => {
    const counts = { Open: 0, 'In Progress': 0, Fixed: 0, Verified: 0 }
    const filtered = selectedClient === 'client-all' 
      ? tickets 
      : tickets.filter(t => t.client === selectedClient)
    filtered.forEach(t => {
      if (counts.hasOwnProperty(t.status)) {
        counts[t.status]++
      }
    })
    return counts
  }, [selectedClient])

  const getVulnerabilitiesForTicket = (ticket) => {
    return mockVulnerabilities.filter(v => ticket.vulnerabilities.includes(v.id))
  }
  const [viewVuln, setViewVuln] = useState(null)

  const handleSendMessage = (ticketId) => {
    if (!newMessage.trim()) return
    
    const message = {
      id: `msg-${Date.now()}`,
      author: 'Вы',
      timestamp: new Date().toLocaleString('ru-RU'),
      message: newMessage,
    }
    
    // В реальном приложении здесь был бы API вызов
    setNewMessage('')
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Определяем допустимого клиента для создаваемого тикета:
  // - если в фильтре выбран конкретный клиент, используем его
  // - иначе берём клиента из первой выбранной уязвимости
  const allowedClientForTicket = useMemo(() => {
    if (selectedClient && selectedClient !== 'client-all') return selectedClient
    if (selectedVulns.length > 0) {
      const first = mockVulnerabilities.find(v => v.id === selectedVulns[0])
      return first ? first.client : null
    }
    return null
  }, [selectedClient, selectedVulns])

  const allowedClientName = useMemo(() => {
    const client = mockClients.find(c => c.id === allowedClientForTicket)
    if (!client) return ''
    return client.name
  }, [allowedClientForTicket])

  const filteredVulnerabilitiesForTicket = useMemo(() => {
    return mockVulnerabilities.filter(v => {
      const matchesSearch = v.id.toLowerCase().includes(vulnSearchTerm.toLowerCase()) ||
                          v.title.toLowerCase().includes(vulnSearchTerm.toLowerCase()) ||
                          v.asset.toLowerCase().includes(vulnSearchTerm.toLowerCase())
      const matchesCriticality = vulnFilterCriticality === 'All' || v.criticality === vulnFilterCriticality
      const matchesStatus = vulnFilterStatus === 'All' || v.status === vulnFilterStatus
      const matchesClientScope = allowedClientForTicket
        ? v.client === allowedClientForTicket
        : true
      return matchesSearch && matchesCriticality && matchesStatus && matchesClientScope
    })
  }, [vulnSearchTerm, vulnFilterCriticality, vulnFilterStatus, allowedClientForTicket])

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
    const vuln = mockVulnerabilities.find(v => v.id === vulnId)
    if (!vuln) return
    // Если уже определён допустимый клиент, не позволяем выбирать уязвимости другого клиента
    if (allowedClientForTicket && vuln.client !== allowedClientForTicket) {
      return
    }
    setSelectedVulns(prev => (
      prev.includes(vulnId)
        ? prev.filter(id => id !== vulnId)
        : [...prev, vulnId]
    ))
  }

  const isVulnDisabled = (v) => {
    return Boolean(allowedClientForTicket && v.client !== allowedClientForTicket)
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
            <button className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Экспорт
            </button>
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
              <span className="text-2xl font-bold text-purple-400">{mockTickets.length}</span>
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
          <div className="bg-dark-surface border border-dark-border rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-1">Проверено</div>
            <div className="text-2xl font-bold text-teal-400">{statusCounts.Verified}</div>
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
              <option value="Verified">Verified</option>
              <option value="Closed">Closed</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ответственный</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Срок</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredTickets.map((ticket) => {
                const daysUntil = getDaysUntilDue(ticket.dueDate)
                const isOverdue = daysUntil < 0
                return (
                  <tr key={ticket.id} className="hover:bg-dark-card/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-dark-purple-secondary font-medium">{ticket.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{ticket.title}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {ticket.createdAt}
                      </div>
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
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{ticket.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {ticket.client === 'client-a' ? 'ТехноСервис' :
                       ticket.client === 'client-b' ? 'ФинансХост' :
                       ticket.client === 'client-c' ? 'МедиаДиджитал' :
                       ticket.client === 'client-d' ? 'Козлов' :
                       ticket.client === 'client-e' ? 'РозницаПро' :
                       ticket.client === 'client-f' ? 'ВолковГрупп' : ticket.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {isOverdue ? (
                          <span className="text-red-400 font-medium">{Math.abs(daysUntil)} дн. просрочено</span>
                        ) : (
                          <span className="text-gray-300">{daysUntil} дней</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{ticket.dueDate}</div>
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
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTicket.id}</h2>
                  <p className="text-sm text-gray-400">{selectedTicket.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Приоритет</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      priorityColors[selectedTicket.priority]
                    } text-white`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Статус</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColorsTickets[selectedTicket.status]
                    } text-white`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Ответственный</label>
                  <div className="mt-1 flex items-center gap-2">
                    <select className="px-3 py-1 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary text-sm">
                      <option>{selectedTicket.assignee}</option>
                      <option>Петров П.П.</option>
                      <option>Сидоров С.С.</option>
                      <option>Козлов К.К.</option>
                      <option>Морозов М.М.</option>
                      <option>Волков В.В.</option>
                      <option>Соколов С.С.</option>
                      <option>Лебедев Л.Л.</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Автор</label>
                  <div className="mt-1 text-white">{selectedTicket.reporter}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Клиент</label>
                  <div className="mt-1 text-white">
                    {selectedTicket.client === 'client-a' ? 'ТехноСервис' :
                     selectedTicket.client === 'client-b' ? 'ФинансХост' :
                     selectedTicket.client === 'client-c' ? 'МедиаДиджитал' :
                     selectedTicket.client === 'client-d' ? 'Козлов' :
                     selectedTicket.client === 'client-e' ? 'РозницаПро' :
                     selectedTicket.client === 'client-f' ? 'ВолковГрупп' : selectedTicket.client}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Проект</label>
                  <div className="mt-1 text-white">{selectedTicket.project}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Срок</label>
                  <div className="mt-1 text-white">{selectedTicket.dueDate}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Создан</label>
                  <div className="mt-1 text-white">{selectedTicket.createdAt}</div>
                </div>
              </div>

              {/* Vulnerabilities */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Связанные уязвимости</label>
                <div className="space-y-2">
                      {getVulnerabilitiesForTicket(selectedTicket).map((vuln) => (
                    <div key={vuln.id} className="bg-dark-card border border-dark-border rounded p-3 hover:bg-dark-card/80 cursor-pointer" onClick={() => setViewVuln(vuln)}>
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

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <div className="text-white bg-dark-card p-3 rounded border border-dark-border">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Resolution */}
              {selectedTicket.resolution && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Решение</label>
                  <div className="text-white bg-dark-card p-3 rounded border border-dark-border">
                    {selectedTicket.resolution}
                  </div>
                </div>
              )}

              {/* Chat */}
              <div>
                <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  История обсуждений
                </label>
                <div className="bg-dark-card border border-dark-border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.chatMessages.map((msg) => (
                    <div key={msg.id} className="pb-3 border-b border-dark-border last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{msg.author}</span>
                        <span className="text-xs text-gray-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-300">{msg.message}</p>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedTicket.id)}
                    placeholder="Напишите сообщение..."
                    className="flex-1 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  />
                  <button
                    onClick={() => handleSendMessage(selectedTicket.id)}
                    className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Vulnerability from Ticket */}
      {viewVuln && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-yellow-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{viewVuln.id}</h2>
                  <p className="text-sm text-gray-400">{viewVuln.title}</p>
                </div>
              </div>
              <button onClick={() => setViewVuln(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Актив</label>
                  <div className="mt-1 text-white">{viewVuln.asset}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Тип актива</label>
                  <div className="mt-1 text-white">{viewVuln.assetType}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Критичность</label>
                  <div className="mt-1 text-white">{viewVuln.criticality}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Статус</label>
                  <div className="mt-1 text-white">{viewVuln.status}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">CVSS</label>
                  <div className="mt-1 text-white">{viewVuln.cvss}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Сканер</label>
                  <div className="mt-1 text-white">{viewVuln.scanner}</div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Описание</label>
                <div className="mt-1 text-white bg-dark-card p-3 rounded border border-dark-border">{viewVuln.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Создать новый тикет</h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
                  value={autoTitle}
                  onChange={(e) => setAutoTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Тикет для клиента"
                />
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Название автоматически формируется от клиента
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Приоритет</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Клиент</label>
                  <input
                    type="text"
                    value={allowedClientName}
                    disabled
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg opacity-70 cursor-not-allowed"
                    placeholder="Определится по выбору уязвимостей или фильтру клиента"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Выберите уязвимости ({selectedVulns.length} выбрано)</label>
                
                {/* Search and filters */}
                <div className="bg-dark-card border border-dark-border rounded-lg p-3 space-y-3 mb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={vulnSearchTerm}
                      onChange={(e) => setVulnSearchTerm(e.target.value)}
                      placeholder="Поиск по ID, названию или активу..."
                      className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={vulnFilterCriticality}
                      onChange={(e) => setVulnFilterCriticality(e.target.value)}
                      className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary text-sm"
                    >
                      <option value="All">Все уровни</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    
                    <select
                      value={vulnFilterStatus}
                      onChange={(e) => setVulnFilterStatus(e.target.value)}
                      className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary text-sm"
                    >
                      <option value="All">Все статусы</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </div>
                </div>

                {/* Vulnerabilities list */}
                <div className="bg-dark-card border border-dark-border rounded-lg max-h-64 overflow-y-auto p-3 space-y-2">
                  {filteredVulnerabilitiesForTicket.length === 0 ? (
                    <div className="text-center text-gray-400 py-4 text-sm">Уязвимости не найдены</div>
                  ) : (
                    filteredVulnerabilitiesForTicket.map((vuln) => (
                      <label 
                        key={vuln.id} 
                        className={`flex items-start gap-3 ${isVulnDisabled(vuln) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-dark-border'} p-3 rounded border transition-colors ${
                          selectedVulns.includes(vuln.id) ? 'border-dark-purple-primary bg-dark-purple-primary/10' : 'border-transparent'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedVulns.includes(vuln.id)}
                          onChange={() => handleVulnToggle(vuln.id)}
                          disabled={isVulnDisabled(vuln)}
                          className="mt-0.5 accent-dark-purple-primary" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{vuln.id}</span>
                            <div className="flex gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                vuln.criticality === 'Critical' ? 'bg-red-600' :
                                vuln.criticality === 'High' ? 'bg-orange-600' :
                                vuln.criticality === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                              } text-white`}>
                                {vuln.criticality}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                vuln.status === 'Open' ? 'bg-purple-600' :
                                vuln.status === 'In Progress' ? 'bg-blue-600' :
                                vuln.status === 'Fixed' ? 'bg-green-600' : 'bg-teal-600'
                              } text-white`}>
                                {vuln.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-300 mb-1">{vuln.title}</div>
                          <div className="text-xs text-gray-400">Актив: {vuln.asset}</div>
                          <div className="text-[10px] text-gray-500 mt-1">Клиент: {vuln.client}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea
                  rows="4"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Опишите проблему..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!allowedClientForTicket || selectedVulns.length === 0}
                >
                  Создать тикет
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditTicketModal && editTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Редактировать тикет</h2>
              <button onClick={() => setShowEditTicketModal(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Название</label>
                <input type="text" value={editTicket.title} onChange={(e) => setEditTicket({ ...editTicket, title: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Приоритет</label>
                  <select value={editTicket.priority} onChange={(e) => setEditTicket({ ...editTicket, priority: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Статус</label>
                  <select value={editTicket.status} onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Fixed</option>
                    <option>Verified</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Ответственный</label>
                  <input type="text" value={editTicket.assignee} onChange={(e) => setEditTicket({ ...editTicket, assignee: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Срок</label>
                  <input type="date" value={editTicket.dueDate} onChange={(e) => setEditTicket({ ...editTicket, dueDate: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea rows="4" value={editTicket.description} onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEditTicketModal(false)} className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">Отмена</button>
                <button onClick={() => { setTickets(prev => prev.map(t => t.id === editTicket.id ? { ...t, ...editTicket } : t)); setShowEditTicketModal(false) }} className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors">Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsPage

