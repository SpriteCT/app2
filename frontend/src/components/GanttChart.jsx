import React from 'react'

// Примитивная диаграмма Ганта без зависимостей
const GanttChart = ({ tasks, startDate, endDate }) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalMs = Math.max(1, end - start)

  const daysBetween = Math.ceil(totalMs / (1000 * 60 * 60 * 24))
  const ticks = Math.min(12, daysBetween) // до 12 делений для читаемости

  const formatTick = (i) => {
    const d = new Date(start.getTime() + (totalMs * i) / ticks)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }
  
  // Текущая дата для отображения на шкале
  const now = new Date()
  const nowInRange = now >= start && now <= end
  const nowPosition = nowInRange ? ((now - start) / totalMs) * 100 : null

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 overflow-x-auto">
      {/* Заголовок шкалы */}
      <div className="grid" style={{ gridTemplateColumns: `200px 1fr` }}>
        <div></div>
        <div className="relative">
          <div className="flex justify-between text-[10px] text-gray-400">
            {Array.from({ length: ticks + 1 }).map((_, i) => (
              <span key={i}>{formatTick(i)}</span>
            ))}
          </div>
          <div className="absolute left-0 right-0 top-4 h-px bg-dark-border" />
          {/* Текущая дата */}
          {nowPosition !== null && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${nowPosition}%` }}
              title={`Сегодня: ${now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Задачи */}
      <div className="space-y-2 mt-6">
        {tasks.map(task => {
          const s = new Date(task.startDate)
          const e = new Date(task.endDate)
          const left = clamp(((s - start) / totalMs) * 100, 0, 100)
          const width = clamp(((e - s) / totalMs) * 100, 0.5, 100 - left)
          return (
            <div key={task.id} className="grid items-center" style={{ gridTemplateColumns: `200px 1fr` }}>
              <div className="text-xs text-white pr-3 truncate">{task.name}</div>
              <div className="relative h-6 bg-dark-surface border border-dark-border rounded">
                <div
                  className="absolute h-full bg-dark-purple-primary/70 rounded"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${task.startDate} — ${task.endDate}`}
                />
                {/* Текущая дата на задаче */}
                {nowPosition !== null && (
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${nowPosition}%` }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GanttChart

