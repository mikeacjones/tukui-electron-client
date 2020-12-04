const { ipcRenderer } = require('electron')
const storage = require('electron-json-storage-sync');

const CHANNEL_NAME = 'main'

let autoUpdate = storage.get('auto-update')
if (autoUpdate.status) {
  document.querySelector('#update').checked = autoUpdate.data === true || autoUpdate.data.checked === undefined || autoUpdate.data.checked
}

document.querySelector('#icon').addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_NAME, 'icon_click')
})

document.querySelector('#update').addEventListener('change', (event) => {
  ipcRenderer.send(CHANNEL_NAME, 'update_changed', event.target.checked )
})

document.querySelector('#trayExitButton').addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_NAME, 'close_tray')
})