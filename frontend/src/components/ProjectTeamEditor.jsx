import React, { useState } from 'react'

// Редактор команды проекта с выпадающим списком и добавлением произвольных участников
const ProjectTeamEditor = ({ team, teamMemberIds = [], workers = [], onChange }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  
  const add = () => {
    if (!selectedWorkerId) return
    const worker = workers.find(w => String(w.id) === String(selectedWorkerId))
    if (!worker) return
    if (teamMemberIds.includes(parseInt(selectedWorkerId))) return
    const newTeam = [...team, worker.fullName]
    const newIds = [...teamMemberIds, parseInt(selectedWorkerId)]
    onChange(newTeam, newIds)
    setSelectedWorkerId('')
  }
  
  const remove = (index) => {
    const newTeam = team.filter((_, i) => i !== index)
    const newIds = teamMemberIds.filter((_, i) => i !== index)
    onChange(newTeam, newIds)
  }

  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">Команда</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {team.map((member, idx) => (
          <span key={idx} className="px-3 py-1 bg-dark-card border border-dark-border text-xs text-white rounded flex items-center gap-2">
            {member}
            <button onClick={() => remove(idx)} className="text-gray-400 hover:text-white">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <select 
          value={selectedWorkerId} 
          onChange={(e) => setSelectedWorkerId(e.target.value)} 
          className="flex-1 px-3 py-2 bg-dark-card border border-dark-border text-white rounded"
        >
          <option value="">— выбрать участника —</option>
          {workers.map(w => (
            <option key={w.id} value={w.id}>{w.fullName}</option>
          ))}
        </select>
        <button 
          onClick={add} 
          className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded hover:bg-dark-border text-sm"
        >
          Добавить
        </button>
      </div>
    </div>
  )
}

export default ProjectTeamEditor

