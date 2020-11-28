const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const isDev = require('electron-is-dev')

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 800, webPreferences: { nodeIntegration: true }, backgroundColor: '#000', titleBarStyle: 'hiddenInset' })
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)
  mainWindow.on('closed', () => {
    mainWindow = null
    app.dock.hide()
  })
}

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})
