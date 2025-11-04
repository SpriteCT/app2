import React, { useState } from 'react'

const GenerateReportModal = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [reportType, setReportType] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleGenerate = () => {
    onGenerate({
      type: reportType,
      startDate: reportType === 'client' ? startDate : null,
      endDate: reportType === 'client' ? endDate : null
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
        <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Сформировать отчёт</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Тип отчёта</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              <option value="weekly">Еженедельный</option>
              <option value="monthly">Ежемесячный</option>
              <option value="quarterly">Ежеквартальный</option>
              <option value="client">Отчёт для клиента</option>
            </select>
          </div>

          {reportType === 'client' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Дата начала</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Дата окончания</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                />
              </div>
            </div>
          )}

          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              ℹ️ Отчёт будет сгенерирован автоматически и отправлен на email
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
            >
              Сформировать отчёт
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateReportModal

