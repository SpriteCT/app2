import React from 'react'

// Редактор списка контактов клиента
const ClientContactsEditor = ({ contacts, onChange }) => {
  const add = () => {
    const currentContacts = contacts || []
    // Если это первый контакт, помечаем его как основной
    const isFirst = currentContacts.length === 0
    const next = [...currentContacts, { name: '', role: '', phone: '', email: '', isPrimary: isFirst }]
    onChange(next)
  }
  const remove = (idx) => {
    const next = (contacts || []).filter((_, i) => i !== idx)
    onChange(next)
  }
  const update = (idx, field, value) => {
    const next = (contacts || []).map((c, i) => {
      if (i === idx) {
        const updated = { ...c, [field]: value }
        // Если устанавливаем isPrimary = true, снимаем флаг с других контактов
        if (field === 'isPrimary' && value === true) {
          return updated
        }
        return updated
      }
      // Если устанавливаем isPrimary = true для одного контакта, снимаем с других
      if (field === 'isPrimary' && value === true) {
        return { ...c, isPrimary: false }
      }
      return c
    })
    onChange(next)
  }

  return (

<div className="space-y-2">
      {(contacts || []).map((c, idx) => (
        <div key={idx} className="bg-dark-card border border-dark-border rounded p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input 
              value={c.name || ''} 
              onChange={(e) => update(idx, 'name', e.target.value)} 
              placeholder="Имя" 
              className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
            />
            <input 
              value={c.role || ''} 
              onChange={(e) => update(idx, 'role', e.target.value)} 
              placeholder="Роль" 
              className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input 
              value={c.phone || ''} 
              onChange={(e) => update(idx, 'phone', e.target.value)} 
              placeholder="Телефон" 
              className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
            />
            <input 
              value={c.email || ''} 
              onChange={(e) => update(idx, 'email', e.target.value)} 
              placeholder="Email" 
              className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-400" title="Основной контакт">
              <input 
                type="checkbox" 
                checked={c.isPrimary || c.is_primary || false} 
                onChange={(e) => update(idx, 'isPrimary', e.target.checked)} 
                className="w-4 h-4"
              />
              <span>Основной</span>
            </label>
            <button 
              onClick={() => remove(idx)} 
              className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded text-sm transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
      <div className="pt-1">
        <button 
          onClick={add} 
          className="px-3 py-1.5 bg-dark-card border border-dark-border text-white rounded hover:bg-dark-border text-sm"
        >
          Добавить контакт
        </button>
      </div>
    </div>
  )
}

export default ClientContactsEditor

