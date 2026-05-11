const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  // Убираем стандартное меню
  win.setMenu(null)

  // Обработчик для открытия диалога выбора папки
  ipcMain.handle('open-folder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    return result
  })

  // Обработчик для чтения содержимого папки
  ipcMain.handle('read-directory', async (event, folderPath) => {
    try {
      const items = fs.readdirSync(folderPath, { withFileTypes: true })
      const result = items.map(item => ({
        name: item.name,
        path: path.join(folderPath, item.name),
        type: item.isDirectory() ? 'directory' : 'file'
      }))
      return result
    } catch (error) {
      console.error('Error reading directory:', error)
      return []
    }
  })

  // Обработчик для чтения содержимого файла
  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return content
    } catch (error) {
      console.error('Error reading file:', error)
      return null
    }
  })

  // Обработчик для сохранения содержимого файла
  ipcMain.handle('save-file', async (event, { path: filePath, content }) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      console.error('Error saving file:', error)
      return { success: false, error: error.message }
    }
  })

  // Загружаем HTML после того как окно готово
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }

  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
