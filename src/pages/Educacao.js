import "./Educacao.css";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Grid,
  Box,
  TextField,
  Link,
  Alert,
  LinearProgress,
  Chip
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

  const [moduloSelecionado, setModuloSelecionado] = useState(null);

  const progresso = 35;

  const modulos = [
  {
    id: 1,
    icone: "🛡️",
    titulo: "Introdução à Segurança",
    descricao: "Conceitos básicos de segurança digital.",
    conteudo: `
A segurança digital é o conjunto de práticas, ferramentas e comportamentos utilizados para proteger informações, dispositivos e contas contra acessos não autorizados, golpes e ataques virtuais. Atualmente, grande parte das nossas atividades acontece pela internet, como compras, pagamentos, estudos, trabalho e comunicação. Por isso, conhecer os riscos existentes é fundamental para utilizar a tecnologia com mais segurança.

Criminosos virtuais utilizam diversas técnicas para enganar usuários e obter informações pessoais, como senhas, dados bancários e documentos. Muitas vezes, esses ataques não exploram falhas em sistemas, mas sim o comportamento humano. Isso significa que qualquer pessoa pode se tornar alvo de um golpe, independentemente do nível de conhecimento tecnológico.

Alguns cuidados básicos podem reduzir significativamente os riscos. É importante manter computadores e celulares sempre atualizados, utilizar senhas fortes, evitar clicar em links desconhecidos e desconfiar de mensagens que criem senso de urgência. Além disso, realizar backups periódicos ajuda a evitar a perda de dados importantes.

A educação digital é uma das formas mais eficazes de prevenção. Quanto mais uma pessoa conhece os golpes e as ameaças existentes, maiores são as chances de identificar situações suspeitas antes que causem prejuízos.

Boas práticas:
• Mantenha seus dispositivos atualizados.
• Utilize antivírus confiáveis.
• Faça backups regularmente.
• Nunca compartilhe senhas.
• Verifique sempre a autenticidade de sites e aplicativos.
`
  },
  {
    id: 2,
    icone: "🎣",
    titulo: "Phishing",
    descricao: "Aprenda a identificar golpes online.",
    conteudo: `
Phishing é uma das formas mais comuns de golpe na internet. Nesse tipo de ataque, criminosos tentam se passar por empresas, bancos ou serviços conhecidos para convencer a vítima a fornecer informações pessoais, como senhas, números de cartão e dados bancários.

Normalmente o golpe chega por e-mail, SMS, WhatsApp ou redes sociais. As mensagens costumam utilizar linguagem alarmante, afirmando que existe um problema urgente na conta da vítima. O objetivo é fazer com que a pessoa tome uma decisão rápida sem analisar a situação cuidadosamente.

Os golpistas geralmente criam páginas falsas muito parecidas com as originais. Em muitos casos, apenas pequenos detalhes diferenciam o site legítimo do fraudulento. Por isso, é importante observar atentamente o endereço da página antes de inserir qualquer informação.

Exemplo de phishing:

"Seu banco identificou uma movimentação suspeita. Clique aqui para validar sua conta."

Ao clicar, a vítima é direcionada para um site falso que coleta seus dados.

Sinais de alerta:
• Mensagens urgentes.
• Links desconhecidos.
• Erros de ortografia.
• Solicitação de senhas.
• Promoções exageradas.

Sempre confirme informações utilizando canais oficiais da empresa.
`
  },
  {
    id: 3,
    icone: "🔒",
    titulo: "Senhas Seguras",
    descricao: "proteger suas contas contra invasões.",
    conteudo: `
As senhas são a principal barreira de proteção das contas digitais. Quando uma senha é fraca ou previsível, criminosos podem obter acesso às informações pessoais com relativa facilidade.

Muitas pessoas ainda utilizam combinações simples como "123456", "senha123" ou datas de nascimento. Essas senhas podem ser descobertas em poucos segundos por ferramentas automatizadas utilizadas por criminosos.

Uma senha forte deve possuir uma combinação de letras maiúsculas, letras minúsculas, números e caracteres especiais. Além disso, recomenda-se utilizar pelo menos 12 caracteres para aumentar significativamente o nível de segurança.

Outro erro comum é reutilizar a mesma senha em vários serviços. Caso uma plataforma sofra vazamento de dados, todas as demais contas que utilizam a mesma senha também podem ficar comprometidas.

Exemplo de senha forte:

J0rg3!SafeClick#2026

Boas práticas:
• Use senhas únicas para cada serviço.
• Ative autenticação em dois fatores.
• Não compartilhe senhas.
• Utilize gerenciadores de senhas.
• Troque senhas comprometidas imediatamente.
`
  },
  {
    id: 4,
    icone: "🔗",
    titulo: "Links Maliciosos",
    descricao: "Aprenda a reconhecer URLs perigosas.",
    conteudo: `
Links maliciosos são endereços criados para direcionar usuários a páginas falsas ou infectadas com programas maliciosos. Muitas vezes eles são distribuídos por mensagens, e-mails, anúncios ou redes sociais.

Ao clicar em um link malicioso, a vítima pode ter seus dados roubados, instalar vírus sem perceber ou ser redirecionada para páginas fraudulentas que simulam sites legítimos.

Uma técnica muito utilizada pelos criminosos consiste em registrar domínios parecidos com os originais. A diferença pode ser apenas uma letra ou símbolo, dificultando a identificação do golpe.

Exemplos:

Seguro:
www.google.com

Suspeito:
www.google-seguranca.xyz

Antes de clicar em qualquer link, verifique:
• O domínio do site.
• A presença do HTTPS.
• Erros de escrita.
• Solicitações incomuns de dados.

Quando possível, digite o endereço manualmente no navegador em vez de acessar links recebidos por mensagens.
`
  },
  {
    id: 5,
    icone: "🧠",
    titulo: "Engenharia Social",
    descricao: "Como criminosos manipulam pessoas.",
    conteudo: `
Engenharia social é uma técnica utilizada para manipular pessoas e convencê-las a fornecer informações confidenciais ou realizar ações que beneficiem criminosos.

Diferentemente dos ataques técnicos, a engenharia social explora emoções humanas como medo, confiança, curiosidade e urgência. O objetivo é fazer a vítima agir sem analisar a situação adequadamente.

Um exemplo comum ocorre quando alguém se passa por funcionário de banco e informa que a conta da vítima foi comprometida. Em seguida, solicita códigos de autenticação ou dados pessoais para supostamente resolver o problema.

Os criminosos costumam estudar o comportamento da vítima antes do contato. Informações obtidas em redes sociais podem ser utilizadas para tornar o golpe mais convincente.

Sinais de engenharia social:
• Pressão para agir rapidamente.
• Solicitação de informações sigilosas.
• Promessas exageradas.
• Histórias emocionais.
• Autoridade falsa.

Sempre confirme informações utilizando canais oficiais antes de tomar qualquer decisão.
`
  },
  {
    id: 6,
    icone: "💳",
    titulo: "Golpes Bancários",
    descricao: "golpes financeiros mais comuns.",
    conteudo: `
Os golpes bancários estão entre os crimes digitais que mais causam prejuízos financeiros. Os criminosos utilizam diversas estratégias para convencer as vítimas a realizar transferências, informar dados bancários ou instalar aplicativos maliciosos.

Um dos golpes mais comuns é o da falsa central de atendimento. Nesse caso, o criminoso entra em contato alegando ser funcionário do banco e informa que existe uma movimentação suspeita na conta. Durante a conversa, tenta obter senhas, códigos de autenticação ou convencer a vítima a realizar transferências.

Outro golpe bastante conhecido envolve o PIX. Os golpistas enviam comprovantes falsos ou mensagens afirmando que ocorreu um erro na transferência, induzindo a vítima a realizar novos pagamentos.

Também existem golpes relacionados a empréstimos falsos, clonagem de cartões e aplicativos bancários adulterados.

Para se proteger:
• Nunca informe senhas por telefone.
• Confirme informações diretamente no aplicativo oficial.
• Desconfie de pedidos urgentes.
• Verifique sempre os comprovantes recebidos.
• Ative notificações de movimentações bancárias.

Em caso de suspeita, entre em contato diretamente com seu banco utilizando os canais oficiais disponíveis.
`
  }
];

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
  <>
    <div className="hero-section">
      <Container maxWidth="lg">

        <Typography variant="h3">
          Centro de Aprendizado SafeClick
        </Typography>

        <Typography variant="h6">
          Aprenda a identificar golpes digitais e proteger seus dados.
        </Typography>

        <Box className="progress-container">

          <Typography sx={{ mb: 1 }}>
            Progresso do Curso
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progresso}
            className="progress-bar"
          />

          <Typography sx={{ mt: 1 }}>
            {progresso}% concluído
          </Typography>

        </Box>

        <Button
          className="btn-logout"
          onClick={handleLogout}
        >
          Sair
        </Button>

      </Container>
    </div>

    <Container maxWidth="lg" className="content-section">

      <Typography
        variant="h4"
        className="section-title"
      >
        Módulos de Aprendizado
      </Typography>

      <Grid container spacing={3}>

        {modulos.map((modulo, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>

            <Card
            className="card-modulo"
            onClick={() => setModuloSelecionado(modulo)}
          >

              <CardContent>

                <div className="modulo-icon">
                  {modulo.icone}
                </div>

                <Typography className="modulo-title">
                  {modulo.titulo}
                </Typography>

                <Typography className="modulo-text">
                  {modulo.descricao}
                </Typography>

                <Chip
                  label="Disponível"
                  color="success"
                  sx={{ mt: 2 }}
                />

              </CardContent>

            </Card>

          </Grid>
        ))}

      </Grid>

      <Box className="estatisticas-box">

        {moduloSelecionado && (
  <Card className="conteudo-modulo-card">

    <CardContent>

      <Typography
        variant="h4"
        className="conteudo-titulo"
      >
        {moduloSelecionado.icone} {moduloSelecionado.titulo}
      </Typography>

      <Typography
        className="conteudo-texto"
      >
        {moduloSelecionado.conteudo}
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => setModuloSelecionado(null)}
      >
        Fechar Aula
      </Button>

    </CardContent>

  </Card>
)}

        <Typography
          variant="h4"
          className="section-title"
        >
          Fatos Importantes
        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={12} md={4}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h3">90%</Typography>
                <Typography>
                  dos ataques começam através de phishing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h3">80%</Typography>
                <Typography>
                  das invasões usam senhas vazadas ou fracas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h3">35%</Typography>
                <Typography>
                  aumento nos golpes via WhatsApp.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

      </Box>

    </Container>
  </>
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