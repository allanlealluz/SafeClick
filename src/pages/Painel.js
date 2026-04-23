import React, { useState } from "react";
import { 
  Typography, Button, Container, Card, CardContent, Grid, TextField, 
  Tabs, Tab, Box 
} from "@mui/material";

// ==========================================
// COMPONENTE AUXILIAR PARA AS ABAS
// ==========================================
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Painel() {
  // Controle da Aba Selecionada (0 = Link, 1 = Arquivo, 2 = E-mail)
  const [tabAtual, setTabAtual] = useState(0); 
  
  // Estados dos inputs
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [arquivo, setArquivo] = useState(null);
  
  // Estados de resultado
  const [analiseStatus, setAnaliseStatus] = useState(null); 
  const [mensagem, setMensagem] = useState(""); 

  // Quando o usuário troca de aba, limpamos os resultados antigos
  const handleTabChange = (event, newValue) => {
    setTabAtual(newValue);
    setAnaliseStatus(null);
    setMensagem("");
  };

  // ==========================================
  // FUNÇÃO 1: ANALISAR LINK
  // ==========================================
  const analisarLink = async () => {
    if (!link) return;
    setAnaliseStatus("loading");
    
    const urlBase = link.toLowerCase().trim();
    const regexIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

    // Validações básicas no Frontend
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
      const resposta = await fetch('http://localhost:5001/api/analisar-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlParaAnalisar: urlBase })
      });
      processarResposta(resposta);
    } catch (error) {
      tratarErroConexao(error);
    }
  };

  // ==========================================
  // FUNÇÃO 2: ANALISAR ARQUIVO
  // ==========================================
  const analisarArquivo = async () => {
    if (!arquivo) {
      setAnaliseStatus("warning");
      setMensagem("Por favor, selecione um arquivo primeiro.");
      return;
    }
    setAnaliseStatus("loading");

    // Para envio de arquivos, usamos FormData em vez de JSON
    const formData = new FormData();
    formData.append("arquivoParaAnalisar", arquivo);

    try {
      const resposta = await fetch('http://localhost:5001/api/analisar-arquivo', {
        method: 'POST',
        // ATENÇÃO: Nunca defina 'Content-Type' manualmente ao usar FormData.
        // O navegador faz isso automaticamente e define o "boundary" correto.
        body: formData
      });
      processarResposta(resposta);
    } catch (error) {
      tratarErroConexao(error);
    }
  };

  // ==========================================
  // FUNÇÃO 3: ANALISAR E-MAIL
  // ==========================================
  const analisarEmail = async () => {
    if (!email) return;
    setAnaliseStatus("loading");
    
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      setAnaliseStatus("warning");
      setMensagem("Formato de e-mail inválido. Verifique o que foi digitado.");
      return;
    }

    try {
      const resposta = await fetch('http://localhost:5001/api/analisar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailParaAnalisar: email.trim() })
      });
      processarResposta(resposta);
    } catch (error) {
      tratarErroConexao(error);
    }
  };

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================
  const processarResposta = async (resposta) => {
    try {
      const dados = await resposta.json();
      if (!resposta.ok || dados.erro) {
        setAnaliseStatus("warning");
        setMensagem(`Erro na verificação: ${dados.erro || "Falha desconhecida no servidor."}`);
        return;
      }
      setAnaliseStatus(dados.statusFinal);
      setMensagem(dados.mensagem);
    } catch (e) {
      setAnaliseStatus("warning");
      setMensagem("Erro ao processar a resposta do servidor.");
    }
  };

  const tratarErroConexao = (error) => {
    console.error("Erro na API:", error);
    setAnaliseStatus("warning");
    setMensagem("Não conseguimos conectar ao nosso servidor de segurança. Verifique se o backend está rodando na porta 5000.");
  };

  // ==========================================
  // RENDERIZAÇÃO (TELA)
  // ==========================================
  return (
    <div>
      {/* HERO SECTION */}
      <div style={{ padding: '60px 0', backgroundColor: '#f5f7fa' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom sx={{ color: '#092C4C', fontWeight: 800 }}>
            Central de Segurança
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9, color: '#555' }}>
            Proteja-se cruzando links, arquivos e e-mails com as maiores bases de dados de ameaças do mundo.
          </Typography>

          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
              <Tabs value={tabAtual} onChange={handleTabChange} centered variant="fullWidth">
                <Tab label="Link / URL" />
                <Tab label="Arquivo" />
                <Tab label="E-mail" />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 4, bgcolor: '#fff' }}>
              
              {/* ABA 0: LINKS */}
              <TabPanel value={tabAtual} index={0}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <TextField 
                    fullWidth
                    variant="outlined"
                    placeholder="https://exemplo.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                  <Button 
                    variant="contained" color="secondary" size="large"
                    onClick={analisarLink} disabled={analiseStatus === "loading"}
                    sx={{ px: 4, minWidth: '150px' }}
                  >
                    {analiseStatus === "loading" ? "Analisando..." : "Analisar"}
                  </Button>
                </Box>
              </TabPanel>

              {/* ABA 1: ARQUIVOS */}
              <TabPanel value={tabAtual} index={1}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ flexGrow: 1, height: '56px', justifyContent: 'flex-start', px: 2, color: arquivo ? '#092C4C' : '#888', borderColor: '#ccc' }}
                  >
                    {arquivo ? arquivo.name : "Clique aqui para selecionar um arquivo (Até 10MB)"}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => setArquivo(e.target.files[0])}
                    />
                  </Button>
                  <Button 
                    variant="contained" color="secondary" size="large"
                    onClick={analisarArquivo} disabled={analiseStatus === "loading" || !arquivo}
                    sx={{ px: 4, minWidth: '150px', height: '56px' }}
                  >
                    {analiseStatus === "loading" ? "Enviando..." : "Analisar"}
                  </Button>
                </Box>
              </TabPanel>

              {/* ABA 2: E-MAIL */}
              <TabPanel value={tabAtual} index={2}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <TextField 
                    fullWidth
                    variant="outlined"
                    placeholder="contato@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button 
                    variant="contained" color="secondary" size="large"
                    onClick={analisarEmail} disabled={analiseStatus === "loading"}
                    sx={{ px: 4, minWidth: '150px' }}
                  >
                    {analiseStatus === "loading" ? "Verificando..." : "Analisar"}
                  </Button>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Container>
      </div>

      {/* RESULTADO DA ANÁLISE */}
      {analiseStatus && analiseStatus !== "loading" && (
        <div style={{
          padding: '24px 0', 
          marginTop: '20px',
          backgroundColor: analiseStatus === 'safe' ? '#e8f5e9' : analiseStatus === 'warning' ? '#fff3e0' : '#ffebee',
          color: analiseStatus === 'safe' ? '#2e7d32' : analiseStatus === 'warning' ? '#ef6c00' : '#c62828',
          borderTop: `4px solid ${analiseStatus === 'safe' ? '#4caf50' : analiseStatus === 'warning' ? '#ff9800' : '#f44336'}`,
          borderBottom: `1px solid ${analiseStatus === 'safe' ? '#c8e6c9' : analiseStatus === 'warning' ? '#ffe0b2' : '#ffcdd2'}`
        }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              {analiseStatus === 'safe' ? "✓ Pareceu Seguro!" : 
               analiseStatus === 'warning' ? "⚠️ Atenção Necessária" : "🛑 Cuidado! Risco Detectado"}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
              {mensagem}
            </Typography>
          </Container>
        </div>
      )}

      {/* CARDS INFORMATIVOS */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '3px solid #2980B9' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700 }}>🔗 Links</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cruzamos o link fornecido com as bases em tempo real do Google Safe Browsing e dezenas de motores antivírus para identificar phishing e sites falsos.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '3px solid #2980B9' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700 }}>📄 Arquivos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Calculamos uma assinatura criptográfica do seu arquivo e pesquisamos na base do VirusTotal para descobrir se ele já foi reportado como malware ou cavalo de troia.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '3px solid #2980B9' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700 }}>📧 E-mails</Typography>
                <Typography variant="body2" color="text.secondary">
                  Verificamos se o domínio remetente possui reputação negativa, se é um e-mail temporário descartável ou se foi usado em golpes conhecidos na internet.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}