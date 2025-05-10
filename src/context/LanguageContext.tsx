import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// 定义语言上下文类型
type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言提供者组件的Props
interface LanguageProviderProps {
  children: ReactNode;
}

// 语言提供者组件
export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  // 切换语言
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // 当i18n语言变化时，更新状态
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义Hook，便于组件中使用语言
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}; 