import './TukuiClient.css'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Addons from './Addons'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}))

export default function TukuiClient() {
  const [addons, setAddons] = React.useState({})
  const [version, setVersion] = React.useState('Retail')
  const classes = useStyles()

  const handleChange = (event) => {
    setVersion(event.target.value)
  }

  React.useEffect(() => {
    const ipcRenderer = window.require('electron').ipcRenderer
    ipcRenderer.on('update-addons', (event, data) => {
      setAddons(data)
    })
  }, [])

  return (
    <div className="TukuiClient">
      <div id="dragArea"> </div>
      <div className="TukuiClient-menu">
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="game-version-select-outlined-label">Game Version</InputLabel>
          <Select labelId="game-version-select-outlined-label" onChange={handleChange} value={version} id="game-version" label="Game Version">
            <MenuItem value="Retail">Retail</MenuItem>
            <MenuItem value="Classic">Classic</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="TukuiClient-addons">
        <Addons addons={addons[version]} version={version} />
      </div>
    </div>
  )
}
