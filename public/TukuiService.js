const fetch = require('electron-fetch').default
const { readdirSync } = require('fs')
const path = require('path')
const GetClientVersions = require('./VersionLocation')
const AddonToc = require('./AddonToc')

async function FetchAddons(provider) {
  switch (provider) {
    case 'Classic':
      return await FetchClassicAddons()
    case 'Retail':
    default:
      return await FetchRetailAddons()
  }
}

async function FetchRetailAddons() {
  let retailAddons, elvui, tukui

  await fetch('https://tukui.org/client-api.php?addons=all')
    .then((res) => res.json())
    .then((res) => (retailAddons = res))
  await fetch('https://tukui.org/client-api.php?ui=elvui')
    .then((res) => res.json())
    .then((res) => (elvui = res))
  await fetch('https://tukui.org/client-api.php?ui=tukui')
    .then((res) => res.json())
    .then((res) => (tukui = res))

  return {
    elvui: elvui,
    tukui: tukui,
    all: retailAddons,
  }
}

async function FetchClassicAddons() {
  let classicAddons

  await fetch('https://tukui.org/client-api.php?classic-addons=all')
    .then((res) => res.json())
    .then((res) => (classicAddons = res))

  return {
    all: classicAddons.filter((addon) => parseInt(addon.id) > 2),
    elvui: classicAddons.filter((addon) => addon.id === '2')[0],
    tukui: classicAddons.filter((addon) => addon.id === '1')[0],
  }
}

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

function FetchInstalledAddons(client) {
  return getDirectories(client.path).map((addon) => { return { ...AddonToc(client.path, addon), basePath: client.path }})
}

module.exports = { FetchAddons, FetchInstalledAddons }
