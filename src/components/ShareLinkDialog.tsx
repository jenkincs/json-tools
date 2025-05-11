import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import {
  ContentCopy,
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  Email,
  WhatsApp,
  QrCode
} from '@mui/icons-material'
import { generateShareUrl } from '../utils/shareUtils'

interface ShareLinkDialogProps {
  open: boolean
  onClose: () => void
  jsonContent: string
  currentTool: string
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void
}

export function ShareLinkDialog({
  open,
  onClose,
  jsonContent,
  currentTool,
  onSnackbar
}: ShareLinkDialogProps) {
  const { t } = useTranslation()
  const [shareLink, setShareLink] = useState('')
  const [includeJson, setIncludeJson] = useState(true)
  const [includeToolSettings, setIncludeToolSettings] = useState(true)

  // 当对话框打开时或相关参数变更时生成分享链接
  useEffect(() => {
    if (open) {
      generateShareLink()
    }
  }, [open, jsonContent, currentTool, includeJson, includeToolSettings])

  // 生成可分享链接
  const generateShareLink = () => {
    try {
      const toolSettings: Record<string, any> = {}
      
      // 这里可以添加各种工具的特定设置
      // 例如：格式化工具的缩进大小、压缩选项等
      if (currentTool === 'formatter') {
        toolSettings.indent = '2' // 默认缩进
      }
      
      // 生成URL链接，根据选项决定是否包含JSON数据
      const url = generateShareUrl(
        currentTool,
        includeJson ? jsonContent : '',
        includeToolSettings ? toolSettings : {}
      )
      
      setShareLink(url)
    } catch (error) {
      console.error('Error generating share link:', error)
      onSnackbar(t('share.generateError'), 'error')
    }
  }

  // 复制链接到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      onSnackbar(t('share.linkCopied'), 'success')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      onSnackbar(t('share.copyError'), 'error')
    }
  }

  // 分享到社交媒体
  const shareToSocial = (platform: string) => {
    let shareUrl = ''
    const text = t('share.socialText')
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`
        break
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareLink)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(t('share.emailSubject'))}&body=${encodeURIComponent(text + ' ' + shareLink)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="share-dialog-title"
    >
      <DialogTitle id="share-dialog-title">
        <Box display="flex" alignItems="center">
          <Share sx={{ mr: 1 }} />
          {t('share.title')}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('share.description')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={includeJson} 
                onChange={(e) => setIncludeJson(e.target.checked)}
              />
            }
            label={t('share.includeJson')}
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={includeToolSettings} 
                onChange={(e) => setIncludeToolSettings(e.target.checked)}
              />
            }
            label={t('share.includeSettings')}
          />
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          value={shareLink}
          label={t('share.linkLabel')}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Tooltip title={t('share.copy')}>
                <IconButton edge="end" onClick={copyToClipboard}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            )
          }}
          sx={{ mb: 3 }}
        />
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          {t('share.socialShare')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Facebook">
            <IconButton color="primary" onClick={() => shareToSocial('facebook')}>
              <Facebook />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Twitter">
            <IconButton color="primary" onClick={() => shareToSocial('twitter')}>
              <Twitter />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="LinkedIn">
            <IconButton color="primary" onClick={() => shareToSocial('linkedin')}>
              <LinkedIn />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="WhatsApp">
            <IconButton color="primary" onClick={() => shareToSocial('whatsapp')}>
              <WhatsApp />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Email">
            <IconButton color="primary" onClick={() => shareToSocial('email')}>
              <Email />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            {t('share.qrCodeInfo')}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <QrCode sx={{ fontSize: 160, opacity: 0.8 }} />
            {/* 实际实现中可以使用真正的QR码生成库 */}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
        <Button 
          onClick={copyToClipboard} 
          color="primary" 
          variant="contained" 
          startIcon={<ContentCopy />}
        >
          {t('share.copyLink')}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 