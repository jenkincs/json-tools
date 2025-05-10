import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Typography,
  AppBar,
  Toolbar,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { TabPanel } from './components/TabPanel'
import { FormatPanel } from './components/FormatPanel'
import { ComparePanel } from './components/ComparePanel'
import { ConvertPanel } from './components/ConvertPanel'
import { VisualizePanel } from './components/VisualizePanel'
import { SchemaValidationPanel } from './components/SchemaValidationPanel'
import { QueryPanel } from './components/QueryPanel'
import { Footer } from './components/Footer'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useThemeContext } from './context/ThemeContext'

function App() {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const [activeTab, setActiveTab] = useState(0)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // SEO Optimization - Update document title based on active tab
  useEffect(() => {
    const tabTitles = [
      t('format.title') + " | JSON Tools",
      t('compare.title') + " | JSON Tools",
      t('convert.title') + " | JSON Tools",
      t('visualize.title') + " | JSON Tools",
      t('validate.title') + " | JSON Tools",
      t('query.title') + " | JSON Tools"
    ];
    
    document.title = tabTitles[activeTab];
    
    // Add meta description based on active tab
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptions = [
      t('format.description'),
      t('compare.description'),
      t('convert.description'),
      t('visualize.description'),
      t('validate.description'),
      t('query.description')
    ];
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptions[activeTab]);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descriptions[activeTab];
      document.head.appendChild(meta);
    }
  }, [activeTab, t]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <LanguageSwitcher />
          <Tooltip title={mode === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}>
            <IconButton color="inherit" onClick={toggleTheme} aria-label={t('theme.toggle')}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* SEO Optimized Page Introduction */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('app.header')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('app.description')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {['JSON tools', 'JSON formatter', 'JSON validator', 'JSON comparison', 'JSON converter',
              'JSON visualization', 'JSON query', 'JSON schema', 'developer tools', 'data tools'].map((keyword) => (
              <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
        </Box>
        
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('tabs.format')} />
            <Tab label={t('tabs.compare')} />
            <Tab label={t('tabs.convert')} />
            <Tab label={t('tabs.visualize')} />
            <Tab label={t('tabs.validate')} />
            <Tab label={t('tabs.query')} />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <FormatPanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ComparePanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ConvertPanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <VisualizePanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <SchemaValidationPanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <QueryPanel onSnackbar={handleSnackbar} />
          </TabPanel>
        </Paper>
      </Container>

      <Footer />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default App 