import { Box, Container, Typography, Link, Divider, IconButton, Stack, Grid, useTheme, useMediaQuery } from '@mui/material'
import { GitHub, LinkedIn, Email, Twitter, Code, BugReport } from '@mui/icons-material'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        color: 'text.secondary',
        py: 3,
        mt: 'auto', // Pushes footer to bottom
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Company Information */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              JSON Tools
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ mb: 1 }}>
              A comprehensive suite of JSON utilities for developers and data professionals.
            </Typography>
            <Typography variant="body2" color="inherit">
              Built with React, TypeScript, and Material-UI.
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
              © {currentYear} JSON Tools. All rights reserved.
            </Typography>
          </Grid>
          
          {/* Tools Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Tools
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="primary" variant="body2" underline="hover">JSON Formatter & Beautifier</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">JSON Diff & Compare</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">JSON Converter (XML, CSV, YAML)</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">JSON Visualizer</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">JSON Schema Validator</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">JSONPath Query Tool</Link>
            </Stack>
          </Grid>
          
          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="primary" variant="body2" underline="hover">Documentation</Link>
              <Link href="#" color="primary" variant="body2" underline="hover">API Reference</Link>
              <Link href="https://json.org/" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover">JSON.org</Link>
              <Link href="https://jsonpath.com/" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover">JSONPath Reference</Link>
              <Link href="https://json-schema.org/" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover">JSON Schema</Link>
            </Stack>
          </Grid>
          
          {/* Developer Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Connect with the Developer
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <IconButton size="small" color="primary" aria-label="GitHub" component="a" href="https://github.com/yourusername" target="_blank" rel="noopener">
                <GitHub />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="LinkedIn" component="a" href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener">
                <LinkedIn />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="Email" component="a" href="mailto:your.email@example.com">
                <Email />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="Twitter" component="a" href="https://twitter.com/yourusername" target="_blank" rel="noopener">
                <Twitter />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email fontSize="small" /> your.email@example.com
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Link href="https://github.com/yourusername/json-formatter-v2" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Code fontSize="small" /> Source Code
              </Link>
              <Link href="https://github.com/yourusername/json-formatter-v2/issues" target="_blank" rel="noopener" color="primary" variant="body2" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BugReport fontSize="small" /> Report Bug
              </Link>
            </Stack>
          </Grid>
        </Grid>
        
        {!isMobile && (
          <Divider sx={{ my: 2, bgcolor: 'divider' }} />
        )}
        
        <Box sx={{ pt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'center' }, gap: 1 }}>
          <Typography variant="caption" color="inherit">
            All tools on this site are client-side only. Your data never leaves your browser.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" color="primary" variant="caption" underline="hover">Privacy Policy</Link>
            <Link href="#" color="primary" variant="caption" underline="hover">Terms of Use</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
} 