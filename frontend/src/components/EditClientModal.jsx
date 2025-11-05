import React, { useState, useEffect } from 'react'
import { clientsApi } from '../services/api'
import { transformClient, transformClientToBackend } from '../utils/dataTransform'
import ClientContactsEditor from './ClientContactsEditor'

const EditClientModal = ({
  isOpen,
  onClose,
  onUpdate,
  client
}) => {
  const [editClient, setEditClient] = useState(null)

  useEffect(() => {
    if (client) {
      // Убеждаемся, что контакты есть в объекте
      const clientWithContacts = {
        ...client,
        contacts: client.contacts || client.additionalContacts || []
      }
      setEditClient(clientWithContacts)
    }
  }, [client])

  const handleSave = async () => {
    if (!editClient) return
    
    try {
      const backendData = transformClientToBackend(editClient)
      const updated = await clientsApi.update(editClient.id, backendData)
      const transformed = transformClient(updated)
      onUpdate(transformed)
      onClose()
    } catch (error) {
      console.error('Failed to update client:', error)
      alert('Ошибка при обновлении клиента')
    }
  }

  if (!isOpen || !editClient) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Редактировать клиента</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Полное название</label>
              <input 
                type="text" 
                value={editClient.name} 
                onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Краткое имя (3–4 заглавные)</label>
              <input 
                type="text" 
                value={editClient.shortName} 
                onChange={(e) => setEditClient({ ...editClient, shortName: e.target.value.toUpperCase().slice(0,4) })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Отрасль</label>
              <input 
                type="text" 
                value={editClient.industry || ''} 
                onChange={(e) => setEditClient({ ...editClient, industry: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <label className="text-sm text-gray-400 mb-3 block">Контакты</label>
            <ClientContactsEditor 
              contacts={editClient.contacts || editClient.additionalContacts || []} 
              onChange={(updated) => setEditClient({ ...editClient, contacts: updated, additionalContacts: updated })} 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Договор №</label>
              <input 
                type="text" 
                value={editClient.contractNumber || ''} 
                onChange={(e) => setEditClient({ ...editClient, contractNumber: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Дата подписания</label>
              <input 
                type="date" 
                value={editClient.contractDate || ''} 
                onChange={(e) => setEditClient({ ...editClient, contractDate: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Окончание</label>
              <input 
                type="date" 
                value={editClient.contractExpiry || ''} 
                onChange={(e) => setEditClient({ ...editClient, contractExpiry: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Заметки</label>
            <textarea 
              rows="3" 
              value={editClient.notes || ''} 
              onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
            />
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

export default EditClientModal

