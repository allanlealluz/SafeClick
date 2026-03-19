import React, { useState } from "react";
import { 
  Typography, Button, Container, Card, CardContent, 
  Grid, Box, TextField, Link 
} from "@mui/material";

export default function Educacao() {
  // Estado para controlar qual tela mostrar: 'home', 'login' ou 'cadastro'
  const [telaAtual, setTelaAtual] = useState('home');

  // --- TELA 1: HOME DA EDUCAÇÃO ---
  const renderHome = () => (
    <div>
      <div className="hero-section">
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Aprenda a Navegar com Segurança
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
            Entenda como os cibercriminosos agem e proteja seus dados antes de clicar.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={() => setTelaAtual('cadastro')}
            >
              Criar Conta Grátis
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#2980B9' } }}
              onClick={() => setTelaAtual('login')}
            >
              Já tenho conta
            </Button>
          </Box>
        </Container>
      </div>

      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Typography variant="h4" color="primary" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Ameaças Comuns na Internet
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '4px solid #C0392B' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Phishing
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  E-mails ou mensagens falsas que se passam por empresas reais (bancos, lojas) para roubar suas senhas e dados de cartão.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '4px solid #F39C12' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Malware
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Softwares maliciosos escondidos em links ou downloads que podem danificar seu computador ou espionar suas atividades.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '4px solid #27AE60' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Engenharia Social
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Táticas de manipulação psicológica. O golpista cria um senso de urgência ("Sua conta foi bloqueada!") para forçar você a agir sem pensar.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );

  // --- TELA 2: LOGIN ---
  const renderLogin = () => (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 10 }}>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
          Entrar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Acesse o painel do SafeClick
        </Typography>
        
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="E-mail" variant="outlined" fullWidth type="email" />
          <TextField label="Senha" variant="outlined" fullWidth type="password" />
          
          <Button variant="contained" color="primary" size="large" fullWidth>
            Entrar
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Não tem uma conta?{' '}
            <Link component="button" variant="body2" onClick={() => setTelaAtual('cadastro')} sx={{ fontWeight: 'bold', color: '#2980B9' }}>
              Cadastre-se
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Link component="button" variant="body2" onClick={() => setTelaAtual('home')} color="inherit">
              Voltar para Educação
            </Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );

  // --- TELA 3: CADASTRO ---
  const renderCadastro = () => (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 10 }}>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
          Criar Conta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Junte-se à comunidade SafeClick
        </Typography>
        
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Nome Completo" variant="outlined" fullWidth />
          <TextField label="E-mail" variant="outlined" fullWidth type="email" />
          <TextField label="Senha" variant="outlined" fullWidth type="password" />
          <TextField label="Confirmar Senha" variant="outlined" fullWidth type="password" />
          
          <Button variant="contained" color="secondary" size="large" fullWidth>
            Cadastrar
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Já possui conta?{' '}
            <Link component="button" variant="body2" onClick={() => setTelaAtual('login')} sx={{ fontWeight: 'bold', color: '#092C4C' }}>
              Fazer Login
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Link component="button" variant="body2" onClick={() => setTelaAtual('home')} color="inherit">
              Voltar para Educação
            </Link>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
  return (
    <Box sx={{ minHeight: '80vh', bgcolor: '#F5F7FA' }}>
      {telaAtual === 'home' && renderHome()}
      {telaAtual === 'login' && renderLogin()}
      {telaAtual === 'cadastro' && renderCadastro()}
    </Box>
  );
}