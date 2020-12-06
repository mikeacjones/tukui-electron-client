import './LargeAddon.css'
import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'

export default function LargeAddon(props) {
  const { addon, disabled } = props
  const ipcRenderer = window.require('electron').ipcRenderer
  const [ installing, setInstalling ] = useState(false)
  const [ localAddon, setLocalAddon ] = useState(props.addon.localAddon)

  let installButtonText, installButtonColor
  if (!localAddon) {
    installButtonText = 'Install'
    installButtonColor = 'primary'
  } else if (addon.version !== localAddon.Version) {
    installButtonText = 'Update'
    installButtonColor = 'secondary'
  } else {
    installButtonText = 'Re-Install'
    installButtonColor = 'default'
  }

  const installAddon = () => {
    setInstalling(true)
    ipcRenderer.invoke('install_addon', addon).then((result) => {
      if (result) setLocalAddon(result)
      setInstalling(false)
    })
  }

  useEffect(() => {
    if (props.addon.localAddon !== localAddon) setLocalAddon(props.addon.localAddon)
  }, [localAddon, props.addon.localAddon])

  return (
    <div className="LargeAddon">
      <Card className="LargeAddon-card">
        <div className="LargeAddon-image">
          <img src={addon.screenshot_url} alt="" />
        </div>
        <div className="LargeAddon-content">
          <h1 className="LargeAddon-title">{addon.name}</h1>
          <div className="LargeAddon-info">
            <div className="LargeAddon-info-installed">{localAddon ? `Installed: ${localAddon.Version}` : ''}&nbsp;</div>
            <div className="LargeAddon-info-available">Latest Version: {addon.version}</div>
          </div>
          <div className="LargeAddon-button">
            <Button variant="outlined" color={installButtonColor} disabled={disabled || installing} onClick={installAddon}>
              {installing ? 'Installing...' : installButtonText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
