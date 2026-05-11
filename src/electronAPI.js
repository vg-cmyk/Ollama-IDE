// Адаптер для работы как в Electron, так и в веб-режиме

const isElectron = () => {
  return window && window.electronAPI
}

// Веб-реализация API (заглушки)
const webAPI = {
  openFolder: async () => {
    console.warn('openFolder not available in web mode')
    return { canceled: true, filePaths: [] }
  },
  readDirectory: async (folderPath) => {
    console.warn('readDirectory not available in web mode')
    return []
  },
  readFile: async (filePath) => {
    console.warn('readFile not available in web mode')
    return null
  },
  saveFile: async (path, content) => {
    console.warn('saveFile not available in web mode')
    return { success: false, error: 'Not available in web mode' }
  },
  getOllamaModels: async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      if (!response.ok) throw new Error('Ollama not available')
      const data = await response.json()
      return data.models?.map(m => m.name) || []
    } catch (error) {
      console.error('Error getting Ollama models:', error)
      return []
    }
  },
  sendToOllama: async (model, messages) => {
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false })
      })
      if (!response.ok) throw new Error('Ollama request failed')
      const data = await response.json()
      return data.message?.content || ''
    } catch (error) {
      console.error('Error sending to Ollama:', error)
      throw error
    }
  }
}

// Экспортируем единый API
export const electronAPI = isElectron() ? window.electronAPI : webAPI
export { isElectron }
