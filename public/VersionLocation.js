const storage = require('electron-json-storage-sync')
const fs = require('fs')

const defaultVersions = {
  Retail: {
    path: '/Applications/World of Warcraft/_retail_/Interface/AddOns',
    installed: false,
    provider: 'Retail',
  },
  Classic: {
    path: '/Applications/World of Warcraft/_classic_/Interface/AddOns',
    installed: false,
    provider: 'Classic',
  },
}

function GetClientVersions(callback) {
  let versions = defaultVersions //storage.get('client-versions').data
  Object.keys(versions).forEach((client) => {
    versions[client].installed = fs.existsSync(versions[client].path)
  })
  return versions
}

module.exports = GetClientVersions
