import React, { useState, useMemo, useEffect } from 'react'
import { Search, Info } from 'lucide-react'
import { ticketsApi, referenceApi } from '../services/api'
import { transformTicket, transformTicketToBackend } from '../utils/dataTransform'

const CreateTicketModal = ({
  isOpen,
  onClose,
  onCreate,
  ticketFromVuln = null,
  vulnerabilities = [],
  clients = [],
  assets = [],
  tickets = [],
  workers = [],
  initialClientId = null,
  initialVulnIds = []
}) => {
  const [autoTitle, setAutoTitle] = useState('')
  const [createPriority, setCreatePriority] = useState('High')
  const [createStatus, setCreateStatus] = useState('Open')
  
  // ENUM values
  const priorityLevels = ['Critical', 'High', 'Medium', 'Low']
  const ticketStatuses = ['Open', 'In Progress', 'Closed']
  const [createDescription, setCreateDescription] = useState('')
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null)
  const [vulnSearchTerm, setVulnSearchTerm] = useState('')
  const [vulnFilterCriticality, setVulnFilterCriticality] = useState('All')
  const [vulnFilterStatus, setVulnFilterStatus] = useState('All')
  const [selectedVulns, setSelectedVulns] = useState(initialVulnIds)

  useEffect(() => {
    if (isOpen) {
      // Set defaults
      setCreatePriority('High')
      setCreateStatus('Open')
    }
  }, [isOpen])

  // Determine allowed client
  const allowedClientForTicket = useMemo(() => {
    if (initialClientId) return initialClientId
    if (ticketFromVuln) return ticketFromVuln.clientId
    if (selectedVulns.length > 0) {
      const firstVuln = vulnerabilities.find(v => selectedVulns.includes(v.id))
      return firstVuln?.clientId
    }
    return null
  }, [initialClientId, ticketFromVuln, selectedVulns, vulnerabilities])

  const allowedClientName = useMemo(() => {
    if (!allowedClientForTicket) return ''
    const client = clients.find(c => String(c.id) === String(allowedClientForTicket))
    return client?.name || ''
  }, [allowedClientForTicket, clients])

  // Filter assignees: workers OR clients from the same client as the ticket
  const availableAssignees = useMemo(() => {
    if (!allowedClientForTicket) return []
    
    return workers.filter(w => {
      // Все исполнители
      if (w.userType === 'worker') return true
      // Только пользователи заказчика этого тикета
      if (w.userType === 'client' && String(w.clientId) === String(allowedClientForTicket)) return true
      return false
    })
  }, [workers, allowedClientForTicket])

  // Filter vulnerabilities for ticket creation
  const filteredVulnerabilitiesForTicket = useMemo(() => {
    let filtered = vulnerabilities.filter(v => {
      if (allowedClientForTicket && String(v.clientId) !== String(allowedClientForTicket)) {
        return false
      }
      const matchesSearch = String(v.displayId || v.id).toLowerCase().includes(vulnSearchTerm.toLowerCase()) ||
                          v.title.toLowerCase().includes(vulnSearchTerm.toLowerCase()) ||
                          (assets.find(a => a.id === v.assetId)?.name || '').toLowerCase().includes(vulnSearchTerm.toLowerCase())
      const matchesCriticality = vulnFilterCriticality === 'All' || v.criticality === vulnFilterCriticality
      const matchesStatus = vulnFilterStatus === 'All' || v.status === vulnFilterStatus
      return matchesSearch && matchesCriticality && matchesStatus
    })
    return filtered
  }, [vulnerabilities, allowedClientForTicket, vulnSearchTerm, vulnFilterCriticality, vulnFilterStatus, assets])

  // Check if vulnerability is already in a ticket
  const isVulnInTicket = (vulnId) => {
    return tickets.some(ticket => 
      ticket.vulnerabilities && 
      ticket.vulnerabilities.some(v => v.id === vulnId)
    )
  }

  const isVulnDisabled = (vuln) => {
    if (!allowedClientForTicket) return false
    return String(vuln.clientId) !== String(allowedClientForTicket)
  }

  const handleVulnToggle = (vulnId) => {
    if (isVulnDisabled(vulnerabilities.find(v => v.id === vulnId))) return
    setSelectedVulns(prev => 
      prev.includes(vulnId) 
        ? prev.filter(id => id !== vulnId)
        : [...prev, vulnId]
    )
  }

  const recomputeAutoTitle = () => {
    if (selectedVulns.length === 0 && !ticketFromVuln) return ''
    const vulnsToUse = selectedVulns.length > 0 
      ? vulnerabilities.filter(v => selectedVulns.includes(v.id))
      : [ticketFromVuln]
    if (vulnsToUse.length === 0) return ''
    const client = clients.find(c => String(c.id) === String(allowedClientForTicket))
    return `Тикет: ${vulnsToUse.map(v => v.displayId || v.id).join(', ')}`
  }

  const handleCreate = async () => {
    if (!allowedClientForTicket || (selectedVulns.length === 0 && !ticketFromVuln)) return
    if (!createPriority || !createStatus) {
      alert('Пожалуйста, выберите приоритет и статус')
      return
    }
    
    try {
      const ticketData = {
        clientId: parseInt(allowedClientForTicket),
        title: autoTitle || recomputeAutoTitle() || `Тикет для клиента: ${allowedClientName}`,
        description: createDescription || (ticketFromVuln ? `Требуется устранить уязвимость ${ticketFromVuln.displayId || ticketFromVuln.id}: ${ticketFromVuln.title}` : ''),
        priority: createPriority,
        status: createStatus,
        assigneeId: selectedAssigneeId || null,
        reporterId: workers && workers.length > 0 ? workers[0].id : null,
        dueDate: null,
        vulnerabilityIds: selectedVulns.length > 0 ? selectedVulns : [ticketFromVuln.id],
      }
      
      const backendData = transformTicketToBackend(ticketData)
      const created = await ticketsApi.create(backendData)
      const transformed = transformTicket(created)
      
      if (onCreate) {
        onCreate(transformed)
      }
      
      // Reset form
      setAutoTitle('')
      setCreateDescription('')
      setCreatePriority('High')
      setCreateStatus('Open')
      setSelectedAssigneeId(null)
      setSelectedVulns(initialVulnIds)
      setVulnSearchTerm('')
      setVulnFilterCriticality('All')
      setVulnFilterStatus('All')
      
      onClose()
    } catch (error) {
      console.error('Failed to create ticket:', error)
      alert('Ошибка при создании тикета: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const handleClose = () => {
    setAutoTitle('')
    setCreateDescription('')
    setCreatePriority('High')
    setCreateStatus('Open')
    setSelectedAssigneeId(null)
    setSelectedVulns(initialVulnIds)
    setVulnSearchTerm('')
    setVulnFilterCriticality('All')
    setVulnFilterStatus('All')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Создать новый тикет</h2>
          <button
            onClick={handleClose}
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
                value={createPriority || ''}
                onChange={(e) => setCreatePriority(e.target.value)}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— выберите приоритет —</option>
                {priorityLevels.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Статус</label>
              <select
                value={createStatus || ''}
                onChange={(e) => setCreateStatus(e.target.value)}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— выберите статус —</option>
                {ticketStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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

          {allowedClientForTicket && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Ответственный</label>
              <select
                value={selectedAssigneeId || ''}
                onChange={(e) => setSelectedAssigneeId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— не назначен —</option>
                {availableAssignees.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.fullName} {w.userType === 'worker' ? '' : '(Заказчик)'}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  <option value="Closed">Closed</option>
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
                        <span className="text-sm font-medium text-white">{vuln.displayId || vuln.id}</span>
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
                            vuln.status === 'Closed' ? 'bg-gray-600' : 'bg-gray-600'
                          } text-white`}>
                            {vuln.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 mb-1">{vuln.title}</div>
                      <div className="text-xs text-gray-400">Актив: {assets.find(a => a.id === vuln.assetId)?.name || '-'}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[10px] text-gray-500">Клиент: {clients.find(c => String(c.id) === String(vuln.clientId))?.name || '-'}</div>
                        {isVulnInTicket(vuln.id) && (
                          <span className="text-[10px] px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded border border-yellow-600/50">
                            Уже в тикете
                          </span>
                        )}
                      </div>
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
              onClick={handleClose}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!allowedClientForTicket || (selectedVulns.length === 0 && !ticketFromVuln)}
            >
              Создать тикет
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTicketModal

