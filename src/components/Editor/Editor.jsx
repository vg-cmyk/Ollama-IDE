import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './Editor.css';

// Определение языка по расширению файла
function getLanguageFromPath(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    java: 'java',
    cpp: 'cpp',
    c: 'cpp',
    rs: 'rust'
  };
  
  return languageMap[ext] || 'plaintext';
}

function EditorComponent({ activeTab, openedTabs, onContentChange, onSave }) {
  const editorRef = useRef(null);
  const viewStates = useRef({});

  // Сохраняем состояние редактора при переключении вкладок
  useEffect(() => {
    if (editorRef.current && activeTab) {
      viewStates.current[activeTab] = editorRef.current.saveViewState();
    }
  }, [activeTab]);

  // Восстанавливаем состояние редактора при переключении вкладок
  useEffect(() => {
    if (editorRef.current && activeTab && viewStates.current[activeTab]) {
      editorRef.current.restoreViewState(viewStates.current[activeTab]);
      editorRef.current.focus();
    }
  }, [activeTab]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
    // Обработчик Ctrl+S для сохранения
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
      () => {
        if (activeTab) {
          onSave(activeTab);
        }
      }
    );
  };

  const activeFile = openedTabs.find(tab => tab.path === activeTab);

  if (!activeFile) {
    return (
      <div className="editor-empty">
        <div className="empty-icon">🗒️</div>
        <div className="empty-text">Откройте файл из проводника</div>
      </div>
    );
  }

  const language = getLanguageFromPath(activeFile.path);

  return (
    <div className="editor-container">
      <Editor
        height="100%"
        language={language}
        value={activeFile.content}
        theme="vs-dark"
        onMount={handleEditorMount}
        onChange={(value) => {
          onContentChange(activeFile.path, value);
        }}
        options={{
          fontSize: 14,
          fontFamily: 'Consolas, monospace',
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
        }}
      />
    </div>
  );
}

export default EditorComponent;
