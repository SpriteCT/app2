// Utility functions for date formatting and manipulation
// Ensures dates are displayed in user's local timezone

/**
 * Formats a date string to local date string (YYYY-MM-DD)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  // Use local timezone
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a date to readable string in Russian locale
 * @param {string|Date} date - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  }
  
  return d.toLocaleDateString('ru-RU', defaultOptions)
}

/**
 * Formats a datetime to readable string in Russian locale
 * @param {string|Date} date - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return '—'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }
  
  return d.toLocaleString('ru-RU', defaultOptions)
}

/**
 * Gets current date in local timezone as YYYY-MM-DD
 * @returns {string} Current date string
 */
export const getCurrentDate = () => {
  const now = new Date()
  return formatDateForInput(now)
}

/**
 * Parses a date string and returns Date object in local timezone
 * Handles both date-only strings (YYYY-MM-DD) and ISO datetime strings
 * @param {string} dateString - Date string
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null
  
  // If it's just a date (YYYY-MM-DD), treat it as local midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  // Otherwise parse as ISO string (will be converted to local time)
  const d = new Date(dateString)
  return isNaN(d.getTime()) ? null : d
}

