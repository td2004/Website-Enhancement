import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '5rem', md: '8rem' },
          fontWeight: 700,
          background: 'linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        That URL doesn&rsquo;t match anything on this site.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Back home
        </Button>
      </Box>
    </Container>
  );
}
