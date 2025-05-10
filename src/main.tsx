import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
) 