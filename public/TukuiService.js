const fetch = require('electron-fetch').default
const { readdirSync } = require('fs')
const versionLocations = require('./VersionLocation')
const AddonToc = require('./AddonToc')

async function FetchAddons(callback) {
  let retailAddons, classicAddons, elvui, tukui

  await fetch('https://tukui.org/client-api.php?addons=all')
    .then((res) => res.json())
    .then((res) => (retailAddons = res))
  await fetch('https://tukui.org/client-api.php?classic-addons=all')
    .then((res) => res.json())
    .then((res) => (classicAddons = res))
  await fetch('https://tukui.org/client-api.php?ui=elvui')
    .then((res) => res.json())
    .then((res) => (elvui = res))
  await fetch('https://tukui.org/client-api.php?ui=tukui')
    .then((res) => res.json())
    .then((res) => (tukui = res))

  callback({
    Retail: {
      all: retailAddons,
      elvui: elvui,
      tukui: tukui,
    },
    Classic: {
      all: classicAddons.filter((addon) => parseInt(addon.id) > 2),
      elvui: classicAddons.filter((addon) => addon.id === '2')[0],
      tukui: classicAddons.filter((addon) => addon.id === '1')[0],
    },
  })
}

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

function FetchInstalledAddons(version) {
  try {
    const addons = getDirectories(versionLocations.mac[version])
    return addons.map((addon) => AddonToc(version, addon))
  } catch(err) {
    console.log(err)
    return []
  }
}

module.exports = { FetchAddons, FetchInstalledAddons }
