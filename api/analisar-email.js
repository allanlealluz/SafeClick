export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido'
    });
  }

  try {
    const { emailParaAnalisar } = req.body;

    if (!emailParaAnalisar) {
      return res.status(400).json({
        statusFinal: 'warning',
        mensagem: 'Nenhum e-mail informado.'
      });
    }

    const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

    if (!HUNTER_API_KEY) {
      return res.status(500).json({
        statusFinal: 'warning',
        mensagem: 'Hunter API não configurada.'
      });
    }

    const endpoint = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(emailParaAnalisar)}&api_key=${HUNTER_API_KEY}`;

    const resposta = await fetch(endpoint);

    if (!resposta.ok) {
      throw new Error('Falha na consulta Hunter.');
    }

    const json = await resposta.json();

    if (json.errors) {
      throw new Error(json.errors[0].details);
    }

    const dados = json.data;

    let statusFinal = 'safe';
    const detalhes = [];

    // Existência SMTP
    if (
      dados.status === 'invalid' ||
      dados.result === 'undeliverable'
    ) {
      statusFinal = 'danger';

      detalhes.push({
        criterio: 'Existência da Conta',
        status: 'danger',
        mensagem: 'A conta não existe ou não recebe mensagens.'
      });
    } else {
      detalhes.push({
        criterio: 'Existência da Conta',
        status: 'success',
        mensagem: 'A caixa postal existe.'
      });
    }

    // Temporário
    if (dados.disposable) {
      statusFinal = 'danger';

      detalhes.push({
        criterio: 'E-mail Temporário',
        status: 'danger',
        mensagem: 'E-mail descartável detectado.'
      });
    } else {
      detalhes.push({
        criterio: 'E-mail Temporário',
        status: 'success',
        mensagem: 'Não pertence a serviços temporários.'
      });
    }

    // Webmail
    if (dados.webmail) {
      if (statusFinal !== 'danger') {
        statusFinal = 'warning';
      }

      detalhes.push({
        criterio: 'Tipo de Provedor',
        status: 'warning',
        mensagem: 'Utiliza provedor público.'
      });
    } else {
      detalhes.push({
        criterio: 'Tipo de Provedor',
        status: 'success',
        mensagem: 'Domínio corporativo próprio.'
      });
    }

    // MX
    if (!dados.mx_records) {
      if (statusFinal !== 'danger') {
        statusFinal = 'warning';
      }

      detalhes.push({
        criterio: 'MX Records',
        status: 'warning',
        mensagem: 'Domínio sem MX válido.'
      });
    } else {
      detalhes.push({
        criterio: 'MX Records',
        status: 'success',
        mensagem: 'MX configurado corretamente.'
      });
    }

    // Score
    const score = dados.score ?? 0;

    let statusScore = 'success';

    if (score < 50) {
      statusScore = 'danger';
    } else if (score < 80) {
      statusScore = 'warning';
    }

    detalhes.push({
      criterio: 'Pontuação de Confiança',
      status: statusScore,
      mensagem: `Confiabilidade estimada: ${score}%.`
    });

    let mensagem = 'O e-mail parece legítimo.';

    if (statusFinal === 'danger') {
      mensagem = 'O e-mail apresentou sinais fortes de fraude.';
    } else if (statusFinal === 'warning') {
      mensagem = 'O e-mail exige atenção adicional.';
    }

    return res.status(200).json({
      statusFinal,
      mensagem,
      detalhes
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      statusFinal: 'warning',
      mensagem: 'Erro ao verificar o e-mail.'
    });
  }
}