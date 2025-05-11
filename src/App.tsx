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
import { Brightness4, Brightness7, QuestionAnswer } from '@mui/icons-material'
import { HelmetProvider } from 'react-helmet-async'
import { TabPanel } from './components/TabPanel'
import { FormatPanel } from './components/FormatPanel'
import { ComparePanel } from './components/ComparePanel'
import { ConvertPanel } from './components/ConvertPanel'
import { VisualizePanel } from './components/VisualizePanel'
import { SchemaValidationPanel } from './components/SchemaValidationPanel'
import { QueryPanel } from './components/QueryPanel'
import { CodeGeneratorPanel } from './components/CodeGeneratorPanel'
import { ApiMockerPanel } from './components/ApiMockerPanel'
import { FaqPanel } from './components/FaqPanel'
import { Footer } from './components/Footer'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useThemeContext } from './context/ThemeContext'
import { SharedStateProvider, useSharedState } from './context/SharedStateContext'
import { ToolSeoMetadata } from './components/ToolSeoMetadata'

// 工具标识符映射
const TOOL_NAMES = [
  'format',
  'compare',
  'convert',
  'visualize',
  'validate',
  'query',
  'codeGenerator',
  'apiMocker',
  'faq'
] as const;

// 主应用组件
function AppContent() {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const { sharedState, clearSharedState } = useSharedState();
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

  // 处理共享链接，设置初始Tab
  useEffect(() => {
    if (sharedState.hasSharedParams && sharedState.tool) {
      // 根据工具名称设置对应的Tab索引
      const toolTabMap: Record<string, number> = {
        'format': 0,
        'compare': 1,
        'convert': 2,
        'visualize': 3,
        'validate': 4,
        'query': 5,
        'codeGenerator': 6,
        'apiMocker': 7
      };
      
      if (toolTabMap[sharedState.tool] !== undefined) {
        setActiveTab(toolTabMap[sharedState.tool]);
      }
    }
  }, [sharedState]);

  // SEO Optimization - Update meta description based on active tab
  useEffect(() => {
    // Add meta description based on active tab
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptions = [
      t('format.description'),
      t('compare.description'),
      t('convert.description'),
      t('visualize.description'),
      t('validate.description'),
      t('query.description'),
      t('codeGenerator.description'),
      t('apiMocker.description'),
      t('faq.description')
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

  // 获取当前活跃的工具名称
  const getActiveToolName = () => {
    return TOOL_NAMES[activeTab];
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 工具SEO元数据 */}
      <ToolSeoMetadata
        toolName={TOOL_NAMES[activeTab]}
        isActive={true}
      />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <Tooltip title={t('tabs.faq')}>
            <IconButton 
              color="inherit" 
              onClick={() => setActiveTab(8)}
              aria-label={t('tabs.faq')}
              sx={{ mr: 1 }}
            >
              <QuestionAnswer />
            </IconButton>
          </Tooltip>
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
              'JSON visualization', 'JSON query', 'JSON schema', 'developer tools', 'data tools', 'API mocking',
              'JSON FAQ', 'JSON help'].map((keyword) => (
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
            <Tab label={t('tabs.codeGenerator')} />
            <Tab label={t('tabs.apiMocker')} />
            <Tab label={t('tabs.faq')} icon={<QuestionAnswer />} iconPosition="start" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <FormatPanel 
              onSnackbar={handleSnackbar} 
              initialData={activeTab === 0 && sharedState.tool === 'format' ? sharedState.jsonData : null}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ComparePanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ConvertPanel 
              onSnackbar={handleSnackbar} 
              initialData={activeTab === 2 && sharedState.tool === 'convert' ? sharedState.jsonData : null}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <VisualizePanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <SchemaValidationPanel 
              onSnackbar={handleSnackbar} 
              initialData={activeTab === 4 && sharedState.tool === 'validate' ? sharedState.jsonData : null}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <QueryPanel 
              onSnackbar={handleSnackbar} 
              initialData={activeTab === 5 && sharedState.tool === 'query' ? sharedState.jsonData : null}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <CodeGeneratorPanel onSnackbar={handleSnackbar} />
          </TabPanel>

          <TabPanel value={activeTab} index={7}>
            <ApiMockerPanel onSnackbar={handleSnackbar} />
          </TabPanel>
          
          <TabPanel value={activeTab} index={8}>
            <FaqPanel onSnackbar={handleSnackbar} />
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

// 带有SharedStateProvider的App组件
function App() {
  return (
    <HelmetProvider>
      <SharedStateProvider>
        <AppContent />
      </SharedStateProvider>
    </HelmetProvider>
  )
}

export default App 