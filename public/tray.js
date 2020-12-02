const { ipcRenderer } = require('electron')
const storage = require('electron-json-storage');

const CHANNEL_NAME = 'main'

storage.get('auto-update', (err, obj) => {
  if (err) return;
  document.querySelector('#update').checked = obj
})

document.querySelector('#icon').addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_NAME, 'icon_click')
})

document.querySelector('#update').addEventListener('change', (event) => {
  ipcRenderer.send(CHANNEL_NAME, 'update_changed', event.target.checked )
})

document.querySelector('#trayExitButton').addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_NAME, 'close_tray')
})