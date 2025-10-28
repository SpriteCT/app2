// Маппинг ID клиентов к коротким кодам
export const clientCodes = {
  '1': 'TSV',  // ТехноСервис
  '2': 'FNH',  // ФинансХост
  '3': 'MDD',  // МедиаДиджитал
  '4': 'KZL',  // Козлов
  '5': 'RZP',  // РозницаПро
  '6': 'VGP',  // ВолковГрупп
}

export const getClientCode = (clientId) => {
  return clientCodes[clientId] || 'XXX'
}

