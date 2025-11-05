import React, { useState, useEffect } from 'react'
import { assetsApi, referenceApi } from '../services/api'
import { transformAsset, transformAssetToBackend } from '../utils/dataTransform'

const AddAssetModal = ({
  isOpen,
  onClose,
  onCreate,
  clients = [],
  assetTypes = []
}) => {
  const [assetStatuses, setAssetStatuses] = useState([])
  const [priorityLevels, setPriorityLevels] = useState([])
  const [newAsset, setNewAsset] = useState({
    name: '',
    typeId: '',
    ipAddress: '',
    operatingSystem: '',
    statusId: null,
    criticalityId: null,
    clientId: ''
  })

  useEffect(() => {
    if (isOpen) {
      const loadReferenceData = async () => {
        try {
          const [statuses, priorities] = await Promise.all([
            referenceApi.getAssetStatuses(),
            referenceApi.getPriorityLevels(),
          ])
          setAssetStatuses(statuses)
          setPriorityLevels(priorities)
          
          // Set defaults
          const defaultStatus = statuses.find(s => s.name === 'В эксплуатации')
          const defaultCriticality = priorities.find(p => p.name === 'High')
          setNewAsset(prev => ({
            ...prev,
            statusId: defaultStatus?.id || (statuses[0]?.id),
            criticalityId: defaultCriticality?.id || (priorities[0]?.id),
          }))
        } catch (error) {
          console.error('Failed to load reference data:', error)
        }
      }
      loadReferenceData()
    }
  }, [isOpen])

  const handleCreate = async () => {
    if (!newAsset.name || !newAsset.typeId || !newAsset.clientId) {
      alert('Заполните все обязательные поля: имя, тип и клиент')
      return
    }
    if (!newAsset.statusId || !newAsset.criticalityId) {
      alert('Пожалуйста, выберите статус и критичность')
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
        statusId: null,
        criticalityId: null,
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
                value={newAsset.criticalityId || ''} 
                onChange={(e) => setNewAsset({ ...newAsset, criticalityId: e.target.value ? parseInt(e.target.value) : null })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— выберите критичность —</option>
                {priorityLevels.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Статус</label>
              <select 
                value={newAsset.statusId || ''} 
                onChange={(e) => setNewAsset({ ...newAsset, statusId: e.target.value ? parseInt(e.target.value) : null })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
              >
                <option value="">— выберите статус —</option>
                {assetStatuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
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

