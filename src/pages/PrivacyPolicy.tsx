import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Home, Brightness4, Brightness7 } from '@mui/icons-material';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useThemeContext } from '../context/ThemeContext';
import { Footer } from '../components/Footer';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const lastUpdated = '2025-05-11';
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
      
      <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
        <Paper sx={{ p: 4 }}>
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {t('app.title')}
            </Link>
            <Typography color="text.primary">{t('footer.privacyPolicy')}</Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('policy.privacyPolicy.title')}
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('policy.privacyPolicy.dataProcessing.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.privacyPolicy.dataProcessing.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.privacyPolicy.cookies.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.privacyPolicy.cookies.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.privacyPolicy.analytics.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.privacyPolicy.analytics.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.privacyPolicy.thirdParty.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.privacyPolicy.thirdParty.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.privacyPolicy.updates.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.privacyPolicy.updates.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.privacyPolicy.contact.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.privacyPolicy.contact.content')}
            </Typography>
            
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption">
                {t('policy.privacyPolicy.lastUpdated', { date: lastUpdated })}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
}; 