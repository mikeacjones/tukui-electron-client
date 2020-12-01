const { app, BrowserWindow, Tray, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const storage = require('electron-json-storage')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const { Notification } = require('electron')

let mainWindow, trayWindow, tray

const startup = () => {
  if (!app.getLoginItemSettings().wasOpenedAtLogin) createMainWindow()
  else app.dock.hide()
  createTrayWindow()
  setOpenAtLogin()
  if (!isDev) autoUpdater.checkForUpdates()
}

//#region Functions
const setOpenAtLogin = () => {
  storage.get('auto-update', (err, data) => {
    const autoStart = err || data
    app.setLoginItemSettings({
      openAtLogin: autoStart,
    })
  })
}
//#endregion

//#region Inter-app communication
ipcMain.on('main', (event, eventName, arg1) => {
  if (eventName === 'icon_click') toggleMainWindow()
  else if (eventName === 'update_changed') {
    const autoUpdate = arg1
    storage.set('auto-update', autoUpdate, () => {
      app.setLoginItemSettings({
        openAtLogin: autoUpdate,
      })
      if (!autoUpdate && (!mainWindow || !mainWindow.isVisible())) app.quit()
    })
  } else if (eventName === 'update_requested') {
    autoUpdater.downloadUpdate()
  } else if (eventName === 'update_install') {
    autoUpdater.quitAndInstall()
  }
})
//#endregion

//#region Main Window
const allWindowsClosed = () => app.quit()
const mainWindowClosed = () => {
  mainWindow = null

  storage.get('auto-update', (err, obj) => {
    if (err || obj) app.dock.hide()
    else app.quit()
  })
}

const createMainWindow = () => {
  if (mainWindow != null) {
    mainWindow.show()
    return
  }
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 900,
    webPreferences: { nodeIntegration: true, enableRemoteModule: true, devTools: isDev, webSecurity: false },
    backgroundColor: '#000',
    titleBarStyle: 'hiddenInset',
  })
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)
  mainWindow.on('closed', mainWindowClosed)
}

const toggleMainWindow = () => {
  if (!mainWindow) {
    createMainWindow()
    app.dock.show()
  } else if (mainWindow.isVisible()) {
    mainWindow.hide()
    app.dock.hide()
  } else {
    mainWindow.show()
    app.dock.show()
  }
}
//#endregion

//#region Tray window
const createTrayWindow = () => {
  tray = new Tray(path.join(__dirname, 'trayTemplate.png'))
  tray.on('right-click', toggleTrayWindow)
  tray.on('double-click', toggleTrayWindow)
  tray.on('click', toggleTrayWindow)

  trayWindow = new BrowserWindow({
    width: 300,
    height: 250,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })
  trayWindow.loadURL(isDev ? 'http://localhost:3000/tray.html' : `file://${path.join(__dirname, '../build/tray.html')}`)
  trayWindow.on('blur', () => trayWindow.hide())
}

const toggleTrayWindow = () => {
  if (trayWindow.isVisible()) {
    trayWindow.hide()
  } else {
    showTrayWindow()
  }
}

const showTrayWindow = () => {
  const position = getTrayWindowPosition()
  trayWindow.setPosition(position.x, position.y, false)
  trayWindow.show()
  trayWindow.focus()
}

const getTrayWindowPosition = () => {
  const windowBounds = trayWindow.getBounds()
  const trayBounds = tray.getBounds()
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return { x: x, y: y }
}
//#endregion

//#region App events
app.on('ready', startup)
app.on('window-all-closed', allWindowsClosed)
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  } else {
    mainWindow.show()
  }
})
app.on('ready-to-show', () => {
  log.debug('ready-to-show')
  autoUpdater.logger = log
})
//#endregion

//#region AutoUpdater events
autoUpdater.on('update-available', () => {
  //autoUpdater.downloadUpdate()
  mainWindow.webContents.send('update-available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded')
})
//#endregion
