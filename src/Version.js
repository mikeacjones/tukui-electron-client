import { version } from 'react'
import './Version.css'

export default function Version() {
  const appVersion = window.require('electron').remote.app.getVersion()

  return (
    <div id="AppVersion">{appVersion}</div>
  )
}