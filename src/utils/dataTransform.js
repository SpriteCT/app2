// Utility functions to transform data between backend (snake_case) and frontend (camelCase)

// Transform client from backend to frontend format
export const transformClient = (backendClient) => {
  if (!backendClient) return null
  
  return {
    id: backendClient.id,
    name: backendClient.name,
    shortName: backendClient.short_name,
    code: backendClient.short_name, // Alias for compatibility
    industry: backendClient.industry,
    contactPerson: backendClient.contact_person,
    position: backendClient.position,
    phone: backendClient.phone,
    email: backendClient.email,
    sla: backendClient.sla,
    securityLevel: backendClient.security_level,
    contractNumber: backendClient.contract_number,
    contractDate: backendClient.contract_date,
    contractExpiry: backendClient.contract_expiry,
    billingCycle: backendClient.billing_cycle,
    infraCloud: backendClient.infra_cloud !== undefined ? backendClient.infra_cloud : true,
    infraOnPrem: backendClient.infra_on_prem !== undefined ? backendClient.infra_on_prem : true,
    infrastructure: {
      cloudServices: backendClient.infra_cloud !== undefined ? backendClient.infra_cloud : true,
      onPremise: backendClient.infra_on_prem !== undefined ? backendClient.infra_on_prem : true,
    },
    notes: backendClient.notes,
    isDefault: backendClient.is_default || false,
    additionalContacts: (backendClient.additional_contacts || []).map(contact => ({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
    })),
  }
}

// Transform client from frontend to backend format
export const transformClientToBackend = (frontendClient) => {
  // Преобразуем short_name в верхний регистр и обрезаем до 3-4 символов
  let shortName = (frontendClient.shortName || '').toUpperCase().trim()
  if (shortName.length > 4) {
    shortName = shortName.substring(0, 4)
  }
  
  return {
    name: frontendClient.name,
    short_name: shortName,
    industry: frontendClient.industry,
    contact_person: frontendClient.contactPerson,
    position: frontendClient.position,
    phone: frontendClient.phone,
    email: frontendClient.email,
    sla: frontendClient.sla,
    security_level: frontendClient.securityLevel,
    contract_number: frontendClient.contractNumber,
    contract_date: frontendClient.contractDate || null,
    contract_expiry: frontendClient.contractExpiry || null,
    billing_cycle: frontendClient.billingCycle,
    infra_cloud: frontendClient.infraCloud !== undefined ? frontendClient.infraCloud : true,
    infra_on_prem: frontendClient.infraOnPrem !== undefined ? frontendClient.infraOnPrem : true,
    notes: frontendClient.notes,
    is_default: frontendClient.isDefault || false,
    additional_contacts: (frontendClient.additionalContacts || []).map(contact => ({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
    })),
  }
}

// Transform project from backend to frontend format
export const transformProject = (backendProject) => {
  if (!backendProject) return null
  
  return {
    id: backendProject.id,
    clientId: backendProject.client_id,
    clientName: backendProject.client?.name || '',
    name: backendProject.name,
    description: backendProject.description,
    type: backendProject.type,
    status: backendProject.status,
    priority: backendProject.priority,
    startDate: backendProject.start_date,
    endDate: backendProject.end_date,
    budget: backendProject.budget ? parseFloat(backendProject.budget) : null,
    progress: backendProject.progress || 0,
    team: (backendProject.team_members || []).map(member => member.worker?.full_name || ''),
    teamMemberIds: (backendProject.team_members || []).map(member => member.worker_id),
  }
}

// Transform project from frontend to backend format
export const transformProjectToBackend = (frontendProject) => {
  // Преобразуем даты в правильный формат (YYYY-MM-DD или null)
  let startDate = frontendProject.startDate
  if (startDate && startDate.length >= 10) {
    startDate = startDate.substring(0, 10) // Берем только дату (YYYY-MM-DD)
  } else if (!startDate || startDate === '') {
    startDate = null
  }
  
  let endDate = frontendProject.endDate
  if (endDate && endDate.length >= 10) {
    endDate = endDate.substring(0, 10) // Берем только дату (YYYY-MM-DD)
  } else if (!endDate || endDate === '') {
    endDate = null
  }
  
  return {
    client_id: frontendProject.clientId,
    name: frontendProject.name,
    description: frontendProject.description,
    type: frontendProject.type,
    status: frontendProject.status,
    priority: frontendProject.priority,
    start_date: startDate,
    end_date: endDate,
    budget: frontendProject.budget ? String(frontendProject.budget) : null,
    progress: frontendProject.progress || 0,
    team_member_ids: frontendProject.teamMemberIds || [],
  }
}

// Transform asset from backend to frontend format
export const transformAsset = (backendAsset) => {
  if (!backendAsset) return null
  
  return {
    id: backendAsset.id,
    clientId: backendAsset.client_id,
    name: backendAsset.name,
    typeId: backendAsset.type_id,
    typeName: backendAsset.type?.name || '',
    ipAddress: backendAsset.ip_address,
    operatingSystem: backendAsset.operating_system,
    status: backendAsset.status,
    criticality: backendAsset.criticality,
    lastScan: backendAsset.last_scan,
  }
}

// Transform asset from frontend to backend format
export const transformAssetToBackend = (frontendAsset) => {
  return {
    client_id: frontendAsset.clientId,
    name: frontendAsset.name,
    type_id: frontendAsset.typeId,
    ip_address: frontendAsset.ipAddress,
    operating_system: frontendAsset.operatingSystem,
    status: frontendAsset.status,
    criticality: frontendAsset.criticality,
    last_scan: frontendAsset.lastScan || null,
  }
}

// Transform vulnerability from backend to frontend format
export const transformVulnerability = (backendVuln) => {
  if (!backendVuln) return null
  
  return {
    id: backendVuln.id,
    displayId: backendVuln.display_id || String(backendVuln.id),
    clientId: backendVuln.client_id,
    assetId: backendVuln.asset_id,
    assetName: backendVuln.asset?.name || '',
    assetTypeName: backendVuln.asset?.type?.name || '',
    title: backendVuln.title,
    description: backendVuln.description,
    scannerId: backendVuln.scanner_id,
    scannerName: backendVuln.scanner?.name || '',
    status: backendVuln.status,
    criticality: backendVuln.criticality,
    cvss: backendVuln.cvss ? parseFloat(backendVuln.cvss) : null,
    cve: backendVuln.cve,
    discovered: backendVuln.discovered,
    lastModified: backendVuln.last_modified,
    createdAt: backendVuln.created_at,
    updatedAt: backendVuln.updated_at,
  }
}

// Transform vulnerability from frontend to backend format
export const transformVulnerabilityToBackend = (frontendVuln) => {
  // Валидация CVSS
  let cvssValue = frontendVuln.cvss
  if (cvssValue !== null && cvssValue !== undefined && cvssValue !== '') {
    cvssValue = parseFloat(cvssValue)
    if (isNaN(cvssValue) || cvssValue < 0 || cvssValue > 10) {
      cvssValue = null
    }
  } else {
    cvssValue = null
  }
  
  const data = {
    client_id: typeof frontendVuln.clientId === 'string' ? parseInt(frontendVuln.clientId) : frontendVuln.clientId,
    title: frontendVuln.title || '',
    status: frontendVuln.status || 'Open',
    criticality: frontendVuln.criticality || 'High',
  }
  
  // Optional fields
  if (frontendVuln.assetId) {
    data.asset_id = typeof frontendVuln.assetId === 'string' ? parseInt(frontendVuln.assetId) : frontendVuln.assetId
  } else {
    data.asset_id = null
  }
  
  if (frontendVuln.description) {
    data.description = frontendVuln.description
  }
  
  // Asset type is derived from asset, not stored separately
  
  if (frontendVuln.scannerId) {
    data.scanner_id = typeof frontendVuln.scannerId === 'string' ? parseInt(frontendVuln.scannerId) : frontendVuln.scannerId
  } else {
    data.scanner_id = null
  }
  
  // CVSS should be float, not string
  data.cvss = cvssValue
  
  if (frontendVuln.cve) {
    data.cve = frontendVuln.cve
  } else {
    data.cve = null
  }
  
  if (frontendVuln.discovered) {
    data.discovered = frontendVuln.discovered
  } else {
    data.discovered = null
  }
  
  if (frontendVuln.lastModified) {
    data.last_modified = frontendVuln.lastModified
  } else {
    data.last_modified = null
  }
  
  return data
}

// Transform ticket from backend to frontend format
export const transformTicket = (backendTicket) => {
  if (!backendTicket) return null
  
  return {
    id: backendTicket.id,
    displayId: backendTicket.display_id || String(backendTicket.id),
    clientId: backendTicket.client_id,
    title: backendTicket.title,
    description: backendTicket.description,
    assigneeId: backendTicket.assignee_id,
    assigneeName: backendTicket.assignee?.full_name || '',
    reporterId: backendTicket.reporter_id,
    reporterName: backendTicket.reporter?.full_name || '',
    priority: backendTicket.priority,
    status: backendTicket.status,
    createdAt: backendTicket.created_at,
    updatedAt: backendTicket.updated_at,
    dueDate: backendTicket.due_date,
    resolution: backendTicket.resolution,
    vulnerabilities: (backendTicket.vulnerabilities || []).map(v => transformVulnerability(v)),
    chatMessages: (backendTicket.messages || []).map(msg => ({
      id: msg.id,
      authorId: msg.author_id,
      author: msg.author?.full_name || 'Система',
      timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      message: msg.message,
    })),
  }
}

// Transform ticket from frontend to backend format
export const transformTicketToBackend = (frontendTicket) => {
  return {
    client_id: frontendTicket.clientId,
    title: frontendTicket.title,
    description: frontendTicket.description,
    assignee_id: frontendTicket.assigneeId || null,
    reporter_id: frontendTicket.reporterId || null,
    priority: frontendTicket.priority,
    status: frontendTicket.status,
    due_date: frontendTicket.dueDate || null,
    resolution: frontendTicket.resolution || null,
    vulnerability_ids: frontendTicket.vulnerabilityIds || [],
  }
}

// Transform worker from backend to frontend format
export const transformWorker = (backendWorker) => {
  if (!backendWorker) return null
  
  return {
    id: backendWorker.id,
    fullName: backendWorker.full_name,
    email: backendWorker.email,
    phone: backendWorker.phone,
  }
}

// Transform worker from frontend to backend format
export const transformWorkerToBackend = (frontendWorker) => {
  return {
    full_name: frontendWorker.fullName,
    email: frontendWorker.email,
    phone: frontendWorker.phone,
  }
}

