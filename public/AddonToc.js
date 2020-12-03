const path = require('path')
const fs = require('fs')

module.exports = function AddonToc(versionPath, addonName) {
  const tocPath = path.join(versionPath, addonName, `${addonName}.toc`)
  if (!fs.existsSync(tocPath)) return null

  var tocObject = { name: addonName }

  require('fs')
    .readFileSync(path.join(versionPath, addonName, `${addonName}.toc`), 'utf-8')
    .split(/\r?\n/)
    .forEach(function (line) {
      const kvp = line.match(/## ([^:]+): (.+)/)
      if (kvp !== null) {
        tocObject[kvp[1]] = kvp[2]
      }
    })

  return tocObject
}
