import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemText, 
  ListItemIcon,
  Tooltip 
} from '@mui/material';
import { Translate } from '@mui/icons-material';
import { useLanguageContext } from '../context/LanguageContext';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguageContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t('language.toggle')}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label={t('language.toggle')}
        >
          <Translate />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')} 
          selected={language === 'en'}
        >
          <ListItemText primary={t('language.english')} />
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('zh')} 
          selected={language === 'zh'}
        >
          <ListItemText primary={t('language.chinese')} />
        </MenuItem>
      </Menu>
    </>
  );
} 