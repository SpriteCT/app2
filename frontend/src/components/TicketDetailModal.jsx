import React, { useState } from 'react'
import { Ticket, MessageCircle } from 'lucide-react'
import { priorityColors, statusColorsTickets, statusColors } from '../config/colors'
import { formatDate } from '../utils/dateUtils'

const TicketDetailModal = ({ 
  ticket, 
  onClose, 
  workers = [], 
  clients = [], 
  vulnerabilities = [],
  onViewVulnerability = null,
  onSendMessage = null,
  newMessage = '',
  setNewMessage = () => {}
}) => {
  const [showClosedVulns, setShowClosedVulns] = useState(false)
  
  if (!ticket) return null

  const assignee = workers.find(w => w.id === ticket.assigneeId)
  const reporter = workers.find(w => w.id === ticket.reporterId)
  const client = clients.find(c => String(c.id) === String(ticket.clientId))

  const getVulnerabilitiesForTicket = (ticket) => {
    if (!ticket || !ticket.vulnerabilities) return []
    return ticket.vulnerabilities.filter(v => {
      if (!showClosedVulns && v.status === 'Closed') return false
      return true
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{ticket.displayId || ticket.id}</h2>
              <p className="text-sm text-gray-400">{ticket.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Приоритет</label>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  priorityColors[ticket.priority]
                } text-white`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Статус</label>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColorsTickets[ticket.status]
                } text-white`}>
                  {ticket.status}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Ответственный</label>
              <div className="mt-1 text-white">{assignee?.fullName || '—'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Автор</label>
              <div className="mt-1 text-white">{reporter?.fullName || '—'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Клиент</label>
              <div className="mt-1 text-white">{client?.name || '—'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Срок</label>
              <div className="mt-1 text-white">{ticket.dueDate || '—'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Создан</label>
              <div className="mt-1 text-white">
                {formatDate(ticket.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Изменено</label>
              <div className="mt-1 text-white">
                {formatDate(ticket.updatedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Vulnerabilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400 block">Связанные уязвимости ({getVulnerabilitiesForTicket(ticket).length})</label>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClosedVulns}
                  onChange={(e) => setShowClosedVulns(e.target.checked)}
                  className="w-4 h-4 accent-dark-purple-primary"
                />
                <span>Показывать закрытые</span>
              </label>
            </div>
            {getVulnerabilitiesForTicket(ticket).length > 0 ? (
              <div className="space-y-2">
                {getVulnerabilitiesForTicket(ticket).map((vuln) => (
                  <div 
                    key={vuln.id} 
                    className="bg-dark-card border border-dark-border rounded p-3 hover:bg-dark-card/80 cursor-pointer" 
                    onClick={() => onViewVulnerability && onViewVulnerability(vuln)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white font-medium">{vuln.displayId || vuln.id}</div>
                        <div className="text-xs text-gray-400">{vuln.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          vuln.criticality === 'Critical' ? 'bg-red-600' :
                          vuln.criticality === 'High' ? 'bg-orange-600' :
                          vuln.criticality === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        } text-white`}>
                          {vuln.criticality}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          statusColors[vuln.status] || 'bg-gray-600'
                        } text-white`}>
                          {vuln.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                {showClosedVulns ? 'Нет уязвимостей' : 'Нет открытых уязвимостей'}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Описание</label>
            <div className="text-white bg-dark-card p-3 rounded border border-dark-border">
              {ticket.description || '—'}
            </div>
          </div>

          {/* Resolution */}
          {ticket.resolution && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Решение</label>
              <div className="text-white bg-dark-card p-3 rounded border border-dark-border">
                {ticket.resolution}
              </div>
            </div>
          )}

          {/* Chat */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              История обсуждений
            </label>
            <div className="bg-dark-card border border-dark-border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
              {(ticket.chatMessages || []).map((msg) => (
                <div key={msg.id} className="pb-3 border-b border-dark-border last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{msg.author}</span>
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.message}</p>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            {onSendMessage && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onSendMessage(ticket.id)}
                  placeholder="Напишите сообщение..."
                  className="flex-1 px-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                />
                <button
                  onClick={() => onSendMessage(ticket.id)}
                  className="px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors"
                >
                  Отправить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailModal

