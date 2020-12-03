const { app, BrowserWindow, Tray, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const storage = require('electron-json-storage')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const { FetchAddons, FetchInstalledAddons } = require('./TukuiService')
const GetClientVersions = require('./VersionLocation')

const clientUpdateInterval = 1000 * 60 * 10
const updateAddonInterval = 1000 * 60

log.transports.file.level = 'info'
let mainWindow, trayWindow, tray, lastAddonPull, clientUpdateTimeout

const startup = () => {
  autoUpdater.autoDownload = false
  if (!app.getLoginItemSettings().wasOpenedAtLogin) createMainWindow()
  else {
    app.dock.hide()
    updateAddonInfo()
  }
  createTrayWindow()
  setOpenAtLogin()
  checkForClientUpdates()
}
const updateAddonInfo = async (repeat = true) => {
  try {
    const versions = GetClientVersions()
    let result = {}
    for (var client of Object.keys(versions)) {
      console.log(client)
      result[client] = { installed: versions[client].installed }
      if (!versions[client].installed) continue
      result[client] = { ...result[client], ...(await FetchAddons(versions[client].provider)) }
    }
    lastAddonPull = result
    if (mainWindow?.isVisible())
      mainWindow.webContents.send('update-addons', lastAddonPull)
  } catch(err) {
    console.log(err)
  }
  //#region
  /*   FetchAddons((addons) => {
    try {
      const versions = GetClientVersions()
      let addon

      FetchInstalledAddons('Retail', (installedRetailAddons) => {
        FetchInstalledAddons('Classic', (installedClassicAddons) => {
          const result = {
            Retail: {
              installed: installedRetailAddons ? true : false,
              elvui: {
                ...addons.Retail.elvui,
                localAddon: installedRetailAddons?.filter(
                  (addon) => addon.name === 'ElvUI'
                )[0],
              },
              tukui: {
                ...addons.Retail.tukui,
                localAddon: installedRetailAddons?.filter(
                  (addon) => addon.name === 'Tukui'
                )[0],
              },
              all: installedRetailAddons
                ? addons.Retail.all.map((addon) => {
                    return {
                      ...addon,
                      localAddon: installedRetailAddons.filter(
                        (a) => a.name === addon.name
                      )[0],
                    }
                  })
                : addons.Retail.all,
            },
            Classic: {
              installed: installedClassicAddons ? true : false,
              elvui: {
                ...addons.Classic.elvui,
                localAddon: installedClassicAddons?.filter(
                  (addon) => addon.name === 'ElvUI'
                )[0],
              },
              tukui: {
                ...addons.Classic.tukui,
                localAddon: installedClassicAddons?.filter(
                  (addon) => addon.name === 'Tukui'
                )[0],
              },
              all: installedClassicAddons
                ? addons.Classic.all.map((addon) => {
                    return {
                      ...addon,
                      localAddon: installedClassicAddons.filter(
                        (a) => a.name === addon.name
                      )[0],
                    }
                  })
                : addons.Classic.all,
            },
          }

          lastAddonPull = result ? result : lastAddonPull
          try {
            if (mainWindow?.isVisible())
              mainWindow.webContents.send('update-addons', lastAddonPull)
          } catch {}
        })
      })
    } catch {} */
  //#endregion
  if (clientUpdateTimeout) clearTimeout(clientUpdateTimeout)
  clientUpdateTimeout = setTimeout(updateAddonInfo, updateAddonInterval)
}

//#region Functions
const setOpenAtLogin = () => {
  storage.get('auto-update', (err, data) => {
    const autoStart = err || data
    app.setLoginItemSettings({
      openAtLogin: autoStart,
      openAsHidden: autoStart,
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
  } else if (eventName === 'close_tray') {
    trayWindow?.destroy()
    tray?.destroy()
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
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: isDev,
      webSecurity: false,
    },
    backgroundColor: '#000',
  })
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  mainWindow.on('closed', mainWindowClosed)
  mainWindow.on('ready-to-show', () => {
    console.log('ready-to-show')
    updateAddonInfo()
  })
  mainWindow.on('show', () => {})
}

const toggleMainWindow = () => {
  if (!mainWindow) {
    createMainWindow()
    app.dock.show()
  } else if (mainWindow.isVisible()) {
    mainWindow.destroy()
    mainWindow = null
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
  trayWindow.loadURL(
    isDev
      ? 'http://localhost:3000/tray.html'
      : `file://${path.join(__dirname, '../build/tray.html')}`
  )
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
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  )
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
  app.dock.show()
})
app.on('ready-to-show', () => {
  log.debug('ready-to-show')
  autoUpdater.logger = log
})
//#endregion

//#region AutoUpdater events
autoUpdater.on('update-available', () => {
  try {
    if (mainWindow && mainWindow?.isVisible())
      mainWindow.webContents.send('update-available')
    else autoUpdater.downloadUpdate()
  } catch (err) {}
})

autoUpdater.on('update-downloaded', () => {
  try {
    if (mainWindow && mainWindow?.isVisible())
      mainWindow.webContents.send('update-downloaded')
    else autoUpdater.quitAndInstall()
  } catch (err) {}
})

const checkForClientUpdates = () => {
  try {
    autoUpdater.checkForUpdates()
  } catch {}
  setTimeout(checkForClientUpdates, clientUpdateInterval)
}
//#endregion
