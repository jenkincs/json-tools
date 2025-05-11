import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconButton,
  Tooltip
} from '@mui/material'
import { Share as ShareIcon } from '@mui/icons-material'
import { ShareLinkDialog } from './ShareLinkDialog'

interface ShareButtonProps {
  jsonContent: string
  currentTool: string
  onSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void
}

export function ShareButton({
  jsonContent,
  currentTool,
  onSnackbar
}: ShareButtonProps) {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const handleOpenShareDialog = () => {
    setDialogOpen(true)
  }
  
  const handleCloseShareDialog = () => {
    setDialogOpen(false)
  }
  
  return (
    <>
      <Tooltip title={t('share.buttonTooltip') || 'Share this JSON'}>
        <IconButton
          color="primary"
          onClick={handleOpenShareDialog}
          aria-label={t('share.buttonAriaLabel') || 'Share'}
          size="medium"
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>
      
      <ShareLinkDialog
        open={dialogOpen}
        onClose={handleCloseShareDialog}
        jsonContent={jsonContent}
        currentTool={currentTool}
        onSnackbar={onSnackbar}
      />
    </>
  )
} 