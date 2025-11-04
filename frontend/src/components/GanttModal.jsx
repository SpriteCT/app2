import React, { useState, useEffect } from 'react'
import { ganttApi } from '../services/api'
import GanttTaskEditor from './GanttTaskEditor'
import GanttChart from './GanttChart'

const GanttModal = ({
  isOpen,
  onClose,
  project,
  onSave
}) => {
  const [ganttDraftTasks, setGanttDraftTasks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && project) {
      loadGanttTasks()
    }
  }, [isOpen, project])

  const loadGanttTasks = async () => {
    if (!project) return
    
    try {
      setLoading(true)
      const savedTasks = await ganttApi.getByProject(project.id)
      const start = project.startDate
      const end = project.endDate
      let initial = []
      
      if (savedTasks && Array.isArray(savedTasks) && savedTasks.length > 0) {
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
    } catch (error) {
      console.error('Failed to load Gantt tasks:', error)
      // Fallback to default task
      const start = project.startDate
      const end = project.endDate
      setGanttDraftTasks([{
        id: `temp-${Date.now()}`,
        name: 'Основная работа',
        startDate: start,
        endDate: end,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!project) return
    
    try {
      // Получаем текущие задачи для проекта
      const existingTasks = await ganttApi.getByProject(project.id)
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
          project_id: project.id,
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
      
      if (onSave) {
        onSave()
      }
      onClose()
    } catch (error) {
      console.error('Failed to save Gantt tasks:', error)
      alert('Ошибка при сохранении диаграммы Ганта: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  if (!isOpen || !project) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Диаграмма Ганта — {project.name}</h3>
            <p className="text-sm text-gray-400">{project.startDate} — {project.endDate}</p>
          </div>
          <button
            onClick={onClose}
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
            defaultStart={project.startDate}
            defaultEnd={project.endDate}
          />

          {/* Рендер диаграммы */}
          <GanttChart
            tasks={ganttDraftTasks}
            startDate={project.startDate}
            endDate={project.endDate}
          />

          <div className="flex justify-end gap-3 pt-2">
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

export default GanttModal

