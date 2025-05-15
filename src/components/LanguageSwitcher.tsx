import { useTranslation } from 'react-i18next';
import { 
  Button,
  Tooltip,
  Menu,
  MenuItem} from '@mui/material';
import { Translate } from '@mui/icons-material';
import { useLanguageContext } from '../context/LanguageContext';
import { useState } from 'react';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguageContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    handleClose();
  };
  
  const getLanguageName = () => {
    switch(language) {
      case 'en': return 'English';
      case 'zh': return '中文';
      case 'de': return 'Deutsch';
      default: return 'English';
    }
  };
  
  return (
    <>
      <Tooltip title={t('language.toggle')}>
        <Button
          color="inherit"
          onClick={handleClick}
          startIcon={<Translate />}
          sx={{ 
            borderRadius: 2,
            px: 1.5,
            textTransform: 'none',
            minWidth: 'auto',
            border: '1px solid rgba(255,255,255,0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          {getLanguageName()}
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleLanguageChange('en')} selected={language === 'en'}>
          {t('language.english')}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('zh')} selected={language === 'zh'}>
          {t('language.chinese')}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('de')} selected={language === 'de'}>
          {t('language.german')}
        </MenuItem>
      </Menu>
    </>
  );
} 