import { useTranslation } from 'react-i18next';
import { 
  Button,
  Tooltip} from '@mui/material';
import { Translate } from '@mui/icons-material';
import { useLanguageContext } from '../context/LanguageContext';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguageContext();

  const handleLanguageToggle = () => {
    // 在中文和英文之间切换
    const newLang = language === 'en' ? 'zh' : 'en';
    changeLanguage(newLang);
  };

  return (
    <Tooltip title={t('language.toggle')}>
      <Button
        color="inherit"
        onClick={handleLanguageToggle}
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
        {language === 'en' ? '中文' : 'English'}
      </Button>
    </Tooltip>
  );
} 