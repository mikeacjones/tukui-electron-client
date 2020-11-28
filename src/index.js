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
  },
  typography: {
    fontFamily: ['Roboto'],
  },
})

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('root')
)
