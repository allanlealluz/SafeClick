import React, { useState } from "react";
import { 
  Typography, Button, Container, Card, CardContent, 
  Grid, Box, TextField, Link, Alert
} from "@mui/material";

// Importando as funções mágicas do Firebase e a nossa configuração
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function Educacao() {
  const [telaAtual, setTelaAtual] = useState('home');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // --- LÓGICA DE CADASTRO ---
  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      setUsuarioLogado(userCredential.user);
      setTelaAtual('logado');
    } catch (error) {
      setErro("Erro ao cadastrar: " + error.message);
    }
  };

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setUsuarioLogado(userCredential.user);
      setTelaAtual('logado');
    } catch (error) {
      setErro("Email ou senha incorretos.");
    }
  };

  // --- LÓGICA DE SAIR ---
  const handleLogout = async () => {
    await signOut(auth);
    setUsuarioLogado(null);
    setTelaAtual('home');
    setEmail('');
    setSenha('');
  };

  // --- TELA 1: HOME DA EDUCAÇÃO ---
  const renderHome = () => (
    <div>
      <div className="hero-section">
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>Aprenda a Navegar com Segurança</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button variant="contained" color="secondary" size="large" onClick={() => { setTelaAtual('cadastro'); setErro(''); }}>
              Criar Conta Grátis
            </Button>
            <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white' }} onClick={() => { setTelaAtual('login'); setErro(''); }}>
              Já tenho conta
            </Button>
          </Box>
        </Container>
      </div>
      {/* ... o resto dos cards de ameaças ... */}
    </div>
  );

  // --- TELA 2: LOGIN ---
  const renderLogin = () => (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 10 }}>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>Entrar</Typography>
        
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="E-mail" variant="outlined" fullWidth type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Senha" variant="outlined" fullWidth type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>Entrar</Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Não tem conta? <Link component="button" onClick={() => { setTelaAtual('cadastro'); setErro(''); }}>Cadastre-se</Link>
          </Typography>
          <Button onClick={() => setTelaAtual('home')} sx={{ mt: 1 }}>Voltar</Button>
        </Box>
      </Card>
    </Container>
  );

  // --- TELA 3: CADASTRO ---
  const renderCadastro = () => (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 10 }}>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>Criar Conta</Typography>
        
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

        <Box component="form" onSubmit={handleCadastro} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="E-mail" variant="outlined" fullWidth type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Senha" variant="outlined" fullWidth type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <Button type="submit" variant="contained" color="secondary" size="large" fullWidth>Cadastrar</Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Já possui conta? <Link component="button" onClick={() => { setTelaAtual('login'); setErro(''); }}>Fazer Login</Link>
          </Typography>
          <Button onClick={() => setTelaAtual('home')} sx={{ mt: 1 }}>Voltar</Button>
        </Box>
      </Card>
    </Container>
  );

  // --- TELA 4: USUÁRIO LOGADO ---
  const renderLogado = () => (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h4" color="primary" gutterBottom>Bem-vindo ao SafeClick!</Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Você está logado como: <strong>{usuarioLogado?.email}</strong>
      </Typography>
      <Button variant="outlined" color="error" onClick={handleLogout}>Sair da Conta</Button>
    </Container>
  );

  return (
    <Box sx={{ minHeight: '80vh', bgcolor: '#F5F7FA' }}>
      {telaAtual === 'home' && renderHome()}
      {telaAtual === 'login' && renderLogin()}
      {telaAtual === 'cadastro' && renderCadastro()}
      {telaAtual === 'logado' && renderLogado()}
    </Box>
  );
}