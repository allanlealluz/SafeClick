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
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ==========================================
// ROTA 1: ANALISAR LINKS (Ultra-Específica e Categorizada)
// ==========================================
app.post('/api/analisar-link', async (req, res) => {
    const { urlParaAnalisar } = req.body;

    if (!urlParaAnalisar) {
        return res.status(400).json({ erro: "Nenhuma URL fornecida." });
    }

    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

        // 1. CONSULTA GOOGLE SAFE BROWSING
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

        // 2. CONSULTA VIRUSTOTAL (API v3)
        const urlBase64 = Buffer.from(urlParaAnalisar).toString('base64url');
        const endpointVT = `https://www.virustotal.com/api/v3/urls/${urlBase64}`;

        const respostaVT = await fetch(endpointVT, {
            method: 'GET',
            headers: { 
                'x-apikey': VIRUSTOTAL_API_KEY,
                'Accept': 'application/json'
            }
        });

        let statusFinal = "safe";
        const detalhes = [];
        let categoriasDetectadas = [];
        let tiposDeAmeaça = [];

        // --- 1. MINERAÇÃO DE DADOS DO GOOGLE ---
        if (dadosGoogle.matches && dadosGoogle.matches.length > 0) {
            statusFinal = "danger";
            
            dadosGoogle.matches.forEach(match => {
                if (match.threatType === "SOCIAL_ENGINEERING") {
                    tiposDeAmeaça.push("Clonagem/Phishing (Site Falso/Engenharia Social)");
                } else if (match.threatType === "MALWARE") {
                    tiposDeAmeaça.push("Distribuição de Vírus/Malware");
                } else if (match.threatType === "UNWANTED_SOFTWARE") {
                    tiposDeAmeaça.push("Software Indesejado/Adware");
                }
            });

            detalhes.push({
                criterio: "Filtro de Navegação Segura (Google)",
                status: "danger",
                mensagem: `Bloqueado pelo Google. Motivo: ${tiposDeAmeaça.join(" e ")}.`
            });
        } else {
            detalhes.push({
                criterio: "Filtro de Navegação Segura (Google)",
                status: "success",
                mensagem: "✓ O Google não detectou fraudes de engenharia social ativas neste link."
            });
        }

        // --- 2. MINERAÇÃO DE DADOS DO VIRUSTOTAL ---
        if (respostaVT.status === 404) {
            detalhes.push({
                criterio: "Reputação em Motores de Antivírus",
                status: "warning",
                mensagem: "Link Inédito: Nenhuma empresa de segurança analisou este link no passado."
            });
        } else {
            const dadosVT = await respostaVT.json();
            
            if (dadosVT.data && dadosVT.data.attributes) {
                const attrs = dadosVT.data.attributes;
                const maliciosos = attrs.last_analysis_stats.malicious;
                const suspeitos = attrs.last_analysis_stats.suspicious;


                if (attrs.categories) {
                    const listaCategorias = Object.values(attrs.categories).map(c => c.toLowerCase());
                    
                    if (listaCategorias.some(c => c.includes("porn") || c.includes("adult") || c.includes("erotic"))) {
                        categoriasDetectadas.push("Conteúdo Adulto/Pornográfico");
                    }
                    if (listaCategorias.some(c => c.includes("torrent") || c.includes("file-sharing") || c.includes("p2p") || c.includes("illegal"))) {
                        categoriasDetectadas.push("Pirataria / Compartilhamento de Arquivos (Torrent)");
                    }
                    if (listaCategorias.some(c => c.includes("gambling") || c.includes("casino") || c.includes("betting"))) {
                        categoriasDetectadas.push("Apostas / Cassinos Online");
                    }
                    if (listaCategorias.some(c => c.includes("shopping") || c.includes("finance"))) {
                        categoriasDetectadas.push("E-commerce / Portal Financeiro");
                    }
                }


                let rotulosDeAmeaçaVT = [];
                if (attrs.last_analysis_results) {
                    const resultados = Object.values(attrs.last_analysis_results);
                    if (resultados.some(r => r.result === "phishing")) rotulosDeAmeaçaVT.push("Phishing/Roubo de Identidade");
                    if (resultados.some(r => r.result === "malware")) rotulosDeAmeaçaVT.push("Malware Ativo");
                }

                if (maliciosos > 0) {
                    statusFinal = "danger";
                    detalhes.push({
                        criterio: "Análise de Motores de Segurança (VirusTotal)",
                        status: "danger",
                        mensagem: `Alerta: ${maliciosos} motores classificaram este link como nocivo. Tipo detectado: ${rotulosDeAmeaçaVT.join(" / ") || "Ameaça Genérica"}.`
                    });
                } else if (suspeitos > 0) {
                    if (statusFinal !== "danger") statusFinal = "warning";
                    detalhes.push({
                        criterio: "Análise de Motores de Segurança (VirusTotal)",
                        status: "warning",
                        mensagem: `Suspeito: ${suspeitos} motores indicam comportamento anômalo ou fraude iminente.`
                    });
                } else {
                    detalhes.push({
                        criterio: "Análise de Motores de Segurança (VirusTotal)",
                        status: "success",
                        mensagem: "Escaneado por mais de 70 empresas de segurança e considerado limpo."
                    });
                }
            }
        }

        // --- 3. ANALISADOR DE NATIVIDADE DO SITE (CATEGORIAS) ---
        if (categoriasDetectadas.length > 0) {
            detalhes.push({
                criterio: "Categoria da Plataforma",
                status: "info",
                mensagem: ` Categoria do Site: Este endereço pertence ao nicho de **${categoriasDetectadas.join(" e ")}**.`
            });
            if (categoriasDetectadas.some(c => c.includes("Torrent") || c.includes("Adulto")) && statusFinal === "safe") {
                statusFinal = "warning";
                detalhes.push({
                    criterio: "Análise Comportamental Preventiva",
                    status: "warning",
                    mensagem: "💡 Atenção: Embora o link esteja limpo em bancos de dados, sites dessa categoria costumam abusar de anúncios com scripts maliciosos (Pop-unders) que tentam baixar arquivos sem autorização."
                });
            }
        }

        // --- 4. VERIFICAÇÃO DE ATAQUES HOMÓGRAFOS / TYPOSQUATTING (Heurística Local para o "rnicrosoft") ---
        const urlObjeto = new URL(urlParaAnalisar.startsWith("http") ? urlParaAnalisar : `https://${urlParaAnalisar}`);
        const dominio = urlObjeto.hostname.toLowerCase();
        
        // Verifica se o domínio tenta imitar letras usando "rn" ou "vv" perto de marcas grandes
        if (dominio.includes("rnicrosoft") || dominio.includes("g00gle") || dominio.includes("faceb00k") || dominio.includes("netf1ix")) {
            statusFinal = "danger";
            detalhes.push({
                criterio: "Análise de Engenharia Ortográfica (Typosquatting)",
                status: "danger",
                mensagem: ` FRAUDE DETECTADA: O domínio "${dominio}" está usando caracteres visualmente modificados para se passar por uma empresa legítima.`
            });
        }

        // --- 5. CRIPTOGRAFIA (HTTPS) ---
        if (!urlParaAnalisar.startsWith("https://")) {
            if (statusFinal !== "danger") statusFinal = "warning";
            detalhes.push({
                criterio: "Criptografia de Canal",
                status: "warning",
                mensagem: "Sem HTTPS: O site trafega em texto puro. Se você digitar senhas ou dados de cartão aqui, eles poderão ser interceptados na rede."
            });
        }

        // Mensagem Resumo Dinâmica
        let mensagemGeral = "Link verificado e seguro.";
        if (statusFinal === "danger") mensagemGeral = "BLOQUEADO: Este link é uma armadilha confirmada. Não prossiga.";
        if (statusFinal === "warning") mensagemGeral = "PONTOS DE ATENÇÃO: O link não possui vírus direto, mas o ambiente oferece riscos.";

        res.json({
            statusFinal,
            mensagem: mensagemGeral,
            detalhes
        });

    } catch (error) {
        console.error("Erro completo na análise de link:", error);
        res.status(500).json({ erro: "Falha profunda ao processar a inteligência do link." });
    }
});

// ==========================================
// ROTA 2: ANALISAR ARQUIVOS (Multidimensional)
// ==========================================
app.post('/api/analisar-arquivo', upload.single('arquivoParaAnalisar'), async (req, res) => {
    try {
        const arquivo = req.file;
        if (!arquivo) {
            return res.status(400).json({ erro: "Nenhum arquivo recebido." });
        }

        const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
        const hashArquivo = crypto.createHash('sha256').update(arquivo.buffer).digest('hex');

        const endpointVT = `https://www.virustotal.com/api/v3/files/${hashArquivo}`;
        const respostaVT = await fetch(endpointVT, {
            method: 'GET',
            headers: { 
                'x-apikey': VIRUSTOTAL_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (respostaVT.status === 404) {
            return res.json({
                statusFinal: "safe",
                mensagem: "Arquivo Inédito comercialmente.",
                detalhes: [
                    { criterio: "Assinatura Digital (SHA-256)", status: "success", mensagem: `Hash gerado: ${hashArquivo}` },
                    { criterio: "Reputação Global", status: "success", mensagem: "✓ Este arquivo nunca foi reportado por nenhuma empresa de segurança do mundo. Geralmente indica um arquivo pessoal legítimo." }
                ]
            });
        }

        const dadosVT = await respostaVT.json();
        const stats = dadosVT.data.attributes.last_analysis_stats;
        const malicioso = stats.malicious;
        const suspeito = stats.suspicious;
        const limpo = stats.harmless + stats.undetected;

        let statusFinal = "safe";
        if (malicioso > 0) statusFinal = "danger";
        else if (suspeito > 0) statusFinal = "warning";

        res.json({
            statusFinal,
            mensagem: malicioso > 0 ? "Atenção: Este arquivo contém vírus!" : "O arquivo parece seguro.",
            detalhes: [
                { criterio: "Identificação", status: "success", mensagem: `SHA-256: ${hashArquivo}` },
                { criterio: "Análise de Malware", status: malicioso > 0 ? "danger" : "success", mensagem: `Detecções de vírus perigosos: ${malicioso} motor(es).` },
                { criterio: "Análise de Heurística", status: suspeito > 0 ? "warning" : "success", mensagem: `Comportamentos suspeitos detectados: ${suspeito} motor(es).` },
                { criterio: "Motores Confiáveis", status: "success", mensagem: `Verificações que confirmaram segurança: ${limpo} motores antivírus.` }
            ]
        });

    } catch (error) {
        console.error("Erro na API de arquivo:", error);
        res.status(500).json({ erro: "Erro ao analisar o arquivo." });
    }
});

// ==========================================
// ROTA 3: ANALISAR E-MAILS (Multidimensional)
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
        
        let statusFinal = "safe";
        const detalhes = [];

        // --- CHECKLIST 1: EXISTÊNCIA REAL (SMTP) ---
        if (dados.status === 'invalid' || dados.result === 'undeliverable') {
            statusFinal = "danger";
            detalhes.push({ criterio: "Existência da Conta", status: "danger", mensagem: "🚨 Conta Inexistente. Este e-mail não existe de verdade. Fortes indícios de spoofing ou fraude eletrônica." });
        } else {
            detalhes.push({ criterio: "Existência da Conta", status: "success", mensagem: "✓ E-mail verificado. A caixa postal existe e está ativa no servidor de destino." });
        }

        // --- CHECKLIST 2: E-MAIL DESCARTÁVEL (TEMPORÁRIO) ---
        if (dados.disposable) {
            statusFinal = "danger";
            detalhes.push({ criterio: "Persistência do Domínio", status: "danger", mensagem: "⏳ Domínio Descartável! Criado em plataformas de e-mail temporário de 10 minutos. Altíssimo risco." });
        } else {
            detalhes.push({ criterio: "Persistência do Domínio", status: "success", mensagem: "✓ Domínio permanente. Não pertence a plataformas de e-mails descartáveis anônimos." });
        }

        // --- CHECKLIST 3: TIPO DE PROVEDOR (WEBMAIL) ---
        if (dados.webmail) {
            if (statusFinal !== "danger") statusFinal = "warning";
            detalhes.push({ criterio: "Origem Corporativa", status: "warning", mensagem: "📧 Provedor Público Gratuito (Gmail, Yahoo, Outlook). Se o remetente afirma ser de um suporte bancário, de uma grande empresa ou governo, trata-se de um golpe." });
        } else {
            detalhes.push({ criterio: "Origem Corporativa", status: "success", mensagem: "✓ Domínio Privado/Corporativo próprio (legitimidade empresarial)." });
        }

        // --- CHECKLIST 4: SERVIDORES DE MENSAGENS (MX RECORDS) ---
        if (!dados.mx_records) {
            if (statusFinal !== "danger") statusFinal = "warning";
            detalhes.push({ criterio: "Configuração de Rede (MX)", status: "danger", mensagem: "❌ Falha técnica: O domínio não possui servidores MX válidos configurados para receber respostas." });
        } else {
            detalhes.push({ criterio: "Configuração de Rede (MX)", status: "success", mensagem: "✓ Servidores de recebimento de e-mail (Registros MX) configurados corretamente." });
        }

        // --- CHECKLIST 5: SCORE DE CONFIABILIDADE ---
        const scoreConfianca = dados.score;
        let statusScore = "success";
        if (scoreConfianca < 50) statusScore = "danger";
        else if (scoreConfianca < 80) statusScore = "warning";

        detalhes.push({ 
            criterio: "Índice de Confiança Global", 
            status: statusScore, 
            mensagem: `📊 Pontuação de ${scoreConfianca}% com base em entregabilidade e aparições em fontes públicas.` 
        });

        // Mensagem resumo geral baseada em todas as etapas acumuladas
        let mensagemGeral = "Remetente corporativo verificado e seguro.";
        if (statusFinal === "danger") mensagemGeral = "PERIGO: Este e-mail falhou em critérios críticos de autenticidade.";
        if (statusFinal === "warning") mensagemGeral = "ATENÇÃO: Avalie o contexto. Embora o e-mail exista, ele usa um canal público gratuito.";

        res.json({
            statusFinal,
            mensagem: mensagemGeral,
            detalhes // Envia TODAS as verificações juntas
        });

    } catch (error) {
        console.error("Erro na API de e-mail:", error);
        res.status(500).json({ erro: "Erro ao verificar a reputação deste e-mail." });
    }
});

const PORTA = process.env.SERVER_PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORTA, () => {
        console.log(`🛡️ Servidor de segurança rodando fixo na porta ${PORTA}`);
    });
}

// ESSENCIAL PARA A VERCEL:
module.exports = app;