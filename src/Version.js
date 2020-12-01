import './Version.css'
import React from 'react'
const { ipcRenderer } = require('electron')

ipcRenderer.on('update-available', (event, arg) => {
  setVersion(arg)
})

export default function Version() {
  const appVersion = window.require('electron').remote.app.getVersion()
  const [ version, setVersion ] = React.use(appVersion)
  return (
    <div id="AppVersion">{appVersion}</div>
  )
}