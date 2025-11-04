import React from 'react'
import { Plus } from 'lucide-react'
import { projectTypeColors, projectStatusColors, priorityColorsProjects } from '../data/mockProjects'

const ProjectsListModal = ({
  isOpen,
  onClose,
  client,
  projects = [],
  onAddProject,
  onSelectProject,
  calculateProjectProgress
}) => {
  if (!isOpen || !client) return null

  const getProjectsForClient = (clientId) => {
    return projects.filter(p => p.clientId === clientId)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Проекты: {client.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="mb-4">
            <button
              onClick={onAddProject}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить проект
            </button>
          </div>
          {getProjectsForClient(client.id).map((project) => (
            <div
              key={project.id}
              className="bg-dark-card border border-dark-border rounded p-4 hover:bg-dark-card/80 transition-colors cursor-pointer"
              onClick={() => onSelectProject(project)}
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
                  Прогресс: {calculateProjectProgress ? calculateProjectProgress(project.startDate, project.endDate) : 0}%
                </span>
              </div>
              <div className="mt-3 bg-dark-surface rounded h-2 overflow-hidden">
                <div 
                  className="bg-dark-purple-primary h-full transition-all" 
                  style={{ width: `${calculateProjectProgress ? calculateProjectProgress(project.startDate, project.endDate) : 0}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectsListModal

