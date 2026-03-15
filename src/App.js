import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent, 
  Grid, Alert, Box, ThemeProvider, createTheme, CssBaseline, TextField 
} from "@mui/material";

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
  const [link, setLink] = useState("");
  const [analiseStatus, setAnaliseStatus] = useState(null); 
  const [mensagem, setMensagem] = useState(""); 

  const handleAnalisar = async () => {
    if (!link) return;
    
    setAnaliseStatus("loading");
    setMensagem(""); 

    const urlBase = link.toLowerCase().trim();

    // 1. ANÁLISE HEURÍSTICA (Rápida e local)
    const regexIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    if (!urlBase.startsWith("http://") && !urlBase.startsWith("https://")) {
      setAnaliseStatus("warning");
      setMensagem("Atenção: O link não possui 'http://' ou 'https://'. Digite a URL completa.");
      return; 
    } else if (regexIP.test(urlBase)) {
      setAnaliseStatus("danger");
      setMensagem("Muito Suspeito: O link usa um endereço IP direto. Tática comum em phishing.");
      return;
    }

    // 2. ANÁLISE PROFUNDA (Via o SEU Backend Seguro)
    try {
      // Aqui chamamos o NOSSO servidor (Node.js), e não o Google diretamente!
      const resposta = await fetch('http://localhost:5000/api/analisar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlParaAnalisar: urlBase })
      });

      const dados = await resposta.json();

      // Se a API retornar a propriedade 'matches', significa que o Google achou ameaça
      if (dados.matches && dados.matches.length > 0) {
        setAnaliseStatus("danger");
        setMensagem("ALERTA MÁXIMO: O Google Safe Browsing detectou que este site é perigoso (Phishing ou Malware)!");
      } else {
        // Se não achou no Google, conferimos coisas básicas (como o HTTPS)
        if (urlBase.startsWith("http://")) {
          setAnaliseStatus("warning");
          setMensagem("O Google não detectou malwares, mas cuidado: O site não possui certificado de segurança (HTTPS). Não digite senhas.");
        } else {
          setAnaliseStatus("safe");
          setMensagem("Parece Seguro! O Google Safe Browsing não encontrou registros maliciosos para este link.");
        }
      }

    } catch (error) {
      console.error("Erro na API:", error);
      setAnaliseStatus("warning");
      setMensagem("Não conseguimos conectar ao nosso servidor de segurança. Verifique se o backend está rodando na porta 5000.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <div>
        {/* === HEADER === */}
        <AppBar position="static" color="primary" elevation={0} sx={{ py: 1 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800 }}>
              SafeClick
            </Typography>
            <Button color="inherit">Painel</Button>
            <Button color="inherit">Educação</Button>
          </Toolbar>
        </AppBar>

        {/* === HERO SECTION (Usando classes do App.css) === */}
        <div className="hero-section">
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom>
              Verifique se o seu link é seguro
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Analise URLs em bancos de dados globais para detectar phishing e malware.
            </Typography>

            <div className="search-container">
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="https://exemplo.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                onClick={handleAnalisar}
                disabled={analiseStatus === "loading"}
                sx={{ px: 4, fontSize: '1.1rem', minWidth: '150px' }}
              >
                {analiseStatus === "loading" ? "Analisando..." : "Analisar"}
              </Button>
            </div>
          </Container>
        </div>

        {/* === RESULTADO DA ANÁLISE === */}
        {analiseStatus && analiseStatus !== "loading" && (
          <div className={`banner-resultado ${
            analiseStatus === 'safe' ? 'banner-safe' : 
            analiseStatus === 'warning' ? 'banner-warning' : 'banner-danger'
          }`}>
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                {analiseStatus === 'safe' ? "Parece Seguro!" : 
                 analiseStatus === 'warning' ? "Atenção Necessária" : "Cuidado! Risco Detectado"}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400 }}>
                {mensagem}
              </Typography>
            </Container>
          </div>
        )}

        {/* === CONTEÚDO PRINCIPAL === */}
        <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom color="primary">
                    Dica de Segurança
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Mesmo que um link conste como seguro, use o bom senso. Golpes muito recentes podem ainda não estar nos bancos de dados do Google.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom color="primary">
                    Como funciona?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    O SafeClick cruza o link que você digitou com a base de dados em tempo real da <strong>Google Safe Browsing API</strong> para garantir que você não acesse sites listados como maliciosos.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
}