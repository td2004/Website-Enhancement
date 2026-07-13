import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Chip,
  Alert,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import QRCode from 'react-qr-code';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';

const QR_ID = 'qr-svg';

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  const handleGenerate = () => {
    setError('');
    setCopied(false);
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please enter some text or a URL.');
      setGenerated(null);
      return;
    }
    setGenerated(trimmed);
  };

  // Convert the rendered SVG QR code into a PNG and trigger a download.
  // Pure client-side — no backend involved.
  const handleDownload = () => {
    const svg = document.getElementById(QR_ID);
    if (!svg) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.onload = () => {
      const size = 1024; // export at high resolution
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = image64;
  };

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} className="page-enter">
      <Button
        component={RouterLink}
        to="/projects"
        startIcon={<ArrowBackIcon />}
        color="inherit"
        sx={{ mb: 3 }}
      >
        All projects
      </Button>

      <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
        Project · Demo
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1, mb: 2 }}>
        QR Code Generator
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {['React', 'MUI', 'Canvas API', 'SVG'].map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>

      <Grid container spacing={4}>
        {/* Demo */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 2 }}>
                LIVE DEMO
              </Typography>

              <TextField
                label="URL or text"
                placeholder="https://example.com"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError('');
                }}
                fullWidth
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Button onClick={handleGenerate} variant="contained">
                  Generate
                </Button>
                <Button
                  onClick={() => {
                    setText('');
                    setGenerated(null);
                    setError('');
                  }}
                  color="inherit"
                >
                  Clear
                </Button>
              </Stack>

              {generated && (
                <Box ref={containerRef}>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: '#fff',
                        p: 2,
                        borderRadius: 2,
                        display: 'inline-block',
                      }}
                    >
                      <QRCode id={QR_ID} value={generated} size={220} />
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                      <Button
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        variant="contained"
                      >
                        Download PNG
                      </Button>
                      <Tooltip title={copied ? 'Copied!' : 'Copy text'}>
                        <IconButton onClick={handleCopy} color="inherit">
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', maxWidth: 320, textAlign: 'center' }}>
                      Encoded: {generated}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Case study */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Section
              title="The problem"
              body="I wanted a QR code generator that worked entirely in the browser — no backend round-trip, no analytics, no third-party API."
            />
            <Section
              title="What I learned"
              body="The interesting bit is the SVG → PNG conversion. react-qr-code renders an inline SVG; serialising it to a data URL and drawing it onto a Canvas gives you a high-resolution PNG you can save without uploading anything."
            />
            <Section
              title="Stack"
              body="React for UI, react-qr-code for the SVG generation, the Canvas API for rasterisation, and MUI for the form components."
            />
            <Button
              component="a"
              href="https://github.com/td2004/qr-generator"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
              variant="outlined"
              fullWidth
            >
              View source on GitHub
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

function Section({ title, body }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 1 }}>
        {title.toUpperCase()}
      </Typography>
      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {body}
      </Typography>
    </Box>
  );
}
