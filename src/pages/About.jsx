import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import DownloadIcon from '@mui/icons-material/Download';
import { PROFILE, SOCIAL, SKILLS } from '../config.js';

const education = [
  {
    title: PROFILE.degree,
    org: PROFILE.university,
    period: `Expected ${PROFILE.graduationYear}`,
    detail:
      'Coursework across software design and architecture, web and mobile development, databases, data structures and algorithms, artificial intelligence and machine learning, and cloud computing. Built team projects in React, Node, and React Native under agile/scrum.',
  },
];

const experience = [
  {
    title: 'Open to graduate / intern roles',
    org: 'Looking for opportunities',
    period: '2026',
    detail:
      'Add roles, internships, or research positions here as you take them on. Each entry should describe what you did, what you used, and what you learned.',
  },
];

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} className="page-enter">
      <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
        About
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1, mb: 3 }}>
        A bit about me
      </Typography>

      <Grid container spacing={6}>
        {/* Bio */}
        <Grid item xs={12} md={7}>
          <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }}>
            {PROFILE.shortBio}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 3 }} color="text.secondary">
            I&apos;m most comfortable in JavaScript and React, and I enjoy the
            full loop — designing the UI, wiring up the data layer, deploying
            it, and iterating from there. Outside of coursework I&apos;ve built
            a financial data viewer, a QR generator, and a few smaller utilities
            you can find on this site.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.8 }} color="text.secondary">
            Currently looking for graduate software engineering roles for 2026
            — feel free to{' '}
            <Box
              component="a"
              href={`mailto:${SOCIAL.email}`}
              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              get in touch
            </Box>
            .
          </Typography>

          <Button
            component="a"
            href={SOCIAL.resume}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ mt: 4 }}
          >
            Download resume
          </Button>
        </Grid>

        {/* Quick facts */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 2 }}>
                AT A GLANCE
              </Typography>
              <Stack spacing={1.5}>
                <Row label="Location" value={PROFILE.location} />
                <Row label="Education" value={PROFILE.university} />
                <Row label="Graduating" value={PROFILE.graduationYear} />
                <Row label="Email" value={SOCIAL.email} mono />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: { xs: 6, md: 8 } }} />

      {/* Skills */}
      <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 3 }}>
        Skills
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(SKILLS).map(([category, items]) => (
          <Grid key={category} item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="secondary" sx={{ mb: 1.5, letterSpacing: 1 }}>
              {category.toUpperCase()}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {items.map((skill) => (
                <Chip key={skill} label={skill} size="small" sx={{ mb: 0.5 }} />
              ))}
            </Stack>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: { xs: 6, md: 8 } }} />

      {/* Education */}
      <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 3 }}>
        Education
      </Typography>
      <Stack spacing={2}>
        {education.map((item, i) => (
          <TimelineCard key={i} icon={<SchoolIcon />} {...item} />
        ))}
      </Stack>

      <Divider sx={{ my: { xs: 6, md: 8 } }} />

      {/* Experience */}
      <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 3 }}>
        Experience
      </Typography>
      <Stack spacing={2}>
        {experience.map((item, i) => (
          <TimelineCard key={i} icon={<WorkIcon />} {...item} />
        ))}
      </Stack>
    </Container>
  );
}

function Row({ label, value, mono }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit',
          fontSize: mono ? '0.85rem' : '0.9rem',
          textAlign: 'right',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function TimelineCard({ icon, title, org, period, detail }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(124,92,255,0.12)',
              color: 'primary.main',
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'baseline' }}
              spacing={{ xs: 0.5, sm: 2 }}
            >
              <Typography variant="h6">{title}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {period}
              </Typography>
            </Stack>
            <Typography variant="body2" color="secondary" sx={{ mb: 1 }}>
              {org}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {detail}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
