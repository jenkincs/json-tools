import { useCallback } from 'react';
import { trackEvent, trackToolUsage, trackError } from '../utils/analytics';

// 创建分析工具钩子，提供事件跟踪功能
export const useAnalytics = () => {
  // 通用事件跟踪
  const trackCustomEvent = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number,
    nonInteraction?: boolean
  ) => {
    trackEvent({
      category,
      action,
      label,
      value,
      nonInteraction
    });
  }, []);

  // 工具使用跟踪
  const trackTool = useCallback((toolName: string, action: string) => {
    trackToolUsage(toolName, action);
  }, []);

  // 转换事件跟踪
  const trackConversion = useCallback((from: string, to: string, success: boolean) => {
    trackEvent({
      category: 'Conversion',
      action: `${from}_to_${to}`,
      label: success ? 'success' : 'failed'
    });
  }, []);

  // 文件操作跟踪
  const trackFileOperation = useCallback((operation: string, fileType: string, fileSize?: number) => {
    trackEvent({
      category: 'FileOperation',
      action: operation,
      label: fileType,
      value: fileSize
    });
  }, []);

  // 错误跟踪
  const trackErrorEvent = useCallback((errorType: string, errorMessage: string) => {
    trackError(errorType, errorMessage);
  }, []);

  // 用户互动跟踪
  const trackInteraction = useCallback((component: string, action: string) => {
    trackEvent({
      category: 'UserInteraction',
      action: action,
      label: component
    });
  }, []);

  return {
    trackCustomEvent,
    trackTool,
    trackConversion,
    trackFileOperation,
    trackErrorEvent,
    trackInteraction
  };
}; 