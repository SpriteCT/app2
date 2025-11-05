import React, { useState, useMemo, useEffect } from 'react'
import { Download, FileText, Calendar, TrendingUp, Users, AlertTriangle, CheckCircle, BarChart3, Clock, Target, Search, Filter, Shield, TrendingDown } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { vulnerabilitiesApi, ticketsApi, assetsApi, referenceApi } from '../services/api'
import { transformVulnerability, transformTicket, transformAsset } from '../utils/dataTransform'
import { formatDate } from '../utils/dateUtils'
const ReportsPage = ({ selectedClient }) => {
  const [activeTab, setActiveTab] = useState('weekly')
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [tickets, setTickets] = useState([])
  const [assets, setAssets] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Date range for weekly reports
  // Initialize date range using local timezone
  const getLocalDateString = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return {
      start: getLocalDateString(weekAgo),
      end: getLocalDateString(now)
    }
  })
  
  // Chart type for daily breakdown
  const [chartType, setChartType] = useState('area')

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [vulnsData, ticketsData, assetsData, assetTypesData] = await Promise.all([
          vulnerabilitiesApi.getAll(),
          ticketsApi.getAll(),
          assetsApi.getAll(),
          referenceApi.getAssetTypes(),
        ])
        setVulnerabilities(vulnsData.map(transformVulnerability))
        setTickets(ticketsData.map(transformTicket))
        setAssets(assetsData.map(transformAsset))
        setAssetTypes(assetTypesData || [])
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter data by selected client
  const filteredVulnerabilities = useMemo(() => {
    if (selectedClient === 'client-all') return vulnerabilities
    return vulnerabilities.filter(v => v.clientId === selectedClient)
  }, [vulnerabilities, selectedClient])

  const filteredTickets = useMemo(() => {
    if (selectedClient === 'client-all') return tickets
    return tickets.filter(t => t.clientId === selectedClient)
  }, [tickets, selectedClient])

  const filteredAssets = useMemo(() => {
    if (selectedClient === 'client-all') return assets
    return assets.filter(a => a.clientId === selectedClient)
  }, [assets, selectedClient])

  // Filter by date range - using local timezone
  const filterByDateRange = (items, dateField) => {
    // Parse dates as local dates (YYYY-MM-DD format)
    const startDateStr = dateRange.start
    const endDateStr = dateRange.end
    
    if (!startDateStr || !endDateStr) return items
    
    // Create dates in local timezone (midnight local time)
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
    const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
    
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
    const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
    
    return items.filter(item => {
      if (!item[dateField]) return false
      
      // Parse item date - if it's a date-only string, treat as local midnight
      // If it's a datetime string, convert to local time
      const itemDateStr = item[dateField]
      let itemDate
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(itemDateStr)) {
        // Date-only string (YYYY-MM-DD) - treat as local midnight
        const [year, month, day] = itemDateStr.split('-').map(Number)
        itemDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      } else {
        // Datetime string - convert to local time
        itemDate = new Date(itemDateStr)
      }
      
      if (isNaN(itemDate.getTime())) return false
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  // Weekly metrics - filtered by date range
  const weeklyMetrics = useMemo(() => {
    const rangeVulns = filterByDateRange(filteredVulnerabilities, 'discovered')
    
    const newVulns = rangeVulns.length
    const closedVulns = rangeVulns.filter(v => v.status === 'Closed').length
    const criticalVulns = rangeVulns.filter(v => v.criticality === 'Critical').length
    const highVulns = rangeVulns.filter(v => v.criticality === 'High').length
    const inProgressVulns = rangeVulns.filter(v => v.status === 'In Progress').length
    
    // Average CVSS score for vulnerabilities in range
    const avgCVSS = (() => {
      const vulnsWithCVSS = rangeVulns.filter(v => v.cvss && v.cvss > 0)
      if (vulnsWithCVSS.length === 0) return 0
      const sum = vulnsWithCVSS.reduce((sum, v) => sum + (v.cvss || 0), 0)
      return (sum / vulnsWithCVSS.length).toFixed(1)
    })()

    return {
      newVulns,
      closedVulns,
      criticalVulns,
      highVulns,
      inProgressVulns,
      avgCVSS,
      rangeVulns
    }
  }, [filteredVulnerabilities, dateRange])

  // Daily breakdown for the selected range - using local timezone
  const dailyBreakdown = useMemo(() => {
    const startDateStr = dateRange.start
    const endDateStr = dateRange.end
    
    if (!startDateStr || !endDateStr) return []
    
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
    
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
    
    const days = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = getLocalDateString(d)
      days.push({
        date: dayStr,
        label: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        vulns: 0,
        closedVulns: 0
      })
    }

    // Process vulnerabilities - convert to local date
    weeklyMetrics.rangeVulns.forEach(v => {
      if (!v.discovered) return
      
      let vulnDateStr
      if (/^\d{4}-\d{2}-\d{2}$/.test(v.discovered)) {
        vulnDateStr = v.discovered
      } else {
        const vulnDate = new Date(v.discovered)
        if (!isNaN(vulnDate.getTime())) {
          vulnDateStr = getLocalDateString(vulnDate)
        }
      }
      
      if (vulnDateStr) {
        const day = days.find(d => d.date === vulnDateStr)
        if (day) {
          day.vulns++
          if (v.status === 'Closed') day.closedVulns++
        }
      }
    })

    return days
  }, [weeklyMetrics, dateRange])

  // Asset Control Analytics
  const assetControl = useMemo(() => {
    const byAsset = {}
    filteredVulnerabilities.forEach(v => {
      const assetName = v.assetName || 'Не назначен'
      if (!byAsset[assetName]) {
        byAsset[assetName] = { total: 0, open: 0, closed: 0, critical: 0 }
      }
      byAsset[assetName].total++
      if (v.status === 'Open') byAsset[assetName].open++
      if (v.status === 'Closed') byAsset[assetName].closed++
      if (v.criticality === 'Critical') byAsset[assetName].critical++
    })

    return Object.entries(byAsset).map(([name, stats]) => ({
      name,
      ...stats,
      openRate: stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0,
      criticalRate: stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0
    })).sort((a, b) => b.total - a.total)
  }, [filteredVulnerabilities])

  // Asset Statistics
  const assetStatistics = useMemo(() => {
    const assetStats = filteredAssets.map(asset => {
      const vulns = filteredVulnerabilities.filter(v => v.assetId === asset.id)
      return {
        id: asset.id,
        name: asset.name,
        type: asset.typeName || asset.type || 'Неизвестно',
        total: vulns.length,
        open: vulns.filter(v => v.status === 'Open').length,
        inProgress: vulns.filter(v => v.status === 'In Progress').length,
        closed: vulns.filter(v => v.status === 'Closed').length,
        critical: vulns.filter(v => v.criticality === 'Critical').length,
        high: vulns.filter(v => v.criticality === 'High').length,
        avgCVSS: vulns.length > 0
          ? (vulns.reduce((sum, v) => sum + (v.cvss || 0), 0) / vulns.length).toFixed(2)
          : 0,
        status: asset.statusName || asset.status || 'Неизвестно'
      }
    }).filter(a => a.total > 0).sort((a, b) => b.total - a.total)

    const totalVulns = filteredVulnerabilities.length
    const assetDistribution = assetStats.map(a => ({
      name: a.name,
      value: a.total,
      percentage: totalVulns > 0 ? Math.round((a.total / totalVulns) * 100) : 0
    }))

    return {
      assetStats,
      assetDistribution,
      totalAssets: assetStats.length,
      totalVulns
    }
  }, [filteredVulnerabilities, filteredAssets])

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#2563eb', '#8b5cf6', '#10b981', '#06b6d4', '#f59e0b']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Отчёты и аналитика</h1>
            <p className="text-gray-400">Дашборды, статистика и автоматическая генерация отчётов</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-dark-border mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'border-dark-purple-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Показатели за период
          </button>
          <button
            onClick={() => setActiveTab('source-stats')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'source-stats'
                ? 'border-dark-purple-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Статистика активов
          </button>
          <button
            onClick={() => setActiveTab('risk-analysis')}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'risk-analysis'
                ? 'border-dark-purple-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Анализ рисков
          </button>
        </div>
      </div>

      {/* Weekly Metrics Tab */}
      {activeTab === 'weekly' && (
        <div>
          {/* Date Range Selector */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-white font-medium">Период:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const end = new Date()
                      const start = new Date()
                      start.setDate(start.getDate() - 7)
                      setDateRange({
                        start: getLocalDateString(start),
                        end: getLocalDateString(end)
                      })
                    }}
                    className="px-3 py-1 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors text-sm"
                  >
                    За неделю
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date()
                      const start = new Date()
                      start.setMonth(start.getMonth() - 1)
                      setDateRange({
                        start: getLocalDateString(start),
                        end: getLocalDateString(end)
                      })
                    }}
                    className="px-3 py-1 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors text-sm"
                  >
                    За месяц
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date()
                      const start = new Date()
                      start.setMonth(start.getMonth() - 3)
                      setDateRange({
                        start: getLocalDateString(start),
                        end: getLocalDateString(end)
                      })
                    }}
                    className="px-3 py-1 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors text-sm"
                  >
                    За квартал
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date()
                      const start = new Date()
                      start.setFullYear(start.getFullYear() - 1)
                      setDateRange({
                        start: getLocalDateString(start),
                        end: getLocalDateString(end)
                      })
                    }}
                    className="px-3 py-1 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors text-sm"
                  >
                    За год
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span className="text-3xl font-bold text-red-400">{weeklyMetrics.newVulns}</span>
              </div>
              <div className="text-sm text-gray-400">Новых уязвимостей</div>
              <div className="text-xs text-gray-500 mt-1">{weeklyMetrics.criticalVulns} критических</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-3xl font-bold text-green-400">{weeklyMetrics.closedVulns}</span>
              </div>
              <div className="text-sm text-gray-400">Закрыто уязвимостей</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <span className="text-3xl font-bold text-orange-400">{weeklyMetrics.highVulns}</span>
              </div>
              <div className="text-sm text-gray-400">Высоких уязвимостей</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-6 h-6 text-blue-400" />
                <span className="text-3xl font-bold text-blue-400">{weeklyMetrics.avgCVSS}</span>
              </div>
              <div className="text-sm text-gray-400">Средний CVSS</div>
              <div className="text-xs text-gray-500 mt-1">{weeklyMetrics.inProgressVulns} в работе</div>
            </div>
          </div>

          {/* Daily Breakdown Chart */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Ежедневная динамика</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Тип графика:</span>
                <select 
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="px-3 py-1 bg-dark-card border border-dark-border text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                >
                  <option value="area">Область</option>
                  <option value="line">Линия</option>
                  <option value="bar">Столбцы</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              {chartType === 'area' ? (
              <AreaChart data={dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="vulns" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} name="Новые уязвимости" />
                <Area type="monotone" dataKey="closedVulns" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Закрытые уязвимости" />
              </AreaChart>
              ) : chartType === 'line' ? (
              <LineChart data={dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="vulns" stroke="#dc2626" strokeWidth={2} name="Новые уязвимости" />
                <Line type="monotone" dataKey="closedVulns" stroke="#10b981" strokeWidth={2} name="Закрытые уязвимости" />
              </LineChart>
              ) : (
              <BarChart data={dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="vulns" fill="#dc2626" name="Новые уязвимости" />
                <Bar dataKey="closedVulns" fill="#10b981" name="Закрытые уязвимости" />
              </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Download Report Button */}
          <div className="flex justify-end mt-6">
            <button 
              onClick={() => {/* Download logic */}}
              className="px-6 py-3 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Скачать отчет
            </button>
          </div>
        </div>
      )}

      {/* Asset Statistics Tab */}
      {activeTab === 'source-stats' && (
        <div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Asset Distribution */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Распределение по активам</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={assetStatistics.assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => percentage > 5 ? `${name}: ${percentage}%` : ''}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetStatistics.assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Stats Bar Chart */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Статистика по активам</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={assetStatistics.assetStats.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="open" stackId="a" fill="#dc2626" name="Открыто" />
                  <Bar dataKey="inProgress" stackId="a" fill="#2563eb" name="В работе" />
                  <Bar dataKey="closed" stackId="a" fill="#10b981" name="Закрыто" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Control Table */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Контроль активов</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4 text-gray-400">Актив</th>
                    <th className="text-right py-3 px-4 text-gray-400">Всего уязвимостей</th>
                    <th className="text-right py-3 px-4 text-gray-400">Открыто</th>
                    <th className="text-right py-3 px-4 text-gray-400">Закрыто</th>
                    <th className="text-right py-3 px-4 text-gray-400">Критичных</th>
                    <th className="text-right py-3 px-4 text-gray-400">% Открытых</th>
                    <th className="text-right py-3 px-4 text-gray-400">% Критичных</th>
                  </tr>
                </thead>
                <tbody>
                  {assetControl.map((asset, index) => (
                    <tr key={index} className="border-b border-dark-border hover:bg-dark-card">
                      <td className="py-3 px-4 text-white font-medium">{asset.name}</td>
                      <td className="py-3 px-4 text-right text-white">{asset.total}</td>
                      <td className="py-3 px-4 text-right text-red-400">{asset.open}</td>
                      <td className="py-3 px-4 text-right text-green-400">{asset.closed}</td>
                      <td className="py-3 px-4 text-right text-orange-400">{asset.critical}</td>
                      <td className="py-3 px-4 text-right text-gray-400">{asset.openRate}%</td>
                      <td className="py-3 px-4 text-right text-gray-400">{asset.criticalRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Report Button */}
          <div className="flex justify-end mt-6">
            <button 
              onClick={() => {/* Download logic */}}
              className="px-6 py-3 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Скачать отчет
            </button>
          </div>
        </div>
      )}

      {/* Risk Analysis Tab */}
      {activeTab === 'risk-analysis' && (() => {
        // Check if client is selected
        if (!selectedClient || selectedClient === 'client-all') {
          return (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Выберите клиента</h3>
              <p className="text-gray-400">Для отображения анализа рисков необходимо выбрать клиента</p>
            </div>
          )
        }

        // Calculate risk score (0-100, lower is better)
        const totalVulns = filteredVulnerabilities.length
        const criticalVulns = filteredVulnerabilities.filter(v => v.criticality === 'Critical').length
        const highVulns = filteredVulnerabilities.filter(v => v.criticality === 'High').length
        const openVulns = filteredVulnerabilities.filter(v => v.status === 'Open').length
        const avgCVSS = filteredVulnerabilities.length > 0
          ? filteredVulnerabilities.reduce((sum, v) => sum + (v.cvss || 0), 0) / filteredVulnerabilities.length
          : 0
        
        // Risk score calculation (simplified)
        const riskScore = Math.min(100, Math.round(
          (criticalVulns * 10 + highVulns * 5 + (openVulns / totalVulns) * 50 + (avgCVSS / 10) * 30)
        ))
        const riskLevel = riskScore >= 70 ? 'Критический' : riskScore >= 50 ? 'Высокий' : riskScore >= 30 ? 'Средний' : 'Низкий'
        const riskColor = riskScore >= 70 ? 'text-red-400' : riskScore >= 50 ? 'text-orange-400' : riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'

        // Top vulnerabilities by CVSS
        const topVulns = [...filteredVulnerabilities]
          .filter(v => v.cvss && v.status !== 'Closed')
          .sort((a, b) => (b.cvss || 0) - (a.cvss || 0))
          .slice(0, 10)

        // Vulnerability age analysis
        const vulnAgeGroups = {
          '0-7 дней': 0,
          '8-30 дней': 0,
          '31-90 дней': 0,
          '90+ дней': 0
        }
        filteredVulnerabilities
          .filter(v => v.status === 'Open' && v.discovered)
          .forEach(v => {
            const days = Math.floor((new Date() - new Date(v.discovered)) / (1000 * 60 * 60 * 24))
            if (days <= 7) vulnAgeGroups['0-7 дней']++
            else if (days <= 30) vulnAgeGroups['8-30 дней']++
            else if (days <= 90) vulnAgeGroups['31-90 дней']++
            else vulnAgeGroups['90+ дней']++
          })

        // Criticality distribution
        const criticalityDist = {
          Critical: filteredVulnerabilities.filter(v => v.criticality === 'Critical' && v.status !== 'Closed').length,
          High: filteredVulnerabilities.filter(v => v.criticality === 'High' && v.status !== 'Closed').length,
          Medium: filteredVulnerabilities.filter(v => v.criticality === 'Medium' && v.status !== 'Closed').length,
          Low: filteredVulnerabilities.filter(v => v.criticality === 'Low' && v.status !== 'Closed').length,
        }

        return (
          <div>
            {/* Risk Score Card */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className={`rounded-lg p-6 col-span-2 ${
                riskScore >= 70 
                  ? 'bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30'
                  : riskScore >= 50
                  ? 'bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30'
                  : riskScore >= 30
                  ? 'bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30'
                  : 'bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Shield className={`w-8 h-8 ${riskColor}`} />
                  <div className="text-right">
                    <div className={`text-5xl font-bold ${riskColor}`}>{riskScore}</div>
                    <div className="text-sm text-gray-400">Индекс риска</div>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${riskColor} mt-2`}>{riskLevel} уровень риска</div>
              </div>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
                <div className="text-3xl font-bold text-red-400 mb-1">{criticalVulns}</div>
                <div className="text-sm text-gray-400">Критических уязвимостей</div>
              </div>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-400 mb-1">{highVulns}</div>
                <div className="text-sm text-gray-400">Высоких уязвимостей</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Criticality Distribution */}
              <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Распределение по критичности</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(criticalityDist).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Vulnerability Age */}
              <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Возраст открытых уязвимостей</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(vulnAgeGroups).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(vulnAgeGroups).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Vulnerabilities */}
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Топ уязвимостей по CVSS</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-4 text-gray-400">ID</th>
                      <th className="text-left py-3 px-4 text-gray-400">Название</th>
                      <th className="text-left py-3 px-4 text-gray-400">Критичность</th>
                      <th className="text-right py-3 px-4 text-gray-400">CVSS</th>
                      <th className="text-right py-3 px-4 text-gray-400">CVE</th>
                      <th className="text-right py-3 px-4 text-gray-400">Обнаружена</th>
                      <th className="text-left py-3 px-4 text-gray-400">Актив</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVulns.map((vuln) => (
                      <tr key={vuln.id} className="border-b border-dark-border hover:bg-dark-card">
                        <td className="py-3 px-4 text-dark-purple-secondary font-medium">{vuln.displayId || vuln.id}</td>
                        <td className="py-3 px-4 text-white">{vuln.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            vuln.criticality === 'Critical' ? 'bg-red-600/30 text-red-400' :
                            vuln.criticality === 'High' ? 'bg-orange-600/30 text-orange-400' :
                            vuln.criticality === 'Medium' ? 'bg-yellow-600/30 text-yellow-400' :
                            'bg-blue-600/30 text-blue-400'
                          }`}>
                            {vuln.criticality}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${
                            (vuln.cvss || 0) >= 9 ? 'text-red-400' :
                            (vuln.cvss || 0) >= 7 ? 'text-orange-400' :
                            (vuln.cvss || 0) >= 4 ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {vuln.cvss?.toFixed(1) || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400">{vuln.cve || '—'}</td>
                        <td className="py-3 px-4 text-right text-gray-400">
                          {formatDate(vuln.discovered)}
                        </td>
                        <td className="py-3 px-4 text-gray-400">{vuln.assetName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download Report Button */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => {/* Download logic */}}
                className="px-6 py-3 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Скачать отчет
              </button>
            </div>
          </div>
        )
      })()}

    </div>
  )
}

export default ReportsPage
