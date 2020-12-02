import './LargeAddon.css'
import React from 'react'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'

export default function LargeAddon(props) {
  const { addon, disabled } = props

  let installButtonText, installButtonColor
  if (!addon.localAddon) {
    installButtonText = 'Install'
    installButtonColor = 'primary'
  } else if (addon.version !== addon.localAddon.Version) {
    installButtonText = 'Update'
    installButtonColor = 'secondary'
  } else {
    installButtonText = 'Re-Install'
    installButtonColor = 'default'
  }

  return (
    <div className="LargeAddon">
      <Card className="LargeAddon-card">
        <div className="LargeAddon-image">
          <img src={addon.screenshot_url} alt="" />
        </div>
        <div className="LargeAddon-content">
          <h1 className="LargeAddon-title">{addon.name}</h1>
          <div className="LargeAddon-info">
            <div className="LargeAddon-info-installed">{addon.localAddon ? `Installed: ${addon.localAddon.Version}` : ''}&nbsp;</div>
            <div className="LargeAddon-info-available">Latest Version: {addon.version}</div>
          </div>
          <div className="LargeAddon-button">
            <Button variant="outlined" color={installButtonColor} disabled={disabled}>
              {installButtonText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
