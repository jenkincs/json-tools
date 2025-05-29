import { useState, useEffect, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
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
  Tooltip,
  Button,
  CircularProgress
} from '@mui/material'
import { Brightness4, Brightness7, QuestionAnswer, Home, Cookie } from '@mui/icons-material'
import { TabPanel } from './components/TabPanel'
// 懒加载组件
const FormatPanel = lazy(() => import('./components/FormatPanel').then(module => ({ default: module.FormatPanel })))
const ComparePanel = lazy(() => import('./components/ComparePanel').then(module => ({ default: module.ComparePanel })))
const ConvertPanel = lazy(() => import('./components/ConvertPanel').then(module => ({ default: module.ConvertPanel })))
const VisualizePanel = lazy(() => import('./components/VisualizePanel').then(module => ({ default: module.VisualizePanel })))
const SchemaValidationPanel = lazy(() => import('./components/SchemaValidationPanel').then(module => ({ default: module.SchemaValidationPanel })))
const QueryPanel = lazy(() => import('./components/QueryPanel').then(module => ({ default: module.QueryPanel })))
const CodeGeneratorPanel = lazy(() => import('./components/CodeGeneratorPanel').then(module => ({ default: module.CodeGeneratorPanel })))
const ApiMockerPanel = lazy(() => import('./components/ApiMockerPanel').then(module => ({ default: module.ApiMockerPanel })))
const FaqPanel = lazy(() => import('./components/FaqPanel').then(module => ({ default: module.FaqPanel })))
const JwtDecoderPanel = lazy(() => import('./components/JwtDecoderPanel').then(module => ({ default: module.JwtDecoderPanel })))
const JsonEditorPanel = lazy(() => import('./components/JsonEditorPanel').then(module => ({ default: module.JsonEditorPanel })))
const JsonCryptoPanel = lazy(() => import('./components/JsonCryptoPanel').then(module => ({ default: module.JsonCryptoPanel })))
const SortPanel = lazy(() => import('./components/SortPanel').then(module => ({ default: module.SortPanel })))
const CookieToolPanel = lazy(() => import('./components/CookieToolPanel').then(module => ({ default: module.CookieToolPanel })))

import { Footer } from './components/Footer'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useThemeContext } from './context/ThemeContext'
import { SharedStateProvider, useSharedState } from './context/SharedStateContext'
import { SEO } from './components/SEO'
import { trackToolUsage } from './utils/analytics'

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
  'jwtDecoder',
  'jsonEditor',
  'jsonCrypto',
  'sort',
  'faq',
  'cookieTool'
] as const;

// 主应用组件
function AppContentInner() {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const { sharedState } = useSharedState();
  const location = useLocation();
  
  // 从 localStorage 获取上次使用的标签索引，如果没有则默认为 0
  const getInitialTabIndex = () => {
    // 首先检查URL参数中是否有tab
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam !== null && !isNaN(Number(tabParam))) {
      return Number(tabParam);
    }
    
    // 否则从localStorage中获取
    const savedTab = localStorage.getItem('lastActiveTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTabIndex());
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
        'apiMocker': 7,
        'jwtDecoder': 8,
        'jsonEditor': 9,
        'jsonCrypto': 10,
        'sort': 11,
        'faq': 12,
        'cookieTool': 13
      };
      
      if (toolTabMap[sharedState.tool] !== undefined) {
        setActiveTab(toolTabMap[sharedState.tool]);
      }
    }
  }, [sharedState]);

  // 当标签改变时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('lastActiveTab', activeTab.toString());
    // 跟踪工具使用情况
    const toolName = TOOL_NAMES[activeTab];
    trackToolUsage(toolName, 'tab_switch');
  }, [activeTab]);

  // 当标签改变时，滚动到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // 监听URL参数变化，更新activeTab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam !== null && !isNaN(Number(tabParam))) {
      setActiveTab(Number(tabParam));
      window.scrollTo(0, 0);
    }
  }, [location.search]);

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
      t('jwtDecoder.description'),
      t('jsonEditor.description'),
      t('jsonCrypto.description'),
      t('sort.description'),
      t('faq.description'),
      t('cookieTool.description')
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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
  const activeToolName = TOOL_NAMES[activeTab];
  
  // 生成SEO元数据
  const getSeoMetadata = () => {
    const title = `${t(`tabs.${activeToolName}`)} | JSONGeeks`;
    const description = t(`${activeToolName}.description`);
    let keywords: string[] = [];
    
    try {
      const keywordsArray = t(`${activeToolName}.keywords`, { returnObjects: true }) as string[];
      if (Array.isArray(keywordsArray) && keywordsArray.every(k => typeof k === 'string')) {
        keywords = keywordsArray;
      }
    } catch (error) {
      console.error('Error getting keywords:', error);
    }
    
    return { title, description, keywords };
  };
  
  const seoMetadata = getSeoMetadata();

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 替换旧的ToolSeoMetadata组件为新的SEO组件 */}
      <SEO
        title={seoMetadata.title}
        description={seoMetadata.description}
        keywords={seoMetadata.keywords}
      />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<Home />}
            sx={{ mr: 2 }}
          >
            {t('landingPages.backToHome')}
          </Button>
          <Tooltip title={t('tabs.faq')}>
            <IconButton 
              color="inherit" 
              onClick={() => setActiveTab(12)}
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
            <Tab label={t('tabs.jwtDecoder')} />
            <Tab label={t('tabs.jsonEditor')} />
            <Tab label={t('tabs.jsonCrypto')} />
            <Tab label={t('tabs.sort')} />
            <Tab label={t('tabs.faq')} icon={<QuestionAnswer />} iconPosition="start" />
            <Tab label={t('tabs.cookieTool')} icon={<Cookie />} iconPosition="start" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Suspense fallback={<CircularProgress />}>
              <FormatPanel 
                onSnackbar={handleSnackbar} 
                initialData={activeTab === 0 && sharedState.tool === 'format' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Suspense fallback={<CircularProgress />}>
              <ComparePanel onSnackbar={handleSnackbar} />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Suspense fallback={<CircularProgress />}>
              <ConvertPanel 
                onSnackbar={handleSnackbar} 
                initialData={activeTab === 2 && sharedState.tool === 'convert' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Suspense fallback={<CircularProgress />}>
              <VisualizePanel onSnackbar={handleSnackbar} />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Suspense fallback={<CircularProgress />}>
              <SchemaValidationPanel 
                onSnackbar={handleSnackbar} 
                initialData={activeTab === 4 && sharedState.tool === 'validate' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Suspense fallback={<CircularProgress />}>
              <QueryPanel 
                onSnackbar={handleSnackbar} 
                initialData={activeTab === 5 && sharedState.tool === 'query' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <Suspense fallback={<CircularProgress />}>
              <CodeGeneratorPanel onSnackbar={handleSnackbar} />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={7}>
            <Suspense fallback={<CircularProgress />}>
              <ApiMockerPanel onSnackbar={handleSnackbar} />
            </Suspense>
          </TabPanel>
          
          <TabPanel value={activeTab} index={8}>
            <Suspense fallback={<CircularProgress />}>
              <JwtDecoderPanel 
                onSnackbar={handleSnackbar} 
                initialData={activeTab === 8 && sharedState.tool === 'jwtDecoder' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>
          
          <TabPanel value={activeTab} index={9}>
            <Suspense fallback={<CircularProgress />}>
              <JsonEditorPanel 
                onSnackbar={handleSnackbar}
                initialData={activeTab === 9 && sharedState.tool === 'jsonEditor' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>
          
          <TabPanel value={activeTab} index={10}>
            <Suspense fallback={<CircularProgress />}>
              <JsonCryptoPanel 
                onSnackbar={handleSnackbar}
                initialData={activeTab === 10 && sharedState.tool === 'jsonCrypto' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>
          
          <TabPanel value={activeTab} index={11}>
            <Suspense fallback={<CircularProgress />}>
              <SortPanel 
                onSnackbar={handleSnackbar}
                initialData={activeTab === 11 && sharedState.tool === 'sort' ? sharedState.jsonData : null}
              />
            </Suspense>
          </TabPanel>
          
          <TabPanel value={activeTab} index={12}>
            <Suspense fallback={<CircularProgress />}>
              <FaqPanel onSnackbar={handleSnackbar} />
            </Suspense>
          </TabPanel>

          <TabPanel value={activeTab} index={13}>
            <Suspense fallback={<CircularProgress />}>
              <CookieToolPanel onSnackbar={handleSnackbar} />
            </Suspense>
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
function AppContent() {
  return (
    <SharedStateProvider>
      <AppContentInner />
    </SharedStateProvider>
  )
}

export default AppContent 