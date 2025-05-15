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
  SchemaOutlined,
  VpnKey
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

export function FaqPanel({  }: FaqPanelProps) {
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
      keywords: t('faq.keywords.format1', { returnObjects: true }) as string[]
    },
    {
      id: 'format-2',
      question: t('faq.questions.format2'),
      answer: t('faq.answers.format2'),
      category: 'format',
      keywords: t('faq.keywords.format2', { returnObjects: true }) as string[]
    },
    {
      id: 'format-3',
      question: t('faq.questions.format3'),
      answer: t('faq.answers.format3'),
      category: 'format',
      keywords: t('faq.keywords.format3', { returnObjects: true }) as string[]
    },
    
    // 比较相关
    {
      id: 'compare-1',
      question: t('faq.questions.compare1'),
      answer: t('faq.answers.compare1'),
      category: 'compare',
      keywords: t('faq.keywords.compare1', { returnObjects: true }) as string[]
    },
    {
      id: 'compare-2',
      question: t('faq.questions.compare2'),
      answer: t('faq.answers.compare2'),
      category: 'compare',
      keywords: t('faq.keywords.compare2', { returnObjects: true }) as string[]
    },
    
    // 转换相关
    {
      id: 'convert-1',
      question: t('faq.questions.convert1'),
      answer: t('faq.answers.convert1'),
      category: 'convert',
      keywords: t('faq.keywords.convert1', { returnObjects: true }) as string[]
    },
    {
      id: 'convert-2',
      question: t('faq.questions.convert2'),
      answer: t('faq.answers.convert2'),
      category: 'convert',
      keywords: t('faq.keywords.convert2', { returnObjects: true }) as string[]
    },
    {
      id: 'convert-3',
      question: t('faq.questions.convert3'),
      answer: t('faq.answers.convert3'),
      category: 'convert',
      keywords: t('faq.keywords.convert3', { returnObjects: true }) as string[]
    },
    
    // 验证相关
    {
      id: 'validate-1',
      question: t('faq.questions.validate1'),
      answer: t('faq.answers.validate1'),
      category: 'validate',
      keywords: t('faq.keywords.validate1', { returnObjects: true }) as string[]
    },
    {
      id: 'validate-2',
      question: t('faq.questions.validate2'),
      answer: t('faq.answers.validate2'),
      category: 'validate',
      keywords: t('faq.keywords.validate2', { returnObjects: true }) as string[]
    },
    
    // 查询相关
    {
      id: 'query-1',
      question: t('faq.questions.query1'),
      answer: t('faq.answers.query1'),
      category: 'query',
      keywords: t('faq.keywords.query1', { returnObjects: true }) as string[]
    },
    {
      id: 'query-2',
      question: t('faq.questions.query2'),
      answer: t('faq.answers.query2'),
      category: 'query',
      keywords: t('faq.keywords.query2', { returnObjects: true }) as string[]
    },
    
    // 代码生成器相关
    {
      id: 'code-1',
      question: t('faq.questions.code1'),
      answer: t('faq.answers.code1'),
      category: 'code',
      keywords: t('faq.keywords.code1', { returnObjects: true }) as string[]
    },
    {
      id: 'code-2',
      question: t('faq.questions.code2'),
      answer: t('faq.answers.code2'),
      category: 'code',
      keywords: t('faq.keywords.code2', { returnObjects: true }) as string[]
    },
    
    // API模拟器相关
    {
      id: 'mock-1',
      question: t('faq.questions.mock1'),
      answer: t('faq.answers.mock1'),
      category: 'mock',
      keywords: t('faq.keywords.mock1', { returnObjects: true }) as string[]
    },
    {
      id: 'mock-2',
      question: t('faq.questions.mock2'),
      answer: t('faq.answers.mock2'),
      category: 'mock',
      keywords: t('faq.keywords.mock2', { returnObjects: true }) as string[]
    },
    
    // 可视化相关
    {
      id: 'visualize-1',
      question: t('faq.questions.visualize1'),
      answer: t('faq.answers.visualize1'),
      category: 'visualize',
      keywords: t('faq.keywords.visualize1', { returnObjects: true }) as string[]
    },
    
    // JWT相关问题
    {
      id: 'jwt-1',
      question: t('faq.questions.jwt1'),
      answer: t('faq.answers.jwt1'),
      category: 'jwt',
      keywords: t('faq.keywords.jwt1', { returnObjects: true }) as string[]
    },
    {
      id: 'jwt-2',
      question: t('faq.questions.jwt2'),
      answer: t('faq.answers.jwt2'),
      category: 'jwt',
      keywords: t('faq.keywords.jwt2', { returnObjects: true }) as string[]
    },
    {
      id: 'jwt-3',
      question: t('faq.questions.jwt3'),
      answer: t('faq.answers.jwt3'),
      category: 'jwt',
      keywords: t('faq.keywords.jwt3', { returnObjects: true }) as string[]
    },
    {
      id: 'jwt-4',
      question: t('faq.questions.jwt4'),
      answer: t('faq.answers.jwt4'),
      category: 'jwt',
      keywords: t('faq.keywords.jwt4', { returnObjects: true }) as string[]
    },
    
    // 一般问题
    {
      id: 'general-1',
      question: t('faq.questions.general1'),
      answer: t('faq.answers.general1'),
      category: 'general',
      keywords: t('faq.keywords.general1', { returnObjects: true }) as string[]
    },
    {
      id: 'general-2',
      question: t('faq.questions.general2'),
      answer: t('faq.answers.general2'),
      category: 'general',
      keywords: t('faq.keywords.general2', { returnObjects: true }) as string[]
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
  const handlePanelChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
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
      case 'jwt':
        return <VpnKey />
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
                {Array.isArray(faq.keywords) && faq.keywords.map(keyword => (
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
          {Array.isArray(t('faq.pageKeywords', { returnObjects: true })) && 
            (t('faq.pageKeywords', { returnObjects: true }) as string[]).map((keyword) => (
              <Chip key={keyword} label={keyword} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
            ))
          }
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
            { category: 'jwt', label: t('categories.jwt') },
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
      {renderFaqCategory('jwt', t('categories.jwt'))}

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