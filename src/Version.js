import './Version.css'
import React from 'react'
import Button from '@material-ui/core/Button'

export default function Version() {
  const appVersion = window.require('electron').remote.app.getVersion()
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [buttonMessage, setButtonMessage] = React.useState('Update Client')
  const [downloading, setDownloading] = React.useState(false)
  const [restart, setRestart] = React.useState(false)
  const ipcRenderer = window.require('electron').ipcRenderer

  const sendUpdateCommand = (event) => {
    ipcRenderer.send('main', !restart ? 'update_requested' : 'update_install')
    setDownloading(true)
    setButtonMessage('Downloading Update')
  }

  ipcRenderer.on('update-available', (event) => {
    setUpdateAvailable(true)
  })

  ipcRenderer.on('update-downloaded', (event) => {
    setDownloading(false)
    setRestart(true)
    setButtonMessage('Restart Client')
  })

  return (
    <div id="AppVersion">
      {appVersion}
      {updateAvailable && (
        <Button variant="outlined" color="primary" id="UpdateClientButton" onClick={sendUpdateCommand} disabled={downloading}>
          {buttonMessage}
        </Button>
      )}
    </div>
  )
}
