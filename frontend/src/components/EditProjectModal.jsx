import React, { useState, useEffect } from 'react'
import { projectsApi } from '../services/api'
import { transformProject, transformProjectToBackend } from '../utils/dataTransform'
import ProjectTeamEditor from './ProjectTeamEditor'

const EditProjectModal = ({
  isOpen,
  onClose,
  onUpdate,
  project,
  workers = []
}) => {
  const [editProject, setEditProject] = useState(null)

  useEffect(() => {
    if (project) {
      setEditProject({ ...project })
    }
  }, [project])

  const handleSave = async () => {
    if (!editProject) return
    
    try {
      const backendData = transformProjectToBackend(editProject)
      const updated = await projectsApi.update(editProject.id, backendData)
      const transformed = transformProject(updated)
      onUpdate(transformed)
      onClose()
    } catch (error) {
      console.error('Failed to update project:', error)
      alert('Ошибка при обновлении проекта')
    }
  }

  if (!isOpen || !editProject) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Редактировать проект</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Название проекта</label>
            <input 
              type="text" 
              value={editProject.name} 
              onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Тип проекта</label>
              <select 
                value={editProject.type} 
                onChange={(e) => setEditProject({ ...editProject, type: e.target.value })} 
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
                value={editProject.priority} 
                onChange={(e) => setEditProject({ ...editProject, priority: e.target.value })} 
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
                value={editProject.startDate} 
                onChange={(e) => setEditProject({ ...editProject, startDate: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Дата окончания</label>
              <input 
                type="date" 
                value={editProject.endDate} 
                onChange={(e) => setEditProject({ ...editProject, endDate: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Статус</label>
            <select 
              value={editProject.status} 
              onChange={(e) => setEditProject({ ...editProject, status: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              <option>Active</option>
              <option>Planning</option>
              <option>On Hold</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Описание</label>
            <textarea 
              rows="4" 
              value={editProject.description || ''} 
              onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
            />
          </div>
          <ProjectTeamEditor 
            team={editProject.team || []} 
            teamMemberIds={editProject.teamMemberIds || []} 
            workers={workers} 
            onChange={(updatedTeam, updatedIds) => setEditProject({ ...editProject, team: updatedTeam, teamMemberIds: updatedIds })} 
          />
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProjectModal

