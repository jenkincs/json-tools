import React, { useEffect, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useParams, useLocation } from 'react-router-dom';
import { App } from './App';
import { CircularProgress, Box } from '@mui/material';

// 懒加载组件
const AppContent = lazy(() => import('./AppContent'));
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));

// 懒加载登陆页面
const FormatLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.FormatLandingPage })));
const CompareLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.CompareLandingPage })));
const ConvertLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.ConvertLandingPage })));
const VisualizeLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.VisualizeLandingPage })));
const ValidateLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.ValidateLandingPage })));
const QueryLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.QueryLandingPage })));
const CodeGeneratorLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.CodeGeneratorLandingPage })));
const ApiMockerLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.ApiMockerLandingPage })));
const JwtDecoderLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.JwtDecoderLandingPage })));
const JsonEditorLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.JsonEditorLandingPage })));
const JsonCryptoLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.JsonCryptoLandingPage })));
const SortLandingPage = lazy(() => import('./pages/LandingPages').then(module => ({ default: module.SortLandingPage })));

// 懒加载其他页面
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then(module => ({ default: module.TermsOfUse })));

// 加载提示组件
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

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
  'sort': 11,
  'faq': 12
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
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'format',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <FormatLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'compare',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <CompareLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'convert',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <ConvertLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'visualize',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <VisualizeLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'validate',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <ValidateLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'query',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <QueryLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'code-generator',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <CodeGeneratorLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'api-mocker',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <ApiMockerLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'jwt-decoder',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <JwtDecoderLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'json-editor',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <JsonEditorLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'json-crypto',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <JsonCryptoLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'sort',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <SortLandingPage />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'app',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <AppContent />
            </Suspense>
          </ScrollToTop>
        ),
      },
      {
        path: 'app/:tool',
        element: (
          <ScrollToTop>
            <ToolRedirect />
          </ScrollToTop>
        ),
      },
      // 隐私政策页面
      {
        path: 'privacy-policy',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <PrivacyPolicy />
            </Suspense>
          </ScrollToTop>
        ),
      },
      // 使用条款页面
      {
        path: 'terms-of-use',
        element: (
          <ScrollToTop>
            <Suspense fallback={<LoadingFallback />}>
              <TermsOfUse />
            </Suspense>
          </ScrollToTop>
        ),
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