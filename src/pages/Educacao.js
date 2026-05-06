import "./Educacao.css";
import React, { useState, useEffect } from "react";
import { 
  Typography, Button, Container, Card, CardContent, 
  Grid, Box, TextField, Link, Alert
} from "@mui/material";

import { auth } from "../firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";

export default function Educacao() {
  const [telaAtual, setTelaAtual] = useState('home');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // 🔥 Mantém usuário logado mesmo após refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogado(user);
    });

    return () => unsubscribe();
  }, []);

  // --- CADASTRO ---
  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      setUsuarioLogado(userCredential.user);
      setTelaAtual('home'); // ✅ vai pra home (conteúdo)
    } catch (error) {
      setErro("Erro ao cadastrar: " + error.message);
    }
  };

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setUsuarioLogado(userCredential.user);
      setTelaAtual('home'); // ✅ vai pra home (conteúdo)
    } catch (error) {
      setErro("Email ou senha incorretos.");
    }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    await signOut(auth);
    setUsuarioLogado(null);
    setTelaAtual('home');
    setEmail('');
    setSenha('');
  };

  // --- HOME (PROTEGIDA) ---
  const renderHome = () => {
    // 🔒 NÃO LOGADO
    if (!usuarioLogado) {
      return (
              <Container maxWidth="sm" className="bloqueio">
        <Typography variant="h4">
          Área de Aprendizado
        </Typography>

        <Typography>
          Faça login para acessar conteúdos educativos, dicas de segurança e 
          aprender a se proteger melhor contra golpes online. 
        </Typography>

        <Typography>É rápido e ajuda você a navegar com mais segurança na internet.</Typography>

        <div className="botoes-acesso">
          <Button 
            variant="contained"
            onClick={() => setTelaAtual('login')}
          >
            Login
          </Button>

          <Button 
            variant="outlined"
            onClick={() => setTelaAtual('cadastro')}
          >
            Cadastro
          </Button>
        </div>
      </Container>
      );
    }

    // 🔓 LOGADO → CONTEÚDO
    return (
            <div>
              <div className="hero-section">
  <Container maxWidth="md">
    <Typography variant="h3">
      Aprenda a Navegar com Segurança
    </Typography>

    <Typography variant="h6">
      Descubra como identificar golpes, evitar links perigosos e proteger seus dados na internet de forma simples e prática.
    </Typography>

    <Button 
      className="btn-logout"
      onClick={handleLogout}
    >
      Sair
    </Button>
  </Container>
</div>

<Container className="content-section">
  <Typography variant="h4" className="section-title">
    Conteúdo Educativo
  </Typography>

  <Grid container spacing={3} className="cards-grid">

    {/* PHISHING */}
    <Grid item xs={12} md={4}>
      <Card className="card-educacao">
        <CardContent>
          <div className="card-icon">🎣</div>
          <Typography className="card-title">
            Phishing
          </Typography>
          <Typography className="card-text">
            
            Phishing é um tipo de golpe online em que criminosos tentam enganar você se passando 
            por empresas ou pessoas confiáveis, como bancos, lojas ou até conhecidos. 
            Eles geralmente enviam mensagens por e-mail, SMS ou aplicativos como WhatsApp, 
            pedindo que você clique em um link ou informe seus dados pessoais, como senha, 
            CPF ou informações bancárias. Essas mensagens costumam criar um senso de urgência, 
            dizendo que sua conta foi bloqueada ou que você precisa agir rapidamente. Para se proteger, 
            nunca clique em links desconhecidos, verifique sempre o remetente da mensagem e evite fornecer 
            informações pessoais fora de sites oficiais.
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* SENHAS */}
    <Grid item xs={12} md={4}>
      <Card className="card-educacao">
        <CardContent>
          <div className="card-icon">🔒</div>
          <Typography className="card-title">
            Senhas Seguras
          </Typography>
          <Typography className="card-text">
            Uma senha segura é essencial para proteger suas contas na internet contra acessos não autorizados. 
            Senhas fracas ou fáceis de adivinhar, como datas de nascimento ou sequências simples (123456), 
            podem ser descobertas rapidamente por criminosos. Por isso, é importante criar senhas mais fortes, 
            combinando letras maiúsculas e minúsculas, números e símbolos. Além disso, evite usar a mesma senha em vários sites, 
            pois se uma conta for comprometida, todas as outras também ficam em risco. Sempre que possível, 
            utilize autenticação em dois fatores (2FA) e prefira usar um gerenciador de senhas para armazená-las com segurança.
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* LINKS */}
    <Grid item xs={12} md={4}>
      <Card className="card-educacao">
        <CardContent>
          <div className="card-icon">🔗</div>
          <Typography className="card-title">
            Links Maliciosos
          </Typography>
          <Typography className="card-text">
            Links maliciosos são endereços falsos criados para levar o usuário a sites perigosos, 
            que podem roubar informações pessoais, instalar vírus ou aplicar golpes. Muitas vezes, 
            esses links chegam por e-mail, redes sociais ou aplicativos de mensagem, disfarçados como promoções, 
            avisos importantes ou mensagens de pessoas conhecidas. Antes de clicar em qualquer link, 
            é importante verificar se o endereço é confiável, observando erros de escrita, domínios estranhos 
            ou muito diferentes do original. Evite também links encurtados ou desconhecidos, pois eles escondem o destino real. 
            Sempre que possível, acesse sites digitando o endereço diretamente no navegador, garantindo mais segurança.
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* NOVO CARD 1 */}
    <Grid item xs={12} md={4}>
      <Card className="card-educacao">
        <CardContent>
          <div className="card-icon">💬</div>
          <Typography className="card-title">
            Golpes em Mensagens
          </Typography>
          <Typography className="card-text">
            Golpes em mensagens são muito comuns em aplicativos como WhatsApp e SMS, 
            onde criminosos enviam conteúdos falsos para enganar as pessoas. 
            Essas mensagens podem prometer prêmios, promoções imperdíveis ou até simular pedidos de ajuda de 
            amigos e familiares. Muitas vezes, o objetivo é fazer com que você clique em um link ou compartilhe informações pessoais. 
            Para se proteger, é importante sempre desconfiar de mensagens inesperadas, principalmente aquelas que pedem urgência ou envolvem dinheiro. 
            Antes de clicar em qualquer link ou responder, verifique a origem da mensagem e, se possível, confirme a informação diretamente com a pessoa ou empresa. 
            Evitar agir por impulso é uma das melhores formas de se proteger contra esse tipo de golpe.
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* NOVO CARD 2 */}
    <Grid item xs={12} md={4}>
      <Card className="card-educacao">
        <CardContent>
          <div className="card-icon">🧠</div>
          <Typography className="card-title">
            Engenharia Social
          </Typography>
          <Typography className="card-text">
            Engenharia social é uma técnica usada por criminosos para manipular pessoas e 
            obter informações confidenciais, como senhas, códigos ou dados pessoais. 
            Em vez de atacar sistemas diretamente, eles exploram a confiança e o comportamento humano, 
            fingindo ser alguém confiável, como um funcionário de banco, suporte técnico ou até um conhecido. 
            Esses golpes geralmente envolvem senso de urgência, pressão ou pedidos incomuns, 
            como solicitar códigos de verificação ou transferências de dinheiro. Para se proteger, nunca compartilhe 
            informações sensíveis sem confirmar a identidade da pessoa e desconfie de qualquer situação que pareça apressada ou fora do normal. 
            Sempre que possível, verifique a informação por canais oficiais antes de tomar qualquer ação.
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* NOVO CARD 3 */}
    <Grid item xs={12} md={4}>
      <Card className="card-educacao">
        <CardContent>
          <div className="card-icon">✅</div>
          <Typography className="card-title">
            Boas Práticas
          </Typography>
          <Typography className="card-text">
            Adotar boas práticas de segurança é essencial para se proteger no 
            dia a dia na internet. Manter aplicativos e sistemas sempre atualizados ajuda a 
            corrigir falhas de segurança que podem ser exploradas por criminosos. Além disso, 
            é importante evitar o uso de redes Wi-Fi públicas para acessar contas pessoais ou realizar operações sensíveis, 
            pois essas redes podem não ser seguras. Outra recomendação fundamental é nunca compartilhar dados pessoais 
            ou bancários em sites desconhecidos ou não confiáveis. Sempre verifique se o site possui conexão segura (https) 
            e se realmente pertence à empresa que diz representar. Pequenos cuidados como esses fazem grande diferença e ajudam a evitar golpes e problemas online.
          </Typography>
        </CardContent>
      </Card>
    </Grid>

  </Grid>
</Container>
      </div>
    );
  };

  // --- LOGIN ---
  const renderLogin = () => (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 10 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" className="section-title">Entrar</Typography>

        {erro && <Alert severity="error">{erro}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            label="E-mail"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Entrar
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component="button" onClick={() => setTelaAtual('cadastro')}>
            Criar conta
          </Link>
        </Box>
      </Card>
    </Container>
  );

  // --- CADASTRO ---
  const renderCadastro = () => (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 10 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" className="section-title">Cadastro</Typography>

        {erro && <Alert severity="error">{erro}</Alert>}

        <Box component="form" onSubmit={handleCadastro} sx={{ mt: 2 }}>
          <TextField
            label="E-mail"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Cadastrar
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component="button" onClick={() => setTelaAtual('login')}>
            Já tenho conta
          </Link>
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