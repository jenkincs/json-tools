import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Paper,
  Link
} from '@mui/material'
import {
  ExpandMore,
  Search,
  Code,
  Help,
  BugReport,
  Translate,
  Storage,
  Compare,
  BarChart,
  SchemaOutlined
} from '@mui/icons-material'

interface FaqPanelProps {
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void
}

interface FaqItem {
  id: string
  question: string
  answer: string | JSX.Element
  category: string
  keywords: string[]
}

export function FaqPanel({ onSnackbar }: FaqPanelProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false)

  // 定义FAQ数据，包括问题、答案和相关关键词
  const faqItems: FaqItem[] = [
    // 格式化相关
    {
      id: 'format-1',
      question: t('faq.questions.format1'),
      answer: t('faq.answers.format1'),
      category: 'format',
      keywords: ['格式化', '缩进', '美化', '空格', 'prettify', '易读性']
    },
    {
      id: 'format-2',
      question: t('faq.questions.format2'),
      answer: t('faq.answers.format2'),
      category: 'format',
      keywords: ['压缩', '最小化', 'minify', '移除空格', '文件大小']
    },
    {
      id: 'format-3',
      question: t('faq.questions.format3'),
      answer: t('faq.answers.format3'),
      category: 'format',
      keywords: ['保存', '下载', '复制', '分享', '文件']
    },
    
    // 比较相关
    {
      id: 'compare-1',
      question: t('faq.questions.compare1'),
      answer: t('faq.answers.compare1'),
      category: 'compare',
      keywords: ['比较', '差异', 'diff', '区别', '文件对比']
    },
    {
      id: 'compare-2',
      question: t('faq.questions.compare2'),
      answer: t('faq.answers.compare2'),
      category: 'compare',
      keywords: ['颜色代码', '添加', '删除', '修改', '变更']
    },
    
    // 转换相关
    {
      id: 'convert-1',
      question: t('faq.questions.convert1'),
      answer: t('faq.answers.convert1'),
      category: 'convert',
      keywords: ['JSON转CSV', '转换', '表格', '电子表格', 'Excel']
    },
    {
      id: 'convert-2',
      question: t('faq.questions.convert2'),
      answer: t('faq.answers.convert2'),
      category: 'convert',
      keywords: ['JSON转XML', 'XML', '标记语言', '嵌套']
    },
    {
      id: 'convert-3',
      question: t('faq.questions.convert3'),
      answer: t('faq.answers.convert3'),
      category: 'convert',
      keywords: ['YAML', 'YAML转JSON', '配置文件', '易读性']
    },
    
    // 验证相关
    {
      id: 'validate-1',
      question: t('faq.questions.validate1'),
      answer: t('faq.answers.validate1'),
      category: 'validate',
      keywords: ['验证', 'JSON Schema', '模式', '规则', '数据结构']
    },
    {
      id: 'validate-2',
      question: t('faq.questions.validate2'),
      answer: t('faq.answers.validate2'),
      category: 'validate',
      keywords: ['错误', '无效JSON', '故障排除', '调试', '语法']
    },
    
    // 查询相关
    {
      id: 'query-1',
      question: t('faq.questions.query1'),
      answer: t('faq.answers.query1'),
      category: 'query',
      keywords: ['JSONPath', '查询', '提取', '搜索', '选择器']
    },
    {
      id: 'query-2',
      question: t('faq.questions.query2'),
      answer: t('faq.answers.query2'),
      category: 'query',
      keywords: ['复杂查询', '过滤器', '数组', '条件', '嵌套数据']
    },
    
    // 代码生成器相关
    {
      id: 'code-1',
      question: t('faq.questions.code1'),
      answer: t('faq.answers.code1'),
      category: 'code',
      keywords: ['代码生成', '类', '接口', 'TypeScript', 'Java', 'C#']
    },
    {
      id: 'code-2',
      question: t('faq.questions.code2'),
      answer: t('faq.answers.code2'),
      category: 'code',
      keywords: ['命名惯例', '驼峰命名', '蛇形命名', '帕斯卡命名', '属性名']
    },
    
    // API模拟器相关
    {
      id: 'mock-1',
      question: t('faq.questions.mock1'),
      answer: t('faq.answers.mock1'),
      category: 'mock',
      keywords: ['API模拟', '测试', '模拟数据', '端点', '假数据']
    },
    {
      id: 'mock-2',
      question: t('faq.questions.mock2'),
      answer: t('faq.answers.mock2'),
      category: 'mock',
      keywords: ['Schema', '模板', '数据生成', '随机', '测试']
    },
    
    // 可视化相关
    {
      id: 'visualize-1',
      question: t('faq.questions.visualize1'),
      answer: t('faq.answers.visualize1'),
      category: 'visualize',
      keywords: ['可视化', '图表', '数据展示', '分析', '图形']
    },
    
    // 一般问题
    {
      id: 'general-1',
      question: t('faq.questions.general1'),
      answer: t('faq.answers.general1'),
      category: 'general',
      keywords: ['安全', '隐私', '数据保护', '客户端', '服务器']
    },
    {
      id: 'general-2',
      question: t('faq.questions.general2'),
      answer: t('faq.answers.general2'),
      category: 'general',
      keywords: ['大文件', '性能', '处理', '限制', '浏览器']
    }
  ]

  // 处理搜索查询
  const filteredFaqs = searchQuery
    ? faqItems.filter(
        item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof item.answer === 'string' && 
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.keywords.some(keyword =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          t(`categories.${item.category}`).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems

  // 获取特定类别的FAQ项目
  const getFaqsByCategory = (category: string) => {
    return filteredFaqs.filter(item => item.category === category)
  }

  // 处理面板展开/收起
  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  // 获取类别图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'format':
        return <Code />
      case 'compare':
        return <Compare />
      case 'convert':
        return <Translate />
      case 'validate':
        return <SchemaOutlined />
      case 'query':
        return <Search />
      case 'code':
        return <Storage />
      case 'mock':
        return <BugReport />
      case 'visualize':
        return <BarChart />
      default:
        return <Help />
    }
  }

  // 渲染FAQ类别
  const renderFaqCategory = (category: string, title: string) => {
    const categoryFaqs = getFaqsByCategory(category)
    
    if (categoryFaqs.length === 0) return null
    
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getCategoryIcon(category)}
          <Typography variant="h5" component="h2" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        
        {categoryFaqs.map(faq => (
          <Accordion
            key={faq.id}
            expanded={expandedPanel === faq.id}
            onChange={handlePanelChange(faq.id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight="medium">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {typeof faq.answer === 'string' ? (
                <Typography>{faq.answer}</Typography>
              ) : (
                faq.answer
              )}
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {faq.keywords.map(keyword => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    size="small"
                    variant="outlined"
                    onClick={() => setSearchQuery(keyword)}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* SEO Enhancement */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('faq.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('faq.description')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {['JSON FAQ', 'JSON问题', 'JSON帮助', 'JSON教程', 'JSON指南', 'JSON工具使用'].map((keyword) => (
            <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>

      {/* 搜索框 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('faq.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        
        {searchQuery && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              {t('faq.searchResults', { count: filteredFaqs.length })}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 快速链接 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('faq.quickLinks')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            { category: 'format', label: t('categories.format') },
            { category: 'compare', label: t('categories.compare') },
            { category: 'convert', label: t('categories.convert') },
            { category: 'validate', label: t('categories.validate') },
            { category: 'query', label: t('categories.query') },
            { category: 'code', label: t('categories.code') },
            { category: 'mock', label: t('categories.mock') },
            { category: 'visualize', label: t('categories.visualize') },
            { category: 'general', label: t('categories.general') }
          ].map(({ category, label }) => (
            <Chip
              key={category}
              icon={getCategoryIcon(category)}
              label={label}
              onClick={() => setSearchQuery(label)}
              sx={{ '& .MuiChip-icon': { ml: 0.5 } }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* FAQ分类 */}
      {renderFaqCategory('general', t('categories.general'))}
      {renderFaqCategory('format', t('categories.format'))}
      {renderFaqCategory('compare', t('categories.compare'))}
      {renderFaqCategory('convert', t('categories.convert'))}
      {renderFaqCategory('validate', t('categories.validate'))}
      {renderFaqCategory('query', t('categories.query'))}
      {renderFaqCategory('code', t('categories.code'))}
      {renderFaqCategory('mock', t('categories.mock'))}
      {renderFaqCategory('visualize', t('categories.visualize'))}

      {/* 其他资源 */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('faq.additionalResources')}
        </Typography>
        <Typography variant="body2" paragraph>
          {t('faq.resourcesDescription')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Link href="https://json.org" target="_blank" rel="noopener noreferrer">
            JSON.org - {t('faq.jsonSpecification')}
          </Link>
          <Link href="https://jsonschema.org" target="_blank" rel="noopener noreferrer">
            JSON Schema - {t('faq.jsonSchemaDoc')}
          </Link>
          <Link href="https://jsonpath.com" target="_blank" rel="noopener noreferrer">
            JSONPath - {t('faq.jsonPathDoc')}
          </Link>
        </Box>
      </Paper>
    </Box>
  )
} 