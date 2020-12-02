const path = require('path')
const fs = require('fs')
const readLine = require('readline')
const versionLocations = require('./VersionLocation')

module.exports = function AddonToc(version, addonName) {
  const tocPath = path.join(versionLocations.mac[version], addonName, `${addonName}.toc`)
  if (!fs.existsSync(tocPath)) return null

  var tocObject = { name: addonName }

  require('fs')
    .readFileSync(path.join(versionLocations.mac[version], addonName, `${addonName}.toc`), 'utf-8')
    .split(/\r?\n/)
    .forEach(function (line) {
      const kvp = line.match(/## ([^:]+): (.+)/)
      if (kvp !== null) {
        tocObject[kvp[1]] = kvp[2]
      }
    })

  return tocObject
}
