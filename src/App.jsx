import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Projects from './pages/Projects.jsx';
import Contact from './pages/Contact.jsx';
import QRGenerator from './pages/projects/QRGenerator.jsx';
import StockTracker from './pages/projects/StockTracker.jsx';
import RagAssistant from './pages/projects/RagAssistant.jsx';
import BandwidthSimulator from './pages/projects/BandwidthSimulator.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flex: 1, pt: { xs: 8, sm: 9 } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/qr-generator" element={<QRGenerator />} />
          <Route path="/projects/stock-tracker" element={<StockTracker />} />
          <Route path="/projects/rag-assistant" element={<RagAssistant />} />
          <Route path="/projects/bandwidth-simulator" element={<BandwidthSimulator />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}
