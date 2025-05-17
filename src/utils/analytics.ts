import ReactGA from 'react-ga4';
import { inject } from '@vercel/analytics';

// GA4测量ID
const MEASUREMENT_ID = 'G-71PPDWRFM8'; // 替换为你的GA4测量ID

// 初始化GA和Vercel Analytics
export const initGA = () => {
  // 初始化Google Analytics
  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize(MEASUREMENT_ID);
    console.log('Google Analytics initialized');
    
    // 手动注入Vercel Analytics
    inject();
    console.log('Vercel Analytics initialized');
  } else {
    console.log('Analytics not initialized in development mode');
  }
};

// 页面访问跟踪
export const pageView = (page: string) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.send({
      hitType: 'pageview',
      page: page
    });
    console.log(`Page view tracked: ${page}`);
  }
};

// 自定义事件跟踪
interface EventParams {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any; // 允许其他自定义参数
}

export const trackEvent = (params: EventParams) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.event(params);
    console.log(`Event tracked: ${params.category} - ${params.action}`);
  }
};

// 工具使用情况跟踪
export const trackToolUsage = (toolName: string, action: string) => {
  trackEvent({
    category: 'Tool Usage',
    action: action,
    label: toolName
  });
};

// 性能指标跟踪
export const trackPerformance = (metric: string, value: number) => {
  trackEvent({
    category: 'Performance',
    action: metric,
    value: value
  });
};

// 错误跟踪
export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent({
    category: 'Error',
    action: errorType,
    label: errorMessage
  });
}; 