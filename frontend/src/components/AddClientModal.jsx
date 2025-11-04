import React, { useState } from 'react'
import { clientsApi } from '../services/api'
import { transformClient, transformClientToBackend } from '../utils/dataTransform'
import ClientContactsEditor from './ClientContactsEditor'

const AddClientModal = ({
  isOpen,
  onClose,
  onCreate
}) => {
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
  })

  const handleCreate = async () => {
    try {
      const backendData = transformClientToBackend(newClient)
      const created = await clientsApi.create(backendData)
      const transformed = transformClient(created)
      onCreate(transformed)
      onClose()
      setNewClient({
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
      })
    } catch (error) {
      console.error('Failed to create client:', error)
      alert('Ошибка при создании клиента')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Добавить нового клиента</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Полное название</label>
              <input 
                type="text" 
                value={newClient.name} 
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Краткое имя (3–4 заглавные)</label>
              <input 
                type="text" 
                value={newClient.shortName} 
                onChange={(e) => setNewClient({ ...newClient, shortName: e.target.value.toUpperCase().slice(0,4) })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Отрасль</label>
              <input 
                type="text" 
                value={newClient.industry} 
                onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">SLA</label>
              <select 
                value={newClient.sla} 
                onChange={(e) => setNewClient({ ...newClient, sla: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option>Premium</option>
                <option>Standard</option>
                <option>Basic</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Уровень безопасности</label>
              <select 
                value={newClient.securityLevel} 
                onChange={(e) => setNewClient({ ...newClient, securityLevel: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option>Critical</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Биллинг</label>
              <select 
                value={newClient.billingCycle} 
                onChange={(e) => setNewClient({ ...newClient, billingCycle: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
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
                <input 
                  type="text" 
                  value={newClient.contactPerson} 
                  onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })} 
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Должность</label>
                <input 
                  type="text" 
                  value={newClient.position} 
                  onChange={(e) => setNewClient({ ...newClient, position: e.target.value })} 
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Телефон</label>
                <input 
                  type="text" 
                  value={newClient.phone} 
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} 
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input 
                  type="email" 
                  value={newClient.email} 
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} 
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Договор №</label>
              <input 
                type="text" 
                value={newClient.contractNumber} 
                onChange={(e) => setNewClient({ ...newClient, contractNumber: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Дата подписания</label>
              <input 
                type="date" 
                value={newClient.contractDate} 
                onChange={(e) => setNewClient({ ...newClient, contractDate: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Окончание</label>
              <input 
                type="date" 
                value={newClient.contractExpiry} 
                onChange={(e) => setNewClient({ ...newClient, contractExpiry: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Инфраструктура</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-sm text-white col-span-2 md:col-span-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={newClient.infrastructure.cloudServices} 
                    onChange={(e) => setNewClient({ ...newClient, infrastructure: { ...newClient.infrastructure, cloudServices: e.target.checked } })} 
                  /> 
                  Cloud
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={newClient.infrastructure.onPremise} 
                    onChange={(e) => setNewClient({ ...newClient, infrastructure: { ...newClient.infrastructure, onPremise: e.target.checked } })} 
                  /> 
                  On-Prem
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Заметки</label>
            <textarea 
              rows="3" 
              value={newClient.notes} 
              onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} 
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
              onClick={handleCreate}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
            >
              Добавить клиента
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddClientModal

