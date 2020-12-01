import './Version.css'
import React from 'react'
import Button from '@material-ui/core/Button'

export default function Version() {
  const appVersion = window.require('electron').remote.app.getVersion()
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const ipcRenderer = window.require('electron').ipcRenderer

  const sendUpdateCommand = (event) => {
    ipcRenderer.send('main', 'update_requested')
  }

  ipcRenderer.on('update-available', (event) => {
    setUpdateAvailable(true)
  })

  return (
    <div id="AppVersion">
      {appVersion}
      {updateAvailable && (
        <Button variant="outlined" color="primary" id="UpdateClientButton" onClick={sendUpdateCommand}>
          Update Client
        </Button>
      )}
    </div>
  )
}
