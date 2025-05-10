import { useState, useEffect } from 'react'
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
  Chip
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

  // SEO Optimization - Update document title based on active tab
  useEffect(() => {
    const tabTitles = [
      "JSON Formatter & Beautifier | JSON Tools",
      "JSON Diff & Compare Tool | JSON Tools",
      "JSON Converter (XML, CSV, YAML) | JSON Tools",
      "JSON Visualization Tool | JSON Tools",
      "JSON Schema Validator | JSON Tools",
      "JSONPath Query Tool | JSON Tools"
    ];
    
    document.title = tabTitles[activeTab];
    
    // Add meta description based on active tab
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptions = [
      "Free online JSON formatter, beautifier and validator with advanced formatting options. Format, validate and make your JSON data more readable.",
      "Compare two JSON objects and visualize the differences. Perfect for API testing and debugging JSON outputs.",
      "Convert JSON to XML, CSV, YAML and other formats easily. Transform your JSON data to different data representations.",
      "Create interactive visualizations from your JSON data. Generate charts, graphs and visual representations with a few clicks.",
      "Validate JSON against JSON Schema. Ensure your data matches the required structure and formats for your application.",
      "Query JSON using JSONPath expressions. Extract specific data from complex JSON structures with powerful path syntax."
    ];
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptions[activeTab]);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descriptions[activeTab];
      document.head.appendChild(meta);
    }
  }, [activeTab]);

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
            JSON Tools - Comprehensive JSON Utilities
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* SEO Optimized Page Introduction */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            All-in-One JSON Tools Suite
          </Typography>
          <Typography variant="body1" paragraph>
            A comprehensive collection of JSON utilities for developers and data professionals. Format, validate, 
            compare, convert, query, and visualize JSON data with these powerful online tools.
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