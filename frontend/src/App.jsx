import React, { useState, useEffect } from 'react'
import { Shield, Ticket, Building2, ChevronDown, Server, Users, BarChart } from 'lucide-react'
import VulnerabilitiesPage from './pages/VulnerabilitiesPage'
import TicketsPage from './pages/TicketsPage'
import AssetsPage from './pages/AssetsPage'
import ClientsPage from './pages/ClientsPage'
import ReportsPage from './pages/ReportsPage'
import { clientsApi } from './services/api'
import { transformClient } from './utils/dataTransform'

function App() {
  const [activePage, setActivePage] = useState('vulnerabilities')
  const [selectedClient, setSelectedClient] = useState('client-all')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [clients, setClients] = useState([])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await clientsApi.getAll()
        setClients(clientsData.map(transformClient))
      } catch (error) {
        console.error('Failed to load clients:', error)
      }
    }
    loadClients()
  }, [])

  const currentClient = selectedClient === 'client-all' 
    ? { name: 'Все клиенты', shortName: 'Все', id: 'client-all' }
    : clients.find(c => c.id === selectedClient) || { name: 'Все клиенты', shortName: 'Все', id: 'client-all' }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-white">Security Management</h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActivePage('vulnerabilities')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activePage === 'vulnerabilities'
                      ? 'bg-dark-purple-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Уязвимости
                </button>
                <button
                  onClick={() => setActivePage('tickets')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activePage === 'tickets'
                      ? 'bg-dark-purple-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  Тикеты
                </button>
                <button
                  onClick={() => setActivePage('assets')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activePage === 'assets'
                      ? 'bg-dark-purple-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <Server className="w-4 h-4" />
                  Активы
                </button>
                <button
                  onClick={() => setActivePage('clients')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activePage === 'clients'
                      ? 'bg-dark-purple-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Клиенты
                </button>
                <button
                  onClick={() => setActivePage('reports')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activePage === 'reports'
                      ? 'bg-dark-purple-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  <BarChart className="w-4 h-4" />
                  Отчёты
                </button>
              </div>
            </div>
            
            {/* Client Selector */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:bg-dark-border transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{currentClient.shortName || currentClient.name || 'Все'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showClientDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowClientDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                      <button
                        key="client-all"
                        onClick={() => {
                          setSelectedClient('client-all')
                          setShowClientDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-dark-card transition-colors ${
                          selectedClient === 'client-all' ? 'bg-dark-card' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Все</div>
                            <div className="text-xs text-gray-400">Все клиенты</div>
                          </div>
                          {selectedClient === 'client-all' && (
                            <span className="text-dark-purple-primary">✓</span>
                          )}
                        </div>
                      </button>
                      {clients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client.id)
                            setShowClientDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-dark-card transition-colors ${
                            selectedClient === client.id ? 'bg-dark-card' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium">{client.shortName}</div>
                              {!client.isDefault && (
                                <div className="text-xs text-gray-400">{client.name}</div>
                              )}
                            </div>
                            {selectedClient === client.id && (
                              <span className="text-dark-purple-primary">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-full mx-auto px-6 py-6">
        {activePage === 'vulnerabilities' && <VulnerabilitiesPage selectedClient={selectedClient} />}
        {activePage === 'tickets' && <TicketsPage selectedClient={selectedClient} />}
        {activePage === 'assets' && <AssetsPage selectedClient={selectedClient} />}
        {activePage === 'clients' && <ClientsPage />}
        {activePage === 'reports' && <ReportsPage selectedClient={selectedClient} />}
      </div>
    </div>
  )
}

export default App

