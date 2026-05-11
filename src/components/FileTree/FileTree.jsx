import { useState } from 'react'
import './FileTree.css'
import { electronAPI } from '../../electronAPI'

// Иконки для файлов по расширению
const getFileIcon = (fileName) => {
  const ext = fileName.toLowerCase().split('.').pop()
  const iconMap = {
    js: '🟨',
    jsx: '🟨',
    py: '🐍',
    json: '📋',
    css: '🎨',
    html: '🌐',
    md: '📝'
  }
  return iconMap[ext] || '📄'
}

// Папки которые нужно скрывать
const HIDDEN_FOLDERS = ['node_modules', '.git', 'dist']

// Компонент для отображения элемента дерева (папка или файл)
const TreeItem = ({ item, level, onFileSelect, selectedFile, expandedFolders, toggleFolder }) => {
  const isDirectory = item.type === 'directory'
  const isExpanded = expandedFolders.includes(item.path)
  const isSelected = selectedFile === item.path
  const indent = level * 16

  const handleClick = () => {
    if (isDirectory) {
      toggleFolder(item.path)
    } else {
      onFileSelect(item.path)
    }
  }

  // Скрываем скрытые папки
  if (isDirectory && HIDDEN_FOLDERS.includes(item.name)) {
    return null
  }

  return (
    <div>
      <div
        className={`tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={handleClick}
      >
        <span className="icon">
          {isDirectory ? (isExpanded ? '📂' : '📁') : getFileIcon(item.name)}
        </span>
        <span className="name">{item.name}</span>
      </div>
      {isDirectory && isExpanded && item.children && (
        <div className="tree-children">
          {item.children.map((child, index) => (
            <TreeItem
              key={index}
              item={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FileTree = ({ onFileSelect }) => {
  const [rootPath, setRootPath] = useState(null)
  const [items, setItems] = useState([])
  const [expandedFolders, setExpandedFolders] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  // Открыть диалог выбора папки
  const handleOpenFolder = async () => {
    try {
      const result = await electronAPI.openFolder()
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0]
        setRootPath(folderPath)
        await loadDirectory(folderPath)
      }
    } catch (error) {
      console.error('Error opening folder:', error)
    }
  }

  // Загрузить содержимое папки
  const loadDirectory = async (folderPath) => {
    try {
      const items = await electronAPI.readDirectory(folderPath)
      // Сортировка: сначала папки, потом файлы
      const sorted = items.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name)
        }
        return a.type === 'directory' ? -1 : 1
      })
      setItems(sorted)
      // Раскрыть корневую папку
      if (!expandedFolders.includes(folderPath)) {
        setExpandedFolders(prev => [...prev, folderPath])
      }
    } catch (error) {
      console.error('Error loading directory:', error)
    }
  }

  // Переключить состояние раскрытия папки
  const toggleFolder = async (folderPath) => {
    if (expandedFolders.includes(folderPath)) {
      // Свернуть папку
      setExpandedFolders(prev => prev.filter(p => p !== folderPath))
    } else {
      // Раскрыть папку - загрузить её содержимое если ещё не загружено
      const existingItem = findItem(items, folderPath)
      if (!existingItem || !existingItem.children) {
        try {
          const children = await electronAPI.readDirectory(folderPath)
          const sorted = children.sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name)
            }
            return a.type === 'directory' ? -1 : 1
          })
          // Обновить элемент с детьми
          setItems(prev => updateItemChildren(prev, folderPath, sorted))
        } catch (error) {
          console.error('Error loading subdirectory:', error)
        }
      }
      setExpandedFolders(prev => [...prev, folderPath])
    }
  }

  // Найти элемент по пути
  const findItem = (items, path) => {
    for (const item of items) {
      if (item.path === path) {
        return item
      }
      if (item.children) {
        const found = findItem(item.children, path)
        if (found) return found
      }
    }
    return null
  }

  // Обновить детей элемента
  const updateItemChildren = (items, path, children) => {
    return items.map(item => {
      if (item.path === path) {
        return { ...item, children }
      }
      if (item.children) {
        return { ...item, children: updateItemChildren(item.children, path, children) }
      }
      return item
    })
  }

  // Обработать выбор файла
  const handleFileSelect = async (filePath) => {
    setSelectedFile(filePath)
    try {
      const content = await electronAPI.readFile(filePath)
      onFileSelect(filePath, content)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  return (
    <div className="file-tree">
      <button className="open-folder-btn" onClick={handleOpenFolder}>
        📂 Открыть папку
      </button>
      <div className="tree-content">
        {items.map((item, index) => (
          <TreeItem
            key={index}
            item={item}
            level={0}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
      </div>
    </div>
  )
}

export default FileTree
