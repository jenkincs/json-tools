/**
 * Vite插件：在生产构建时注入预加载链接
 * 这个插件会在HTML模板中的<!-- PRELOAD_LINKS_PLACEHOLDER -->标记处
 * 插入主要资源的预加载链接
 */
export default function preloadLinksPlugin() {
  return {
    name: 'vite-plugin-preload-links',
    apply: 'build', // 仅在构建模式下应用
    transformIndexHtml(html, ctx) {
      // 仅在生产构建且是主HTML文件时处理
      if (!ctx.chunk || !ctx.chunk.isEntry) return html;

      // 预加载链接
      const preloadLinks = `
    <link rel="modulepreload" href="/src/main.tsx" as="script">
    <link rel="preload" href="/assets/react-vendor.js" as="script" crossorigin>
    <link rel="preload" href="/assets/mui-core.js" as="script" crossorigin>
      `;

      // 替换占位符
      return html.replace('<!-- PRELOAD_LINKS_PLACEHOLDER -->', preloadLinks);
    }
  };
} 