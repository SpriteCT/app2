import React, { useState, useMemo, useEffect } from 'react'
import { Download, FileText, Calendar, TrendingUp, Users, AlertTriangle, CheckCircle, BarChart3, Clock, Target } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { vulnerabilitiesApi, ticketsApi, assetsApi, referenceApi } from '../services/api'
import { transformVulnerability, transformTicket, transformAsset } from '../utils/dataTransform'
import GenerateReportModal from '../components/GenerateReportModal'

const ReportsPage = ({ selectedClient }) => {
  const [showReportModal, setShowReportModal] = useState(false)
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [tickets, setTickets] = useState([])
  const [assets, setAssets] = useState([])
  const [assetTypes, setAssetTypes] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Statistics calculations
  const stats = useMemo(() => {
    const totalVulns = filteredVulnerabilities.length
    const criticalVulns = filteredVulnerabilities.filter(v => v.criticality === 'Critical').length
    const openVulns = filteredVulnerabilities.filter(v => v.status === 'Open').length
    const closedVulns = filteredVulnerabilities.filter(v => v.status === 'Closed').length
    
    const activeTickets = filteredTickets.filter(t => t.status !== 'Closed').length
    const closedTickets = filteredTickets.filter(t => t.status === 'Closed').length
    const totalTickets = filteredTickets.length
    const resolvedPercentage = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0

    return {
      totalVulns,
      criticalVulns,
      openVulns,
      closedVulns,
      activeTickets,
      closedTickets,
      totalTickets,
      resolvedPercentage,
    }
  }, [filteredVulnerabilities, filteredTickets])

  // CVSS Distribution (0-10 histogram)
  const cvssDistribution = useMemo(() => {
    const buckets = [
      { range: '0.0-1.0', min: 0, max: 1, count: 0 },
      { range: '1.0-2.0', min: 1, max: 2, count: 0 },
      { range: '2.0-3.0', min: 2, max: 3, count: 0 },
      { range: '3.0-4.0', min: 3, max: 4, count: 0 },
      { range: '4.0-5.0', min: 4, max: 5, count: 0 },
      { range: '5.0-6.0', min: 5, max: 6, count: 0 },
      { range: '6.0-7.0', min: 6, max: 7, count: 0 },
      { range: '7.0-8.0', min: 7, max: 8, count: 0 },
      { range: '8.0-9.0', min: 8, max: 9, count: 0 },
      { range: '9.0-10.0', min: 9, max: 10, count: 0 },
    ]
    
    filteredVulnerabilities.forEach(v => {
      if (v.cvss !== null && v.cvss !== undefined) {
        const bucket = buckets.find(b => v.cvss >= b.min && v.cvss < b.max)
        if (bucket) bucket.count++
      }
    })
    
    return buckets.map(b => ({ name: b.range, value: b.count }))
  }, [filteredVulnerabilities])

  // Vulnerability Age Distribution (how long vulnerabilities are open)
  const vulnerabilityAgeDistribution = useMemo(() => {
    const now = new Date()
    const buckets = [
      { range: '0-7 дней', max: 7, count: 0 },
      { range: '8-30 дней', max: 30, count: 0 },
      { range: '31-90 дней', max: 90, count: 0 },
      { range: '91-180 дней', max: 180, count: 0 },
      { range: '180+ дней', max: Infinity, count: 0 },
    ]

    filteredVulnerabilities
      .filter(v => v.status === 'Open' || v.status === 'In Progress')
      .forEach(v => {
        const date = v.discovered ? new Date(v.discovered) : (v.createdAt ? new Date(v.createdAt) : null)
        if (date) {
          const days = Math.floor((now - date) / (1000 * 60 * 60 * 24))
          const bucket = buckets.find(b => days <= b.max)
          if (bucket) bucket.count++
        }
      })

    return buckets.map(b => ({ name: b.range, value: b.count }))
  }, [filteredVulnerabilities])

  // Vulnerabilities with vs without tickets
  const vulnsWithTickets = useMemo(() => {
    const vulnIdsInTickets = new Set()
    filteredTickets.forEach(t => {
      if (t.vulnerabilities) {
        t.vulnerabilities.forEach(v => vulnIdsInTickets.add(v.id))
      }
    })
    
    const withTickets = filteredVulnerabilities.filter(v => vulnIdsInTickets.has(v.id)).length
    const withoutTickets = filteredVulnerabilities.length - withTickets
    
    return [
      { name: 'С тикетами', value: withTickets, color: '#10b981' },
      { name: 'Без тикетов', value: withoutTickets, color: '#dc2626' },
    ]
  }, [filteredVulnerabilities, filteredTickets])

  // Open vulnerabilities trend (last 6 months) - based on discovered date or createdAt
  const openVulnerabilitiesTrend = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' })
      months.push({
        month: monthName,
        date: date,
        open: 0,
        fixed: 0,
      })
    }

    filteredVulnerabilities.forEach(v => {
      const discoveredDate = v.discovered ? new Date(v.discovered) : (v.createdAt ? new Date(v.createdAt) : null)
      if (!discoveredDate) return

      const monthIndex = months.findIndex(m => 
        m.date.getMonth() === discoveredDate.getMonth() && 
        m.date.getFullYear() === discoveredDate.getFullYear()
      )
      if (monthIndex >= 0) {
        months[monthIndex].open++
      }

      // Closed vulnerabilities - use updatedAt when status changed to Closed
      if (v.status === 'Closed' && v.updatedAt) {
        const closedDate = new Date(v.updatedAt)
        const closedMonthIndex = months.findIndex(m => 
          m.date.getMonth() === closedDate.getMonth() && 
          m.date.getFullYear() === closedDate.getFullYear()
        )
        if (closedMonthIndex >= 0) {
          months[closedMonthIndex].fixed++
        }
      }
    })

    return months
  }, [filteredVulnerabilities])

  // Assets by type distribution
  const assetsByType = useMemo(() => {
    const stats = {}
    filteredAssets.forEach(a => {
      if (a.typeName) {
        stats[a.typeName] = (stats[a.typeName] || 0) + 1
      } else if (a.typeId) {
        const assetType = assetTypes.find(t => t.id === a.typeId)
        const typeName = assetType ? assetType.name : `Type ${a.typeId}`
        stats[typeName] = (stats[typeName] || 0) + 1
      }
    })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredAssets, assetTypes])

  // Assets with vs without vulnerabilities
  const assetsWithVulns = useMemo(() => {
    const assetIdsWithVulns = new Set()
    filteredVulnerabilities.forEach(v => {
      if (v.assetId) {
        assetIdsWithVulns.add(v.assetId)
      }
    })
    
    const withVulns = filteredAssets.filter(a => assetIdsWithVulns.has(a.id)).length
    const withoutVulns = filteredAssets.length - withVulns
    
    return [
      { name: 'С уязвимостями', value: withVulns, color: '#dc2626' },
      { name: 'Без уязвимостей', value: withoutVulns, color: '#10b981' },
    ]
  }, [filteredAssets, filteredVulnerabilities])

  // Ticket creation and resolution trend (last 6 months)
  const ticketTrend = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('ru-RU', { month: 'short' })
      months.push({
        month: monthName,
        date: date,
        created: 0,
        fixed: 0,
        inProgress: 0,
      })
    }

    filteredTickets.forEach(t => {
      // Created tickets
      if (t.createdAt) {
        const ticketDate = new Date(t.createdAt)
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === ticketDate.getMonth() && 
          m.date.getFullYear() === ticketDate.getFullYear()
        )
        if (monthIndex >= 0) {
          months[monthIndex].created++
        }
      }

      // Closed tickets
      if (t.status === 'Closed' && t.updatedAt) {
        const closedDate = new Date(t.updatedAt)
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === closedDate.getMonth() && 
          m.date.getFullYear() === closedDate.getFullYear()
        )
        if (monthIndex >= 0) {
          months[monthIndex].fixed++
        }
      }

      // In Progress tickets
      if (t.status === 'In Progress' && t.updatedAt) {
        const progressDate = new Date(t.updatedAt)
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === progressDate.getMonth() && 
          m.date.getFullYear() === progressDate.getFullYear()
        )
        if (monthIndex >= 0) {
          months[monthIndex].inProgress++
        }
      }
    })

    return months
  }, [filteredTickets])

  // Ticket age distribution (how long tickets are open)
  const ticketAgeDistribution = useMemo(() => {
    const now = new Date()
    const buckets = [
      { range: '0-1 день', max: 1, count: 0 },
      { range: '2-7 дней', max: 7, count: 0 },
      { range: '8-30 дней', max: 30, count: 0 },
      { range: '31-90 дней', max: 90, count: 0 },
      { range: '90+ дней', max: Infinity, count: 0 },
    ]

    filteredTickets
      .filter(t => t.status === 'Open' || t.status === 'In Progress')
      .forEach(t => {
        if (t.createdAt) {
          const date = new Date(t.createdAt)
          const days = Math.floor((now - date) / (1000 * 60 * 60 * 24))
          const bucket = buckets.find(b => days <= b.max)
          if (bucket) bucket.count++
        }
      })

    return buckets.map(b => ({ name: b.range, value: b.count }))
  }, [filteredTickets])

  // Ticket resolution time statistics
  const ticketResolutionStats = useMemo(() => {
    const closedTickets = filteredTickets.filter(t => t.status === 'Closed' && t.createdAt && t.updatedAt)
    if (closedTickets.length === 0) {
      return { average: 0, median: 0, min: 0, max: 0, count: 0 }
    }

    const resolutionTimes = closedTickets.map(t => {
      const created = new Date(t.createdAt)
      const updated = new Date(t.updatedAt)
      return Math.ceil((updated - created) / (1000 * 60 * 60 * 24)) // days
    }).sort((a, b) => a - b)

    const average = Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
    const median = resolutionTimes[Math.floor(resolutionTimes.length / 2)]
    const min = resolutionTimes[0]
    const max = resolutionTimes[resolutionTimes.length - 1]

    return { average, median, min, max, count: closedTickets.length }
  }, [filteredTickets])

  // Tickets by priority and status
  const ticketsByPriority = useMemo(() => {
    return [
      { name: 'Critical', value: filteredTickets.filter(t => t.priority === 'Critical').length },
      { name: 'High', value: filteredTickets.filter(t => t.priority === 'High').length },
      { name: 'Medium', value: filteredTickets.filter(t => t.priority === 'Medium').length },
      { name: 'Low', value: filteredTickets.filter(t => t.priority === 'Low').length },
    ]
  }, [filteredTickets])

  const ticketsByStatus = useMemo(() => {
    return [
      { name: 'Open', value: filteredTickets.filter(t => t.status === 'Open').length, color: '#9333ea' },
      { name: 'In Progress', value: filteredTickets.filter(t => t.status === 'In Progress').length, color: '#2563eb' },
      { name: 'Closed', value: filteredTickets.filter(t => t.status === 'Closed').length, color: '#16a34a' },
    ]
  }, [filteredTickets])

  // Top problematic assets
  const topProblematicAssets = useMemo(() => {
    const stats = {}
    filteredVulnerabilities.forEach(v => {
      if (v.assetId) {
        stats[v.assetId] = (stats[v.assetId] || 0) + 1
      }
    })
    return Object.entries(stats)
      .map(([assetId, count]) => {
        const asset = filteredAssets.find(a => a.id === parseInt(assetId))
        return {
          name: asset ? asset.name : `Asset ${assetId}`,
          value: count,
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredVulnerabilities, filteredAssets])

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#2563eb', '#8b5cf6', '#10b981']

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
          <div className="flex gap-3">
            <button 
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Сформировать отчёт
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span className="text-3xl font-bold text-red-400">{stats.totalVulns}</span>
            </div>
            <div className="text-sm text-gray-400">Всего уязвимостей</div>
            <div className="text-xs text-gray-500 mt-1">{stats.criticalVulns} критических, {stats.openVulns} открытых</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-purple-400" />
              <span className="text-3xl font-bold text-purple-400">{stats.activeTickets}</span>
            </div>
            <div className="text-sm text-gray-400">Активных тикетов</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="text-3xl font-bold text-blue-400">{ticketResolutionStats.average} дней</span>
            </div>
            <div className="text-sm text-gray-400">Среднее время решения</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-green-400" />
              <span className="text-3xl font-bold text-green-400">{stats.resolvedPercentage}%</span>
            </div>
            <div className="text-sm text-gray-400">Тикетов решено</div>
            <div className="text-xs text-gray-500 mt-1">{stats.fixedTickets} из {stats.totalTickets}</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 - Tickets Focus */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Ticket Trend */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Динамика тикетов (по месяцам)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="created" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Создано" />
              <Area type="monotone" dataKey="fixed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Закрыто" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Priority */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Тикеты по приоритету</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ticketsByPriority}>
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

      {/* Charts Row 2 - Tickets Age and Status */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Ticket Age Distribution */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Возраст открытых тикетов</h3>
          <ResponsiveContainer width="100%" height={300}>
            {ticketAgeDistribution.some(b => b.value > 0) ? (
              <BarChart data={ticketAgeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Нет открытых тикетов
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Tickets by Status */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Тикеты по статусам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        </div>

      {/* Charts Row 3 - Vulnerabilities */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* CVSS Distribution */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Распределение уязвимостей по CVSS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cvssDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vulnerabilities with vs without tickets */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Уязвимости: с тикетами и без</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vulnsWithTickets}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {vulnsWithTickets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 4 - More Vulnerabilities */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Open Vulnerabilities Trend */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Динамика открытых/исправленных уязвимостей</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={openVulnerabilitiesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1f3f', border: '1px solid #252a50', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="open" stroke="#dc2626" strokeWidth={2} name="Открыто" />
              <Line type="monotone" dataKey="fixed" stroke="#10b981" strokeWidth={2} name="Исправлено" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 5 - Additional Analytics */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Assets by Type */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Распределение активов по типам</h3>
          <ResponsiveContainer width="100%" height={300}>
            {assetsByType.length > 0 ? (
              <PieChart>
                <Pie
                  data={assetsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Нет данных
        </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={(reportData) => {
          // Здесь можно добавить логику генерации отчета
        }}
      />
    </div>
  )
}

export default ReportsPage
