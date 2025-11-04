import React, { useState } from 'react'
import { projectsApi } from '../services/api'
import { transformProject, transformProjectToBackend } from '../utils/dataTransform'

const CreateProjectModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  clientId 
}) => {
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

  const handleCreate = async () => {
    if (!clientId) {
      alert('Ошибка: не указан клиент')
      return
    }
    
    // Валидация обязательных полей
    if (!newProject.name || !newProject.name.trim()) {
      alert('Пожалуйста, укажите название проекта')
      return
    }
    if (!newProject.startDate || !newProject.endDate) {
      alert('Пожалуйста, укажите даты начала и окончания проекта')
      return
    }
    
    try {
      const projectData = {
        ...newProject,
        clientId: clientId,
        status: 'Active',
        budget: newProject.budget ? Number(newProject.budget) : null,
        progress: 0,
        teamMemberIds: [],
      }
      const backendData = transformProjectToBackend(projectData)
      const created = await projectsApi.create(backendData)
      const transformed = transformProject(created)
      onCreate(transformed)
      handleClose()
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Ошибка при создании проекта: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const handleClose = () => {
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
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Создать новый проект</h2>
          <button
            onClick={handleClose}
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
              ℹ️ После создания проекта можно будет назначить команду
            </p>
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
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
            >
              Создать проект
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal

