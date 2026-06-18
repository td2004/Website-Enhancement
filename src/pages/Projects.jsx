import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';
import { PROJECTS } from '../config.js';

export default function Projects() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} className="page-enter">
      <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
        Projects
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1, mb: 1 }}>
        Things I&rsquo;ve built
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 720 }}>
        A small collection of projects from coursework and side experiments.
        Each one has a live demo and a short writeup of the decisions that went
        into it.
      </Typography>

      <Grid container spacing={3}>
        {PROJECTS.map((project) => (
          <Grid key={project.slug} item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
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
              <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                <Button
                  component={RouterLink}
                  to={project.href}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                >
                  Open demo
                </Button>
                <Button
                  component="a"
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  color="inherit"
                >
                  Source
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8, p: 4, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          More on the way.
        </Typography>
        <Typography color="text.secondary">
          I&apos;m actively building out new things — check back, or follow me on
          GitHub for the latest.
        </Typography>
      </Box>
    </Container>
  );
}
