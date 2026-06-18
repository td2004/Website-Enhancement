import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import { PROFILE, SOCIAL } from '../config.js';

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [emailCopied, setEmailCopied] = useState(false);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.email.trim()) next.email = 'Required';
    else if (!validateEmail(form.email)) next.email = 'Not a valid email';
    if (!form.message.trim()) next.message = 'Required';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    // Open the user's mail client with a pre-filled message.
    // This works on any static host with no backend.
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name} (${form.email})`,
    );
    window.location.href = `mailto:${SOCIAL.email}?subject=${subject}&body=${body}`;
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SOCIAL.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} className="page-enter">
      <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
        Contact
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1, mb: 2 }}>
        Let&rsquo;s talk
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 640 }}>
        I&rsquo;m looking for graduate software engineering roles for 2026. If
        you&rsquo;re hiring or just want to chat about a project, drop a note —
        I&rsquo;ll get back to you.
      </Typography>

      <Grid container spacing={4}>
        {/* Contact details */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <ContactRow
              icon={<EmailIcon />}
              label="Email"
              value={SOCIAL.email}
              action={
                <Tooltip title={emailCopied ? 'Copied!' : 'Copy email'}>
                  <IconButton size="small" onClick={copyEmail}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
              href={`mailto:${SOCIAL.email}`}
            />
            <ContactRow
              icon={<LocationOnIcon />}
              label="Location"
              value={PROFILE.location}
            />
            <ContactRow
              icon={<GitHubIcon />}
              label="GitHub"
              value={SOCIAL.github.replace(/^https?:\/\//, '')}
              href={SOCIAL.github}
            />
            <ContactRow
              icon={<LinkedInIcon />}
              label="LinkedIn"
              value={SOCIAL.linkedin.replace(/^https?:\/\//, '')}
              href={SOCIAL.linkedin}
            />
          </Stack>
        </Grid>

        {/* Form */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" component="form" onSubmit={handleSubmit}>
            <CardContent>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 2 }}>
                SEND A MESSAGE
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={update('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  fullWidth
                  required
                />
                <TextField
                  label="Message"
                  value={form.message}
                  onChange={update('message')}
                  error={Boolean(errors.message)}
                  helperText={errors.message}
                  fullWidth
                  required
                  multiline
                  rows={5}
                />

                <Alert severity="info" variant="outlined">
                  Hitting send opens your mail client with the message
                  pre-filled. This site has no backend and stores nothing.
                </Alert>

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                  >
                    Send
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function ContactRow({ icon, label, value, href, action }) {
  const valueNode = (
    <Typography
      variant="body2"
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.85rem',
        wordBreak: 'break-all',
      }}
    >
      {value}
    </Typography>
  );

  return (
    <Card variant="outlined">
      <CardContent sx={{ '&:last-child': { pb: 2 }, pt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(34,211,238,0.12)',
              color: 'secondary.main',
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            {href ? (
              <Box
                component="a"
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                sx={{
                  textDecoration: 'none',
                  color: 'text.primary',
                  display: 'block',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {valueNode}
              </Box>
            ) : (
              valueNode
            )}
          </Box>
          {action}
        </Stack>
      </CardContent>
    </Card>
  );
}
