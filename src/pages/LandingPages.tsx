import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Fab
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
  ArrowForward,
  Check,
  Home,
  Apps,
  Brightness4,
  Brightness7,
  VpnKey,
  Edit as EditIcon,
  Security
} from '@mui/icons-material';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useThemeContext } from '../context/ThemeContext';
import { Footer } from '../components/Footer';

interface LandingPageProps {
  toolName: 'format' | 'compare' | 'convert' | 'visualize' | 'validate' | 'query' | 'codeGenerator' | 'apiMocker' | 'jwtDecoder' | 'jsonEditor' | 'jsonCrypto' | 'faq';
}

// 获取工具图标
const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case 'format': return <FormatAlignLeft fontSize="large" />;
    case 'compare': return <CompareArrows fontSize="large" />;
    case 'convert': return <SwapHoriz fontSize="large" />;
    case 'visualize': return <BarChart fontSize="large" />;
    case 'validate': return <CheckCircle fontSize="large" />;
    case 'query': return <SearchOutlined fontSize="large" />;
    case 'codeGenerator': return <Code fontSize="large" />;
    case 'apiMocker': return <Api fontSize="large" />;
    case 'jwtDecoder': return <VpnKey fontSize="large" />;
    case 'jsonEditor': return <EditIcon fontSize="large" />;
    case 'jsonCrypto': return <Security fontSize="large" />;
    default: return null;
  }
};

// 生成页面关键特性列表
const getFeaturesList = (toolName: string, t: any) => {
  const featuresMap: Record<string, string[]> = {
    format: ['format.feature1', 'format.feature2', 'format.feature3', 'format.feature4'],
    compare: ['compare.feature1', 'compare.feature2', 'compare.feature3'],
    convert: ['convert.feature1', 'convert.feature2', 'convert.feature3', 'convert.feature4'],
    visualize: ['visualize.feature1', 'visualize.feature2', 'visualize.feature3'],
    validate: ['validate.feature1', 'validate.feature2', 'validate.feature3'],
    query: ['query.feature1', 'query.feature2', 'query.feature3'],
    codeGenerator: ['codeGenerator.feature1', 'codeGenerator.feature2', 'codeGenerator.feature3'],
    apiMocker: ['apiMocker.feature1', 'apiMocker.feature2', 'apiMocker.feature3'],
    jwtDecoder: ['jwtDecoder.feature1', 'jwtDecoder.feature2', 'jwtDecoder.feature3'],
    jsonEditor: ['jsonEditor.feature1', 'jsonEditor.feature2', 'jsonEditor.feature3', 'jsonEditor.feature4'],
    jsonCrypto: ['jsonCrypto.feature1', 'jsonCrypto.feature2', 'jsonCrypto.feature3', 'jsonCrypto.feature4']
  };

  return featuresMap[toolName] || [];
};

export const ToolLandingPage: React.FC<LandingPageProps> = ({ toolName }) => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  
  // 从翻译文件获取工具信息
  const title = t(`${toolName}.title`);
  const description = t(`${toolName}.description`);
  const keywords = t(`${toolName}.keywords`, { returnObjects: true });
  const features = getFeaturesList(toolName, t);
  
  // 为每个工具页面生成专属ID
  const toolId = `${toolName}-landing-page`;
  
  // 添加页面加载时滚动到顶部的效果
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [toolName]);
  
  return (
    <Box id={toolId} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 导航栏 - 与App.tsx保持一致的样式 */}
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
          <LanguageSwitcher />
          <Tooltip title={mode === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}>
            <IconButton color="inherit" onClick={toggleTheme} aria-label={t('theme.toggle')}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ py: 6, flexGrow: 1 }}>
        <Container maxWidth="lg">
          {/* 顶部英雄区域 */}
          <Paper 
            elevation={2} 
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
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    color: mode === 'dark' ? '#fff' : '#0d47a1',
                    fontWeight: 'bold',
                    textShadow: mode === 'dark' ? '1px 1px 3px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  {title}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  paragraph
                  sx={{ 
                    color: mode === 'dark' ? '#e0e0e0' : 'text.primary'
                  }}
                >
                  {description}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    component={Link}
                    to={`/app/${toolName}`}
                    endIcon={<ArrowForward />}
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: mode === 'dark' ? '#2196f3' : undefined
                    }}
                  >
                    {t('landingPages.tryNow')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    component={Link} 
                    to="/app"
                  >
                    {t('landingPages.allTools')}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ 
                  fontSize: 100, 
                  color: mode === 'dark' ? '#90caf9' : '#1976d2',
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
                }}>
                  {getToolIcon(toolName)}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* 关键特性 */}
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: mode === 'dark' ? '#90caf9' : '#1976d2' 
            }}
          >
            {t('landingPages.keyFeatures')}
          </Typography>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 5,
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper'
            }}
          >
            <List>
              {features.map((feature, index) => (
                <React.Fragment key={feature}>
                  <ListItem>
                    <ListItemIcon>
                      <Check color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography 
                          sx={{ 
                            fontWeight: 'medium',
                            color: mode === 'dark' ? '#e3f2fd' : 'text.primary' 
                          }}
                        >
                          {t(feature)}
                        </Typography>
                      } 
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: mode === 'dark' ? '#b0bec5' : 'text.secondary' 
                          }}
                        >
                          {t(`${feature}.description`, { fallbackLng: [] })}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < features.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
          
          {/* 关键词标签 */}
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              color: mode === 'dark' ? '#90caf9' : '#1976d2',
              fontWeight: 'medium'
            }}
          >
            {t('landingPages.relatedTopics')}
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {Array.isArray(keywords) && keywords.map((keyword, index) => (
                <Chip 
                  key={index} 
                  label={keyword} 
                  size="medium" 
                  sx={{
                    bgcolor: mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                    color: mode === 'dark' ? '#e3f2fd' : '#1976d2',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)',
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
          
          {/* CTA区域 */}
          <Paper 
            sx={{ 
              p: 4, 
              mt: 6, 
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
              {t('landingPages.readyToStart')}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                color: mode === 'dark' ? '#e0e0e0' : 'text.primary',
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              {t('landingPages.noSignup')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to={`/app/${toolName}`}
              sx={{
                fontWeight: 'bold',
                px: 4,
                py: 1,
                bgcolor: mode === 'dark' ? '#2196f3' : undefined
              }}
            >
              {t('landingPages.startUsing', { tool: t(`tabs.${toolName}`) })}
            </Button>
          </Paper>
        </Container>
      </Box>
      
      {/* 添加Footer */}
      <Footer />
      
      {/* 固定的应用导航按钮 */}
      <Tooltip title={t('landingPages.openTool')} placement="left">
        <Fab 
          color="primary" 
          component={Link} 
          to={`/app/${toolName}`} 
          sx={{ 
            position: 'fixed', 
            bottom: 30, 
            right: 30,
            zIndex: 1000
          }}
          aria-label={t('landingPages.openTool')}
        >
          <Apps />
        </Fab>
      </Tooltip>
    </Box>
  );
};

// 导出单独的着陆页组件
export const FormatLandingPage = () => <ToolLandingPage toolName="format" />;
export const CompareLandingPage = () => <ToolLandingPage toolName="compare" />;
export const ConvertLandingPage = () => <ToolLandingPage toolName="convert" />;
export const VisualizeLandingPage = () => <ToolLandingPage toolName="visualize" />;
export const ValidateLandingPage = () => <ToolLandingPage toolName="validate" />;
export const QueryLandingPage = () => <ToolLandingPage toolName="query" />;
export const CodeGeneratorLandingPage = () => <ToolLandingPage toolName="codeGenerator" />;
export const ApiMockerLandingPage = () => <ToolLandingPage toolName="apiMocker" />;
export const JwtDecoderLandingPage = () => <ToolLandingPage toolName="jwtDecoder" />;
export const JsonEditorLandingPage = () => <ToolLandingPage toolName="jsonEditor" />;
export const JsonCryptoLandingPage = () => <ToolLandingPage toolName="jsonCrypto" />; 