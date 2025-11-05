import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut } from 'lucide-react'

const UserProfileMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Закрывать меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Получаем инициалы для аватара
  const getInitials = (fullName) => {
    if (!fullName) return 'U'
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return fullName.substring(0, 2).toUpperCase()
  }

  const userDisplayName = user?.fullName || 'Пользователь'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-purple-primary hover:bg-dark-purple-secondary text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-dark-purple-primary focus:ring-offset-2 focus:ring-offset-dark-bg"
        title={userDisplayName}
      >
        {getInitials(userDisplayName)}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-purple-primary text-white font-medium">
                {getInitials(userDisplayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{userDisplayName}</div>
                {user?.email && (
                  <div className="text-sm text-gray-400 truncate">{user.email}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout()
                }
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-400 hover:bg-dark-card rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileMenu

