import React, { useState, useMemo } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Building2, User, Phone, Mail, FileText, Calendar, Server, Users, Target } from 'lucide-react'
import { mockClients } from '../data/mockClients'
import { mockProjects, projectTypeColors, projectStatusColors, priorityColorsProjects } from '../data/mockProjects'

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'Vulnerability Scanning',
    priority: 'High',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    team: [],
  })

  const filteredClients = useMemo(() => {
    return mockClients.filter(c => 
      !c.isDefault && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm])

  const getProjectsForClient = (clientId) => {
    return mockProjects.filter(p => p.clientId === clientId)
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
                  <h3 className="text-xl font-bold text-white mb-1">{client.shortName}</h3>
                  <p className="text-sm text-gray-400">{client.name}</p>
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
                      setSelectedClient(client)
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
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
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

              {/* Infrastructure */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Инфраструктура
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-dark-card rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Серверы</div>
                    <div className="text-2xl font-bold text-white">{selectedClient.infrastructure.servers}</div>
                  </div>
                  <div className="bg-dark-card rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Рабочие станции</div>
                    <div className="text-2xl font-bold text-white">{selectedClient.infrastructure.desktops}</div>
                  </div>
                  <div className="bg-dark-card rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Сетевое оборудование</div>
                    <div className="text-2xl font-bold text-white">{selectedClient.infrastructure.networkDevices}</div>
                  </div>
                  <div className="bg-dark-card rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Тип развертывания</div>
                    <div className="text-xs text-white mt-2">
                      {selectedClient.infrastructure.cloudServices && '☁️ Cloud '}
                      {selectedClient.infrastructure.onPremise && '🏢 On-Premise'}
                    </div>
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
                    <div key={project.id} className="bg-dark-card border border-dark-border rounded p-4 hover:bg-dark-card/80 transition-colors">
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
                          Прогресс: {project.progress}%
                        </span>
                      </div>
                      <div className="mt-3 bg-dark-surface rounded h-2 overflow-hidden">
                        <div
                          className="bg-dark-purple-primary h-full transition-all"
                          style={{ width: `${project.progress}%` }}
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

      {/* Add Client Modal - placeholder */}
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
            <div className="p-6 text-center text-gray-400">
              Форма добавления клиента
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Создать новый проект</h2>
              <button
                onClick={() => {
                  setShowProjectModal(false)
                  setNewProject({
                    name: '',
                    type: 'Vulnerability Scanning',
                    priority: 'High',
                    description: '',
                    startDate: '',
                    endDate: '',
                    budget: '',
                    team: [],
                  })
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Название проекта</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Введите название проекта"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Тип проекта</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  >
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
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  >
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
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата окончания</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Бюджет проекта</label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                <textarea
                  rows="4"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  placeholder="Опишите цели и задачи проекта..."
                />
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ После создания проекта можно будет назначить команду и связать с уязвимостями и активами
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowProjectModal(false)
                    setNewProject({
                      name: '',
                      type: 'Vulnerability Scanning',
                      priority: 'High',
                      description: '',
                      startDate: '',
                      endDate: '',
                      budget: '',
                      team: [],
                    })
                  }}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setShowProjectModal(false)
                    setNewProject({
                      name: '',
                      type: 'Vulnerability Scanning',
                      priority: 'High',
                      description: '',
                      startDate: '',
                      endDate: '',
                      budget: '',
                      team: [],
                    })
                  }}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  Создать проект
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientsPage

