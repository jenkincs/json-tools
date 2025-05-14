import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Divider,
  Fab,
  Tooltip,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  FormatAlignLeft,
  CompareArrows,
  SwapHoriz,
  BarChart,
  CheckCircle,
  SearchOutlined,
  Code,
  Api,
  VpnKey,
  QuestionAnswer,
  Apps,
  Brightness4,
  Brightness7,
  Edit as EditIcon,
  Security
} from '@mui/icons-material';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useThemeContext } from '../context/ThemeContext';
import { Footer } from '../components/Footer';

// 工具类型定义
type Tool = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  
  // 添加页面加载时滚动到顶部的效果
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // 定义所有工具
  const tools: Tool[] = [
    { name: 'format', icon: <FormatAlignLeft fontSize="large" color="primary" />, path: '/format' },
    { name: 'compare', icon: <CompareArrows fontSize="large" color="primary" />, path: '/compare' },
    { name: 'convert', icon: <SwapHoriz fontSize="large" color="primary" />, path: '/convert' },
    { name: 'visualize', icon: <BarChart fontSize="large" color="primary" />, path: '/visualize' },
    { name: 'validate', icon: <CheckCircle fontSize="large" color="primary" />, path: '/validate' },
    { name: 'query', icon: <SearchOutlined fontSize="large" color="primary" />, path: '/query' },
    { name: 'codeGenerator', icon: <Code fontSize="large" color="primary" />, path: '/code-generator' },
    { name: 'apiMocker', icon: <Api fontSize="large" color="primary" />, path: '/api-mocker' },
    { name: 'jwtDecoder', icon: <VpnKey fontSize="large" color="primary" />, path: '/jwt-decoder' },
    { name: 'jsonEditor', icon: <EditIcon fontSize="large" color="primary" />, path: '/json-editor' },
    { name: 'jsonCrypto', icon: <Security fontSize="large" color="primary" />, path: '/json-crypto' }
  ];
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* 顶部导航栏 */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            JSONGeeks
          </Typography>
          <LanguageSwitcher />
          <Tooltip title={mode === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}>
            <IconButton color="inherit" onClick={toggleTheme} aria-label={t('theme.toggle')}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 6, bgcolor: 'background.default', flexGrow: 1 }}>
        <Container maxWidth="lg">
          {/* 英雄部分 - 修改背景色和文字颜色以增加对比度 */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 6, 
              borderRadius: 2, 
              background: mode === 'dark' 
                ? 'linear-gradient(120deg, #2d3748 0%, #1a202c 100%)' 
                : 'linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)',
              color: mode === 'dark' ? '#fff' : 'text.primary'
            }}
          >
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                sx={{ 
                  color: mode === 'dark' ? '#fff' : '#0d47a1',
                  textShadow: mode === 'dark' ? '1px 1px 3px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                JSONGeeks
              </Typography>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  mb: 4, 
                  color: mode === 'dark' ? '#e3f2fd' : '#1565c0'
                }}
              >
                {t('home.subtitle')}
              </Typography>
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  maxWidth: '800px', 
                  mx: 'auto', 
                  mb: 4,
                  color: mode === 'dark' ? '#e0e0e0' : 'text.primary'
                }}
              >
                {t('home.description')}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                component={Link} 
                to="/app"
                sx={{
                  fontWeight: 'bold',
                  px: 4,
                  py: 1
                }}
              >
                {t('home.openApp')}
              </Button>
            </Box>
          </Paper>
          
          {/* 功能部分 */}
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            {t('home.availableTools')}
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {tools.map((tool) => (
              <Grid item xs={12} sm={6} md={4} key={tool.name}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>{tool.icon}</Box>
                    <Typography variant="h5" component="h3" gutterBottom align="center">
                      {t(`tabs.${tool.name}`)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center">
                      {t(`${tool.name}.shortDescription`) || t(`${tool.name}.description`)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={tool.path}
                    >
                      {t('home.learnMore')}
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      component={Link} 
                      to={`/app/${tool.name}`}
                    >
                      {t('home.useTool')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            
            {/* FAQ 卡片 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <QuestionAnswer fontSize="large" color="primary" />
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    {t('tabs.faq')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center">
                    {t('faq.shortDescription') || t('faq.description')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'center' }}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    component={Link} 
                    to="/app/faq"
                  >
                    {t('home.viewFaq')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          
          {/* CTA 部分 - 修改背景色和文字颜色以增加对比度 */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 2,
              background: mode === 'dark' 
                ? 'linear-gradient(to right, #1e3a8a, #1e40af)' 
                : 'linear-gradient(to right, #e3f2fd, #bbdefb)',
              color: mode === 'dark' ? '#fff' : 'text.primary'
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                color: mode === 'dark' ? '#fff' : '#0d47a1',
                fontWeight: 'bold'
              }}
            >
              {t('home.startNow')}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                color: mode === 'dark' ? '#e0e0e0' : 'text.primary'
              }}
            >
              {t('home.allToolsFree')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={Link} 
              to="/app"
              sx={{
                fontWeight: 'bold',
                px: 4,
                py: 1,
                bgcolor: mode === 'dark' ? '#2196f3' : undefined
              }}
            >
              {t('home.openAllTools')}
            </Button>
          </Paper>
        </Container>
      </Box>
      
      {/* 添加Footer */}
      <Footer />
      
      {/* 固定的应用导航按钮 */}
      <Tooltip title={t('home.openApp')} placement="left">
        <Fab 
          color="primary" 
          component={Link} 
          to="/app" 
          sx={{ 
            position: 'fixed', 
            bottom: 30, 
            right: 30,
            zIndex: 1000
          }}
          aria-label={t('home.openApp')}
        >
          <Apps />
        </Fab>
      </Tooltip>
    </Box>
  );
}; 