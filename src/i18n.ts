import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import zhTranslation from './locales/zh/translation.json';

// 初始化i18next
i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 将i18next传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // 不需要对React进行HTML转义
    },
    resources: {
      en: {
        translation: enTranslation
      },
      zh: {
        translation: zhTranslation
      }
    },
    // 检测顺序: 先检测浏览器语言(navigator)，再使用本地存储(localStorage)
    detection: {
      order: ['navigator', 'localStorage'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      // 自动检测中文变体 (zh-CN, zh-TW, zh-HK) 并映射到 zh
      convertDetectedLanguage: (lng) => {
        if (lng.startsWith('zh')) return 'zh';
        return lng;
      }
    }
  });

export default i18n;