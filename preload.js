const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Open folder dialog
  openFolder: () => ipcRenderer.invoke('open-folder'),
  
  // Read directory contents
  readDirectory: (folderPath) => ipcRenderer.invoke('read-directory', folderPath),
  
  // Read file contents
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // Save file contents
  saveFile: (path, content) => ipcRenderer.invoke('save-file', { path, content })
})
