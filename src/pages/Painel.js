import React, { useState } from "react";
import { Typography, Button, Container, Card, CardContent, Grid, TextField } from "@mui/material";

export default function Painel() {
  const [link, setLink] = useState("");
  const [analiseStatus, setAnaliseStatus] = useState(null); 
  const [mensagem, setMensagem] = useState(""); 

 const handleAnalisar = async () => {
    if (!link) return;
    setAnaliseStatus("loading");
    setMensagem(""); 
    const urlBase = link.toLowerCase().trim();

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

    try {
      const resposta = await fetch('http://localhost:5000/api/analisar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlParaAnalisar: urlBase })
      });

      const dados = await resposta.json();
      
      if (!resposta.ok || dados.erro) {
        setAnaliseStatus("warning");
        setMensagem(`Erro na verificação: ${dados.erro || "Falha de conexão."}`);
        return;
      }

      // O Backend já manda tudo prontinho agora!
      setAnaliseStatus(dados.statusFinal);
      setMensagem(dados.mensagem);

    } catch (error) {
      console.error("Erro na API:", error);
      setAnaliseStatus("warning");
      setMensagem("Não conseguimos conectar ao nosso servidor de segurança. Verifique se o backend está rodando.");
    }
  };
  return (
    <div>
      {/* HERO SECTION */}
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

      {/* RESULTADO DA ANÁLISE */}
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

      {/* CONTEÚDO INFORMATIVO */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom color="primary">Dica de Segurança</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Mesmo que um link conste como seguro, use o bom senso. Golpes muito recentes podem ainda não estar nos bancos de dados do Google.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom color="primary">Como funciona?</Typography>
                <Typography variant="body1" color="text.secondary">
                  O SafeClick cruza o link que você digitou com a base de dados em tempo real da <strong>Google Safe Browsing API</strong> para garantir que você não acesse sites listados como maliciosos.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}