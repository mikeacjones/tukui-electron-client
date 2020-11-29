import './SmallAddon.css'
import GetAppIcon from '@material-ui/icons/GetApp'

function convertDownloadCount(count) {
  if (count >= 1000000) return `${(count / 1000000.0).toFixed(1)}M`
  else if (count >= 1000) return `${(count / 1000.0).toFixed(1)}K`
  else return count
}

export default function SmallAddon(props) {
  const { addon, dummy } = props

  return (
    <div className={`SmallAddon${(dummy) ? ' FlexDummy' : ''}`}>
      <div className="SmallAddon-image">
        <img src={addon.screenshot_url} />
      </div>
      <div className="SmallAddon-content">
        <div className="SmallAddon-body">
          <span className="SmallAddon-name">{addon.name}</span>
          <span className="SmallAddon-category">{addon.category}</span>
        </div>
        <div className="SmallAddon-footer">
          <GetAppIcon />
          <span>{convertDownloadCount(addon.downloads)}</span>
          <span style={{marginLeft: '15px'}}>by {addon.author}</span>
        </div>
      </div>
    </div>
  )
}
