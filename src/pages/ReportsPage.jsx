import React, { useState, useMemo } from 'react'
import { Download, FileText, Calendar, TrendingUp, Users, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { mockVulnerabilities } from '../data/mockVulnerabilities'
import { mockTickets } from '../data/mockTickets'
import { mockAssets } from '../data/mockAssets'
import { mockProjects } from '../data/mockProjects'

const ReportsPage = ({ selectedClient }) => {
  const [reportType, setReportType] = useState('weekly')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportClient, setReportClient] = useState('client-all')

  // Statistics calculations
  const vulnerabilitiesData = useMemo(() => {
    const filtered = reportClient === 'client-all' 
      ? mockVulnerabilities 
      : mockVulnerabilities.filter(v => v.client === reportClient)
    
    const data = [
      { name: 'Critical', value: filtered.filter(v => v.criticality === 'Critical').length, color: '#dc2626' },
      { name: 'High', value: filtered.filter(v => v.criticality === 'High').length, color: '#ea580c' },
      { name: 'Medium', value: filtered.filter(v => v.criticality === 'Medium').length, color: '#ca8a04' },
      { name: 'Low', value: filtered.filter(v => v.criticality === 'Low').length, color: '#2563eb' },
    ]
    return data
  }, [reportClient])

  const ticketsByPriority = useMemo(() => {
    const filtered = reportClient === 'client-all' 
      ? mockTickets 
      : mockTickets.filter(t => t.client === reportClient)
    
    return [
      { name: 'Critical', value: filtered.filter(t => t.priority === 'Critical').length },
      { name: 'High', value: filtered.filter(t => t.priority === 'High').length },
      { name: 'Medium', value: filtered.filter(t => t.priority === 'Medium').length },
      { name: 'Low', value: filtered.filter(t => t.priority === 'Low').length },
    ]
  }, [reportClient])

  const ticketsByStatus = useMemo(() => {
    const filtered = reportClient === 'client-all' 
      ? mockTickets 
      : mockTickets.filter(t => t.client === reportClient)
    
    return [
      { name: 'Open', value: filtered.filter(t => t.status === 'Open').length, color: '#9333ea' },
      { name: 'In Progress', value: filtered.filter(t => t.status === 'In Progress').length, color: '#2563eb' },
      { name: 'Fixed', value: filtered.filter(t => t.status === 'Fixed').length, color: '#16a34a' },
      { name: 'Verified', value: filtered.filter(t => t.status === 'Verified').length, color: '#0891b2' },
    ]
  }, [reportClient])

  const assetsByStatus = useMemo(() => {
    return [
      { name: 'В эксплуатации', value: mockAssets.filter(a => a.status === 'В эксплуатации').length },
      { name: 'Недоступен', value: mockAssets.filter(a => a.status === 'Недоступен').length },
      { name: 'Выведен из эксп.', value: mockAssets.filter(a => a.status === 'Выведен из эксплуатации').length },
    ]
  }, [])

  const vulnerabilityTrend = useMemo(() => {
    return [
      { month: 'Янв', critical: 3, high: 2, medium: 1, low: 1 },
      { month: 'Фев', critical: 2, high: 1, medium: 2, low: 0 },
      { month: 'Мар', critical: 1, high: 3, medium: 1, low: 1 },
      { month: 'Апр', critical: 0, high: 2, medium: 3, low: 0 },
    ]
  }, [])

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#2563eb']

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Отчёты и аналитика</h1>
            <p className="text-gray-400">Дашборды, статистика и автоматическая генерация отчётов</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Сформировать отчёт
            </button>
            <button 
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Экспорт данных
            </button>
          </div>
        </div>

        {/* Client Filter */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Клиент:</label>
            <select
              value={reportClient}
              onChange={(e) => setReportClient(e.target.value)}
              className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
            >
              <option value="client-all">Все клиенты</option>
              <option value="client-a">ТехноСервис</option>
              <option value="client-b">ФинансХост</option>
              <option value="client-c">МедиаДиджитал</option>
              <option value="client-d">Козлов</option>
              <option value="client-e">РозницаПро</option>
              <option value="client-f">ВолковГрупп</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span className="text-3xl font-bold text-red-400">{mockVulnerabilities.length}</span>
            </div>
            <div className="text-sm text-gray-400">Всего уязвимостей</div>
            <div className="text-xs text-gray-500 mt-1">{mockVulnerabilities.filter(v => v.criticality === 'Critical').length} критических</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-purple-400" />
              <span className="text-3xl font-bold text-purple-400">{mockTickets.length}</span>
            </div>
            <div className="text-sm text-gray-400">Активных тикетов</div>
            <div className="text-xs text-gray-500 mt-1">{mockTickets.filter(t => t.status === 'Fixed').length} решено</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span className="text-3xl font-bold text-blue-400">{mockAssets.length}</span>
            </div>
            <div className="text-sm text-gray-400">Активов в базе</div>
            <div className="text-xs text-gray-500 mt-1">{mockAssets.filter(a => a.status === 'В эксплуатации').length} в эксп.</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-3xl font-bold text-green-400">72%</span>
            </div>
            <div className="text-sm text-gray-400">Уязвимостей устранено</div>
            <div className="text-xs text-gray-500 mt-1">За последний месяц</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Vulnerabilities by Criticality */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Уязвимости по критичности</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={vulnerabilitiesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vulnerabilitiesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Status */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Тикеты по статусам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ticketsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Vulnerability Trend */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Динамика уязвимостей</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={vulnerabilityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} name="Critical" />
              <Line type="monotone" dataKey="high" stroke="#ea580c" strokeWidth={2} name="High" />
              <Line type="monotone" dataKey="medium" stroke="#ca8a04" strokeWidth={2} name="Medium" />
              <Line type="monotone" dataKey="low" stroke="#2563eb" strokeWidth={2} name="Low" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Assets Distribution */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Распределение активов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={assetsByStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Шаблоны отчётов</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-dark-purple-primary transition-colors cursor-pointer">
            <FileText className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="text-white font-medium mb-1">Еженедельный отчёт</h4>
            <p className="text-sm text-gray-400 mb-3">Статистика за неделю</p>
            <button className="text-sm text-dark-purple-primary hover:text-dark-purple-secondary">
              Сформировать →
            </button>
          </div>
          
          <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-dark-purple-primary transition-colors cursor-pointer">
            <FileText className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="text-white font-medium mb-1">Ежемесячный отчёт</h4>
            <p className="text-sm text-gray-400 mb-3">Полная статистика за месяц</p>
            <button className="text-sm text-dark-purple-primary hover:text-dark-purple-secondary">
              Сформировать →
            </button>
          </div>
          
          <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-dark-purple-primary transition-colors cursor-pointer">
            <FileText className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="text-white font-medium mb-1">Отчёт для клиента</h4>
            <p className="text-sm text-gray-400 mb-3">Итоговый отчёт по проекту</p>
            <button className="text-sm text-dark-purple-primary hover:text-dark-purple-secondary">
              Сформировать →
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-2xl w-full">
            <div className="border-b border-dark-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Сформировать отчёт</h2>
              <button
                onClick={() => setShowReportModal(false)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата начала</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Дата окончания</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Формат</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">
                    PDF
                  </button>
                  <button className="flex-1 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">
                    Excel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors">
                    Word
                  </button>
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ Отчёт будет сгенерирован автоматически и отправлен на email
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  Сформировать отчёт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage

