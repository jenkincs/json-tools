import React, { useEffect } from 'react';
import { createBrowserRouter, Navigate, useParams, useLocation } from 'react-router-dom';
import { App } from './App';
import AppContent from './AppContent';
import { Home } from './pages/Home';
import {
  FormatLandingPage,
  CompareLandingPage,
  ConvertLandingPage,
  VisualizeLandingPage,
  ValidateLandingPage,
  QueryLandingPage,
  CodeGeneratorLandingPage,
  ApiMockerLandingPage,
  JwtDecoderLandingPage,
  JsonEditorLandingPage,
  JsonCryptoLandingPage
} from './pages/LandingPages';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';

// 创建一个ScrollToTop组件，确保路由切换时滚动到顶部
const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return <>{children}</>;
};

// URL路径到工具索引的映射
const toolPathsToIndex: Record<string, number> = {
  'format': 0,
  'compare': 1,
  'convert': 2,
  'visualize': 3,
  'validate': 4,
  'query': 5,
  'codeGenerator': 6,
  'apiMocker': 7,
  'jwtDecoder': 8,
  'jsonEditor': 9,
  'jsonCrypto': 10,
  'faq': 11
};

// 创建直接跳转到特定工具的路由组件
const ToolRedirect: React.FC = () => {
  const params = useParams();
  const tool = params.tool || 'format';
  
  const index = toolPathsToIndex[tool];
  // 如果找不到对应的工具索引，则重定向到主应用
  if (index === undefined) {
    return <Navigate to="/app" />;
  }
  
  // 设置本地存储，以便App组件可以检测并切换到正确的选项卡
  localStorage.setItem('lastActiveTab', String(index));
  
  return <Navigate to="/app" />;
};

// 定义应用路由
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ScrollToTop><Home /></ScrollToTop>,
      },
      {
        path: 'format',
        element: <ScrollToTop><FormatLandingPage /></ScrollToTop>,
      },
      {
        path: 'compare',
        element: <ScrollToTop><CompareLandingPage /></ScrollToTop>,
      },
      {
        path: 'convert',
        element: <ScrollToTop><ConvertLandingPage /></ScrollToTop>,
      },
      {
        path: 'visualize',
        element: <ScrollToTop><VisualizeLandingPage /></ScrollToTop>,
      },
      {
        path: 'validate',
        element: <ScrollToTop><ValidateLandingPage /></ScrollToTop>,
      },
      {
        path: 'query',
        element: <ScrollToTop><QueryLandingPage /></ScrollToTop>,
      },
      {
        path: 'code-generator',
        element: <ScrollToTop><CodeGeneratorLandingPage /></ScrollToTop>,
      },
      {
        path: 'api-mocker',
        element: <ScrollToTop><ApiMockerLandingPage /></ScrollToTop>,
      },
      {
        path: 'jwt-decoder',
        element: <ScrollToTop><JwtDecoderLandingPage /></ScrollToTop>,
      },
      {
        path: 'json-editor',
        element: <ScrollToTop><JsonEditorLandingPage /></ScrollToTop>,
      },
      {
        path: 'json-crypto',
        element: <ScrollToTop><JsonCryptoLandingPage /></ScrollToTop>,
      },
      {
        path: 'app',
        element: <ScrollToTop><AppContent /></ScrollToTop>,
      },
      {
        path: 'app/:tool',
        element: <ScrollToTop><ToolRedirect /></ScrollToTop>,
      },
      // 隐私政策页面
      {
        path: 'privacy-policy',
        element: <ScrollToTop><PrivacyPolicy /></ScrollToTop>,
      },
      // 使用条款页面
      {
        path: 'terms-of-use',
        element: <ScrollToTop><TermsOfUse /></ScrollToTop>,
      },
    ]
  },
  // 重定向根路径
  {
    path: '*',
    element: <Navigate to="/" />,
  }
]);

// 将router改为默认导出，解决HMR问题
export default router; 