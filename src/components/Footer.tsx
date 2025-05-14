import { Box, Container, Typography, Link, Divider, IconButton, Stack, Grid, useTheme, useMediaQuery } from '@mui/material'
import { GitHub, LinkedIn, Email, Twitter as X, Code, BugReport } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // 处理工具链接点击事件
  const handleToolClick = (tabIndex: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    // 保存选择的标签索引到localStorage
    localStorage.setItem('lastActiveTab', tabIndex.toString())
    // 导航到app页面
    navigate('/app')
  }
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        color: 'text.secondary',
        py: 3,
        mt: 'auto', // Pushes footer to bottom
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Company Information */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              JSONGeeks
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ mb: 1 }}>
              {t('footer.description')}
            </Typography>
            <Typography variant="body2" color="inherit">
              {t('footer.built')}
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
              {t('footer.copyright', { year: currentYear })}
            </Typography>
          </Grid>
          
          {/* Tools Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              {t('footer.tools')}
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(0)}>{t('format.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(1)}>{t('compare.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(2)}>{t('convert.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(3)}>{t('visualize.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(4)}>{t('validate.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(5)}>{t('query.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(6)}>{t('codeGenerator.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(7)}>{t('apiMocker.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(8)}>{t('jwtDecoder.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(9)}>{t('jsonEditor.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(10)}>{t('jsonCrypto.title')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover" onClick={handleToolClick(11)}>{t('faq.title')}</Link>
            </Stack>
          </Grid>
          
          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              {t('footer.resources')}
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="primary" variant="body2" underline="hover">{t('footer.documentation')}</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">{t('footer.apiReference')}</Link>
              <Link href="https://json.org/" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover">JSON.org</Link>
              <Link href="https://jsonpath.com/" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover">JSONPath Reference</Link>
              <Link href="https://json-schema.org/" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover">JSON Schema</Link>
            </Stack>
          </Grid>
          
          {/* Developer Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              {t('footer.connect')}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <IconButton size="small" color="primary" aria-label="GitHub" component="a" href="https://github.com/jenkincs" target="_blank" rel="noopener">
                <GitHub />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="Email" component="a" href="mailto:contact@jsongeeks.dev">
                <Email />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="X (Twitter)" component="a" href="https://x.com/jenkincsx" target="_blank" rel="noopener">
                <X />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email fontSize="small" /> contact@jsongeeks.dev
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Link href="https://github.com/jenkincs/jsongeeks" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Code fontSize="small" /> {t('footer.sourceCode')}
              </Link>
              <Link href="https://github.com/jenkincs/jsongeeks/issues" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BugReport fontSize="small" /> {t('footer.reportBug')}
              </Link>
            </Stack>
          </Grid>
        </Grid>
        
        {!isMobile && (
          <Divider sx={{ my: 2, bgcolor: 'divider' }} />
        )}
        
        <Box sx={{ pt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'center' }, gap: 1 }}>
          <Typography variant="caption" color="inherit">
            {t('footer.privacy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link 
              component={RouterLink} 
              to="/privacy-policy" 
              color="primary" 
              variant="caption" 
              underline="hover"
            >
              {t('footer.privacyPolicy')}
            </Link>
            <Link 
              component={RouterLink} 
              to="/terms-of-use" 
              color="primary" 
              variant="caption" 
              underline="hover"
            >
              {t('footer.termsOfUse')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
} 