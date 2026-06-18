import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { PROFILE, SOCIAL, SKILLS, PROJECTS } from '../config.js';

export default function Home() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <Box className="page-enter">
      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 12 }, pb: { xs: 6, md: 10 } }}>
        <Typography
          variant="overline"
          color="secondary"
          sx={{ letterSpacing: 2, fontWeight: 600 }}
        >
          {PROFILE.location}
        </Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            mt: 2,
            mb: 1,
            lineHeight: 1.05,
          }}
        >
          Hi, I&rsquo;m{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {PROFILE.name}
          </Box>
          .
        </Typography>

        <Typography
          variant="h2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            fontWeight: 400,
            maxWidth: 720,
            mb: 4,
            lineHeight: 1.5,
          }}
        >
          {PROFILE.role} and {PROFILE.degree.toLowerCase()} student at{' '}
          {PROFILE.university}. I build clean, pragmatic web apps with React and
          Node — and care about the small details that make them feel finished.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            component={RouterLink}
            to="/projects"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            See my projects
          </Button>
          <Button
            component={RouterLink}
            to="/contact"
            variant="outlined"
            size="large"
          >
            Get in touch
          </Button>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: { sm: 1 } }}>
            <Button
              component="a"
              href={SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
              color="inherit"
            >
              GitHub
            </Button>
            <Button
              component="a"
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<LinkedInIcon />}
              color="inherit"
            >
              LinkedIn
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Skills */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="text.secondary">
          Skills
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, mb: 4, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
          What I work with
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(SKILLS).map(([category, items]) => (
            <Grid key={category} item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    sx={{ mb: 1.5, letterSpacing: 1 }}
                  >
                    {category.toUpperCase()}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {items.map((skill) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured projects */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Selected work
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Featured projects
            </Typography>
          </Box>
          <Button component={RouterLink} to="/projects" endIcon={<ArrowForwardIcon />}>
            View all
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {featured.map((project) => (
            <Grid key={project.slug} item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {project.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {project.summary}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {project.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    component={RouterLink}
                    to={project.href}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Open demo
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
