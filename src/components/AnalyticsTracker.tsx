import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageView } from '../utils/analytics';

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // 当路由改变时，记录页面访问
    pageView(location.pathname + location.search);
  }, [location]);
  
  // 这是一个跟踪组件，不渲染任何内容
  return null;
}; 