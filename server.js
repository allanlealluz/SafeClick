// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto'); 

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// CONFIGURAÇÃO DO MULTER (UPLOAD DE ARQUIVOS)
// ==========================================
// Salva o arquivo temporariamente na memória RAM limitando a 10MB
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ==========================================
// ROTA 1: ANALISAR LINKS (Com Tolerância Zero)
// ==========================================
app.post('/api/analisar-link', async (req, res) => {
    const { urlParaAnalisar } = req.body;

    if (!urlParaAnalisar) {
        return res.status(400).json({ erro: "Nenhuma URL fornecida." });
    }

    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

        // 1. VERIFICAÇÃO NO GOOGLE SAFE BROWSING
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

        // 2. VERIFICAÇÃO NO VIRUSTOTAL (API v3)
        const urlBase64 = Buffer.from(urlParaAnalisar).toString('base64url');
        const endpointVT = `https://www.virustotal.com/api/v3/urls/${urlBase64}`;

        const respostaVT = await fetch(endpointVT, {
            method: 'GET',
            headers: { 
                'x-apikey': VIRUSTOTAL_API_KEY,
                'Accept': 'application/json'
            }
        });
        const dadosVT = await respostaVT.json();

        // 3. CRUZANDO OS DADOS (Regras Rigorosas)
        let statusFinal = "safe"; 
        let mensagemFinal = "Parece Seguro! Nenhum motor de segurança apontou riscos.";
        let maliciososVT = 0;
        let suspeitosVT = 0;

        const googleAchouPerigo = dadosGoogle.matches && dadosGoogle.matches.length > 0;
        
        if (dadosVT.data && dadosVT.data.attributes) {
            maliciososVT = dadosVT.data.attributes.last_analysis_stats.malicious;
            suspeitosVT = dadosVT.data.attributes.last_analysis_stats.suspicious;
        }

        // Verifica encurtadores
        const encurtadores = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd"];
        const usaEncurtador = encurtadores.some(enc => urlParaAnalisar.includes(enc));

        // Decisão Rigorosa
        if (googleAchouPerigo || maliciososVT > 0) {
            statusFinal = "danger";
            mensagemFinal = `ALERTA MÁXIMO: Site classificado como malicioso por ${maliciososVT} motor(es) ou pelo Google! Não acesse.`;
        } else if (suspeitosVT > 0) {
            statusFinal = "warning";
            mensagemFinal = `CUIDADO: ${suspeitosVT} motor(es) de segurança marcaram este site como suspeito de phishing.`;
        } else if (usaEncurtador) {
            statusFinal = "warning";
            mensagemFinal = "ATENÇÃO: Este é um link encurtado. Golpistas usam isso para esconder o destino real. Tenha certeza de quem te enviou.";
        } else if (!urlParaAnalisar.startsWith("https://")) {
            statusFinal = "warning";
            mensagemFinal = "CUIDADO: Este site não possui certificado de segurança (falta o HTTPS). Seus dados podem ser interceptados.";
        }

        res.json({
            statusFinal: statusFinal,
            mensagem: mensagemFinal,
            estatisticasVT: maliciososVT 
        });

    } catch (error) {
        console.error("Erro na API de link:", error);
        res.status(500).json({ erro: "Erro ao consultar as APIs de segurança." });
    }
});

// ==========================================
// ROTA 2: ANALISAR ARQUIVOS
// ==========================================
app.post('/api/analisar-arquivo', upload.single('arquivoParaAnalisar'), async (req, res) => {
    try {
        const arquivo = req.file;
        if (!arquivo) {
            return res.status(400).json({ erro: "Nenhum arquivo recebido." });
        }

        const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

        // 1. Gera o Hash SHA-256 do arquivo (Assinatura digital)
        const hashArquivo = crypto.createHash('sha256').update(arquivo.buffer).digest('hex');

        // 2. Consulta o VirusTotal procurando por esse Hash
        const endpointVT = `https://www.virustotal.com/api/v3/files/${hashArquivo}`;
        const respostaVT = await fetch(endpointVT, {
            method: 'GET',
            headers: { 
                'x-apikey': VIRUSTOTAL_API_KEY,
                'Accept': 'application/json'
            }
        });

        // 404 Significa que o arquivo é inédito na base global (geralmente arquivos pessoais)
        if (respostaVT.status === 404) {
            return res.json({
                statusFinal: "safe",
                mensagem: "Arquivo Inédito: Nenhuma ameaça encontrada. Este arquivo nunca foi reportado como vírus na base global."
            });
        }

        const dadosVT = await respostaVT.json();
        
        // Se a API retornar outro tipo de erro
        if (dadosVT.error) {
            throw new Error(dadosVT.error.message);
        }

        // 3. Analisando os resultados
        const stats = dadosVT.data.attributes.last_analysis_stats;
        const malicioso = stats.malicious;
        const suspeito = stats.suspicious;

        if (malicioso > 0) {
            return res.json({
                statusFinal: "danger",
                mensagem: `ALERTA MÁXIMO: ${malicioso} antivírus detectaram que este arquivo é um MALWARE/VÍRUS!`
            });
        } else if (suspeito > 0) {
            return res.json({
                statusFinal: "warning",
                mensagem: `CUIDADO: ${suspeito} motores de segurança marcaram este arquivo como suspeito.`
            });
        } else {
            return res.json({
                statusFinal: "safe",
                mensagem: "Parece Seguro! Nenhum antivírus do banco de dados detectou ameaças neste arquivo."
            });
        }

    } catch (error) {
        console.error("Erro na API de arquivo:", error);
        res.status(500).json({ erro: "Erro ao consultar a API do VirusTotal para arquivos." });
    }
});

// ==========================================
// ROTA 3: ANALISAR E-MAILS
// ==========================================
app.post('/api/analisar-email', async (req, res) => {
    const { emailParaAnalisar } = req.body;

    if (!emailParaAnalisar) {
        return res.status(400).json({ erro: "Nenhum e-mail fornecido." });
    }

    try {
        const HUNTER_API_KEY = process.env.HUNTER_API_KEY; 
        
        if (!HUNTER_API_KEY) {
            return res.status(500).json({ erro: "Chave da API de e-mail não configurada no servidor." });
        }

        const endpointHunter = `https://api.hunter.io/v2/email-verifier?email=${emailParaAnalisar}&api_key=${HUNTER_API_KEY}`;
        
        const respostaHunter = await fetch(endpointHunter);
        const jsonHunter = await respostaHunter.json();

        if (jsonHunter.errors) {
            throw new Error(jsonHunter.errors[0].details);
        }

        const dados = jsonHunter.data;

        // Regras de detecção de fraude
        if (dados.status === 'invalid') {
            return res.json({
                statusFinal: "danger",
                mensagem: "ALERTA: Este endereço de e-mail não existe ou é inválido. Pode ser uma tentativa de golpe."
            });
        }

        if (dados.disposable) {
            return res.json({
                statusFinal: "danger",
                mensagem: "MUITO SUSPEITO: Este é um e-mail descartável (temporário). Golpistas usam isso para não serem rastreados."
            });
        }

        if (dados.webmail) {
             return res.json({
                statusFinal: "warning",
                mensagem: "Atenção: É um e-mail gratuito (como Gmail ou Yahoo). Empresas legítimas costumam usar domínios próprios, verifique o remetente."
            });
        }

        return res.json({
            statusFinal: "safe",
            mensagem: "Parece Seguro! O formato é válido e pertence a um domínio corporativo legítimo."
        });

    } catch (error) {
        console.error("Erro na API de e-mail:", error);
        res.status(500).json({ erro: "Erro ao verificar a reputação deste e-mail." });
    }
});

// Forçando a porta 5001 para não dar conflito com o React
const PORTA = process.env.PORT || 5001;
app.listen(PORTA, () => {
    console.log(`🛡️ Servidor de segurança rodando fixo na porta ${PORTA}`);
});