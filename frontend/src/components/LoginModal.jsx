import React, { useState } from 'react'
import { User, Lock, AlertCircle } from 'lucide-react'

const LoginModal = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля')
      return
    }

    setIsLoading(true)
    try {
      await onLogin(username.trim(), password)
      // onLogin успешно выполнен, ошибок нет
    } catch (err) {
      setError(err.message || 'Ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-lg max-w-md w-full">
        <div className="border-b border-dark-border px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Вход в систему</h2>
          <p className="text-sm text-gray-400 mt-1">Введите данные для входа</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                placeholder="Введите email"
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Введите пароль"
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-purple-primary"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full px-4 py-2 bg-dark-purple-primary text-white rounded-lg hover:bg-dark-purple-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Вход...</span>
                </>
              ) : (
                'Войти'
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2 space-y-1">
            <p>Пароль по умолчанию для всех пользователей:</p>
            <p><code className="bg-dark-card px-2 py-1 rounded text-yellow-400">password123</code></p>
            <p className="text-gray-600 mt-2">Пример email: <span className="text-gray-400">ivanov@company.ru</span></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal

