import React, { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Building2, User, Phone, Mail, FileText, Calendar, Server, Users, Target } from 'lucide-react'
import { projectTypeColors, projectStatusColors, priorityColorsProjects } from '../data/mockProjects'
import { clientsApi, projectsApi, workersApi, ganttApi } from '../services/api'
import { transformClient, transformProject, transformWorker, transformClientToBackend, transformProjectToBackend } from '../utils/dataTransform'
import CreateProjectModal from '../components/CreateProjectModal'

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [clientsData, projectsData, workersData] = await Promise.all([
          clientsApi.getAll(),
          projectsApi.getAll(),
          workersApi.getAll(),
        ])
        setClients(clientsData.map(transformClient))
        setProjects(projectsData.map(transformProject))
        setWorkers(workersData.map(transformWorker))
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showProjectsListModal, setShowProjectsListModal] = useState(false)
  const [projectsForClient, setProjectsForClient] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showGanttModal, setShowGanttModal] = useState(false)
  const [ganttDraftTasks, setGanttDraftTasks] = useState([])
  const [savedGanttByProject, setSavedGanttByProject] = useState({})
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [newClient, setNewClient] = useState({
    id: String(Date.now()),
    name: '',
    shortName: '',
    industry: '',
    contactPerson: '',
    position: '',
    phone: '',
    email: '',
    sla: 'Standard',
    securityLevel: 'High',
    contractNumber: '',
    contractDate: '',
    contractExpiry: '',
    billingCycle: 'Monthly',
    infrastructure: { servers: 0, desktops: 0, networkDevices: 0, cloudServices: true, onPremise: true },
    notes: '',
    isDefault: false,
  })

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      !c.isDefault && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, clients])

  const getProjectsForClient = (clientId) => {
    return projects.filter(p => p.clientId === clientId)
  }

  // Функция для расчета прогресса проекта на основе текущей даты
  const calculateProjectProgress = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    const total = end - start
    if (total <= 0) return 0
    if (now < start) return 0
    if (now > end) return 100
    const progress = Math.round(((now - start) / total) * 100)
    return Math.min(100, Math.max(0, progress))
  }

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
            <h1 className="text-3xl font-bold text-white mb-2">Управление клиентами</h1>
            <p className="text-gray-400">Клиентская база и управление проектами</p>
          </div>
          <button 
            onClick={() => setShowClientModal(true)}
            className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить клиента
          </button>
        </div>

        {/* Search */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, контактному лицу или отрасли..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            />
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClients.map((client) => {
          const projects = getProjectsForClient(client.id)
          return (
            <div
              key={client.id}
              className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-dark-purple-primary transition-colors cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                  <p className="text-sm text-gray-400">{client.shortName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  client.sla === 'Premium' ? 'bg-emerald-600' :
                  client.sla === 'Standard' ? 'bg-blue-600' : 'bg-gray-600'
                } text-white`}>
                  {client.sla}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{client.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{client.email}</span>
                </div>
              </div>

              {/* Projects */}
              <div className="border-t border-dark-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Активные проекты</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setProjectsForClient(client)
                      setShowProjectsListModal(true)
                    }}
                    className="text-xs text-dark-purple-primary hover:text-dark-purple-secondary"
                  >
                    Все проекты →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projects.slice(0, 2).map((proj) => (
                    <span key={proj.id} className={`px-2 py-1 rounded text-xs ${
                      projectTypeColors[proj.type] || 'bg-gray-600'
                    } text-white`}>
                      {proj.type}
                    </span>
                  ))}
                  {projects.length > 2 && (
                    <span className="px-2 py-1 rounded text-xs bg-dark-card border border-dark-border text-gray-400">
                      +{projects.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && !selectedClient.isDefault && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-400">{selectedClient.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditClient({ ...selectedClient })
                    setShowEditClientModal(true)
                  }}
                  className="px-3 py-1.5 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Редактировать
                </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Контактная информация
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Основной контакт</label>
                    <div className="mt-1 text-white">{selectedClient.contactPerson}</div>
                    <div className="text-sm text-gray-400">{selectedClient.position}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Телефон</label>
                    <div className="mt-1 text-white">{selectedClient.phone}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <div className="mt-1 text-white">{selectedClient.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Уровень безопасности</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedClient.securityLevel === 'Critical' ? 'bg-red-600' : 'bg-blue-600'
                      } text-white`}>
                        {selectedClient.securityLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Contacts */}
                {selectedClient.additionalContacts && selectedClient.additionalContacts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <label className="text-sm text-gray-400 mb-2 block">Дополнительные контакты</label>
                    <div className="space-y-3">
                      {selectedClient.additionalContacts.map((contact, idx) => (
                        <div key={idx} className="bg-dark-card rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-white">{contact.name}</div>
                              <div className="text-xs text-gray-400">{contact.role}</div>
                            </div>
                            <div className="text-xs text-gray-400">
                              <div>{contact.phone}</div>
                              <div>{contact.email}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contract Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Договор и SLA
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Номер договора</label>
                    <div className="mt-1 text-white">{selectedClient.contractNumber}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">SLA</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        selectedClient.sla === 'Premium' ? 'bg-emerald-600' :
                        selectedClient.sla === 'Standard' ? 'bg-blue-600' : 'bg-gray-600'
                      } text-white`}>
                        {selectedClient.sla}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Дата подписания</label>
                    <div className="mt-1 text-white">{selectedClient.contractDate}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Окончание</label>
                    <div className="mt-1 text-white">{selectedClient.contractExpiry}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Биллинг</label>
                    <div className="mt-1 text-white">{selectedClient.billingCycle}</div>
                  </div>
                </div>
              </div>

              {/* Infrastructure (counts derived elsewhere; show deployment types only) */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Инфраструктура
                </h3>
                <div className="bg-dark-card rounded p-4">
                    <div className="text-sm text-gray-400 mb-1">Тип развертывания</div>
                    <div className="text-xs text-white mt-2">
                      {selectedClient.infrastructure.cloudServices && '☁️ Cloud '}
                      {selectedClient.infrastructure.onPremise && '🏢 On-Premise'}
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Проекты ({getProjectsForClient(selectedClient.id).length})
                  </h3>
                  <button
                    onClick={() => {
                      setProjectsForClient(selectedClient)
                      setShowProjectModal(true)
                      setSelectedClient(null)
                    }}
                    className="px-3 py-1.5 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Новый проект
                  </button>
                </div>
                <div className="space-y-3">
                  {getProjectsForClient(selectedClient.id).map((project) => (
                    <div
                      key={project.id}
                      className="bg-dark-card border border-dark-border rounded p-4 hover:bg-dark-card/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-white">{project.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{project.description}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          projectStatusColors[project.status]
                        } text-white`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          projectTypeColors[project.type]
                        } text-white`}>
                          {project.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          priorityColorsProjects[project.priority]
                        } text-white`}>
                          {project.priority}
                        </span>
                        <span className="text-xs text-gray-400">
                          {project.startDate} - {project.endDate}
                        </span>
                        <span className="text-xs text-gray-400">
                          Прогресс: {calculateProjectProgress(project.startDate, project.endDate)}%
                        </span>
                      </div>
                      <div className="mt-3 bg-dark-surface rounded h-2 overflow-hidden">
                        <div
                          className="bg-dark-purple-primary h-full transition-all"
                          style={{ width: `${calculateProjectProgress(project.startDate, project.endDate)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Заметки</h3>
                  <div className="bg-dark-card border border-dark-border rounded p-4 text-gray-300">
                    {selectedClient.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditClientModal && editClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Редактировать клиента</h2>
              <button onClick={() => setShowEditClientModal(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editClient.name} onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Полное название" />
                <input type="text" value={editClient.shortName} onChange={(e) => setEditClient({ ...editClient, shortName: e.target.value.toUpperCase().slice(0,4) })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Краткое имя" />
                <input type="text" value={editClient.industry} onChange={(e) => setEditClient({ ...editClient, industry: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Отрасль" />
                <select value={editClient.sla} onChange={(e) => setEditClient({ ...editClient, sla: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded">
                  <option>Premium</option>
                  <option>Standard</option>
                  <option>Basic</option>
                </select>
                <select value={editClient.securityLevel} onChange={(e) => setEditClient({ ...editClient, securityLevel: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded">
                  <option>Critical</option>
                  <option>High</option>
                </select>
                <select value={editClient.billingCycle} onChange={(e) => setEditClient({ ...editClient, billingCycle: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editClient.contactPerson} onChange={(e) => setEditClient({ ...editClient, contactPerson: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Контактное лицо" />
                <input type="text" value={editClient.position} onChange={(e) => setEditClient({ ...editClient, position: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Должность" />
                <input type="text" value={editClient.phone} onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Телефон" />
                <input type="email" value={editClient.email} onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Email" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <input type="text" value={editClient.contractNumber} onChange={(e) => setEditClient({ ...editClient, contractNumber: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Договор №" />
                <input type="date" value={editClient.contractDate} onChange={(e) => setEditClient({ ...editClient, contractDate: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" />
                <input type="date" value={editClient.contractExpiry} onChange={(e) => setEditClient({ ...editClient, contractExpiry: e.target.value })} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 text-sm text-white col-span-2 md:col-span-4">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!editClient.infrastructure?.cloudServices} onChange={(e) => setEditClient({ ...editClient, infrastructure: { ...editClient.infrastructure, cloudServices: e.target.checked } })} /> Cloud</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!editClient.infrastructure?.onPremise} onChange={(e) => setEditClient({ ...editClient, infrastructure: { ...editClient.infrastructure, onPremise: e.target.checked } })} /> On-Prem</label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Дополнительные контакты</label>
                <ClientContactsEditor contacts={editClient.additionalContacts || []} onChange={(updated) => setEditClient({ ...editClient, additionalContacts: updated })} />
              </div>

              <textarea rows="3" value={editClient.notes || ''} onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })} className="w-full px-3 py-2 bg-dark-card border border-dark-border text-white rounded" placeholder="Заметки" />

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEditClientModal(false)} className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">Отмена</button>
                <button
                  onClick={async () => {
                    try {
                      const backendData = transformClientToBackend(editClient)
                      const updated = await clientsApi.update(editClient.id, backendData)
                      const transformed = transformClient(updated)
                      setClients(prev => prev.map(c => c.id === transformed.id ? transformed : c))
                      setSelectedClient(prev => (prev && prev.id === transformed.id ? transformed : prev))
                      setShowEditClientModal(false)
                    } catch (error) {
                      console.error('Failed to update client:', error)
                      alert('Ошибка при обновлении клиента')
                    }
                  }}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Добавить нового клиента</h2>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Полное название</label>
                  <input type="text" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
            </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Краткое имя (3–4 заглавные)</label>
                  <input type="text" value={newClient.shortName} onChange={(e) => setNewClient({ ...newClient, shortName: e.target.value.toUpperCase().slice(0,4) })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Отрасль</label>
                  <input type="text" value={newClient.industry} onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">SLA</label>
                  <select value={newClient.sla} onChange={(e) => setNewClient({ ...newClient, sla: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Premium</option>
                    <option>Standard</option>
                    <option>Basic</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Уровень безопасности</label>
                  <select value={newClient.securityLevel} onChange={(e) => setNewClient({ ...newClient, securityLevel: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Critical</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Биллинг</label>
                  <select value={newClient.billingCycle} onChange={(e) => setNewClient({ ...newClient, billingCycle: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Yearly</option>
                  </select>
                </div>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-lg p-4">
                <label className="text-sm text-gray-400 mb-3 block">Контактное лицо</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ФИО</label>
                    <input type="text" value={newClient.contactPerson} onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })} className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Должность</label>
                    <input type="text" value={newClient.position} onChange={(e) => setNewClient({ ...newClient, position: e.target.value })} className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Телефон</label>
                    <input type="text" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email</label>
                    <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Договор №</label>
                  <input type="text" value={newClient.contractNumber} onChange={(e) => setNewClient({ ...newClient, contractNumber: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата подписания</label>
                  <input type="date" value={newClient.contractDate} onChange={(e) => setNewClient({ ...newClient, contractDate: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Окончание</label>
                  <input type="date" value={newClient.contractExpiry} onChange={(e) => setNewClient({ ...newClient, contractExpiry: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Инфраструктура</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 text-sm text-white col-span-2 md:col-span-4">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={newClient.infrastructure.cloudServices} onChange={(e) => setNewClient({ ...newClient, infrastructure: { ...newClient.infrastructure, cloudServices: e.target.checked } })} /> Cloud</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={newClient.infrastructure.onPremise} onChange={(e) => setNewClient({ ...newClient, infrastructure: { ...newClient.infrastructure, onPremise: e.target.checked } })} /> On-Prem</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Заметки</label>
                <textarea rows="3" value={newClient.notes} onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowClientModal(false)} className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">Отмена</button>
                <button
                  onClick={async () => {
                    try {
                      const backendData = transformClientToBackend(newClient)
                      const created = await clientsApi.create(backendData)
                      const transformed = transformClient(created)
                      setClients(prev => [transformed, ...prev])
                      setShowClientModal(false)
                      setNewClient({
                        id: String(Date.now()),
                        name: '', shortName: '', industry: '', contactPerson: '', position: '', phone: '', email: '', sla: 'Standard', securityLevel: 'High', contractNumber: '', contractDate: '', contractExpiry: '', billingCycle: 'Monthly', infrastructure: { servers: 0, desktops: 0, networkDevices: 0, cloudServices: true, onPremise: true }, notes: '',
                      })
                    } catch (error) {
                      console.error('Failed to create client:', error)
                      alert('Ошибка при создании клиента')
                    }
                  }}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >Добавить клиента</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      <CreateProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onCreate={(project) => {
          setProjects(prev => [project, ...prev])
          setShowProjectModal(false)
        }}
        clientId={projectsForClient?.id}
      />

      {/* Projects List Modal for a specific client */}
      {showProjectsListModal && projectsForClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Проекты: {projectsForClient.name}</h2>
              <button
                onClick={() => {
                  setShowProjectsListModal(false)
                  setProjectsForClient(null)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="mb-4">
                <button
                  onClick={() => {
                    setProjectsForClient(projectsForClient)
                    setShowProjectModal(true)
                  }}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить проект
                </button>
              </div>
              {getProjectsForClient(projectsForClient.id).map((project) => (
                <div
                  key={project.id}
                  className="bg-dark-card border border-dark-border rounded p-4 hover:bg-dark-card/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{project.description}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${projectStatusColors[project.status]} text-white`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`px-2 py-1 rounded text-xs ${projectTypeColors[project.type]} text-white`}>
                      {project.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${priorityColorsProjects[project.priority]} text-white`}>
                      {project.priority}
                    </span>
                    <span className="text-xs text-gray-400">
                      {project.startDate} - {project.endDate}
                    </span>
                    <span className="text-xs text-gray-400">
                      Прогресс: {calculateProjectProgress(project.startDate, project.endDate)}%
                    </span>
                  </div>
                  <div className="mt-3 bg-dark-surface rounded h-2 overflow-hidden">
                    <div className="bg-dark-purple-primary h-full transition-all" style={{ width: `${calculateProjectProgress(project.startDate, project.endDate)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditProject({ ...selectedProject })
                    setShowEditProjectModal(true)
                  }}
                  className="px-3 py-1.5 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Редактировать
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Загружаем задачи Ганта с бэкенда
                      const savedTasks = await ganttApi.getByProject(selectedProject.id)
                      const start = selectedProject.startDate
                      const end = selectedProject.endDate
                      let initial = []
                      if (savedTasks && Array.isArray(savedTasks) && savedTasks.length > 0) {
                        // Преобразуем задачи из бэкенда в формат фронтенда
                        initial = savedTasks.map(task => ({
                          id: task.id,
                          name: task.name,
                          startDate: task.start_date,
                          endDate: task.end_date,
                        }))
                      } else {
                        initial = [{
                          id: `temp-${Date.now()}`,
                          name: 'Основная работа',
                          startDate: start,
                          endDate: end,
                        }]
                      }
                      setGanttDraftTasks(initial)
                      setShowGanttModal(true)
                    } catch (error) {
                      console.error('Failed to load Gantt tasks:', error)
                      // Если ошибка, используем локальное сохранение как fallback
                      const savedTasks = savedGanttByProject[selectedProject.id]
                      const start = selectedProject.startDate
                      const end = selectedProject.endDate
                      let initial = []
                      if (savedTasks && Array.isArray(savedTasks)) {
                        initial = savedTasks
                      } else {
                        initial = [{
                          id: `temp-${Date.now()}`,
                          name: 'Основная работа',
                          startDate: start,
                          endDate: end,
                        }]
                      }
                      setGanttDraftTasks(initial)
                      setShowGanttModal(true)
                    }
                  }}
                  className="px-3 py-1.5 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors text-sm"
                >
                  Диаграмма Ганта
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Клиент</label>
                  <div className="mt-1 text-white">{(clients.find(c => c.id === selectedProject.clientId) || {}).name || ''}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Статус</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${projectStatusColors[selectedProject.status]} text-white`}>
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Тип</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${projectTypeColors[selectedProject.type]} text-white`}>
                      {selectedProject.type}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Приоритет</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColorsProjects[selectedProject.priority]} text-white`}>
                      {selectedProject.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Сроки</label>
                  <div className="mt-1 text-white">{selectedProject.startDate} — {selectedProject.endDate}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Бюджет</label>
                  <div className="mt-1 text-white">{selectedProject.budget.toLocaleString('ru-RU')} ₽</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <div className="text-white bg-dark-card p-3 rounded border border-dark-border">
                  {selectedProject.description}
                </div>
              </div>


              <div>
                <label className="text-sm text-gray-400 mb-2 block">Команда</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((m, i) => (
                    <span key={i} className="px-3 py-1 bg-dark-card border border-dark-border text-xs text-white rounded">{m}</span>
                  ))}
                </div>
              </div>

              <div className="bg-dark-surface rounded h-2 overflow-hidden">
                <div className="bg-dark-purple-primary h-full transition-all" style={{ width: `${calculateProjectProgress(selectedProject.startDate, selectedProject.endDate)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && editProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Редактировать проект</h2>
              <button onClick={() => setShowEditProjectModal(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Название проекта</label>
                <input type="text" value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Тип проекта</label>
                  <select value={editProject.type} onChange={(e) => setEditProject({ ...editProject, type: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Vulnerability Scanning</option>
                    <option>Penetration Test</option>
                    <option>Network Scanning</option>
                    <option>BAS</option>
                    <option>Web Application Scanning</option>
                    <option>Compliance Check</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Приоритет</label>
                  <select value={editProject.priority} onChange={(e) => setEditProject({ ...editProject, priority: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата начала</label>
                  <input type="date" value={editProject.startDate} onChange={(e) => setEditProject({ ...editProject, startDate: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата окончания</label>
                  <input type="date" value={editProject.endDate} onChange={(e) => setEditProject({ ...editProject, endDate: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Бюджет проекта</label>
                <input type="number" value={editProject.budget} onChange={(e) => setEditProject({ ...editProject, budget: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Статус</label>
                <select value={editProject.status} onChange={(e) => setEditProject({ ...editProject, status: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary">
                  <option>Active</option>
                  <option>Planning</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea rows="4" value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" />
              </div>
              <ProjectTeamEditor team={editProject.team || []} teamMemberIds={editProject.teamMemberIds || []} workers={workers} onChange={(updatedTeam, updatedIds) => setEditProject({ ...editProject, team: updatedTeam, teamMemberIds: updatedIds })} />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEditProjectModal(false)} className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">Отмена</button>
                <button
                  onClick={async () => {
                    try {
                      const backendData = transformProjectToBackend(editProject)
                      const updated = await projectsApi.update(editProject.id, backendData)
                      const transformed = transformProject(updated)
                      setProjects(prev => prev.map(p => p.id === transformed.id ? transformed : p))
                      setSelectedProject(prev => (prev && prev.id === transformed.id ? transformed : prev))
                      setShowEditProjectModal(false)
                    } catch (error) {
                      console.error('Failed to update project:', error)
                      alert('Ошибка при обновлении проекта')
                    }
                  }}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gantt Modal */}
      {showGanttModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Диаграмма Ганта — {selectedProject.name}</h3>
                <p className="text-sm text-gray-400">{selectedProject.startDate} — {selectedProject.endDate}</p>
              </div>
              <button
                onClick={() => setShowGanttModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Добавление задач */}
              <GanttTaskEditor
                tasks={ganttDraftTasks}
                onChange={setGanttDraftTasks}
                defaultStart={selectedProject.startDate}
                defaultEnd={selectedProject.endDate}
              />

              {/* Рендер диаграммы */}
              <GanttChart
                tasks={ganttDraftTasks}
                startDate={selectedProject.startDate}
                endDate={selectedProject.endDate}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowGanttModal(false)}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Получаем текущие задачи для проекта
                      const existingTasks = await ganttApi.getByProject(selectedProject.id)
                      const existingTaskIds = existingTasks ? existingTasks.map(t => t.id) : []
                      
                      // Удаляем задачи, которых больше нет
                      for (const existingId of existingTaskIds) {
                        const taskExists = ganttDraftTasks.some(t => String(t.id) === String(existingId))
                        if (!taskExists) {
                          await ganttApi.delete(existingId)
                        }
                      }
                      
                      // Создаем или обновляем задачи
                      for (const task of ganttDraftTasks) {
                        const taskData = {
                          project_id: selectedProject.id,
                          name: task.name,
                          start_date: task.startDate,
                          end_date: task.endDate,
                        }
                        
                        // Проверяем, что ID не является временным (temp-*) и является числом
                        if (task.id && !task.id.toString().startsWith('temp-') && !isNaN(parseInt(task.id))) {
                          // Обновляем существующую задачу
                          await ganttApi.update(parseInt(task.id), taskData)
                        } else {
                          // Создаем новую задачу
                          await ganttApi.create(taskData)
                        }
                      }
                      
                      // Перезагружаем задачи с сервера для обновления ID
                      const updatedTasks = await ganttApi.getByProject(selectedProject.id)
                      if (updatedTasks && Array.isArray(updatedTasks) && updatedTasks.length > 0) {
                        const transformedTasks = updatedTasks.map(task => ({
                          id: task.id,
                          name: task.name,
                          startDate: task.start_date,
                          endDate: task.end_date,
                        }))
                        setSavedGanttByProject(prev => ({ ...prev, [selectedProject.id]: transformedTasks }))
                      } else {
                        setSavedGanttByProject(prev => ({ ...prev, [selectedProject.id]: [] }))
                      }
                      
                      setShowGanttModal(false)
                    } catch (error) {
                      console.error('Failed to save Gantt tasks:', error)
                      alert('Ошибка при сохранении диаграммы Ганта: ' + (error.message || 'Неизвестная ошибка'))
                    }
                  }}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Project Modal (component defined within file for clarity)
// Already implemented inline above within JSX conditional

// Простой редактор задач для диаграммы Ганта
const GanttTaskEditor = ({ tasks, onChange, defaultStart, defaultEnd }) => {
  const [name, setName] = useState('')
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)

  const handleStartChange = (value) => {
    // Ограничиваем дату начала пределами проекта
    if (value < defaultStart) {
      value = defaultStart
    }
    if (value > defaultEnd) {
      value = defaultEnd
    }
    setStart(value)
    // Если дата окончания стала меньше даты начала, обновляем её
    if (end && value > end) {
      setEnd(value)
    }
  }

  const handleEndChange = (value) => {
    // Ограничиваем дату окончания пределами проекта
    if (value < defaultStart) {
      value = defaultStart
    }
    if (value > defaultEnd) {
      value = defaultEnd
    }
    setEnd(value)
    // Если дата начала стала больше даты окончания, обновляем её
    if (start && value < start) {
      setStart(value)
    }
  }

  const addTask = () => {
    if (!name || !start || !end) {
      alert('Пожалуйста, заполните все поля')
      return
    }
    // Ограничение по датам проекта
    if (start < defaultStart || end > defaultEnd || start > end) {
      alert('Даты задачи должны находиться в пределах сроков проекта')
      return
    }
    const id = `task-${Date.now()}`
    onChange([
      ...tasks,
      { id, name, startDate: start, endDate: end }
    ])
    setName('')
    setStart(defaultStart)
    setEnd(defaultEnd)
  }

  const removeTask = (id) => {
    onChange(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4">
      <div className="grid grid-cols-4 gap-3 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название задачи" className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" />
        <input 
          type="date" 
          value={start} 
          min={defaultStart} 
          max={defaultEnd} 
          onChange={(e) => handleStartChange(e.target.value)} 
          className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
        />
        <input 
          type="date" 
          value={end} 
          min={start || defaultStart} 
          max={defaultEnd} 
          onChange={(e) => handleEndChange(e.target.value)} 
          className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
        />
        <button onClick={addTask} className="px-3 py-2 bg-dark-purple-primary text-white rounded hover:bg-dark-purple-secondary">Добавить</button>
      </div>
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-dark-surface border border-dark-border rounded p-2">
              <div className="text-sm text-white">{t.name}</div>
              <div className="text-xs text-gray-400">{t.startDate} — {t.endDate}</div>
              <button onClick={() => removeTask(t.id)} className="text-red-400 hover:text-red-300 text-sm">Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Примитивная диаграмма Ганта без зависимостей
const GanttChart = ({ tasks, startDate, endDate }) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalMs = Math.max(1, end - start)

  const daysBetween = Math.ceil(totalMs / (1000 * 60 * 60 * 24))
  const ticks = Math.min(12, daysBetween) // до 12 делений для читаемости

  const formatTick = (i) => {
    const d = new Date(start.getTime() + (totalMs * i) / ticks)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }
  
  // Текущая дата для отображения на шкале
  const now = new Date()
  const nowInRange = now >= start && now <= end
  const nowPosition = nowInRange ? ((now - start) / totalMs) * 100 : null

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 overflow-x-auto">
      {/* Заголовок шкалы */}
      <div className="grid" style={{ gridTemplateColumns: `200px 1fr` }}>
        <div></div>
        <div className="relative">
          <div className="flex justify-between text-[10px] text-gray-400">
            {Array.from({ length: ticks + 1 }).map((_, i) => (
              <span key={i}>{formatTick(i)}</span>
            ))}
          </div>
          <div className="absolute left-0 right-0 top-4 h-px bg-dark-border" />
          {/* Текущая дата */}
          {nowPosition !== null && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${nowPosition}%` }}
              title={`Сегодня: ${now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Задачи */}
      <div className="space-y-2 mt-6">
        {tasks.map(task => {
          const s = new Date(task.startDate)
          const e = new Date(task.endDate)
          const left = clamp(((s - start) / totalMs) * 100, 0, 100)
          const width = clamp(((e - s) / totalMs) * 100, 0.5, 100 - left)
          return (
            <div key={task.id} className="grid items-center" style={{ gridTemplateColumns: `200px 1fr` }}>
              <div className="text-xs text-white pr-3 truncate">{task.name}</div>
              <div className="relative h-6 bg-dark-surface border border-dark-border rounded">
                <div
                  className="absolute h-full bg-dark-purple-primary/70 rounded"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${task.startDate} — ${task.endDate}`}
                />
                {/* Текущая дата на задаче */}
                {nowPosition !== null && (
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${nowPosition}%` }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ClientsPage

// Редактор списка дополнительных контактов клиента
const ClientContactsEditor = ({ contacts, onChange }) => {
  const add = () => {
    const next = [...(contacts || []), { name: '', role: '', phone: '', email: '' }]
    onChange(next)
  }
  const remove = (idx) => {
    const next = (contacts || []).filter((_, i) => i !== idx)
    onChange(next)
  }
  const update = (idx, field, value) => {
    const next = (contacts || []).map((c, i) => i === idx ? { ...c, [field]: value } : c)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {(contacts || []).map((c, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-dark-card border border-dark-border rounded p-2">
          <input value={c.name} onChange={(e) => update(idx, 'name', e.target.value)} placeholder="Имя" className="px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
          <input value={c.role} onChange={(e) => update(idx, 'role', e.target.value)} placeholder="Роль" className="px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
          <input value={c.phone} onChange={(e) => update(idx, 'phone', e.target.value)} placeholder="Телефон" className="px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
          <div className="flex items-center gap-2 min-w-0">
            <input value={c.email} onChange={(e) => update(idx, 'email', e.target.value)} placeholder="Email" className="flex-1 px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
            <button onClick={() => remove(idx)} className="shrink-0 text-red-400 hover:text-red-300 text-sm">Удалить</button>
          </div>
        </div>
      ))}
      <div className="pt-1">
        <button onClick={add} className="px-3 py-1.5 bg-dark-card border border-dark-border text-white rounded hover:bg-dark-border text-sm">Добавить контакт</button>
      </div>
    </div>
  )
}

// Редактор команды проекта с выпадающим списком и добавлением произвольных участников
const ProjectTeamEditor = ({ team, teamMemberIds = [], workers = [], onChange }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const add = () => {
    if (!selectedWorkerId) return
    const worker = workers.find(w => String(w.id) === String(selectedWorkerId))
    if (!worker) return
    if (teamMemberIds.includes(parseInt(selectedWorkerId))) return
    const newTeam = [...team, worker.fullName]
    const newIds = [...teamMemberIds, parseInt(selectedWorkerId)]
    onChange(newTeam, newIds)
    setSelectedWorkerId('')
  }
  const remove = (index) => {
    const newTeam = team.filter((_, i) => i !== index)
    const newIds = teamMemberIds.filter((_, i) => i !== index)
    onChange(newTeam, newIds)
  }

  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">Команда</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {team.map((member, idx) => (
          <span key={idx} className="px-3 py-1 bg-dark-card border border-dark-border text-xs text-white rounded flex items-center gap-2">
            {member}
            <button onClick={() => remove(idx)} className="text-gray-400 hover:text-white">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="flex-1 px-3 py-2 bg-dark-card border border-dark-border text-white rounded">
          <option value="">— выбрать участника —</option>
          {workers.map(w => (
            <option key={w.id} value={w.id}>{w.fullName}</option>
          ))}
        </select>
        <button onClick={add} className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded hover:bg-dark-border text-sm">Добавить</button>
      </div>
    </div>
  )
}

