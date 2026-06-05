export default async function handler(req, res) {
  // CORS: Libera requisições prévias do navegador
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Trava de método: Só aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { urlParaAnalisar } = req.body;

    // 1. Validação básica de entrada
    if (!urlParaAnalisar) {
      return res.status(400).json({ 
        statusFinal: 'warning', 
        mensagem: 'Nenhuma URL informada. Digite um link válido.' 
      });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

    if (!GOOGLE_API_KEY || !VIRUSTOTAL_API_KEY) {
      return res.status(500).json({ 
        statusFinal: 'warning', 
        mensagem: 'Chaves de API ausentes no servidor da Vercel. Verifique as Environment Variables.' 
      });
    }

    // ---------------------------------------------------------
    // 1. CONSULTA GOOGLE SAFE BROWSING
    // ---------------------------------------------------------
    const endpointGoogle = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;
    const corpoGoogle = {
      client: { clientId: "safeclick-app", clientVersion: "1.0.0" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: urlParaAnalisar }]
      }
    };

    const respostaGoogle = await fetch(endpointGoogle, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpoGoogle)
    });
    const dadosGoogle = await respostaGoogle.json();

    // ---------------------------------------------------------
    // 2. CONSULTA VIRUSTOTAL (API v3)
    // ---------------------------------------------------------
    // Transforma a URL em Base64 sem preenchimento (=), padrão exigido pela v3 da API do VT
    const urlBase64 = Buffer.from(urlParaAnalisar).toString('base64url');
    const endpointVT = `https://www.virustotal.com/api/v3/urls/${urlBase64}`;

    const respostaVT = await fetch(endpointVT, {
      method: 'GET',
      headers: { 
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Accept': 'application/json'
      }
    });

    // ---------------------------------------------------------
    // 3. PROCESSAMENTO E MINERAÇÃO DE DADOS COMBINADOS
    // ---------------------------------------------------------
    let statusFinal = "safe";
    const detalhes = [];
    let tiposDeAmeaca = [];

    // --- ANÁLISE GOOGLE ---
    if (dadosGoogle.matches && dadosGoogle.matches.length > 0) {
      statusFinal = "danger"; // Se o Google pegou, é perigo na certa
      
      dadosGoogle.matches.forEach(match => {
        if (match.threatType === "SOCIAL_ENGINEERING") {
          tiposDeAmeaca.push("Clonagem/Phishing (Site Falso/Engenharia Social)");
        } else if (match.threatType === "MALWARE") {
          tiposDeAmeaca.push("Distribuição de Vírus/Malware");
        } else if (match.threatType === "UNWANTED_SOFTWARE") {
          tiposDeAmeaca.push("Software Indesejado/Adware");
        } else {
          tiposDeAmeaca.push("Ameaça identificada");
        }
      });

      detalhes.push({
        criterio: "Filtro de Navegação Segura (Google)",
        status: "danger",
        mensagem: `Bloqueado pelo Google. Motivo: ${[...new Set(tiposDeAmeaca)].join(" e ")}.`
      });
    } else {
      detalhes.push({
        criterio: "Filtro de Navegação Segura (Google)",
        status: "success",
        mensagem: "✓ O Google não detectou fraudes de engenharia social ou malwares ativos neste link."
      });
    }

    // --- ANÁLISE VIRUSTOTAL ---
    if (respostaVT.status === 404) {
      // Se o link nunca foi consultado no VirusTotal, mudamos para warning se já não for danger
      if (statusFinal !== "danger") statusFinal = "warning";
      
      detalhes.push({
        criterio: "Reputação em Motores de Antivírus (VirusTotal)",
        status: "warning",
        mensagem: "Link Inédito: Nenhuma empresa de segurança analisou este link no banco do VirusTotal ainda. Proceda com cuidado."
      });
    } else if (!respostaVT.ok) {
      // Caso a API do VT caia ou mude a cota
      detalhes.push({
        criterio: "Reputação em Motores de Antivírus (VirusTotal)",
        status: "warning",
        mensagem: "Não foi possível coletar a reputação do VirusTotal neste momento."
      });
    } else {
      const dadosVT = await respostaVT.json();
      
      if (dadosVT.data && dadosVT.data.attributes) {
        const attrs = dadosVT.data.attributes;
        const maliciosos = attrs.last_analysis_stats.malicious || 0;
        const suspeitos = attrs.last_analysis_stats.suspicious || 0;
        const limpos = attrs.last_analysis_stats.harmless || 0;

        if (maliciosos > 0) {
          statusFinal = "danger";
          detalhes.push({
            criterio: "Reputação em Motores de Antivírus (VirusTotal)",
            status: "danger",
            mensagem: `Alerta! Este link foi classificado como MALICIOSO por ${maliciosos} motor(es) de antivírus parceiros.`
          });
        } else if (suspeitos > 0) {
          // Se não há maliciosos diretos mas há suspeitos, acende a luz amarela
          if (statusFinal !== "danger") statusFinal = "warning";
          detalhes.push({
            criterio: "Reputação em Motores de Antivírus (VirusTotal)",
            status: "warning",
            mensagem: `Atenção: ${suspeitos} motor(es) consideram o comportamento deste link suspeito.`
          });
        } else {
          detalhes.push({
            criterio: "Reputação em Motores de Antivírus (VirusTotal)",
            status: "success",
            mensagem: `✓ Analisado por ${limpos} sistemas de segurança globais e considerado limpo.`
          });
        }
      }
    }

    // --- DEFINE MENSAGEM DO PROVEDOR PRINCIPAL ---
    let mensagemGeral = "O link parece seguro para navegação.";
    if (statusFinal === "danger") {
      mensagemGeral = "Atenção! Detectamos sérios riscos de segurança associados a esta URL.";
    } else if (statusFinal === "warning") {
      mensagemGeral = "Link com comportamento suspeito ou sem histórico confiável. Fique atento.";
    }

    // 4. ENVIA RESPOSTA COMPLETA E FORMATADA PARA O REACT MAPEAR
    return res.status(200).json({
      statusFinal,
      mensagem: mensagemGeral,
      detalhes
    });

  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return res.status(500).json({ 
      statusFinal: 'warning', 
      mensagem: 'Ocorreu um erro interno no servidor ao cruzar os dados de segurança.' 
    });
  }
}