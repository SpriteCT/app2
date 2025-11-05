// Utility functions to transform data between backend (snake_case) and frontend (camelCase)

// Transform client from backend to frontend format
export const transformClient = (backendClient) => {
  if (!backendClient) return null
  
  const contacts = (backendClient.contacts || [])
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0] || null
  
  return {
    id: backendClient.id,
    name: backendClient.name,
    shortName: backendClient.short_name,
    code: backendClient.short_name, // Alias for compatibility
    industry: backendClient.industry,
    contactPerson: primaryContact?.name || '',
    position: primaryContact?.role || '',
    phone: primaryContact?.phone || '',
    email: primaryContact?.email || '',
    contractNumber: backendClient.contract_number,
    contractDate: backendClient.contract_date,
    contractExpiry: backendClient.contract_expiry,
    billingCycle: backendClient.billing_cycle,
    notes: backendClient.notes,
    contacts: contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
      isPrimary: contact.is_primary || false,
    })),
    additionalContacts: contacts.map(contact => ({
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
  
  const contacts = frontendClient.contacts || frontendClient.additionalContacts || []
  
  return {
    name: frontendClient.name,
    short_name: shortName,
    industry: frontendClient.industry,
    contract_number: frontendClient.contractNumber,
    contract_date: frontendClient.contractDate || null,
    contract_expiry: frontendClient.contractExpiry || null,
    billing_cycle: frontendClient.billingCycle,
    notes: frontendClient.notes,
    contacts: contacts.map(contact => ({
      name: contact.name || '',
      role: contact.role || '',
      phone: contact.phone || '',
      email: contact.email || '',
      is_primary: contact.isPrimary || contact.is_primary || false,
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
    team: (backendProject.team_members || []).map(member => member.user_account?.full_name || ''),
    teamMemberIds: (backendProject.team_members || []).map(member => member.user_account_id),
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

// Transform user account from backend to frontend format
export const transformWorker = (backendUser) => {
  if (!backendUser) return null
  
  return {
    id: backendUser.id,
    username: backendUser.username,
    passwordHash: backendUser.password_hash,
    fullName: backendUser.full_name,
    email: backendUser.email,
    phone: backendUser.phone,
    userType: backendUser.user_type,
    clientId: backendUser.client_id,
  }
}

// Transform user account from frontend to backend format
export const transformWorkerToBackend = (frontendUser) => {
  return {
    username: frontendUser.username,
    password_hash: frontendUser.passwordHash,
    full_name: frontendUser.fullName,
    email: frontendUser.email,
    phone: frontendUser.phone,
    user_type: frontendUser.userType || 'worker',
    client_id: frontendUser.clientId || null,
  }
}

