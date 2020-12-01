import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    background: { default: '#222' },
    primary: {
      light: '#e6ceff',
      main: '#b39ddb',
      dark: '#836fa9',
      contrastText: '#fff',
    },
    secondary: {
      light: '#f8ffd7',
      main: '#c5e1a5',
      dark: '#94af76',
      contrastText: '#000',
    }
  },
  typography: {
    fontFamily: ['Roboto'],
  },
})

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <h1>TRAY</h1>
  </ThemeProvider>,
  document.getElementById('root')
)
