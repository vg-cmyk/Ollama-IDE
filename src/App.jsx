import { useState, useCallback, useRef } from 'react'
import './index.css'
import FileTree from './components/FileTree/FileTree'
import Tabs from './components/Tabs/Tabs'
import EditorComponent from './components/Editor/Editor'
import AIPanel from './components/AIPanel/AIPanel'
import Splash from './components/Splash/Splash'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [openedTabs, setOpenedTabs] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const editorRef = useRef(null)

  const handleSplashFinish = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleFileSelect = useCallback((filePath, content) => {
    setOpenedTabs(prevTabs => {
      // Проверяем, открыт ли файл уже
      const existingTab = prevTabs.find(tab => tab.path === filePath)
      
      if (existingTab) {
        // Файл уже открыт - просто переключаемся на него
        setActiveTab(filePath)
        return prevTabs
      } else {
        // Новый файл - добавляем вкладку
        setActiveTab(filePath)
        return [...prevTabs, { path: filePath, content, isModified: false }]
      }
    })
  }, [])

  const handleTabChange = useCallback((path) => {
    setActiveTab(path)
  }, [])

  const handleTabClose = useCallback((path) => {
    setOpenedTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.path !== path)
      
      // Если закрываем активную вкладку
      if (path === activeTab) {
        if (newTabs.length > 0) {
          // Активируем соседнюю вкладку (предыдущую или следующую)
          const closedIndex = prevTabs.findIndex(tab => tab.path === path)
          const newIndex = Math.min(closedIndex, newTabs.length - 1)
          setActiveTab(newTabs[newIndex].path)
        } else {
          setActiveTab(null)
        }
      }
      
      return newTabs
    })
  }, [activeTab])

  const handleContentChange = useCallback((path, newContent) => {
    setOpenedTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.path === path 
          ? { ...tab, content: newContent, isModified: true }
          : tab
      )
    )
  }, [])

  const handleSave = useCallback(async (path) => {
    const tab = openedTabs.find(t => t.path === path)
    if (!tab) return
    
    try {
      const result = await window.electronAPI.saveFile(path, tab.content)
      if (result.success) {
        setOpenedTabs(prevTabs => 
          prevTabs.map(t => 
            t.path === path ? { ...t, isModified: false } : t
          )
        )
      }
    } catch (error) {
      console.error('Error saving file:', error)
    }
  }, [openedTabs])

  // Функция для получения выделенного текста из редактора
  const getSelectedText = useCallback(() => {
    if (editorRef.current) {
      const editor = editorRef.current
      if (editor && typeof editor.getModel === 'function') {
        const model = editor.getModel()
        const selection = editor.getSelection()
        if (model && selection) {
          return model.getValueInRange(selection) || ''
        }
      }
    }
    return ''
  }, [])

  // Получаем контент активного файла для AI панели
  const activeFileContent = activeTab 
    ? openedTabs.find(tab => tab.path === activeTab)?.content || ''
    : ''

  // Показываем Splash экран во время загрузки
  if (isLoading) {
    return <Splash onFinish={handleSplashFinish} />
  }

  return (
    <div className="app-container">
      <div className="sidebar-left">
        <FileTree onFileSelect={handleFileSelect} />
      </div>
      <div className="main-area">
        <Tabs 
          openedTabs={openedTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onTabClose={handleTabClose}
        />
        <EditorComponent 
          activeTab={activeTab}
          openedTabs={openedTabs}
          onContentChange={handleContentChange}
          onSave={handleSave}
          editorRef={editorRef}
        />
      </div>
      <div className="sidebar-right">
        <AIPanel 
          activeFileContent={activeFileContent}
          getSelectedText={getSelectedText}
        />
      </div>
    </div>
  )
}

export default App
