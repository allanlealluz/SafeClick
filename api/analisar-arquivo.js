import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
const MAGIC_NUMBERS = {
  exe: '4d5a',       // "MZ" - Executáveis Windows (EXE, DLL, SYS)
  elf: '7f454c46',   // "ELF" - Executáveis Linux
  zip: '504b0304',   // "PK" - Arquivos compactados (Zip, APK, Office novos)
  pdf: '25504446',   // "%PDF"
  png: '89504e47',   // PNG
  jpg: 'ffd8ffe0',   // JPEG
};

const PADROES_SUSPEITOS = [
  { termo: 'eval\\(', label: 'Execução de código dinâmico (eval)' },
  { termo: 'child_process\\.exec', label: 'Invocação de comandos do Sistema Operacional' },
  { termo: 'powershell\\.exe', label: 'Script automatizado malicioso (PowerShell)' },
  { termo: 'cmd\\.exe', label: 'Abertura oculta do Prompt de Comando' },
  { termo: 'autoit', label: 'Scripts AutoIt comuns em stealers de senhas' },
  { termo: 'kms-activator', label: 'Ativador ilegal / Crack de software' },
  { termo: 'bypass_uac', label: 'Tentativa de burlar privilégios de Administrador' },
  { termo: 'base64_decode', label: 'Ofuscação de código suspeito' }
];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  try {
    const { arquivoBase64, nomeArquivo } = req.body;

    if (!arquivoBase64) {
      return res.status(400).json({ statusFinal: 'warning', mensagem: 'Nenhum arquivo enviado.' });
    }

    const buffer = Buffer.from(arquivoBase64, 'base64');
    const tamanhoArquivo = buffer.length;
    const extensaoDeclarada = nomeArquivo.split('.').pop().toLowerCase();

    // Inicia os detalhes da análise
    const detalhes = [
      { criterio: 'Tamanho do Arquivo', status: 'success', mensagem: `${(tamanhoArquivo / 1024 / 1024).toFixed(2)} MB` }
    ];

    let pontosDeRisco = 0;

    // ==========================================
    // ANÁLISE 1: VERIFICAÇÃO DE ASSINATURA REAL (MAGIC NUMBERS)
    // ==========================================
    const primeirosBytesHex = buffer.slice(0, 4).toString('hex');
    let extensaoReal = 'desconhecida';

    for (const [ext, magic] of Object.entries(MAGIC_NUMBERS)) {
      if (primeirosBytesHex.startsWith(magic)) {
        extensaoReal = ext;
        break;
      }
    }

    // Alerta se o arquivo estiver mascarado (ex: foto.png que na verdade é um .exe)
    if (extensaoReal === 'exe' || extensaoReal === 'elf') {
      const ehMascarado = extensaoDeclarada !== 'exe' && extensaoDeclarada !== 'dll' && extensaoDeclarada !== 'scr';
      
      detalhes.push({
        criterio: 'Formato Interno',
        status: 'danger',
        mensagem: ehMascarado 
          ? `ALERTA CRÍTICO: O arquivo finge ser .${extensaoDeclarada}, mas é um EXECUTÁVEL interno.`
          : `Binário Executável detectado (.${extensaoReal}). Arquivos desse tipo contêm alto risco por padrão.`
      });
      pontosDeRisco += ehMascarado ? 3 : 1;
    } else {
      detalhes.push({
        criterio: 'Formato Interno',
        status: 'success',
        mensagem: `A assinatura do arquivo condiz com formatos comuns e seguros.`
      });
    }

    // ==========================================
    // ANÁLISE 2: VARREDURA DE STRINGS E CÓDIGOS SUSPEITOS (ESTÁTICA)
    // ==========================================
    const conteudoTexto = buffer.toString('utf8', 0, Math.min(tamanhoArquivo, 500000)); // Lê até os primeiros 500KB como texto
    const padroesEncontrados = [];

    PADROES_SUSPEITOS.forEach(({ termo, label }) => {
      const regex = new RegExp(termo, 'i');
      if (regex.test(conteudoTexto)) {
        padroesEncontrados.push(label);
        pontosDeRisco += 1;
      }
    });

    if (padroesEncontrados.length > 0) {
      detalhes.push({
        criterio: 'Análise de Código',
        status: 'danger',
        mensagem: `Detectamos strings suspeitas comuns em malwares: ${padroesEncontrados.join(', ')}.`
      });
    } else {
      detalhes.push({
        criterio: 'Análise de Código',
        status: 'success',
        mensagem: 'Nenhuma assinatura de código nocivo ou ativadores piratas encontrados.'
      });
    }

    // ==========================================
    // ANÁLISE 3: REPUTAÇÃO CLOUD (VIRUSTOTAL POR HASH)
    // ==========================================
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

    let respostaVT = null;
    if (VIRUSTOTAL_API_KEY) {
      try {
        respostaVT = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
          headers: { 'x-apikey': VIRUSTOTAL_API_KEY }
        });
      } catch (err) {
        console.error("Falha ao contatar VirusTotal:", err);
      }
    }

    let vtStatusFinal = 'safe';
    let vtMensagem = '';

    if (respostaVT && respostaVT.status !== 404) {
      const dados = await respostaVT.json();
      const stats = dados.data?.attributes?.last_analysis_stats || {};
      const maliciosos = stats.malicious || 0;
      const suspeitos = stats.suspicious || 0;

      if (maliciosos > 0) {
        vtStatusFinal = 'danger';
        vtMensagem = `${maliciosos} antivírus globais cravaram como vírus.`;
      } else if (suspeitos > 0) {
        vtStatusFinal = 'warning';
        vtMensagem = `${suspeitos} antivírus reportaram comportamento anômalo.`;
      } else {
        vtMensagem = 'Verificado na nuvem global e listado como limpo por todos os motores.';
      }

      detalhes.push({
        criterio: 'Banco de Dados Global',
        status: vtStatusFinal === 'danger' ? 'danger' : vtStatusFinal === 'warning' ? 'warning' : 'success',
        mensagem: vtMensagem
      });
    } else {
      detalhes.push({
        criterio: 'Banco de Dados Global',
        status: 'warning',
        mensagem: 'Arquivo inédito na nuvem. Avaliação baseada apenas nas regras locais.'
      });
    }

    // ==========================================
    // VEREDITO FINAL COESO
    // ==========================================
    let statusFinal = 'safe';
    let mensagemFinal = 'Arquivo analisado e seguro para abertura.';

    // Se o VirusTotal cravou que é vírus, ou se acumulou muitos pontos de risco locais
    if (vtStatusFinal === 'danger' || pontosDeRisco >= 3) {
      statusFinal = 'danger';
      mensagemFinal = 'Risco Alto Detectado! O arquivo contém assinaturas maliciosas ou executáveis camuflados.';
    } else if (vtStatusFinal === 'warning' || pontosDeRisco > 0) {
      statusFinal = 'warning';
      mensagemFinal = 'Atenção. Foram detectados padrões suspeitos ou chaves não-oficiais no arquivo.';
    }

    return res.status(200).json({
      statusFinal,
      mensagem: mensagemFinal,
      nomeArquivo,
      detalhes
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ statusFinal: 'danger', mensagem: 'Erro interno ao processar arquivo.' });
  }
}