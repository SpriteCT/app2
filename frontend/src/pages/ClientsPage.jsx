import React, { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Building2, User, Phone, Mail, FileText, Calendar, Server, Users, Target } from 'lucide-react'
import { projectTypeColors, projectStatusColors, priorityColorsProjects } from '../config/colors'
import { clientsApi, projectsApi, workersApi, ganttApi } from '../services/api'
import { transformClient, transformProject, transformWorker, transformClientToBackend, transformProjectToBackend } from '../utils/dataTransform'
import CreateProjectModal from '../components/CreateProjectModal'
import AddClientModal from '../components/AddClientModal'
import EditClientModal from '../components/EditClientModal'
import EditProjectModal from '../components/EditProjectModal'
import ProjectsListModal from '../components/ProjectsListModal'
import GanttModal from '../components/GanttModal'

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
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [editClient, setEditClient] = useState(null)

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
      {selectedClient && (
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
                </div>

                {/* Additional Contacts */}
                {(() => {
                  const additionalContacts = (selectedClient.contacts || selectedClient.additionalContacts || []).filter(c => !c.isPrimary && !c.is_primary)
                  return additionalContacts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <label className="text-sm text-gray-400 mb-2 block">Дополнительные контакты</label>
                      <div className="space-y-3">
                        {additionalContacts.map((contact, idx) => (
                          <div key={contact.id || idx} className="bg-dark-card rounded p-3">
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
                  )
                })()}
              </div>

              {/* Contract Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Договор
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Номер договора</label>
                    <div className="mt-1 text-white">{selectedClient.contractNumber}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Дата подписания</label>
                    <div className="mt-1 text-white">{selectedClient.contractDate}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Окончание</label>
                    <div className="mt-1 text-white">{selectedClient.contractExpiry}</div>
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
      <EditClientModal
        isOpen={showEditClientModal}
        onClose={() => setShowEditClientModal(false)}
        onUpdate={(transformed) => {
          setClients(prev => prev.map(c => c.id === transformed.id ? transformed : c))
          setSelectedClient(prev => (prev && prev.id === transformed.id ? transformed : prev))
        }}
        client={editClient}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onCreate={(transformed) => {
          setClients(prev => [transformed, ...prev])
        }}
      />

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
      <ProjectsListModal
        isOpen={showProjectsListModal}
        onClose={() => {
          setShowProjectsListModal(false)
          setProjectsForClient(null)
        }}
        client={projectsForClient}
        projects={projects}
        onAddProject={() => {
          setProjectsForClient(projectsForClient)
          setShowProjectModal(true)
        }}
        onSelectProject={(project) => setSelectedProject(project)}
        calculateProjectProgress={calculateProjectProgress}
      />

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
                  onClick={() => setShowGanttModal(true)}
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
      <EditProjectModal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        onUpdate={(transformed) => {
          setProjects(prev => prev.map(p => p.id === transformed.id ? transformed : p))
          setSelectedProject(prev => (prev && prev.id === transformed.id ? transformed : prev))
        }}
        project={editProject}
        workers={workers}
      />

      {/* Gantt Modal */}
      <GanttModal
        isOpen={showGanttModal}
        onClose={() => setShowGanttModal(false)}
        project={selectedProject}
        onSave={() => {
          // Обновление сохраненных задач может быть выполнено при необходимости
        }}
      />
    </div>
  )
}


export default ClientsPage

