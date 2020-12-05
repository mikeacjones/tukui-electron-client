const { app, BrowserWindow, Tray, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const storage = require('electron-json-storage-sync')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const { FetchAddons, FetchInstalledAddons } = require('./TukuiService')
const GetClientVersions = require('./VersionLocation')
const https = require('https')
const { tmpdir } = require('os')
const crypto = require('crypto')
const extract = require('extract-zip')
const AddonToc = require('./AddonToc')

const clientUpdateInterval = 1000 * 60 * 10
const updateAddonInterval = 1000 * 60

let updating = false

log.transports.file.level = 'info'
let mainWindow, trayWindow, tray, lastAddonPull, clientUpdateTimeout

const startup = () => {
  autoUpdater.autoDownload = false
  mainWindowStartup()
  updateAddonInfo()
  createTrayWindow()
  setOpenAtLogin()
  checkForClientUpdates()
}

const mainWindowStartup = () => {
  const result = storage.has('doing-background-update')
  let openHidden = app.getLoginItemSettings().wasOpenedAtLogin
  if (result.status && result.data) {
    storage.remove('doing-background-update')
    app.dock.hide()
    openHidden = true
  }
  createMainWindow(openHidden)
}

//#region Addon functions
const updateAddonInfo = async (repeat = true) => {
  try {
    const versions = GetClientVersions()
    let result = {}
    for (var client of Object.keys(versions)) {
      result[client] = { installed: versions[client].installed }
      if (!versions[client].installed) continue

      let installedAddons = FetchInstalledAddons(versions[client])
      result[client] = {
        ...result[client],
        ...(await FetchAddons(versions[client].provider)),
      }
      result[client].elvui = {
        ...result[client].elvui,
        basePath: versions[client].path,
        localAddon: installedAddons.filter((addon) => addon.name === 'ElvUI')[0],
      }
      result[client].tukui = {
        ...result[client].tukui,
        basePath: versions[client].path,
        localAddon: installedAddons.filter((addon) => addon.name === 'Tukui')[0],
      }
      result[client].all = result[client].all.map((addon) => {
        return {
          ...addon,
          basePath: versions[client].path,
          localAddon: installedAddons.filter((a) => a.name === addon.name)[0],
        }
      })
    }
    lastAddonPull = result
    if (mainWindow) mainWindow.webContents.send('update-addons', lastAddonPull)
  } catch (err) {}
  if (clientUpdateTimeout) clearTimeout(clientUpdateTimeout)
  clientUpdateTimeout = setTimeout(updateAddonInfo, updateAddonInterval)
}
const installAddon = async (addon) => {
  let paths = [path.join(addon.basePath, addon.name)]
  if (addon.localAddon) {
    if (addon.localAddon['X-Tukui-ProjectFolders'])
      paths = addon.localAddon['X-Tukui-ProjectFolders'].split(',').map((folder) => path.join(addon.basePath, folder.trim()))
    //pre-install cleanup
    paths.forEach((path) => {
      if (!fs.existsSync(path)) return
      if (fs.existsSync(path + '-bak')) fs.rmdirSync(path + '-bak', { recursive: true })
      fs.renameSync(path, path + '-bak')
    })
  }

  try {
    const filePath = path.join(tmpdir(), crypto.randomBytes(16).toString('hex') + '.zip')
    await downloadAddon(addon.url, filePath)
    await extract(filePath, { dir: addon.basePath })

    if (addon.localAddon) paths.forEach((path) => fs.rmdirSync(path + '-bak', { recursive: true }))
  } catch (err) {
    if (addon.localAddon)
      paths.forEach((path) => {
        if (fs.existsSync(path)) fs.rmdirSync(path, { recursive: true })
        fs.renameSync(path + '-bak', path)
      })
  }
}
const downloadAddon = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    https
      .get(url, function (response) {
        response.pipe(file)
        file.on('finish', function () {
          file.close(() => {
            resolve()
          })
        })
      })
      .on('error', (err) => reject(err))
  })
}
//#endregion

//#region Functions
const setOpenAtLogin = () => {
  let autoUpdate = storage.get('auto-update')
  autoUpdate = autoUpdate.success ? autoUpdate.data || true : true
  app.setLoginItemSettings({
    openAtLogin: autoUpdate,
    openAsHidden: autoUpdate,
  })
}
//#endregion

//#region Inter-app communication
ipcMain.on('main', (event, eventName, arg1) => {
  if (eventName === 'icon_click') toggleMainWindow()
  else if (eventName === 'update_changed') {
    const autoUpdate = arg1
    storage.set('auto-update', { checked: autoUpdate })
    app.setLoginItemSettings({
      openAtLogin: autoUpdate,
      openAsHidden: autoUpdate,
    })
    if (!autoUpdate && (!mainWindow || !mainWindow.isVisible())) app.quit()
  } else if (eventName === 'update_requested') {
    autoUpdater.downloadUpdate()
  } else if (eventName === 'update_install') {
    updating = true
    autoUpdater.quitAndInstall()
  } else if (eventName === 'close_tray') {
    trayWindow?.destroy()
    tray?.destroy()
    if (!mainWindow?.isVisible()) {
      mainWindow.destroy()
      app.quit()
    }
  }
})
ipcMain.handle('install_addon', async (event, addon) => {
  try {
    await installAddon(addon)
    return AddonToc(addon.basePath, addon.name)
  } catch {
    return false
  }
})
//#endregion

//#region Main Window
const allWindowsClosed = () => app.quit()
const mainWindowClosed = (event) => {
  if (!updating) event.preventDefault()
  else return
  const autoUpdate = storage.get('auto-update')
  if (autoUpdate.status && (autoUpdate.data === true || autoUpdate.data.checked || autoUpdate.data === undefined)) {
    mainWindow.hide()
    app.dock.hide()
  } else {
    mainWindow.destroy()
    app.quit()
  }
}

const createMainWindow = (openHidden = false) => {
  if (openHidden) app.dock.hide()
  if (mainWindow != null && !openHidden) {
    mainWindow.show()
    return
  }
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 900,
    show: !openHidden,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: isDev,
      webSecurity: false,
    },
    backgroundColor: '#000',
  })
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)
  mainWindow.on('close', mainWindowClosed)
  mainWindow.on('ready-to-show', () => {})
  mainWindow.on('show', () => {})
}

const toggleMainWindow = () => {
  if (!mainWindow) {
    createMainWindow()
    app.dock.show()
  } else if (mainWindow.isVisible()) {
    if (!trayWindow || trayWindow == null) {
      app.quit()
      return
    }
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
  if (!mainWindow || mainWindow === null) {
    createMainWindow()
  } else {
    mainWindow.show()
  }
  app.dock.show()
})
app.on('ready-to-show', () => {})
//#endregion

//#region AutoUpdater events
autoUpdater.on('update-available', () => {
  try {
    if (mainWindow && mainWindow?.isVisible()) mainWindow.webContents.send('update-available')
    else autoUpdater.downloadUpdate()
  } catch (err) {}
})

autoUpdater.on('update-downloaded', () => {
  try {
    if (mainWindow && mainWindow?.isVisible()) mainWindow.webContents.send('update-downloaded')
    else {
      storage.set('doing-background-update', true)
      app.setLoginItemSettings({
        openAsHidden: true,
      })
      updating = true
      autoUpdater.quitAndInstall()
    }
  } catch (err) {}
})

const checkForClientUpdates = () => {
  try {
    autoUpdater.checkForUpdates()
  } catch {}
  setTimeout(checkForClientUpdates, clientUpdateInterval)
}
//#endregion
