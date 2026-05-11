import { useState } from 'react'
import './index.css'
import FileTree from './components/FileTree/FileTree'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)

  const handleFileSelect = (filePath, content) => {
    setSelectedFile(filePath)
    setFileContent(content)
  }

  return (
    <div className="app-container">
      <div className="sidebar-left">
        <FileTree onFileSelect={handleFileSelect} />
      </div>
      <div className="editor">
        <h3>Editor</h3>
        {selectedFile ? (
          <pre className="file-content">{fileContent}</pre>
        ) : (
          <p>Выберите файл для просмотра</p>
        )}
      </div>
      <div className="sidebar-right">
        <h3>AI Panel</h3>
        <p>AI assistant will go here</p>
      </div>
    </div>
  )
}

export default App
