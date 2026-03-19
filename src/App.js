import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Importando as páginas que criamos
import Painel from "./pages/Painel";
import Educacao from "./pages/Educacao";

const theme = createTheme({
  palette: {
    primary: { main: '#092C4C' },
    secondary: { main: '#2980B9' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-1px' },
    button: { textTransform: 'none', fontWeight: 600 }, 
  },
  shape: { borderRadius: 8 },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      {/* O Router envolve toda a aplicação que terá navegação */}
      <Router>
        <div>
          {/* === HEADER (Fica fixo em todas as páginas) === */}
          <AppBar position="static" color="primary" elevation={0} sx={{ py: 1 }}>
            <Toolbar>
              <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800 }}>
                SafeClick
              </Typography>
              
              {/* O component={RouterLink} faz a troca de tela sem recarregar a página */}
              <Button color="inherit" component={RouterLink} to="/">Painel</Button>
              <Button color="inherit" component={RouterLink} to="/educacao">Educação</Button>
            </Toolbar>
          </AppBar>

          {/* === ÁREA DINÂMICA (As rotas) === */}
          <Routes>
            <Route path="/" element={<Painel />} />
            <Route path="/educacao" element={<Educacao />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}