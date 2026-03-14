import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, Grid, Alert, Box } from "@mui/material";

export default function App() {
  // Estados para guardar o link digitado e o resultado da análise
  const [link, setLink] = useState("");
  const [analiseStatus, setAnaliseStatus] = useState(null); // null, 'loading', 'safe', 'danger'

  // Função disparada ao clicar em "Analisar"
  const handleAnalisar = () => {
    if (!link) return;
    
    setAnaliseStatus("loading");

    // Simulando uma chamada de API (como Google Safe Browsing) com um timer
    setTimeout(() => {
      // Lógica de mentirinha: se tiver "gratis" no link, é perigoso
      if (link.toLowerCase().includes("gratis") || link.toLowerCase().includes("promocao")) {
        setAnaliseStatus("danger");
      } else {
        setAnaliseStatus("safe");
      }
    }, 1500);
  };

  return (
    <div>
      {/* Top Navigation */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SafeClick
          </Typography>
          <Button color="inherit">Painel</Button>
          <Button color="inherit">Educação</Button>
          <Button color="inherit">Configurações</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container className="mt-5">
        {/* Status Overview */}
        <Alert severity="success" className="mb-4">
          Sua navegação está protegida.
        </Alert>

        <Grid container spacing={4}>
          {/* Verificação de Link */}
          <Grid item xs={12} md={6}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Verificar Link
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cole um link abaixo para analisar possíveis riscos.
                </Typography>
                
                <div className="input-group mb-3 mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://exemplo.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)} // Captura o que o usuário digita
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleAnalisar}
                    disabled={analiseStatus === "loading"}
                  >
                    {analiseStatus === "loading" ? "Analisando..." : "Analisar"}
                  </button>
                </div>

                {/* Mostrando o resultado da análise */}
                {analiseStatus === "safe" && (
                  <Alert severity="success">Este link parece ser seguro!</Alert>
                )}
                {analiseStatus === "danger" && (
                  <Alert severity="error">Cuidado! Este link apresenta características suspeitas de Phishing ou Malware.</Alert>
                )}

              </CardContent>
            </Card>
          </Grid>

          {/* Alertas Recentes */}
          <Grid item xs={12} md={6}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Alertas Recentes
                </Typography>
                <Box className="mt-3">
                  <Alert severity="warning" className="mb-2">
                    Possível tentativa de phishing detectada em mensagem recente.
                  </Alert>
                  <Alert severity="info" className="mb-2">
                    Nova atualização de segurança disponível.
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Educação */}
        <Card elevation={3} className="mt-5">
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Dica do Dia
            </Typography>
            <Typography variant="body1">
              Antes de clicar em qualquer link, verifique se o endereço começa com "https" e se o domínio corresponde ao site oficial.
            </Typography>
            <Button variant="outlined" className="mt-3">
              Aprender Mais
            </Button>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}