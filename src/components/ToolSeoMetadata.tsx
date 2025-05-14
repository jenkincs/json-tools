import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'

interface ToolSeoMetadataProps {
  toolName: 'format' | 'compare' | 'convert' | 'validate' | 'query' | 'visualize' | 'codeGenerator' | 'apiMocker' | 'faq'
  isActive: boolean
}


export function ToolSeoMetadata({ toolName, isActive }: ToolSeoMetadataProps) {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language
  
  // 如果组件不是活跃的，不渲染任何内容
  if (!isActive) return null
  
  // 根据工具名称和语言获取对应的翻译键
  const getTitleKey = () => `${toolName}.title`
  const getDescriptionKey = () => `${toolName}.description`
  const getKeywordsKey = () => `${toolName}.keywords`
  
  // 获取翻译内容
  const title = t(getTitleKey()) + " | JSONGeeks"
  const description = t(getDescriptionKey())
  
  // 获取关键词数组并转换为字符串
  let keywords = ''
  try {
    const keywordsArray = t(getKeywordsKey(), { returnObjects: true })
    if (Array.isArray(keywordsArray)) {
      keywords = keywordsArray.join(', ')
    }
  } catch (error) {
    console.error('Error getting keywords:', error)
  }
  
  // 测试输出当前标题
  useEffect(() => {
    console.log(`Setting title for ${toolName} in ${currentLanguage}: ${title}`)
  }, [toolName, currentLanguage, title])
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* 其他SEO元数据 */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      
      {/* 语言相关元数据 */}
      <meta property="og:locale" content={currentLanguage === 'en' ? 'en_US' : 'zh_CN'} />
      <link rel="alternate" hrefLang="en" href={`${window.location.origin}/en`} />
      <link rel="alternate" hrefLang="zh" href={`${window.location.origin}/zh`} />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  )
} 