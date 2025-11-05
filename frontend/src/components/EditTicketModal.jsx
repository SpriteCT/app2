import React, { useState, useEffect, useMemo } from 'react'
import { ticketsApi } from '../services/api'
import { transformTicket, transformTicketToBackend } from '../utils/dataTransform'

const EditTicketModal = ({
  isOpen,
  onClose,
  onUpdate,
  ticket,
  workers = []
}) => {
  const [editTicket, setEditTicket] = useState(null)

  useEffect(() => {
    if (ticket) {
      setEditTicket({ ...ticket })
    }
  }, [ticket])

  // Filter assignees: workers OR clients from the same client as the ticket
  const availableAssignees = useMemo(() => {
    if (!editTicket || !editTicket.clientId) return workers
    
    return workers.filter(w => {
      // Все исполнители
      if (w.userType === 'worker') return true
      // Только пользователи заказчика этого тикета
      if (w.userType === 'client' && String(w.clientId) === String(editTicket.clientId)) return true
      return false
    })
  }, [workers, editTicket?.clientId])

  const handleSave = async () => {
    if (!editTicket) return
    
    try {
      const backendData = transformTicketToBackend(editTicket)
      const updated = await ticketsApi.update(editTicket.id, backendData)
      const transformed = transformTicket(updated)
      onUpdate(transformed)
      onClose()
    } catch (error) {
      console.error('Failed to update ticket:', error)
      alert('Ошибка при обновлении тикета: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  if (!isOpen || !editTicket) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Редактировать тикет</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Название</label>
            <input 
              type="text" 
              value={editTicket.title || ''} 
              onChange={(e) => setEditTicket({ ...editTicket, title: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Приоритет</label>
              <select 
                value={editTicket.priority || 'High'} 
                onChange={(e) => setEditTicket({ ...editTicket, priority: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Статус</label>
              <select 
                value={editTicket.status || 'Open'} 
                onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Ответственный</label>
              <select 
                value={editTicket.assigneeId || ''} 
                onChange={(e) => setEditTicket({ ...editTicket, assigneeId: e.target.value ? parseInt(e.target.value) : null })} 
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
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Срок</label>
              <input 
                type="date" 
                value={editTicket.dueDate || ''} 
                onChange={(e) => setEditTicket({ ...editTicket, dueDate: e.target.value || null })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Описание</label>
            <textarea 
              rows="4" 
              value={editTicket.description || ''} 
              onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Создан</label>
              <div className="px-4 py-2 bg-dark-card border border-dark-border text-gray-400 rounded-lg">
                {editTicket.createdAt ? new Date(editTicket.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Изменено</label>
              <div className="px-4 py-2 bg-dark-card border border-dark-border text-gray-400 rounded-lg">
                {editTicket.updatedAt ? new Date(editTicket.updatedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
              </div>
            </div>
          </div>
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

export default EditTicketModal

