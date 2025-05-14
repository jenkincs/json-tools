import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { HelmetProvider } from 'react-helmet-async'
import './i18n' // 导入i18n配置
import './index.css'
import { initGA } from './utils/analytics' // 导入GA初始化函数

// 初始化Google Analytics
initGA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <CssBaseline />
          <RouterProvider router={router} />
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
) 