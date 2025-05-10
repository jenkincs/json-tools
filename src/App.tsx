import { useState } from 'react'
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
  Toolbar
} from '@mui/material'
import { TabPanel } from './components/TabPanel'
import { FormatPanel } from './components/FormatPanel'
import { ComparePanel } from './components/ComparePanel'
import { ConvertPanel } from './components/ConvertPanel'
import { VisualizePanel } from './components/VisualizePanel'
import { SchemaValidationPanel } from './components/SchemaValidationPanel'
import { QueryPanel } from './components/QueryPanel'

function App() {
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            JSON Tools
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Format" />
            <Tab label="Compare" />
            <Tab label="Convert" />
            <Tab label="Visualize" />
            <Tab label="Validate" />
            <Tab label="Query" />
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