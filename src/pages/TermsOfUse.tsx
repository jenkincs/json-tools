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

export const TermsOfUse: React.FC = () => {
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
            <Typography color="text.primary">{t('footer.termsOfUse')}</Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {t('policy.termsOfUse.title')}
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.license.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.license.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.disclaimer.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.disclaimer.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.intellectualProperty.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.intellectualProperty.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.prohibitedActivities.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.prohibitedActivities.content')}
            </Typography>
            <List disablePadding sx={{ pl: 2, mb: 2 }}>
              {(t('policy.termsOfUse.prohibitedActivities.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.termination.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.termination.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.governingLaw.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.governingLaw.content')}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('policy.termsOfUse.changes.title')}
            </Typography>
            <Typography paragraph>
              {t('policy.termsOfUse.changes.content')}
            </Typography>
            
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption">
                {t('policy.termsOfUse.lastUpdated', { date: lastUpdated })}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
}; 