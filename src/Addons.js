import './Addons.css'
import React from 'react'
import LargeAddon from './LargeAddon'
import SmallAddon from './SmallAddon'
import AddonTable from './AddonTable'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'

export default function Addons(props) {
  const { addons } = props

  const [value, setValue] = React.useState(2)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
      <div className="Addons-tabPanel" role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    )
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  }

  return (
    <div className="Addons">
      <div className="Addons-large">
        <LargeAddon addon={addons.availableAddons.elvui} />
        <LargeAddon addon={addons.availableAddons.tukui} />
      </div>
      <div className="Addons-table">
        <Paper square>
          <Tabs indicatorColor="primary" value={value} textColor="default" onChange={handleChange} aria-label="disabled tabs example">
            <Tab label="My Addons" />
            <Tab label="Get More Addons" />
          </Tabs>
          <div className="Addons-tabPanels">
            <TabPanel value={value} index={0}>
{/*               <AddonTable addons={addons.availableAddons.all} />
 */}            </TabPanel>
            <TabPanel value={value} index={1}>
              <div className="Addons-small">
                {addons.availableAddons.all.map((addon) => (
                  <SmallAddon addon={addon} />
                ))}
              </div>
            </TabPanel>
          </div>
        </Paper>
      </div>
    </div>
  )
}
