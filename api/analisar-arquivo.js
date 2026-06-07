import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

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
    const { arquivoBase64, nomeArquivo } = req.body;

    if (!arquivoBase64) {
      return res.status(400).json({
        statusFinal: 'warning',
        mensagem: 'Nenhum arquivo enviado.'
      });
    }

    const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

    if (!VIRUSTOTAL_API_KEY) {
      return res.status(500).json({
        statusFinal: 'warning',
        mensagem: 'VirusTotal não configurado.'
      });
    }

    const buffer = Buffer.from(arquivoBase64, 'base64');

    const sha256 = crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex');

    const respostaVT = await fetch(
      `https://www.virustotal.com/api/v3/files/${sha256}`,
      {
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY
        }
      }
    );

    const detalhes = [
      {
        criterio: 'Identificação',
        status: 'success',
        mensagem: `SHA-256: ${sha256}`
      }
    ];

    // Arquivo desconhecido
    if (respostaVT.status === 404) {
      detalhes.push({
        criterio: 'Reputação Global',
        status: 'warning',
        mensagem: 'Arquivo sem histórico no VirusTotal.'
      });

      return res.status(200).json({
        statusFinal: 'warning',
        mensagem: 'Arquivo inédito. Não há reputação conhecida.',
        nomeArquivo,
        detalhes
      });
    }

    const dados = await respostaVT.json();

    const stats =
      dados.data?.attributes?.last_analysis_stats || {};

    const maliciosos = stats.malicious || 0;
    const suspeitos = stats.suspicious || 0;
    const limpos =
      (stats.harmless || 0) +
      (stats.undetected || 0);

    let statusFinal = 'safe';

    if (maliciosos > 0) {
      statusFinal = 'danger';
    } else if (suspeitos > 0) {
      statusFinal = 'warning';
    }

    detalhes.push({
      criterio: 'Malware',
      status:
        maliciosos > 0 ? 'danger' : 'success',
      mensagem: `${maliciosos} motor(es) detectaram malware.`
    });

    detalhes.push({
      criterio: 'Heurística',
      status:
        suspeitos > 0 ? 'warning' : 'success',
      mensagem: `${suspeitos} motor(es) apontaram comportamento suspeito.`
    });

    detalhes.push({
      criterio: 'Motores Limpos',
      status: 'success',
      mensagem: `${limpos} motores não detectaram ameaças.`
    });

    let mensagem = 'Arquivo aparentemente seguro.';

    if (statusFinal === 'danger') {
      mensagem = 'Malware confirmado.';
    } else if (statusFinal === 'warning') {
      mensagem = 'Arquivo suspeito ou sem consenso.';
    }

    return res.status(200).json({
      statusFinal,
      mensagem,
      nomeArquivo,
      detalhes
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      statusFinal: 'warning',
      mensagem: 'Erro ao analisar o arquivo.'
    });
  }
}