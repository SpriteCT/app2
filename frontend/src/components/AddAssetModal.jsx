import React, { useState } from 'react'
import { assetsApi } from '../services/api'
import { transformAsset, transformAssetToBackend } from '../utils/dataTransform'

const AddAssetModal = ({
  isOpen,
  onClose,
  onCreate,
  clients = [],
  assetTypes = []
}) => {
  const [newAsset, setNewAsset] = useState({
    name: '',
    typeId: '',
    ipAddress: '',
    operatingSystem: '',
    status: 'В эксплуатации',
    criticality: 'High',
    clientId: ''
  })

  const handleCreate = async () => {
    if (!newAsset.name || !newAsset.typeId || !newAsset.clientId) {
      alert('Заполните все обязательные поля: имя, тип и клиент')
      return
    }
    
    try {
      const backendData = transformAssetToBackend(newAsset)
      const created = await assetsApi.create(backendData)
      const transformed = transformAsset(created)
      onCreate(transformed)
      onClose()
      setNewAsset({
        name: '',
        typeId: '',
        ipAddress: '',
        operatingSystem: '',
        status: 'В эксплуатации',
        criticality: 'High',
        clientId: ''
      })
    } catch (error) {
      console.error('Failed to create asset:', error)
      alert('Ошибка при создании актива: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Добавить актив</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Имя актива</label>
            <input
              type="text"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              placeholder="server.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Тип</label>
              <select 
                value={newAsset.typeId} 
                onChange={(e) => setNewAsset({ ...newAsset, typeId: e.target.value ? parseInt(e.target.value) : '' })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— выберите тип —</option>
                {assetTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">IP Адрес</label>
              <input
                type="text"
                value={newAsset.ipAddress}
                onChange={(e) => setNewAsset({ ...newAsset, ipAddress: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                placeholder="192.168.1.10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Критичность</label>
              <select 
                value={newAsset.criticality} 
                onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })} 
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
                value={newAsset.status} 
                onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option>В эксплуатации</option>
                <option>Недоступен</option>
                <option>В обслуживании</option>
                <option>Выведен из эксплуатации</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">ОС</label>
              <input
                type="text"
                value={newAsset.operatingSystem}
                onChange={(e) => setNewAsset({ ...newAsset, operatingSystem: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                placeholder="Ubuntu 22.04"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Клиент</label>
              <select 
                value={newAsset.clientId} 
                onChange={(e) => setNewAsset({ ...newAsset, clientId: e.target.value ? parseInt(e.target.value) : '' })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— выберите клиента —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
              onClick={handleCreate}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
            >
              Добавить актив
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddAssetModal

