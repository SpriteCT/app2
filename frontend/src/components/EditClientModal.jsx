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
      setEditClient({ ...client })
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
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Редактировать клиента</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              value={editClient.name} 
              onChange={(e) => setEditClient({ ...editClient, name: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Полное название" 
            />
            <input 
              type="text" 
              value={editClient.shortName} 
              onChange={(e) => setEditClient({ ...editClient, shortName: e.target.value.toUpperCase().slice(0,4) })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Краткое имя" 
            />
            <input 
              type="text" 
              value={editClient.industry} 
              onChange={(e) => setEditClient({ ...editClient, industry: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Отрасль" 
            />
            <select 
              value={editClient.sla} 
              onChange={(e) => setEditClient({ ...editClient, sla: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded"
            >
              <option>Premium</option>
              <option>Standard</option>
              <option>Basic</option>
            </select>
            <select 
              value={editClient.securityLevel} 
              onChange={(e) => setEditClient({ ...editClient, securityLevel: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded"
            >
              <option>Critical</option>
              <option>High</option>
            </select>
            <select 
              value={editClient.billingCycle} 
              onChange={(e) => setEditClient({ ...editClient, billingCycle: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded"
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              value={editClient.contactPerson} 
              onChange={(e) => setEditClient({ ...editClient, contactPerson: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Контактное лицо" 
            />
            <input 
              type="text" 
              value={editClient.position} 
              onChange={(e) => setEditClient({ ...editClient, position: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Должность" 
            />
            <input 
              type="text" 
              value={editClient.phone} 
              onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Телефон" 
            />
            <input 
              type="email" 
              value={editClient.email} 
              onChange={(e) => setEditClient({ ...editClient, email: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Email" 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input 
              type="text" 
              value={editClient.contractNumber} 
              onChange={(e) => setEditClient({ ...editClient, contractNumber: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
              placeholder="Договор №" 
            />
            <input 
              type="date" 
              value={editClient.contractDate} 
              onChange={(e) => setEditClient({ ...editClient, contractDate: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
            />
            <input 
              type="date" 
              value={editClient.contractExpiry} 
              onChange={(e) => setEditClient({ ...editClient, contractExpiry: e.target.value })} 
              className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-sm text-white col-span-2 md:col-span-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={!!editClient.infrastructure?.cloudServices} 
                  onChange={(e) => setEditClient({ ...editClient, infrastructure: { ...editClient.infrastructure, cloudServices: e.target.checked } })} 
                /> 
                Cloud
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={!!editClient.infrastructure?.onPremise} 
                  onChange={(e) => setEditClient({ ...editClient, infrastructure: { ...editClient.infrastructure, onPremise: e.target.checked } })} 
                /> 
                On-Prem
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Дополнительные контакты</label>
            <ClientContactsEditor 
              contacts={editClient.additionalContacts || []} 
              onChange={(updated) => setEditClient({ ...editClient, additionalContacts: updated })} 
            />
          </div>

          <textarea 
            rows="3" 
            value={editClient.notes || ''} 
            onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })} 
            className="w-full px-3 py-2 bg-dark-card border border-dark-border text-white rounded" 
            placeholder="Заметки" 
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

export default EditClientModal

