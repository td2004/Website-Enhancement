import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { MOCK_STOCKS } from '../../data/mockStocks.js';

const COLUMNS = [
  { key: 'symbol', label: 'Symbol', numeric: false },
  { key: 'name', label: 'Name', numeric: false },
  { key: 'sector', label: 'Sector', numeric: false },
  { key: 'price', label: 'Price', numeric: true, format: (v) => `$${v?.toFixed(2)}` },
  { key: 'changesPercentage', label: 'Change %', numeric: true, format: (v) => `${v >= 0 ? '+' : ''}${v?.toFixed(2)}%` },
  { key: 'marketCap', label: 'Market Cap', numeric: true, format: (v) => `$${(v / 1e9).toFixed(2)}B` },
];

export default function StockTracker() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  const [orderBy, setOrderBy] = useState('marketCap');
  const [order, setOrder] = useState('desc');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchStocks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/stocks', { timeout: 8000 });
      if (Array.isArray(res.data) && res.data.length) {
        setStocks(res.data);
        setUsingMock(false);
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      // Live API not available — fall back to mock data so the demo still works.
      console.info('Falling back to mock stock data:', err?.message);
      setStocks(MOCK_STOCKS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const sectors = useMemo(() => {
    const set = new Set(stocks.map((s) => s.sector).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [stocks]);

  const filtered = useMemo(() => {
    let out = stocks;
    if (sectorFilter !== 'all') {
      out = out.filter((s) => s.sector === sectorFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (s) =>
          s.symbol?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q),
      );
    }
    out = [...out].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return out;
  }, [stocks, sectorFilter, search, orderBy, order]);

  const handleSort = (key) => {
    if (orderBy === key) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(key);
      setOrder('desc');
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
        ASX Top 50 Stock Tracker
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {['React', 'MUI', 'Vercel Serverless', 'REST API'].map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>

      {usingMock && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing sample data — the live API endpoint is not currently
          configured. Add <code>FMP_API_KEY</code> to your Vercel environment
          variables to enable live data.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Demo */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ mb: 3 }}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
              >
                <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1 }}>
                  LIVE DATA · {filtered.length} STOCKS
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    size="small"
                    placeholder="Search symbol or name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 220 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Sector</InputLabel>
                    <Select
                      value={sectorFilter}
                      label="Sector"
                      onChange={(e) => setSectorFilter(e.target.value)}
                    >
                      {sectors.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s === 'all' ? 'All sectors' : s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    onClick={fetchStocks}
                    startIcon={<RefreshIcon />}
                    color="inherit"
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ bgcolor: 'transparent' }}
                >
                  <Table size="small" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        {COLUMNS.map((col) => (
                          <TableCell
                            key={col.key}
                            align={col.numeric ? 'right' : 'left'}
                            sortDirection={orderBy === col.key ? order : false}
                          >
                            <TableSortLabel
                              active={orderBy === col.key}
                              direction={orderBy === col.key ? order : 'asc'}
                              onClick={() => handleSort(col.key)}
                            >
                              {col.label}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((row) => (
                        <TableRow key={row.symbol} hover>
                          {COLUMNS.map((col) => {
                            const value = row[col.key];
                            const isChange = col.key === 'changesPercentage';
                            const color = isChange
                              ? value > 0
                                ? 'success.main'
                                : value < 0
                                  ? 'error.main'
                                  : 'text.primary'
                              : 'text.primary';
                            return (
                              <TableCell
                                key={col.key}
                                align={col.numeric ? 'right' : 'left'}
                                sx={{
                                  color,
                                  fontFamily: col.numeric
                                    ? '"JetBrains Mono", monospace'
                                    : 'inherit',
                                  fontSize: col.numeric ? '0.85rem' : 'inherit',
                                  fontWeight: col.key === 'symbol' ? 600 : 400,
                                }}
                              >
                                {value == null
                                  ? '—'
                                  : col.format
                                    ? col.format(value)
                                    : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">
                              No stocks match those filters.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Case study */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Section
                    title="The problem"
                    body="A simple way to track the largest ASX-listed companies — sortable, filterable by sector, and fast on mobile. Built originally as a uni assignment, rebuilt here with cleaner architecture."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Section
                    title="What I learned"
                    body="API keys belong on the server. The original version called the data API directly from the browser with the key embedded — moving it behind a Vercel serverless function fixed both the leak and a CORS issue."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Section
                    title="Stack"
                    body="React + MUI on the frontend, a Vercel serverless function as a thin API proxy to Financial Modeling Prep, with a 60-second in-memory cache to stay under free-tier limits."
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button
                  component="a"
                  href="https://github.com/your-username/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  variant="outlined"
                >
                  View source on GitHub
                </Button>
              </Box>
            </CardContent>
          </Card>
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
