import { useState, useEffect, useRef, useCallback } from 'react'
import './AIPanel.css'
import { electronAPI } from '../../electronAPI'

const SYSTEM_PROMPT = `Ты опытный программист. Отвечай на русском языке.
Код всегда оборачивай в markdown блоки с указанием языка.`

// Форматирование времени
const formatTime = (date) => {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Извлечение кода из markdown и оборачивание в <pre>
const renderMessageContent = (content) => {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      // Извлекаем язык и код
      const match = part.match(/```(\w*)\n([\s\S]*?)```/)
      if (match) {
        const lang = match[1] || 'plaintext'
        const code = match[2]
        return (
          <div key={index} className="code-block-wrapper">
            <div className="code-block-header">
              <span className="code-lang">{lang}</span>
              <button
                className="copy-code-btn"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                📋 Копировать
              </button>
            </div>
            <pre className="code-block">{code}</pre>
          </div>
        )
      }
      return <pre key={index} className="code-block">{part}</pre>
    }
    return <span key={index}>{part}</span>
  })
}

const AIPanel = ({ activeFileContent, getSelectedText }) => {
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [ollamaAvailable, setOllamaAvailable] = useState(true)
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Загрузка списка моделей при монтировании
  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await electronAPI.getOllamaModels()
        if (availableModels.length > 0) {
          setModels(availableModels)
          setSelectedModel(availableModels[0])
          setOllamaAvailable(true)
        } else {
          setOllamaAvailable(false)
        }
      } catch (error) {
        console.error('Error loading models:', error)
        setOllamaAvailable(false)
      }
    }
    loadModels()
  }, [])

  // Авто-скролл вниз при новом сообщении
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Отправка сообщения
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !selectedModel || isLoading) return

    const userMessage = {
      role: 'user',
      content: messageText.trim(),
      time: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const allMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: messageText.trim() }
      ]

      const response = await electronAPI.sendToOllama(selectedModel, allMessages)

      const assistantMessage = {
        role: 'assistant',
        content: response,
        time: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending to Ollama:', error)
      const errorMessage = {
        role: 'assistant',
        content: '⚠️ Ошибка: не удалось получить ответ от Ollama. Убедитесь, что Ollama запущена.',
        time: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [selectedModel, isLoading, messages])

  // Обработчик отправки по Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  // Быстрые действия
  const handleQuickAction = useCallback((prompt) => {
    if (!activeFileContent) {
      alert('Сначала откройте файл в редакторе')
      return
    }
    sendMessage(`${prompt}\n\n${activeFileContent}`)
  }, [activeFileContent, sendMessage])

  // Объяснить выделенное
  const handleExplainSelection = useCallback(() => {
    const selectedText = getSelectedText?.()
    if (!selectedText || !selectedText.trim()) {
      alert('Выделите код в редакторе')
      return
    }
    sendMessage(`Объясни этот фрагмент кода:\n\n${selectedText}`)
  }, [getSelectedText, sendMessage])

  // Очистить чат
  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="ai-panel">
      {/* Шапка */}
      <div className="ai-header">
        <span className="ai-title">🤖 AI Assistant</span>
        {!ollamaAvailable ? (
          <span className="ollama-warning">⚠️ Ollama недоступна</span>
        ) : (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoading}
          >
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        )}
      </div>

      {/* История чата */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>Начните диалог с AI...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {msg.role === 'user' ? 'Вы' : 'AI'}
                </span>
                <span className="message-time">{formatTime(msg.time)}</span>
              </div>
              <div className="message-content">
                {renderMessageContent(msg.content)}
              </div>
              <button
                className="copy-message-btn"
                onClick={() => navigator.clipboard.writeText(msg.content)}
              >
                📋
              </button>
            </div>
          ))
        )}
        {isLoading && (
          <div className="loading-indicator">
            ⏳ AI думает...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Кнопки быстрых действий */}
      {activeFileContent && (
        <div className="quick-actions">
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('Объясни этот код подробно')}
            disabled={isLoading}
          >
            💡 Объяснить код
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('Найди баги и проблемы в этом коде')}
            disabled={isLoading}
          >
            🔍 Найти баги
          </button>
          <button
            className="quick-action-btn"
            onClick={() => handleQuickAction('Сделай рефакторинг этого кода, улучши читаемость')}
            disabled={isLoading}
          >
            ⚡ Рефакторинг
          </button>
          <button
            className="quick-action-btn"
            onClick={handleExplainSelection}
            disabled={isLoading}
          >
            ✨ Объяснить выделенное
          </button>
        </div>
      )}

      {/* Ввод сообщения */}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Спросите AI или вставьте код..."
          rows={3}
          disabled={isLoading || !ollamaAvailable}
        />
        <div className="input-buttons">
          <button
            className="clear-chat-btn"
            onClick={clearChat}
            disabled={isLoading || messages.length === 0}
          >
            🗑️
          </button>
          <button
            className="send-btn"
            onClick={() => sendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim() || !ollamaAvailable}
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIPanel
