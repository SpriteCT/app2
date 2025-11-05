import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, BookOpen } from 'lucide-react'
import { referenceApi } from '../services/api'
import { formatDate } from '../utils/dateUtils'

const ReferencesPage = () => {
  const [activeTab, setActiveTab] = useState('asset-types')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [assetTypes, setAssetTypes] = useState([])
  const [scanners, setScanners] = useState([])
  const [projectTypes, setProjectTypes] = useState([])
  
  // Edit states
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Load all reference data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [
        assetTypesData,
        scannersData,
        projectTypesData,
      ] = await Promise.all([
        referenceApi.getAssetTypes(),
        referenceApi.getScanners(),
        referenceApi.getProjectTypes(),
      ])
      
      setAssetTypes(assetTypesData || [])
      setScanners(scannersData || [])
      setProjectTypes(projectTypesData || [])
    } catch (error) {
      console.error('Failed to load reference data:', error)
      alert('Ошибка при загрузке справочников: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'asset-types': return { data: assetTypes, setData: setAssetTypes, api: 'asset-types' }
      case 'scanners': return { data: scanners, setData: setScanners, api: 'scanners' }
      case 'project-types': return { data: projectTypes, setData: setProjectTypes, api: 'project-types' }
      default: return { data: [], setData: () => {}, api: '' }
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setEditingName(item.name)
    setShowAddForm(false)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSave = async (itemId) => {
    if (!editingName.trim()) {
      alert('Название не может быть пустым')
      return
    }

    try {
      const { api, data, setData } = getCurrentData()
      const item = data.find(d => d.id === itemId)
      
      // Update via API
      const updated = await referenceApi.update(api, itemId, { name: editingName.trim() })
      
      // Update local state
      setData(data.map(d => d.id === itemId ? updated : d))
      
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      console.error('Failed to update:', error)
      alert('Ошибка при обновлении: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент? Это может повлиять на связанные данные.')) {
      return
    }

    try {
      const { api, data, setData } = getCurrentData()
      
      // Delete via API
      await referenceApi.delete(api, itemId)
      
      // Update local state
      setData(data.filter(d => d.id !== itemId))
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Ошибка при удалении: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  const handleAdd = async () => {
    if (!newItemName.trim()) {
      alert('Название не может быть пустым')
      return
    }

    try {
      const { api, data, setData } = getCurrentData()
      
      // Create via API
      const created = await referenceApi.create(api, { name: newItemName.trim() })
      
      // Update local state
      setData([...data, created])
      
      setNewItemName('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to create:', error)
      alert('Ошибка при создании: ' + (error.message || 'Неизвестная ошибка'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Загрузка справочников...</div>
      </div>
    )
  }

  const { data: currentData } = getCurrentData()
  const tabLabels = {
    'asset-types': 'Типы активов',
    'scanners': 'Сканеры',
    'project-types': 'Типы проектов',
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Справочники</h1>
            <p className="text-gray-400">Управление справочными данными системы</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-dark-border mb-6 overflow-x-auto">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setEditingId(null)
                setShowAddForm(false)
              }}
              className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-dark-purple-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-dark-surface border border-dark-border rounded-lg">
          <div className="p-6">
            {/* Add new item */}
            <div className="mb-6">
              {!showAddForm ? (
                <button
                  onClick={() => {
                    setShowAddForm(true)
                    setEditingId(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Добавить элемент
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Введите название"
                    className="flex-1 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                    autoFocus
                  />
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewItemName('')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Отмена
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="space-y-2">
              {currentData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Нет элементов в справочнике</p>
                </div>
              ) : (
                currentData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-lg hover:border-dark-purple-primary transition-colors"
                  >
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSave(item.id)}
                          className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(item.id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-xs text-gray-400">
                            ID: {item.id} • Создан: {formatDate(item.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferencesPage

