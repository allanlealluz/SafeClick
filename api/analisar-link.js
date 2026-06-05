export default async function handler(req, res) {
  // CORS: Permite a verificação prévia de segurança do navegador (evita erros no console)
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Bloqueia o que não for POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { urlParaAnalisar } = req.body;

    // 1. Validação inicial de entrada
    if (!urlParaAnalisar) {
      return res.status(400).json({ 
        statusFinal: 'warning', 
        mensagem: 'Nenhuma URL foi fornecida para análise. Por favor, digite um link válido.' 
      });
    }

    // A chave de segurança que você configurou no painel da Vercel
    const apiKey = process.env.GOOGLE_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ 
        statusFinal: 'warning', 
        mensagem: 'Sistema em manutenção: A chave da API de segurança não foi encontrada no servidor.' 
      });
    }

    // 2. Monta a requisição para a API oficial do Google Safe Browsing
    const googleApiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    
    // Configuração estrita de ameaças que queremos buscar (Malwares e Phishing)
    const corpoRequisicao = {
      client: {
        clientId: "safe-click-verificador",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE", 
          "SOCIAL_ENGINEERING", // Phishing / Enganar o usuário
          "UNWANTED_SOFTWARE", 
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          { url: urlParaAnalisar }
        ]
      }
    };

    // 3. Envia os dados para o Google de forma assíncrona
    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpoRequisicao)
    });

    if (!googleResponse.ok) {
      throw new Error(`Falha na comunicação com o banco de dados do Google. Status: ${googleResponse.status}`);
    }

    const googleData = await googleResponse.json();

    // 4. Analisa a resposta do Google
    // Se a propriedade 'matches' existir, significa que o Google encontrou a URL na lista negra.
    if (googleData.matches && googleData.matches.length > 0) {
      // Pega o tipo de ameaça exata que foi encontrada
      const tipoAmeaca = googleData.matches[0].threatType.replace('_', ' ');
      
      return res.status(200).json({ 
        statusFinal: 'danger', 
        mensagem: `Atenção máxima! O Google classificou esta URL como perigosa (${tipoAmeaca}). Recomendamos não acessar e não inserir nenhum dado neste site.` 
      });
    }

    // Se chegou até aqui e 'matches' não existe, a URL não consta em listas de golpe
    return res.status(200).json({ 
      statusFinal: 'safe', 
      mensagem: `A URL foi analisada no Google Safe Browsing e parece estar limpa de ameaças conhecidas.` 
    });

  } catch (error) {
    console.error("Erro interno ao analisar a URL:", error);
    return res.status(500).json({ 
      statusFinal: 'warning',
      mensagem: 'Tivemos um problema de conexão com as bases de segurança. Tente novamente em instantes.' 
    });
  }
}