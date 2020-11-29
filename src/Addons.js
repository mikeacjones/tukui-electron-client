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

  //#region Props
  const { addons } = props

  const [value, setValue] = React.useState(0)
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [sortAddonKey, setSortAddonKey] = React.useState('name')
  const [sortDropdownOpen, setSortDropdownOpen] = React.useState(false)
  const [sortAscending, setSortAscending] = React.useState(true)

  const filteredAddons = () =>
    addons.all.filter((addon) => selectedCategory === '' || addon.category === selectedCategory).sort((a, b) => {
      if (!a.hasOwnProperty(sortAddonKey) || !b.hasOwnProperty(sortAddonKey)) {
        // property doesn't exist on either object
        return 0;
      }
  
      const varA = (typeof a[sortAddonKey] === 'string')
        ? ((!isNaN(a[sortAddonKey]) && !isNaN(parseFloat(a[sortAddonKey]))) ? parseFloat(a[sortAddonKey]) : a[sortAddonKey].toUpperCase()) : a[sortAddonKey];
      const varB = (typeof b[sortAddonKey] === 'string')
        ? ((!isNaN(b[sortAddonKey]) && !isNaN(parseFloat(b[sortAddonKey]))) ? parseFloat(b[sortAddonKey]) : b[sortAddonKey].toUpperCase()) : b[sortAddonKey];

  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }

      if (sortAscending) return comparison
      else return comparison * -1
    })
  //#endregion

  //#region Event handlers
  const handleChange = (event, newValue) => setValue(newValue)
  const handleCategoryChange = (event) => setSelectedCategory(event.target.value)

  const handleSortChange = (event) => {
    if (event.target.value === '') setSortAddonKey('name')
    else setSortAddonKey(event.target.value)
  }
  const onSelectClose = (event) => {
    let key = event.target.getAttribute('data-value')
    if (key === sortAddonKey) setSortAscending(!sortAscending)
    setSortDropdownOpen(false)
  }
  const onSelectOpen = (event) => setSortDropdownOpen(true)
  //#endregion

  //#region TabPanel
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
  //#endregion

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
            </TabPanel>
            <TabPanel value={value} index={1}>
              <div className="Addons-small-container">
                <div className="Addons-small-menu">
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="category-filter-select-outlined-label">Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      labelId="category-filter-select-outlined-label"
                      onChange={handleCategoryChange}
                      id="category-filter"
                      label="Category"
                    >
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
                          <MenuItem value={addon} key={addon}>
                            {addon}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="addon-sort-select-outlined-label">Sort</InputLabel>
                    <Select
                      open={sortDropdownOpen}
                      onOpen={onSelectOpen}
                      onClose={onSelectClose}
                      value={sortAddonKey}
                      onChange={handleSortChange}
                      labelId="addon-sort-select-outlined-label"
                      id="addon-sort"
                      label="Category"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {Object.keys(addons.elvui)
                        .sort()
                        .map((key) => (
                          <MenuItem value={key} key={key} onClose={onSelectClose}>
                            {key} {sortAscending ? '\u2191' : '\u2193'}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="Addons-small">
                  {filteredAddons().map((addon) => (
                    <SmallAddon addon={addon} key={addon.id} />
                  ))}
                  <SmallAddon dummy addon={{ name: 'empty', downloads: 0 }} />
                  <SmallAddon dummy addon={{ name: 'empty', downloads: 0 }} />
                  <SmallAddon dummy addon={{ name: 'empty', downloads: 0 }} />
                  <SmallAddon dummy addon={{ name: 'empty', downloads: 0 }} />
                  <SmallAddon dummy addon={{ name: 'empty', downloads: 0 }} />
                  <SmallAddon dummy addon={{ name: 'empty', downloads: 0 }} />
                </div>
              </div>
            </TabPanel>
          </div>
        </Paper>
      </div>
    </div>
  )
}
