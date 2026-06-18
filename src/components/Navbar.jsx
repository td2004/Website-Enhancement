import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              component={NavLink}
              to="/"
              variant="h6"
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                '& span': {
                  background:
                    'linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                },
              }}
            >
              <span>Arpitha</span>
              <Box
                component="span"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  ml: 0.5,
                  WebkitTextFillColor: 'unset',
                  background: 'none',
                }}
              >
                .dev
              </Box>
            </Typography>

            {/* Desktop links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {links.map((link) => (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  end={link.to === '/'}
                  sx={{
                    color: isActive(link.to) ? 'primary.main' : 'text.primary',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            {/* Mobile menu button */}
            <IconButton
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{ width: 260, height: '100%', bgcolor: 'background.default' }}
          role="presentation"
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
            }}
          >
            <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {links.map((link) => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  sx={{
                    '&.active': { color: 'primary.main' },
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
