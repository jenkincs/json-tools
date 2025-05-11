/**
 * 用于处理共享链接和URL参数的工具函数
 */

/**
 * 从URL参数中解析应用状态
 * @returns 解析后的应用状态对象
 */
export const parseShareParams = (): {
  tool: string | null;
  jsonData: string | null;
  toolSettings: Record<string, any> | null;
} => {
  const params = new URLSearchParams(window.location.search);
  const result = {
    tool: null,
    jsonData: null,
    toolSettings: null
  };

  // 解析当前工具
  if (params.has('tool')) {
    result.tool = params.get('tool');
  }

  // 解析JSON数据
  if (params.has('data')) {
    try {
      // 从Base64解码回JSON字符串
      const base64Data = params.get('data') || '';
      result.jsonData = decodeURIComponent(atob(base64Data));
    } catch (error) {
      console.error('Error parsing shared JSON data:', error);
    }
  }

  // 解析工具特定设置
  const toolSettings: Record<string, any> = {};
  let hasSettings = false;
  
  // 格式化工具设置
  if (params.has('indent')) {
    toolSettings.indent = parseInt(params.get('indent') || '2', 10);
    hasSettings = true;
  }
  
  if (params.has('minify')) {
    toolSettings.minify = params.get('minify') === 'true';
    hasSettings = true;
  }
  
  // 可以添加更多工具的特定设置解析逻辑
  
  if (hasSettings) {
    result.toolSettings = toolSettings;
  }

  return result;
};

/**
 * 将应用状态转换为可分享的URL
 * @param tool 当前工具名称
 * @param jsonData JSON数据内容
 * @param toolSettings 工具特定设置
 * @returns 生成的分享URL
 */
export const generateShareUrl = (
  tool: string,
  jsonData: string,
  toolSettings: Record<string, any> = {}
): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  
  // 添加工具名称
  params.set('tool', tool);
  
  // 添加JSON数据 (Base64编码)
  if (jsonData?.trim()) {
    params.set('data', btoa(encodeURIComponent(jsonData)));
  }
  
  // 添加工具特定设置
  Object.entries(toolSettings).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * 从URL参数中检测是否包含共享数据
 * @returns 是否包含共享数据
 */
export const hasSharedData = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.has('tool') || params.has('data');
};

/**
 * 清理URL中的共享参数
 */
export const clearShareParams = (): void => {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, document.title, url.toString());
}; 