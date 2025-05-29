import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { CookieToolPanel } from '../components/CookieToolPanel';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useThemeContext } from '../context/ThemeContext';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export const CookieToolPage: React.FC = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const [searchParams] = useSearchParams();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 从URL参数获取初始数据
  const initialData = searchParams.get('data');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SEO 
        title={`${t('cookieTool.title')} - JSONGeeks`}
        description={t('cookieTool.description')}
        keywords={t('cookieTool.keywords', { returnObjects: true }) as string[]}
      />

      {/* 顶部导航栏 */}
      <AppBar position="static">
        <Toolbar>
          <Tooltip title={t('home.backToHome')}>
            <IconButton color="inherit" component={Link} to="/" sx={{ mr: 2 }}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            JSONGeeks - {t('cookieTool.title')}
          </Typography>
          <LanguageSwitcher />
          <Tooltip title={mode === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}>
            <IconButton color="inherit" onClick={toggleTheme} aria-label={t('theme.toggle')}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* 主内容区域 */}
      <Box sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <CookieToolPanel 
            onSnackbar={handleSnackbar}
            initialData={initialData}
          />
        </Container>
      </Box>

      {/* 页脚 */}
      <Footer />

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 