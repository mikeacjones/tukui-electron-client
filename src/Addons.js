import './Addons.css'
import React from 'react'
import LargeAddon from './LargeAddon'
import SmallAddon from './SmallAddon'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'

export default function Addons(props) {
  const { addons } = props

  const [value, setValue] = React.useState(0)
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [filteredAddons, setFilteredAddons] = React.useState(addons.all)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)
    if (event.target.value === '') setFilteredAddons(addons.all)
    else setFilteredAddons(addons.all.filter((addon) => addon.category === event.target.value))
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
      <div
        className="Addons-tabPanel"
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    )
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  }

  const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }))

  const classes = useStyles()

  return (
    <div className="Addons">
      <div className="Addons-large">
        <LargeAddon addon={addons.elvui} />
        <LargeAddon addon={addons.tukui} />
      </div>
      <div className="Addons-table">
        <Paper square>
          <Tabs indicatorColor="primary" value={value} textColor="inherit" onChange={handleChange} aria-label="disabled tabs example">
            <Tab label="My Addons" />
            <Tab label="Get More Addons" />
          </Tabs>
          <div className="Addons-tabPanels">
            <TabPanel value={value} index={0}>
              {/*               <AddonTable addons={addons.availableAddons.all} />
               */}
            </TabPanel>
            <TabPanel value={value} index={1}>
              <div className="Addons-small-container">
                <div className="Addons-small-menu">
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="category-filter-select-outlined-label">Category</InputLabel>
                    <Select value={selectedCategory} labelId="category-filter-select-outlined-label" onChange={handleCategoryChange} id="category-filter" label="Category">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {addons.all
                        .reduce((cats, addon) => {
                          if (!cats.includes(addon.category)) cats.push(addon.category)
                          return cats
                        }, [])
                        .sort()
                        .map((addon) => (
                          <MenuItem value={addon}>{addon}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="Addons-small">
                  {filteredAddons
                    .sort((a, b) => b.downloads - a.downloads)
                    .map((addon) => (
                      <SmallAddon addon={addon} />
                    ))}
                    <SmallAddon dummy addon={{name: 'empty', downloads: 0}} />
                    <SmallAddon dummy addon={{name: 'empty', downloads: 0}} />
                    <SmallAddon dummy addon={{name: 'empty', downloads: 0}} />
                    <SmallAddon dummy addon={{name: 'empty', downloads: 0}} />
                    <SmallAddon dummy addon={{name: 'empty', downloads: 0}} />
                    <SmallAddon dummy addon={{name: 'empty', downloads: 0}} />
                </div>
              </div>
            </TabPanel>
          </div>
        </Paper>
      </div>
    </div>
  )
}
