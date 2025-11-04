// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  // Ensure endpoint starts with / if using relative path
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = API_BASE_URL.startsWith('http') 
    ? `${API_BASE_URL}${normalizedEndpoint}`
    : `${API_BASE_URL}${normalizedEndpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { detail: response.statusText }
      }
      
      // Handle validation errors (422) - show detailed messages
      if (response.status === 422 && Array.isArray(errorData.detail)) {
        const messages = errorData.detail.map(err => 
          `${err.loc ? err.loc.join('.') : 'Field'}: ${err.msg || err.message || 'validation error'}`
        ).join('; ')
        throw new Error(`Validation error: ${messages}`)
      }
      
      // Handle other errors
      const errorMessage = errorData.detail || errorData.message || response.statusText
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    }

    // Handle 204 No Content and other responses without body
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    // Check if response has content
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      return text ? JSON.parse(text) : null
    }

    return null
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    throw error
  }
}

// Clients API
export const clientsApi = {
  getAll: () => apiRequest('/clients/'),
  getById: (id) => apiRequest(`/clients/${id}`),
  create: (data) => apiRequest('/clients/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/clients/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/clients/${id}`, { method: 'DELETE' }),
  addContact: (clientId, data) => apiRequest(`/clients/${clientId}/contacts/`, { method: 'POST', body: data }),
  updateContact: (clientId, contactId, data) => apiRequest(`/clients/${clientId}/contacts/${contactId}`, { method: 'PUT', body: data }),
  deleteContact: (clientId, contactId) => apiRequest(`/clients/${clientId}/contacts/${contactId}`, { method: 'DELETE' }),
}

// Projects API
export const projectsApi = {
  getAll: () => apiRequest('/projects/'),
  getById: (id) => apiRequest(`/projects/${id}`),
  create: (data) => apiRequest('/projects/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
}

// Assets API
export const assetsApi = {
  getAll: () => apiRequest('/assets/'),
  getById: (id) => apiRequest(`/assets/${id}`),
  create: (data) => apiRequest('/assets/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/assets/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/assets/${id}`, { method: 'DELETE' }),
}

// Vulnerabilities API
export const vulnerabilitiesApi = {
  getAll: () => apiRequest('/vulnerabilities/'),
  getById: (id) => apiRequest(`/vulnerabilities/${id}`),
  create: (data) => apiRequest('/vulnerabilities/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/vulnerabilities/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/vulnerabilities/${id}`, { method: 'DELETE' }),
}

// Tickets API
export const ticketsApi = {
  getAll: () => apiRequest('/tickets/'),
  getById: (id) => apiRequest(`/tickets/${id}`),
  create: (data) => apiRequest('/tickets/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/tickets/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/tickets/${id}`, { method: 'DELETE' }),
  addMessage: (ticketId, data) => apiRequest(`/tickets/${ticketId}/messages/`, { method: 'POST', body: data }),
}

// Workers API
export const workersApi = {
  getAll: () => apiRequest('/workers/'),
  getById: (id) => apiRequest(`/workers/${id}`),
  create: (data) => apiRequest('/workers/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/workers/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/workers/${id}`, { method: 'DELETE' }),
}

// Reference data API
export const referenceApi = {
  getAssetTypes: () => apiRequest('/reference/asset-types'),
  getScanners: () => apiRequest('/reference/scanners'),
}

// Gantt API
export const ganttApi = {
  getByProject: (projectId) => apiRequest(`/gantt/projects/${projectId}/tasks/`),
  create: (data) => apiRequest('/gantt/tasks/', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/gantt/tasks/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/gantt/tasks/${id}`, { method: 'DELETE' }),
}

