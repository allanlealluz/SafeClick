import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent, 
  Grid, Alert, Box, ThemeProvider, createTheme, CssBaseline, TextField 
} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#092C4C',
      light: '#1A5276',
    },
    secondary: {
      main: '#2980B9',
    },
    background: {
      default: '#F5F7FA', 
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-1px' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, 
  },
  shape: {
    borderRadius: 8, 
  },
});

export default function App() {
  const [link, setLink] = useState("");
  const [analiseStatus, setAnaliseStatus] = useState(null); 
  const [mensagem, setMensagem] = useState(""); 

  const handleAnalisar = () => {
    if (!link) return;
    
    setAnaliseStatus("loading");
    setMensagem(""); 

    setTimeout(() => {
      const url = link.toLowerCase().trim();
      let status = "safe";
      let msg = "Boas notícias! Nenhum risco aparente foi encontrado na estrutura deste link.";

      const regexIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        status = "warning";
        msg = "Atenção: O link não possui 'http://' ou 'https://'.";
      } else if (url.startsWith("http://")) {
        status = "warning";
        msg = "Cuidado: O site não possui certificado de segurança (HTTPS).";
      } else if (regexIP.test(url)) {
        status = "danger";
        msg = "Muito Suspeito: O link usa um endereço IP direto. Tática comum em phishing.";
      } else if (url.includes("bit.ly") || url.includes("tinyurl") || url.includes("cutt.ly")) {
        status = "warning";
        msg = "Atenção: Este é um link encurtado. Ele esconde o destino final.";
      } else if (url.includes("gratis") || url.includes("promocao") || url.includes("premio")) {
        status = "danger";
        msg = "Alerta: O link contém palavras comumente usadas em golpes!";
      }

      setAnaliseStatus(status);
      setMensagem(msg);
    }, 1500);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline aplica as cores de fundo do tema na página inteira */}
      <CssBaseline /> 
      <div>
        
        {/* === HEADER (Topo) === */}
        <AppBar position="static" color="primary" elevation={0} sx={{ py: 1 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800 }}>
              SafeClick
            </Typography>
            <Button color="inherit">Painel</Button>
            <Button color="inherit">Educação</Button>
            <Button color="inherit">Configurações</Button>
          </Toolbar>
        </AppBar>

        {/* === HERO SECTION (Inspirado no Have I Been Pwned) === */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 8, md: 12 }, 
          textAlign: 'center' 
        }}>
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom>
              Verifique se o seu link é seguro
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Analise URLs suspeitas para detectar phishing, malware e golpes de engenharia social.
            </Typography>

            {/* Barra de Pesquisa Grande */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="https://exemplo.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 1,
                  input: { fontSize: '1.2rem', py: 2 } 
                }}
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
            </Box>
          </Container>
        </Box>

        {/* === RESULTADO DA ANÁLISE (Banners Grandes) === */}
        {analiseStatus && analiseStatus !== "loading" && (
          <Box sx={{ 
            bgcolor: analiseStatus === 'safe' ? '#27AE60' : analiseStatus === 'warning' ? '#F39C12' : '#C0392B', 
            color: 'white', 
            py: 4 
          }}>
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                {analiseStatus === 'safe' ? "Parece Seguro!" : analiseStatus === 'warning' ? "Atenção Necessária" : "Cuidado! Risco Detectado"}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400 }}>
                {mensagem}
              </Typography>
            </Container>
          </Box>
        )}

        {/* === CONTEÚDO PRINCIPAL (Cards de Informação) === */}
        <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
          <Grid container spacing={4}>
            
            {/* Educação */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom color="primary">
                    Dica de Segurança
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
                    Antes de clicar em qualquer link recebido por SMS, WhatsApp ou e-mail, verifique se o endereço começa com "https" e se o domínio corresponde ao site oficial da empresa.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    Desconfie sempre do senso de urgência ("Sua conta será bloqueada hoje!").
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 3 }} size="large">
                    Aprender Mais
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Alertas Recentes */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom color="primary">
                    Alertas Globais Recentes
                  </Typography>
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                      Nova onda de phishing se passando pelos Correios (Taxação).
                    </Alert>
                    <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
                      Golpe do "IPVA com desconto" em alta neste mês.
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>

      </div>
    </ThemeProvider>
  );
}