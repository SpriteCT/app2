import React, { useState } from 'react'

const GanttTaskEditor = ({ tasks, onChange, defaultStart, defaultEnd }) => {
  const [name, setName] = useState('')
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)

  const handleStartChange = (value) => {
    // Ограничиваем дату начала пределами проекта
    if (value < defaultStart) {
      value = defaultStart
    }
    if (value > defaultEnd) {
      value = defaultEnd
    }
    setStart(value)
    // Если дата окончания стала меньше даты начала, обновляем её
    if (end && value > end) {
      setEnd(value)
    }
  }

  const handleEndChange = (value) => {
    // Ограничиваем дату окончания пределами проекта
    if (value < defaultStart) {
      value = defaultStart
    }
    if (value > defaultEnd) {
      value = defaultEnd
    }
    setEnd(value)
    // Если дата начала стала больше даты окончания, обновляем её
    if (start && value < start) {
      setStart(value)
    }
  }

  const addTask = () => {
    if (!name || !start || !end) {
      alert('Пожалуйста, заполните все поля')
      return
    }
    // Ограничение по датам проекта
    if (start < defaultStart || end > defaultEnd || start > end) {
      alert('Даты задачи должны находиться в пределах сроков проекта')
      return
    }
    const id = `task-${Date.now()}`
    onChange([
      ...tasks,
      { id, name, startDate: start, endDate: end }
    ])
    setName('')
    setStart(defaultStart)
    setEnd(defaultEnd)
  }

  const removeTask = (id) => {
    onChange(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4">
      <div className="grid grid-cols-4 gap-3 mb-3">
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Название задачи" 
          className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
        />
        <input 
          type="date" 
          value={start} 
          min={defaultStart} 
          max={defaultEnd} 
          onChange={(e) => handleStartChange(e.target.value)} 
          className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
        />
        <input 
          type="date" 
          value={end} 
          min={start || defaultStart} 
          max={defaultEnd} 
          onChange={(e) => handleEndChange(e.target.value)} 
          className="px-3 py-2 bg-dark-surface border border-dark-border text-white rounded" 
        />
        <button 
          onClick={addTask} 
          className="px-3 py-2 bg-dark-purple-primary text-white rounded hover:bg-dark-purple-secondary"
        >
          Добавить
        </button>
      </div>
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-dark-surface border border-dark-border rounded p-2">
              <div className="text-sm text-white">{t.name}</div>
              <div className="text-xs text-gray-400">{t.startDate} — {t.endDate}</div>
              <button 
                onClick={() => removeTask(t.id)} 
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GanttTaskEditor

