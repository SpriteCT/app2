import React from 'react'

// Редактор списка дополнительных контактов клиента
const ClientContactsEditor = ({ contacts, onChange }) => {
  const add = () => {
    const next = [...(contacts || []), { name: '', role: '', phone: '', email: '' }]
    onChange(next)
  }
  const remove = (idx) => {
    const next = (contacts || []).filter((_, i) => i !== idx)
    onChange(next)
  }
  const update = (idx, field, value) => {
    const next = (contacts || []).map((c, i) => i === idx ? { ...c, [field]: value } : c)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {(contacts || []).map((c, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-dark-card border border-dark-border rounded p-2">
          <input value={c.name} onChange={(e) => update(idx, 'name', e.target.value)} placeholder="Имя" className="px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
          <input value={c.role} onChange={(e) => update(idx, 'role', e.target.value)} placeholder="Роль" className="px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
          <input value={c.phone} onChange={(e) => update(idx, 'phone', e.target.value)} placeholder="Телефон" className="px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
          <div className="flex items-center gap-2 min-w-0">
            <input value={c.email} onChange={(e) => update(idx, 'email', e.target.value)} placeholder="Email" className="flex-1 px-2 py-1 bg-dark-surface border border-dark-border text-white rounded min-w-0" />
            <button onClick={() => remove(idx)} className="shrink-0 text-red-400 hover:text-red-300 text-sm">Удалить</button>
          </div>
        </div>
      ))}
      <div className="pt-1">
        <button onClick={add} className="px-3 py-1.5 bg-dark-card border border-dark-border text-white rounded hover:bg-dark-border text-sm">Добавить контакт</button>
      </div>
    </div>
  )
}

export default ClientContactsEditor

