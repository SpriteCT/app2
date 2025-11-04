import React, { useState, useEffect } from 'react'
import { assetsApi } from '../services/api'
import { transformAsset, transformAssetToBackend } from '../utils/dataTransform'

const EditAssetModal = ({
  isOpen,
  onClose,
  onUpdate,
  asset,
  assetTypes = []
}) => {
  const [editAsset, setEditAsset] = useState(null)

  useEffect(() => {
    if (asset) {
      setEditAsset({ ...asset })
    }
  }, [asset])

  const handleSave = async () => {
    if (!editAsset) return
    
    try {
      const backendData = transformAssetToBackend(editAsset)
      const updated = await assetsApi.update(editAsset.id, backendData)
      const transformed = transformAsset(updated)
      onUpdate(transformed)
      onClose()
    } catch (error) {
      console.error('Failed to update asset:', error)
      alert('Ошибка при обновлении актива: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  if (!isOpen || !editAsset) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Редактировать актив</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Имя актива</label>
            <input 
              type="text" 
              value={editAsset.name} 
              onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })} 
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Тип</label>
              <select 
                value={editAsset.typeId || ''} 
                onChange={(e) => setEditAsset({ ...editAsset, typeId: e.target.value ? parseInt(e.target.value) : '' })} 
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
                value={editAsset.ipAddress || ''} 
                onChange={(e) => setEditAsset({ ...editAsset, ipAddress: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Критичность</label>
              <select 
                value={editAsset.criticality} 
                onChange={(e) => setEditAsset({ ...editAsset, criticality: e.target.value })} 
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
                value={editAsset.status} 
                onChange={(e) => setEditAsset({ ...editAsset, status: e.target.value })} 
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
                value={editAsset.operatingSystem || ''} 
                onChange={(e) => setEditAsset({ ...editAsset, operatingSystem: e.target.value })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Последнее сканирование</label>
              <input 
                type="date" 
                value={editAsset.lastScan ? new Date(editAsset.lastScan).toISOString().slice(0, 10) : ''} 
                onChange={(e) => setEditAsset({ ...editAsset, lastScan: e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null })} 
                className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary" 
              />
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

export default EditAssetModal

